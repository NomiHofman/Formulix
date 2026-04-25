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
    // Bulk-insert batch size for Azure SQL.
    // Anything below ~50K wastes round-trips; SqlBulkCopy itself happily streams larger batches.
    private const int BatchSize = 50_000;

    private static async Task Main()
    {
        try
        {
            DatabaseSettings settings = new();
            IFormulixRepository repository = new SqlFormulixRepository(settings);

            // Try the real OpenAI service; fall back to a deterministic Mock if it fails.
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

                // Stream rows from t_data → evaluate → yield results.
                // InsertResultsStreamAsync uses a single long-lived connection +
                // SqlBulkCopy with TABLOCK at 50K-row batches — critical for Azure SQL throughput.
                IAsyncEnumerable<FormulaResult> resultStream = EvaluateStreamAsync(
                    repository,
                    runner,
                    formula.TargilId,
                    MethodNames.AITranslated);

                await repository.InsertResultsStreamAsync(resultStream, batchSize: BatchSize);

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
