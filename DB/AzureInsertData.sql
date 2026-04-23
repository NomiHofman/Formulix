-- =====================================================
-- FORMULIX - הכנסת מיליון רשומות
-- הרץ אחרי AzureSetup.sql
-- =====================================================

-- הכנסת 1,000,000 רשומות עם נתונים אקראיים
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

-- בדיקה
SELECT COUNT(*) AS TotalRows FROM t_data;
