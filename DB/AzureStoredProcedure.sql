-- =====================================================
-- FORMULIX - Stored Procedure for SQL Dynamic Engine
-- הרץ את הסקריפט הזה ב-Azure Query Editor
-- =====================================================

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
            INSERT INTO t_results WITH (TABLOCK) (data_id, targil_id, method, result)
            SELECT data_id, ' + CAST(@TargilId AS VARCHAR(20)) + ', @Method,
                   CAST(' + @Formula + ' AS FLOAT)
            FROM t_data WITH (NOLOCK)
            OPTION (MAXDOP 0);';
    END
    ELSE
    BEGIN
        SET @Condition = REPLACE(@Condition, '==', '=');
        SET @Sql = N'
            INSERT INTO t_results WITH (TABLOCK) (data_id, targil_id, method, result)
            SELECT data_id, ' + CAST(@TargilId AS VARCHAR(20)) + ', @Method,
                   CAST(
                       CASE WHEN ' + @Condition + ' THEN ' + @Formula + '
                            ELSE ' + @FalseFormula + '
                       END
                   AS FLOAT)
            FROM t_data WITH (NOLOCK)
            OPTION (MAXDOP 0);';
    END
    
    EXEC sp_executesql @Sql, N'@Method VARCHAR(50)', @Method = @Method;
    
    INSERT INTO t_log (targil_id, method, run_time)
    VALUES (
        @TargilId, 
        @Method, 
        DATEDIFF(MILLISECOND, @StartTime, SYSDATETIME()) / 1000.0
    );
END;
