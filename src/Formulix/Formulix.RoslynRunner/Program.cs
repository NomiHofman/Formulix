using Formulix.Shared.Configuration;
using Formulix.Shared.Constants;
using Formulix.Shared.Data;
using Formulix.Shared.Models;
using Formulix.Shared.Utilities;
using Microsoft.CodeAnalysis.Scripting;

namespace Formulix.RoslynRunner;

internal static class Program
{
    // Bulk-insert batch size for Azure SQL.
    // Anything below ~50K wastes round-trips; SqlBulkCopy itself happily streams larger batches.
    private const int BatchSize = 50_000;

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

                // Stream rows from t_data → evaluate → yield results.
                // The repository's InsertResultsStreamAsync opens ONE long-lived connection
                // and uses SqlBulkCopy with TABLOCK + 50K batches. This is the single biggest
                // perf win against Azure SQL (vs. opening a connection per batch).
                IAsyncEnumerable<FormulaResult> resultStream = EvaluateStreamAsync(
                    repository,
                    runner,
                    formula.TargilId,
                    MethodNames.Roslyn);

                await repository.InsertResultsStreamAsync(resultStream, batchSize: BatchSize);

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

    private static async IAsyncEnumerable<FormulaResult> EvaluateStreamAsync(
        IFormulixRepository repository,
        ScriptRunner<double> runner,
        int targilId,
        string methodName)
    {
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

            yield return new FormulaResult
            {
                DataId = row.DataId,
                TargilId = targilId,
                Method = methodName,
                Result = result
            };
        }
    }
}
