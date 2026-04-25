import sql from 'mssql';
import { getMssqlConfig } from './lib/azureConfig.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { error, config } = getMssqlConfig({
    connectionTimeout: 30000,
    requestTimeout: 120000,
  });
  if (error) {
    return res.status(503).json({ error: 'Configuration required', detail: error });
  }

  const steps = [];
  let pool;
  try {
    pool = await sql.connect(config);

    // 1) TRUNCATE
    await pool.request().query('TRUNCATE TABLE t_results; TRUNCATE TABLE t_log;');
    steps.push('TRUNCATE t_results + t_log');

    // 2) Drop PK if exists
    const pkCheck = await pool.request().query(`
      SELECT TOP 1 i.name AS pkName
      FROM sys.indexes i JOIN sys.tables t ON i.object_id = t.object_id
      WHERE t.name = 't_results' AND i.is_primary_key = 1
    `);
    if (pkCheck.recordset.length > 0) {
      const pkName = pkCheck.recordset[0].pkName;
      await pool.request().query(`ALTER TABLE t_results DROP CONSTRAINT [${pkName}]`);
      steps.push(`Dropped PK: ${pkName}`);
    }

    // 3) Remove IDENTITY column if present
    const idCheck = await pool.request().query(`
      SELECT 1 AS has_identity FROM sys.columns
      WHERE object_id = OBJECT_ID('t_results') AND name = 'results_id' AND is_identity = 1
    `);
    if (idCheck.recordset.length > 0) {
      await pool.request().query('ALTER TABLE t_results DROP COLUMN results_id');
      await pool.request().query('ALTER TABLE t_results ADD results_id BIGINT NULL');
      steps.push('Converted results_id from IDENTITY to plain BIGINT (HEAP)');
    }

    // 4) Create indexes if missing
    const ixCheck = await pool.request().query(`
      SELECT name FROM sys.indexes
      WHERE object_id = OBJECT_ID('t_results') AND name = 'IX_t_results_method_targil'
    `);
    if (ixCheck.recordset.length === 0) {
      await pool.request().query(`
        CREATE NONCLUSTERED INDEX IX_t_results_method_targil
        ON t_results (method, targil_id) INCLUDE (data_id, result)
      `);
      steps.push('Created IX_t_results_method_targil');
    }

    const ixLogCheck = await pool.request().query(`
      SELECT name FROM sys.indexes
      WHERE object_id = OBJECT_ID('t_log') AND name = 'IX_t_log_method'
    `);
    if (ixLogCheck.recordset.length === 0) {
      await pool.request().query(`
        CREATE NONCLUSTERED INDEX IX_t_log_method ON t_log (method, targil_id)
      `);
      steps.push('Created IX_t_log_method');
    }

    // 5) Create optimized SP with TABLOCK + MAXDOP 0
    await pool.request().query(`
      CREATE OR ALTER PROCEDURE usp_RunDynamicFormula
        @TargilId INT,
        @Method   VARCHAR(50)
      AS
      BEGIN
        SET NOCOUNT ON;
        DECLARE @Formula VARCHAR(1000), @Condition VARCHAR(1000), @FalseFormula VARCHAR(1000);
        DECLARE @Sql NVARCHAR(MAX), @StartTime DATETIME2 = SYSDATETIME();

        SELECT @Formula = targil, @Condition = tnai, @FalseFormula = targil_false
        FROM t_targil WHERE targil_id = @TargilId;

        IF @Condition IS NULL
          SET @Sql = N'INSERT INTO t_results WITH (TABLOCK) (data_id, targil_id, method, result)
            SELECT data_id, ' + CAST(@TargilId AS VARCHAR(20)) + ', @Method,
            CAST(' + @Formula + ' AS FLOAT) FROM t_data WITH (NOLOCK) OPTION (MAXDOP 0);';
        ELSE
        BEGIN
          SET @Condition = REPLACE(@Condition, '==', '=');
          SET @Sql = N'INSERT INTO t_results WITH (TABLOCK) (data_id, targil_id, method, result)
            SELECT data_id, ' + CAST(@TargilId AS VARCHAR(20)) + ', @Method,
            CAST(CASE WHEN ' + @Condition + ' THEN ' + @Formula + ' ELSE ' + @FalseFormula + ' END AS FLOAT)
            FROM t_data WITH (NOLOCK) OPTION (MAXDOP 0);';
        END;

        EXEC sp_executesql @Sql, N'@Method VARCHAR(50)', @Method = @Method;

        INSERT INTO t_log (targil_id, method, run_time)
        VALUES (@TargilId, @Method, DATEDIFF(MILLISECOND, @StartTime, SYSDATETIME()) / 1000.0);
      END
    `);
    steps.push('Created optimized SP (TABLOCK + MAXDOP 0)');

    // 6) Check current table state
    const info = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM t_data) AS dataRows,
        (SELECT COUNT(*) FROM t_targil) AS formulas,
        (SELECT COUNT(*) FROM t_results) AS results,
        (SELECT COUNT(*) FROM t_log) AS logs
    `);

    return res.status(200).json({
      message: 'Optimization complete!',
      steps,
      dbState: info.recordset[0],
    });
  } catch (err) {
    return res.status(500).json({ error: err.message, steps });
  } finally {
    if (pool) await pool.close();
  }
}
