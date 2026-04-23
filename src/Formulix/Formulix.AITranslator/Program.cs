using Formulix.AITranslator.Services;
using Formulix.Shared.Configuration;
using Formulix.Shared.Constants;
using Formulix.Shared.Data;
using Formulix.Shared.Models;
using Formulix.Shared.Utilities;
using Microsoft.CodeAnalysis.Scripting;

namespace Formulix.AITranslator;

internal static class Program
{
    private const int BatchSize = 5000;

    private static async Task Main()
    {
        try
        {
            DatabaseSettings settings = new();
            IFormulixRepository repository = new SqlFormulixRepository(settings);

            // ניסיון להשתמש ב-AI אמיתי
            IFormulaTranslationService primaryService;
            IFormulaTranslationService fallbackService = new MockFormulaTranslationService();

            try
            {
                primaryService = new OpenAiFormulaTranslationService();
                Console.WriteLine("Using OpenAI translation service.");
            }
            catch (Exception ex)
            {
                Console.WriteLine("OpenAI not available, using Mock.");
                Console.WriteLine(ex.Message);
                primaryService = fallbackService;
            }

            Console.WriteLine("Loading formulas...");
            IReadOnlyList<FormulaDefinition> formulas = await repository.GetFormulasAsync();

            Console.WriteLine("Cleaning previous AITranslated results...");
            await repository.ClearResultsForMethodAsync(MethodNames.AITranslated);
            await repository.ClearLogsForMethodAsync(MethodNames.AITranslated);

            Dictionary<int, ScriptRunner<double>> compiledRunners = new();

            Console.WriteLine("Translating and compiling formulas...");

            foreach (FormulaDefinition formula in formulas)
            {
                string businessExpression = FormulaCompiler.BuildBusinessExpression(
                    formula.Targil,
                    formula.Tnai,
                    formula.TargilFalse);

                string translatedExpression;

                try
                {
                    translatedExpression =
                        await primaryService.TranslateToCSharpExpressionAsync(businessExpression);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"AI failed for formula {formula.TargilId}, fallback to Mock.");
                    Console.WriteLine(ex.Message);

                    translatedExpression =
                        await fallbackService.TranslateToCSharpExpressionAsync(businessExpression);
                }

                compiledRunners[formula.TargilId] =
                    FormulaCompiler.Compile(translatedExpression);

                Console.WriteLine($"Formula {formula.TargilId}");
                Console.WriteLine($"  Business : {businessExpression}");
                Console.WriteLine($"  C#       : {translatedExpression}");
            }

            foreach (FormulaDefinition formula in formulas)
            {
                Console.WriteLine($"Running formula {formula.TargilId}: {formula.Targil}");

                BenchmarkTimer timer = new();
                timer.Start();

                ScriptRunner<double> runner = compiledRunners[formula.TargilId];
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
                        Method = MethodNames.AITranslated,
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
                }

                double seconds = timer.StopSeconds();

                await repository.InsertLogAsync(new LogEntry
                {
                    TargilId = formula.TargilId,
                    Method = MethodNames.AITranslated,
                    RunTime = seconds
                });

                Console.WriteLine($"Finished formula {formula.TargilId} in {seconds:N3} sec");
            }

            Console.WriteLine("AITranslator completed successfully.");
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