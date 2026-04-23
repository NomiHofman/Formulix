using Microsoft.Data.SqlClient;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Add CORS for the dashboard
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowDashboard", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors("AllowDashboard");

// Connection string - Azure SQL Database
string GetConnectionString()
{
    return Environment.GetEnvironmentVariable("FORMULIX_DB_CONNECTION") 
        ?? "Server=tcp:formulix-srv-22042026.database.windows.net,1433;Initial Catalog=FormulixDB;Persist Security Info=False;User ID=formulixadmin;Password=Nh0583262051;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";
}

// GET /api/health - Health check
app.MapGet("/api/health", () => new { status = "ok", timestamp = DateTime.UtcNow });

// POST /api/seed - Insert 1M records in batches (idempotent - checks existing count)
app.MapPost("/api/seed", async () =>
{
    try
    {
        await using var connection = new SqlConnection(GetConnectionString());
        await connection.OpenAsync();

        await using var countCmd = new SqlCommand("SELECT COUNT(*) FROM t_data", connection);
        var existing = (int)await countCmd.ExecuteScalarAsync()!;

        const int target = 1_000_000;
        const int batchSize = 50_000;
        
        if (existing >= target)
        {
            return Results.Ok(new { message = "Data already seeded", existing, target });
        }

        var startFrom = existing + 1;
        var inserted = 0;
        var sw = System.Diagnostics.Stopwatch.StartNew();

        while (existing + inserted < target)
        {
            var batchStart = startFrom + inserted;
            var batchEnd = Math.Min(batchStart + batchSize - 1, target);

            var sql = $@"
                ;WITH Numbers AS (
                    SELECT TOP ({batchEnd - batchStart + 1})
                        ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) + {batchStart - 1} AS n
                    FROM sys.all_objects a CROSS JOIN sys.all_objects b
                )
                INSERT INTO t_data (data_id, a, b, c, d)
                SELECT n,
                    CAST((ABS(CHECKSUM(NEWID())) % 1000000) / 1000.0 + 1 AS FLOAT),
                    CAST((ABS(CHECKSUM(NEWID())) % 1000000) / 1000.0 + 1 AS FLOAT),
                    CAST((ABS(CHECKSUM(NEWID())) % 1000000) / 1000.0 + 1 AS FLOAT),
                    CAST((ABS(CHECKSUM(NEWID())) % 1000000) / 1000.0 + 1 AS FLOAT)
                FROM Numbers";

            await using var cmd = new SqlCommand(sql, connection);
            cmd.CommandTimeout = 120;
            await cmd.ExecuteNonQueryAsync();

            inserted += (batchEnd - batchStart + 1);
        }

        sw.Stop();
        return Results.Ok(new { 
            message = "Seed complete!",
            inserted,
            totalTime = $"{sw.Elapsed.TotalSeconds:F1}s"
        });
    }
    catch (Exception ex)
    {
        return Results.Problem($"Seed error: {ex.Message}");
    }
});

// GET /api/summary - Get benchmark summary for dashboard
app.MapGet("/api/summary", async () =>
{
    try
    {
        await using var connection = new SqlConnection(GetConnectionString());
        await connection.OpenAsync();

        // Get data count
        await using var countCmd = new SqlCommand("SELECT COUNT(*) FROM t_data", connection);
        var dataCount = (int)await countCmd.ExecuteScalarAsync()!;

        // Get formulas
        var formulas = new List<object>();
        await using var formulaCmd = new SqlCommand(
            "SELECT targil_id, targil, tnai, targil_false FROM t_targil ORDER BY targil_id", 
            connection);
        await using var formulaReader = await formulaCmd.ExecuteReaderAsync();
        while (await formulaReader.ReadAsync())
        {
            formulas.Add(new
            {
                targil_id = formulaReader.GetInt32(0),
                targil = formulaReader.GetString(1),
                tnai = formulaReader.IsDBNull(2) ? null : formulaReader.GetString(2),
                targil_false = formulaReader.IsDBNull(3) ? null : formulaReader.GetString(3)
            });
        }
        await formulaReader.CloseAsync();

        // Get logs
        var logs = new List<object>();
        await using var logCmd = new SqlCommand(
            "SELECT log_id, targil_id, method, run_time FROM t_log ORDER BY method, targil_id", 
            connection);
        await using var logReader = await logCmd.ExecuteReaderAsync();
        while (await logReader.ReadAsync())
        {
            logs.Add(new
            {
                log_id = logReader.GetInt32(0),
                targil_id = logReader.GetInt32(1),
                method = logReader.GetString(2),
                run_time = logReader.GetDouble(3)
            });
        }
        await logReader.CloseAsync();

        // Get summary per method
        var summary = new Dictionary<string, object>();
        await using var summaryCmd = new SqlCommand(@"
            SELECT 
                method,
                ROUND(AVG(run_time), 4) as avg,
                ROUND(MIN(run_time), 4) as min,
                ROUND(MAX(run_time), 4) as max,
                COUNT(*) as runs
            FROM t_log
            GROUP BY method", connection);
        await using var summaryReader = await summaryCmd.ExecuteReaderAsync();
        while (await summaryReader.ReadAsync())
        {
            var method = summaryReader.GetString(0);
            summary[method] = new
            {
                avg = summaryReader.GetDouble(1),
                min = summaryReader.GetDouble(2),
                max = summaryReader.GetDouble(3),
                runs = summaryReader.GetInt32(4),
                total_ops = dataCount * formulas.Count
            };
        }

        return Results.Ok(new
        {
            exportedAt = DateTime.UtcNow.ToString("o"),
            dataCount,
            formulaCount = formulas.Count,
            formulas,
            logs,
            summary,
            source = "live-db"
        });
    }
    catch (Exception ex)
    {
        return Results.Problem($"Database error: {ex.Message}");
    }
});

// GET /api/results/sample - Get sample results for verification
app.MapGet("/api/results/sample", async () =>
{
    try
    {
        await using var connection = new SqlConnection(GetConnectionString());
        await connection.OpenAsync();

        var results = new List<object>();
        await using var cmd = new SqlCommand(@"
            SELECT TOP 100 
                r.data_id, r.targil_id, r.method, r.result,
                t.targil
            FROM t_results r
            JOIN t_targil t ON r.targil_id = t.targil_id
            ORDER BY r.data_id, r.targil_id", connection);
        
        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            results.Add(new
            {
                data_id = reader.GetInt32(0),
                targil_id = reader.GetInt32(1),
                method = reader.GetString(2),
                result = reader.IsDBNull(3) ? null : (double?)reader.GetDouble(3),
                formula = reader.GetString(4)
            });
        }

        return Results.Ok(results);
    }
    catch (Exception ex)
    {
        return Results.Problem($"Database error: {ex.Message}");
    }
});

// POST /api/setup/stored-procedure - Create the stored procedure for SQL Dynamic engine
app.MapPost("/api/setup/stored-procedure", async () =>
{
    try
    {
        await using var connection = new SqlConnection(GetConnectionString());
        await connection.OpenAsync();

        var sql = @"
CREATE OR ALTER PROCEDURE usp_RunDynamicFormula
    @TargilId INT,
    @Method VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Formula VARCHAR(1000);
    DECLARE @Condition VARCHAR(1000);
    DECLARE @FalseFormula VARCHAR(1000);
    DECLARE @Sql NVARCHAR(MAX);
    DECLARE @StartTime DATETIME2 = SYSDATETIME();
    
    SELECT 
        @Formula = targil, 
        @Condition = tnai, 
        @FalseFormula = targil_false
    FROM t_targil 
    WHERE targil_id = @TargilId;
    
    IF @Condition IS NULL
    BEGIN
        SET @Sql = N'
            INSERT INTO t_results (data_id, targil_id, method, result)
            SELECT data_id, ' + CAST(@TargilId AS VARCHAR(20)) + ', @Method, 
                   CAST(' + @Formula + ' AS FLOAT)
            FROM t_data';
    END
    ELSE
    BEGIN
        SET @Condition = REPLACE(@Condition, '==', '=');
        SET @Sql = N'
            INSERT INTO t_results (data_id, targil_id, method, result)
            SELECT data_id, ' + CAST(@TargilId AS VARCHAR(20)) + ', @Method, 
                   CAST(
                       CASE WHEN ' + @Condition + ' THEN ' + @Formula + '
                            ELSE ' + @FalseFormula + '
                       END 
                   AS FLOAT)
            FROM t_data';
    END
    
    EXEC sp_executesql @Sql, N'@Method VARCHAR(50)', @Method = @Method;
    
    INSERT INTO t_log (targil_id, method, run_time)
    VALUES (
        @TargilId, 
        @Method, 
        DATEDIFF(MILLISECOND, @StartTime, SYSDATETIME()) / 1000.0
    );
END";

        await using var cmd = new SqlCommand(sql, connection);
        cmd.CommandTimeout = 60;
        await cmd.ExecuteNonQueryAsync();

        return Results.Ok(new { message = "Stored procedure created successfully!" });
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error creating stored procedure: {ex.Message}");
    }
});

// POST /api/run/sql-dynamic - Run SQL Dynamic engine on all formulas
app.MapPost("/api/run/sql-dynamic", async () =>
{
    try
    {
        await using var connection = new SqlConnection(GetConnectionString());
        await connection.OpenAsync();

        // Clear previous results
        await using var clearResultsCmd = new SqlCommand(
            "DELETE FROM t_results WHERE method = 'SQLDynamic'", connection);
        clearResultsCmd.CommandTimeout = 300;
        await clearResultsCmd.ExecuteNonQueryAsync();

        await using var clearLogsCmd = new SqlCommand(
            "DELETE FROM t_log WHERE method = 'SQLDynamic'", connection);
        await clearLogsCmd.ExecuteNonQueryAsync();

        // Get formula count
        await using var countCmd = new SqlCommand("SELECT COUNT(*) FROM t_targil", connection);
        var formulaCount = (int)await countCmd.ExecuteScalarAsync()!;

        var sw = System.Diagnostics.Stopwatch.StartNew();
        var completed = 0;

        // Run each formula
        for (int targilId = 1; targilId <= formulaCount; targilId++)
        {
            await using var cmd = new SqlCommand("usp_RunDynamicFormula", connection);
            cmd.CommandType = System.Data.CommandType.StoredProcedure;
            cmd.CommandTimeout = 600; // 10 minutes per formula
            cmd.Parameters.AddWithValue("@TargilId", targilId);
            cmd.Parameters.AddWithValue("@Method", "SQLDynamic");
            
            await cmd.ExecuteNonQueryAsync();
            completed++;
        }

        sw.Stop();

        return Results.Ok(new
        {
            message = "SQL Dynamic engine completed!",
            formulasProcessed = completed,
            totalTime = $"{sw.Elapsed.TotalSeconds:F1}s"
        });
    }
    catch (Exception ex)
    {
        return Results.Problem($"SQL Dynamic error: {ex.Message}");
    }
});

// POST /api/run/clear-sample-logs - Clear sample log data to prepare for real benchmarks
app.MapPost("/api/run/clear-sample-logs", async () =>
{
    try
    {
        await using var connection = new SqlConnection(GetConnectionString());
        await connection.OpenAsync();

        await using var cmd = new SqlCommand("DELETE FROM t_log", connection);
        var deleted = await cmd.ExecuteNonQueryAsync();

        return Results.Ok(new { message = "Sample logs cleared", deletedRows = deleted });
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error: {ex.Message}");
    }
});

// GET /api/status - Get current database status
app.MapGet("/api/status", async () =>
{
    try
    {
        await using var connection = new SqlConnection(GetConnectionString());
        await connection.OpenAsync();

        await using var cmd = new SqlCommand(@"
            SELECT 
                (SELECT COUNT(*) FROM t_data) as data_count,
                (SELECT COUNT(*) FROM t_targil) as formula_count,
                (SELECT COUNT(*) FROM t_results) as results_count,
                (SELECT COUNT(*) FROM t_log) as log_count,
                (SELECT COUNT(DISTINCT method) FROM t_log) as methods_with_logs", connection);
        
        await using var reader = await cmd.ExecuteReaderAsync();
        await reader.ReadAsync();

        return Results.Ok(new
        {
            dataCount = reader.GetInt32(0),
            formulaCount = reader.GetInt32(1),
            resultsCount = reader.GetInt32(2),
            logCount = reader.GetInt32(3),
            methodsWithLogs = reader.GetInt32(4),
            timestamp = DateTime.UtcNow
        });
    }
    catch (Exception ex)
    {
        return Results.Problem($"Status error: {ex.Message}");
    }
});

app.Run();
