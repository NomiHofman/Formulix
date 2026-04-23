-- =====================================================
-- FORMULIX - OPTIMIZATION SCRIPT (Azure SQL / SQL Server)
-- ניתן להרצה ב-Azure Portal Query Editor, ב-SSMS, או ב-sqlcmd.
--
-- מה הסקריפט עושה (בטוח להרצה חוזרת):
--   1. TRUNCATE t_results ו-t_log   -- התוצאות ממילא יתחדשו בריצה הבאה של המנועים
--   2. מוריד Primary Key/IDENTITY מ-t_results  ->  HEAP (הכי מהיר לבנצ'מרק)
--   3. מוסיף אינדקסים ל-(method) עבור DELETE/SELECT לפי שיטה
--   4. מחליף את usp_RunDynamicFormula בגרסה עם TABLOCK + MAXDOP 0
--
-- הנתונים ב-t_data ו-t_targil לא נוגעים.
-- =====================================================

SET NOCOUNT ON;

-- ---------- 1) TRUNCATE ----------
-- מרוקן תוצאות קודמות; כל המנועים מבצעים Clear + Insert מחדש בריצה שלהם ממילא.
TRUNCATE TABLE t_results;
TRUNCATE TABLE t_log;

-- ---------- 2) HEAP: הסרת PK + IDENTITY ----------
-- הורדת PK (אם קיים)
IF EXISTS (
    SELECT 1
    FROM sys.indexes i
    JOIN sys.tables t ON i.object_id = t.object_id
    WHERE t.name = 't_results' AND i.is_primary_key = 1
)
BEGIN
    DECLARE @pkName sysname = (
        SELECT TOP 1 i.name
        FROM sys.indexes i
        JOIN sys.tables t ON i.object_id = t.object_id
        WHERE t.name = 't_results' AND i.is_primary_key = 1
    );
    DECLARE @dropPk NVARCHAR(300) = N'ALTER TABLE t_results DROP CONSTRAINT ' + QUOTENAME(@pkName) + N';';
    EXEC sp_executesql @dropPk;
END;

-- החלפת עמודת results_id אם היא IDENTITY  (מהיר, כי הטבלה ריקה אחרי TRUNCATE)
IF EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('t_results') AND name = 'results_id' AND is_identity = 1
)
BEGIN
    ALTER TABLE t_results DROP COLUMN results_id;
    ALTER TABLE t_results ADD results_id BIGINT NULL;  -- עמודת מזהה (ללא IDENTITY -> insert מהיר ל-HEAP)
END;

-- ---------- 3) אינדקסים ----------
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID('t_results') AND name = 'IX_t_results_method_targil'
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_t_results_method_targil
        ON t_results (method, targil_id)
        INCLUDE (data_id, result);
END;

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID('t_log') AND name = 'IX_t_log_method'
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_t_log_method
        ON t_log (method, targil_id);
END;

-- ---------- 4) SP מהירה יותר (TABLOCK + MAXDOP 0) ----------
-- CREATE OR ALTER PROCEDURE חייבת "ראשונה בבאטץ'",
-- לכן נעטף ב-sp_executesql (כך עובד ב-Azure Query Editor בלי GO).
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
            SELECT data_id, '' + CAST(@TargilId AS VARCHAR(20)) + '', @Method,
                   CAST('' + @Formula + '' AS FLOAT)
            FROM t_data WITH (NOLOCK)
            OPTION (MAXDOP 0);'';
    END
    ELSE
    BEGIN
        SET @Condition = REPLACE(@Condition, ''=='', ''='');

        SET @Sql = N''
            INSERT INTO t_results WITH (TABLOCK) (data_id, targil_id, method, result)
            SELECT data_id, '' + CAST(@TargilId AS VARCHAR(20)) + '', @Method,
                   CAST(
                     CASE WHEN '' + @Condition + ''
                          THEN '' + @Formula + ''
                          ELSE '' + @FalseFormula + ''
                     END AS FLOAT
                   )
            FROM t_data WITH (NOLOCK)
            OPTION (MAXDOP 0);'';
    END;

    EXEC sp_executesql @Sql, N''@Method VARCHAR(50)'', @Method = @Method;

    INSERT INTO t_log (targil_id, method, run_time)
    VALUES (
        @TargilId,
        @Method,
        DATEDIFF(MILLISECOND, @StartTime, SYSDATETIME()) / 1000.0
    );
END;';

EXEC sp_executesql @createProc;

PRINT 'Optimization complete. t_results is HEAP, indexes created, SP uses TABLOCK.';
