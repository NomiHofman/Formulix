using Formulix.Shared.Configuration;
using Formulix.Shared.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace Formulix.Shared.Data;

public sealed class SqlFormulixRepository : IFormulixRepository
{
    private readonly string _connectionString;

    public SqlFormulixRepository(DatabaseSettings settings)
    {
        _connectionString = settings.ConnectionString;
    }

    public async Task<IReadOnlyList<FormulaDefinition>> GetFormulasAsync(CancellationToken cancellationToken = default)
    {
        List<FormulaDefinition> formulas = new();

        await using SqlConnection connection = new(_connectionString);
        await connection.OpenAsync(cancellationToken);

        const string sql = """
            SELECT targil_id, targil, tnai, targil_false
            FROM t_targil
            ORDER BY targil_id
            """;

        await using SqlCommand command = new(sql, connection);
        await using SqlDataReader reader = await command.ExecuteReaderAsync(cancellationToken);

        while (await reader.ReadAsync(cancellationToken))
        {
            FormulaDefinition formula = new()
            {
                TargilId = reader.GetInt32(0),
                Targil = reader.GetString(1),
                Tnai = reader.IsDBNull(2) ? null : reader.GetString(2),
                TargilFalse = reader.IsDBNull(3) ? null : reader.GetString(3)
            };

            formulas.Add(formula);
        }

        return formulas;
    }

    public async IAsyncEnumerable<DataRecord> StreamDataAsync(
        [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        await using SqlConnection connection = new(_connectionString);
        await connection.OpenAsync(cancellationToken);

        const string sql = """
            SELECT data_id, a, b, c, d
            FROM t_data
            ORDER BY data_id
            """;

        await using SqlCommand command = new(sql, connection);
        command.CommandTimeout = 0;

        await using SqlDataReader reader = await command.ExecuteReaderAsync(CommandBehavior.SequentialAccess, cancellationToken);

        while (await reader.ReadAsync(cancellationToken))
        {
            yield return new DataRecord
            {
                DataId = reader.GetInt32(0),
                A = Convert.ToDouble(reader["a"]),
                B = Convert.ToDouble(reader["b"]),
                C = Convert.ToDouble(reader["c"]),
                D = Convert.ToDouble(reader["d"])
            };
        }
    }

    public async Task InsertResultsBulkAsync(IReadOnlyList<FormulaResult> results, CancellationToken cancellationToken = default)
    {
        if (results.Count == 0)
        {
            return;
        }

        DataTable table = BuildResultsTable(results);

        await using SqlConnection connection = new(_connectionString);
        await connection.OpenAsync(cancellationToken);

        await BulkCopyResultsAsync(connection, table, cancellationToken);
    }

    /// <summary>
    /// Streams <paramref name="rows"/> into t_results using a single long-lived connection.
    /// Order of magnitude faster against Azure SQL than opening a connection per batch.
    /// </summary>
    public async Task InsertResultsStreamAsync(
        IAsyncEnumerable<FormulaResult> rows,
        int batchSize = 50_000,
        CancellationToken cancellationToken = default)
    {
        await using SqlConnection connection = new(_connectionString);
        await connection.OpenAsync(cancellationToken);

        List<FormulaResult> batch = new(batchSize);

        await foreach (FormulaResult row in rows.WithCancellation(cancellationToken))
        {
            batch.Add(row);
            if (batch.Count >= batchSize)
            {
                await BulkCopyResultsAsync(connection, BuildResultsTable(batch), cancellationToken);
                batch.Clear();
            }
        }

        if (batch.Count > 0)
        {
            await BulkCopyResultsAsync(connection, BuildResultsTable(batch), cancellationToken);
        }
    }

    private static DataTable BuildResultsTable(IReadOnlyList<FormulaResult> results)
    {
        DataTable table = new();
        table.Columns.Add("data_id", typeof(int));
        table.Columns.Add("targil_id", typeof(int));
        table.Columns.Add("method", typeof(string));
        table.Columns.Add("result", typeof(double));

        foreach (FormulaResult result in results)
        {
            object resultValue = result.Result.HasValue ? result.Result.Value : DBNull.Value;
            table.Rows.Add(result.DataId, result.TargilId, result.Method, resultValue);
        }

        return table;
    }

    private static async Task BulkCopyResultsAsync(SqlConnection connection, DataTable table, CancellationToken cancellationToken)
    {
        // TableLock => minimally-logged bulk insert on HEAP targets; critical for Azure perf.
        using SqlBulkCopy bulkCopy = new(connection, SqlBulkCopyOptions.TableLock, externalTransaction: null)
        {
            DestinationTableName = "t_results",
            BatchSize = 50_000,
            BulkCopyTimeout = 0,
            EnableStreaming = true,
        };

        bulkCopy.ColumnMappings.Add("data_id", "data_id");
        bulkCopy.ColumnMappings.Add("targil_id", "targil_id");
        bulkCopy.ColumnMappings.Add("method", "method");
        bulkCopy.ColumnMappings.Add("result", "result");

        await bulkCopy.WriteToServerAsync(table, cancellationToken);
    }

    public async Task InsertLogAsync(LogEntry logEntry, CancellationToken cancellationToken = default)
    {
        await using SqlConnection connection = new(_connectionString);
        await connection.OpenAsync(cancellationToken);

        const string sql = """
            INSERT INTO t_log (targil_id, method, run_time)
            VALUES (@targil_id, @method, @run_time)
            """;

        await using SqlCommand command = new(sql, connection);
        command.Parameters.AddWithValue("@targil_id", logEntry.TargilId);
        command.Parameters.AddWithValue("@method", logEntry.Method);
        command.Parameters.AddWithValue("@run_time", logEntry.RunTime);

        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    public async Task ClearResultsForMethodAsync(string method, CancellationToken cancellationToken = default)
    {
        await using SqlConnection connection = new(_connectionString);
        await connection.OpenAsync(cancellationToken);

        const string sql = "DELETE FROM t_results WHERE method = @method";

        await using SqlCommand command = new(sql, connection);
        command.Parameters.AddWithValue("@method", method);

        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    public async Task ClearLogsForMethodAsync(string method, CancellationToken cancellationToken = default)
    {
        await using SqlConnection connection = new(_connectionString);
        await connection.OpenAsync(cancellationToken);

        const string sql = "DELETE FROM t_log WHERE method = @method";

        await using SqlCommand command = new(sql, connection);
        command.Parameters.AddWithValue("@method", method);

        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    public async Task TruncateAllResultsAsync(CancellationToken cancellationToken = default)
    {
        await using SqlConnection connection = new(_connectionString);
        await connection.OpenAsync(cancellationToken);

        // TRUNCATE is minimally-logged and much faster than DELETE for emptying the whole table.
        const string sql = "TRUNCATE TABLE t_results; TRUNCATE TABLE t_log;";

        await using SqlCommand command = new(sql, connection) { CommandTimeout = 0 };
        await command.ExecuteNonQueryAsync(cancellationToken);
    }
}