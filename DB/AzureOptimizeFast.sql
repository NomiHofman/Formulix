-- =====================================================================
-- FORMULIX – Azure SQL FAST OPTIMIZATION (Standard / Premium tier)
-- ---------------------------------------------------------------------
-- מריצים פעם אחת לפני סבב ריצה נקי של 4 המנועים על מיליון רשומות מלאות.
-- בטוח להרצה חוזרת (idempotent).
--
-- מה הסקריפט עושה:
--   1) TRUNCATE לטבלאות t_results ו-t_log (סבב נקי).
--   2) ממיר את t_results ל-HEAP (מסיר PK + IDENTITY) – INSERT-ים מהירים פי כמה.
--   3) מסיר FK constraints מ-t_results (FK בודק כל שורה ומאט bulk).
--   4) מוסיף NONCLUSTERED INDEX על (method, targil_id) INCLUDE (data_id, result):
--        – DELETE/SELECT WHERE method=? יהיה הרבה יותר מהיר.
--        – compare_results.py יסרוק רק מה שצריך.
--   5) מחליף את usp_RunDynamicFormula בגרסה אופטימלית:
--        – WITH (TABLOCK)  → minimally-logged bulk INSERT.
--        – WITH (NOLOCK) על t_data (קריאה בלבד, לא משפיע על דיוק).
--        – OPTION (MAXDOP 0, RECOMPILE) → מקסימום parallelism + plan נקי לכל נוסחה.
--
-- הערה לזמן עבודה:
--   המליצה: שדרגי את ה-DB ל-S3 (100 DTU) או יותר לפני ההרצה.
--   אחרי שהסבב מסתיים – אפשר להוריד חזרה ל-Basic/S0.
-- =====================================================================

SET NOCOUNT ON;
SET XACT_ABORT ON;

PRINT '====== Step 1/5 : TRUNCATE t_results, t_log ======';
TRUNCATE TABLE t_results;
TRUNCATE TABLE t_log;

PRINT '====== Step 2/5 : Drop FK constraints from t_results (slow on bulk INSERT) ======';
DECLARE @sql NVARCHAR(MAX) = N'';
SELECT @sql = @sql + N'ALTER TABLE t_results DROP CONSTRAINT ' + QUOTENAME(name) + N';' + CHAR(10)
FROM sys.foreign_keys
WHERE parent_object_id = OBJECT_ID('t_results');

IF LEN(@sql) > 0
BEGIN
    PRINT @sql;
    EXEC sp_executesql @sql;
END
ELSE
    PRINT '  (no FKs on t_results)';

PRINT '====== Step 3/5 : Convert t_results to HEAP (drop PK + IDENTITY) ======';
-- 3a. Drop primary key if it exists.
IF EXISTS (
    SELECT 1
    FROM sys.indexes i
    JOIN sys.tables  t ON i.object_id = t.object_id
    WHERE t.name = 't_results' AND i.is_primary_key = 1
)
BEGIN
    DECLARE @pkName sysname = (
        SELECT TOP 1 i.name
        FROM sys.indexes i
        JOIN sys.tables  t ON i.object_id = t.object_id
        WHERE t.name = 't_results' AND i.is_primary_key = 1
    );
    DECLARE @dropPk NVARCHAR(300) = N'ALTER TABLE t_results DROP CONSTRAINT ' + QUOTENAME(@pkName) + N';';
    PRINT @dropPk;
    EXEC sp_executesql @dropPk;
END
ELSE
    PRINT '  (no PK to drop)';

-- 3b. Drop the IDENTITY column (results_id) – we don't need it for benchmarking,
--     and IDENTITY adds overhead per row. Re-add as plain BIGINT (NULL allowed).
IF EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('t_results')
      AND name      = 'results_id'
      AND is_identity = 1
)
BEGIN
    PRINT '  Dropping IDENTITY column results_id...';
    ALTER TABLE t_results DROP COLUMN results_id;
    ALTER TABLE t_results ADD results_id BIGINT NULL;
END
ELSE
    PRINT '  (results_id is not IDENTITY)';

PRINT '====== Step 4/5 : Create lookup indexes ======';
-- Critical for compare_results.py (SELECT WHERE method=? AND targil_id=?)
-- and for ClearResultsForMethodAsync (DELETE WHERE method=?).
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID('t_results') AND name = 'IX_t_results_method_targil'
)
BEGIN
    PRINT '  Creating IX_t_results_method_targil...';
    CREATE NONCLUSTERED INDEX IX_t_results_method_targil
        ON t_results (method, targil_id)
        INCLUDE (data_id, result);
END
ELSE
    PRINT '  IX_t_results_method_targil already exists.';

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID('t_log') AND name = 'IX_t_log_method'
)
BEGIN
    PRINT '  Creating IX_t_log_method...';
    CREATE NONCLUSTERED INDEX IX_t_log_method
        ON t_log (method, targil_id);
END
ELSE
    PRINT '  IX_t_log_method already exists.';

PRINT '====== Step 5/5 : Replace usp_RunDynamicFormula with tuned version ======';
-- CREATE OR ALTER PROCEDURE must be the first statement of a batch,
-- so we wrap it in sp_executesql (works even from Azure Query Editor without GO).
DECLARE @createProc NVARCHAR(MAX) = N'
CREATE OR ALTER PROCEDURE usp_RunDynamicFormula
    @TargilId INT,
    @Method   VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Formula      VARCHAR(1000);
    DECLARE @Condition    VARCHAR(1000);
    DECLARE @FalseFormula VARCHAR(1000);
    DECLARE @Sql          NVARCHAR(MAX);
    DECLARE @StartTime    DATETIME2 = SYSDATETIME();

    SELECT
        @Formula      = targil,
        @Condition    = tnai,
        @FalseFormula = targil_false
    FROM t_targil
    WHERE targil_id = @TargilId;

    IF @Condition IS NULL
    BEGIN
        SET @Sql = N''
            INSERT INTO t_results WITH (TABLOCK) (data_id, targil_id, method, result)
            SELECT  data_id,
                    '' + CAST(@TargilId AS VARCHAR(20)) + '',
                    @Method,
                    CAST('' + @Formula + '' AS FLOAT)
            FROM t_data WITH (NOLOCK)
            OPTION (MAXDOP 0, RECOMPILE);'';
    END
    ELSE
    BEGIN
        -- "==" in t_targil → SQL "="
        SET @Condition = REPLACE(@Condition, ''=='', ''='');

        SET @Sql = N''
            INSERT INTO t_results WITH (TABLOCK) (data_id, targil_id, method, result)
            SELECT  data_id,
                    '' + CAST(@TargilId AS VARCHAR(20)) + '',
                    @Method,
                    CAST(
                      CASE WHEN '' + @Condition + ''
                           THEN '' + @Formula + ''
                           ELSE '' + @FalseFormula + ''
                      END AS FLOAT
                    )
            FROM t_data WITH (NOLOCK)
            OPTION (MAXDOP 0, RECOMPILE);'';
    END

    EXEC sp_executesql
        @Sql,
        N''@Method VARCHAR(50)'',
        @Method = @Method;

    INSERT INTO t_log (targil_id, method, run_time)
    VALUES (
        @TargilId,
        @Method,
        DATEDIFF(MILLISECOND, @StartTime, SYSDATETIME()) / 1000.0
    );
END;';

EXEC sp_executesql @createProc;

PRINT '';
PRINT '====================================================================';
PRINT '  Optimization complete!';
PRINT '  - t_results is now HEAP (no PK, no IDENTITY, no FKs).';
PRINT '  - NONCLUSTERED indexes created on (method, targil_id).';
PRINT '  - usp_RunDynamicFormula uses TABLOCK + MAXDOP 0 + RECOMPILE.';
PRINT '';
PRINT '  Next steps (in order):';
PRINT '    1. dotnet run --project src\Formulix\Formulix.SqlDynamic';
PRINT '    2. dotnet run --project src\Formulix\Formulix.RoslynRunner';
PRINT '    3. dotnet run --project src\Formulix\Formulix.AITranslator';
PRINT '    4. python  python\formulix_sympy\main.py';
PRINT '    5. python  tools\compare_results.py';
PRINT '====================================================================';
