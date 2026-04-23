using Formulix.Shared.Configuration;
using Formulix.Shared.Constants;
using Formulix.Shared.Data;
using Formulix.Shared.Models;
using Formulix.Shared.Utilities;
using Microsoft.CodeAnalysis.Scripting;

namespace Formulix.RoslynRunner;

internal static class Program
{
    private const int BatchSize = 5000;

    private static async Task Main()
    {
        try
        {
            DatabaseSettings settings = new();
            IFormulixRepository repository = new SqlFormulixRepository(settings);

            Console.WriteLine("Loading formulas...");
            IReadOnlyList<FormulaDefinition> formulas = await repository.GetFormulasAsync();

            Console.WriteLine("Cleaning previous Roslyn results...");
            await repository.ClearResultsForMethodAsync(MethodNames.Roslyn);
            await repository.ClearLogsForMethodAsync(MethodNames.Roslyn);

            Dictionary<int, ScriptRunner<double>> compiledFormulas = new();

            Console.WriteLine("Compiling formulas...");
            foreach (FormulaDefinition formula in formulas)
            {
                string expression = FormulaCompiler.BuildExpression(
                    formula.Targil,
                    formula.Tnai,
                    formula.TargilFalse);

                compiledFormulas[formula.TargilId] = FormulaCompiler.Compile(expression);
                Console.WriteLine($"Compiled formula {formula.TargilId}: {expression}");
            }

            foreach (FormulaDefinition formula in formulas)
            {
                Console.WriteLine($"Running formula {formula.TargilId}: {formula.Targil}");

                BenchmarkTimer timer = new();
                timer.Start();

                ScriptRunner<double> runner = compiledFormulas[formula.TargilId]; 
                List<FormulaResult> batch = new(BatchSize);

                await foreach (DataRecord row in repository.StreamDataAsync())
                {
                    Globals globals = new()
                    {
                        a = row.A,
                        b = row.B,
                        c = row.C,
                        d = row.D
                    };

                    double result = await runner(globals);

                    batch.Add(new FormulaResult
                    {
                        DataId = row.DataId,
                        TargilId = formula.TargilId,
                        Method = MethodNames.Roslyn,
                        Result = result
                    });

                    if (batch.Count >= BatchSize)
                    {
                        await repository.InsertResultsBulkAsync(batch);
                        batch.Clear();
                    }
                }

                if (batch.Count > 0)
                {
                    await repository.InsertResultsBulkAsync(batch);
                    batch.Clear();
                }

                double seconds = timer.StopSeconds();

                await repository.InsertLogAsync(new LogEntry
                {
                    TargilId = formula.TargilId,
                    Method = MethodNames.Roslyn,
                    RunTime = seconds
                });

                Console.WriteLine($"Finished formula {formula.TargilId} in {seconds:N3} sec");
            }

            Console.WriteLine("Roslyn completed successfully.");
        }
        catch (Exception ex)
        {
            Console.WriteLine("ERROR:");
            Console.WriteLine(ex);
        }

        Console.WriteLine("Press any key to close...");
        Console.ReadKey();
    }
}