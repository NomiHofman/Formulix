CREATE DATABASE Formulix;
GO

USE Formulix;
GO

-- 1. טבלת נתונים t_data
CREATE TABLE t_data (
    data_id INT NOT NULL PRIMARY KEY,
    a FLOAT NOT NULL,
    b FLOAT NOT NULL,
    c FLOAT NOT NULL,
    d FLOAT NOT NULL
);
GO

-- 2. טבלת נוסחאות t_targil
CREATE TABLE t_targil (
    targil_id INT NOT NULL PRIMARY KEY,
    targil VARCHAR(500) NOT NULL,
    tnai VARCHAR(1000) NULL,
    targil_false VARCHAR(500) NULL
);
GO

-- 3. טבלת תוצאות t_results
CREATE TABLE t_results (
    results_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    data_id INT NOT NULL,
    targil_id INT NOT NULL,
    method VARCHAR(50) NOT NULL,
    result FLOAT NULL,
    CONSTRAINT FK_results_data FOREIGN KEY (data_id) REFERENCES t_data(data_id),
    CONSTRAINT FK_results_targil FOREIGN KEY (targil_id) REFERENCES t_targil(targil_id)
);
GO

-- 4. טבלת לוג t_log
CREATE TABLE t_log (
    log_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    targil_id INT NOT NULL,
    method VARCHAR(50) NOT NULL,
    run_time FLOAT NOT NULL,
    CONSTRAINT FK_log_targil FOREIGN KEY (targil_id) REFERENCES t_targil(targil_id)
);
GO

USE Formulix;
GO

;WITH Numbers AS
(
    SELECT TOP (1000000)
        ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS n
    FROM sys.all_objects a
    CROSS JOIN sys.all_objects b
    CROSS JOIN sys.all_objects c
)
INSERT INTO t_data (data_id, a, b, c, d)
SELECT
    n,
    CAST((ABS(CHECKSUM(NEWID())) % 1000000) / 1000.0 + 1 AS FLOAT),
    CAST((ABS(CHECKSUM(NEWID())) % 1000000) / 1000.0 + 1 AS FLOAT),
    CAST((ABS(CHECKSUM(NEWID())) % 1000000) / 1000.0 + 1 AS FLOAT),
    CAST((ABS(CHECKSUM(NEWID())) % 1000000) / 1000.0 + 1 AS FLOAT)
FROM Numbers;
GO

USE Formulix;
GO

INSERT INTO t_targil (targil_id, targil, tnai, targil_false)
VALUES
    (1,  'a + b',                    NULL,      NULL),
    (2,  'c * 2',                    NULL,      NULL),
    (3,  'a - b',                    NULL,      NULL),
    (4,  'd / 4',                    NULL,      NULL),
    (5,  '8 * (a + b)',              NULL,      NULL),
    (6,  '(c * c) + (d * d)',        NULL,      NULL),
    (7,  '(a + b + c + d) / 4',      NULL,      NULL),
    (8,  '(a * b) - (c / 2)',        NULL,      NULL),
    (9,  'b * 2',                    'a > 5',   'b / 2'),
    (10, 'a + 1',                    'b < 10',  'd - 1'),
    (11, '1',                        'a == c',  '0'),
    (12, '(a + b) * 2',              'c > d',   '(a + b) / 2');
GO

USE Formulix;
GO

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
                     CASE WHEN ' + @Condition + '
                          THEN ' + @Formula + '
                          ELSE ' + @FalseFormula + '
                     END AS FLOAT
                   )
            FROM t_data WITH (NOLOCK)
            OPTION (MAXDOP 0);';
    END

    EXEC sp_executesql
        @Sql,
        N'@Method VARCHAR(50)',
        @Method = @Method;

    INSERT INTO t_log (targil_id, method, run_time)
    VALUES (
        @TargilId,
        @Method,
        DATEDIFF(MILLISECOND, @StartTime, SYSDATETIME()) / 1000.0
    );
END
GO