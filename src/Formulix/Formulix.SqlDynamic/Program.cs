using Formulix.Shared.Configuration;
using Formulix.Shared.Constants;
using Formulix.Shared.Data;
using Microsoft.Data.SqlClient;

namespace Formulix.SqlDynamic;

internal static class Program
{
    private static async Task Main()
    {
        DatabaseSettings settings = new();
        IFormulixRepository repository = new SqlFormulixRepository(settings);

        Console.WriteLine("Loading formulas...");
        IReadOnlyList<Formulix.Shared.Models.FormulaDefinition> formulas =
            await repository.GetFormulasAsync();

        Console.WriteLine("Cleaning previous SQLDynamic results...");
        await repository.ClearResultsForMethodAsync(MethodNames.SqlDynamic);
        await repository.ClearLogsForMethodAsync(MethodNames.SqlDynamic);

        await using SqlConnection connection = new(settings.ConnectionString);
        await connection.OpenAsync();

        foreach (Formulix.Shared.Models.FormulaDefinition formula in formulas)
        {
            Console.WriteLine($"Running formula {formula.TargilId}: {formula.Targil}");

            await using SqlCommand command = new("usp_RunDynamicFormula", connection);
            command.CommandType = System.Data.CommandType.StoredProcedure;
            command.CommandTimeout = 0;

            command.Parameters.AddWithValue("@TargilId", formula.TargilId);
            command.Parameters.AddWithValue("@Method", MethodNames.SqlDynamic);

            await command.ExecuteNonQueryAsync();
        }

        Console.WriteLine("SQLDynamic completed successfully.");
    }
}