-- =====================================================================
-- FORMULIX – שאילתות לצילומי מסך להגשה (מבדק רמה ג׳)
-- ---------------------------------------------------------------------
-- הרצה: ב-SSMS / Azure Data Studio / Azure Query editor (התחברי ל-FormulixDB).
-- מומלץ: להריץ **בלוק אחד בכל פעם** (לסמן מה־-- עד -- הבא) ולצלם את התוצאה.
-- שמות קבצים מוצעים: ראו `docs/SUBMISSION_CHECKLIST.md` סעיף 1א.
-- =====================================================================
USE [FormulixDB];
GO

-- ---------------------------------------------------------------------
-- 1) [ידני] עץ הטבלאות – לא ב-SQL.
--     ב-SSMS: Databases → FormulixDB → Tables → לראות dbo.t_data, t_targil
--     צלמי: 01-tables-tree.png
-- ---------------------------------------------------------------------

-- ---------------------------------------------------------------------
-- 2) אימות מיליון רשומות ב-t_data  [חשוב מאוד]
--     צלמי: 05-t_data-count-1M.png
-- ---------------------------------------------------------------------
SELECT COUNT(*) AS t_data_row_count
FROM dbo.t_data;
GO

-- ---------------------------------------------------------------------
-- 3) מבנה עמודות – t_data
--     צלמי: 02-t_data-columns.png
-- ---------------------------------------------------------------------
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 't_data'
ORDER BY ORDINAL_POSITION;
GO

-- (חלופה) פירוט מלא
EXEC sp_help 'dbo.t_data';
GO

-- ---------------------------------------------------------------------
-- 4) מבנה עמודות – t_targil
--     צלמי: 03-t_targil-columns.png
-- ---------------------------------------------------------------------
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 't_targil'
ORDER BY ORDINAL_POSITION;
GO

-- ---------------------------------------------------------------------
-- 5) מבנה עמודות – t_results + t_log
--     צלמי: 04-t_results-t_log.png (או שתי שאילתות – שתי תמונות)
-- ---------------------------------------------------------------------
SELECT
    't_results' AS table_name,
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 't_results'
ORDER BY ORDINAL_POSITION;

SELECT
    't_log' AS table_name,
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 't_log'
ORDER BY ORDINAL_POSITION;
GO

-- ---------------------------------------------------------------------
-- 6) דגימה מ-t_targil (מגוון: פשוט / מורכב / תנאי)
--     צלמי: 06-t_targil-sample.png
-- ---------------------------------------------------------------------
SELECT TOP (25)
    targil_id,
    targil,
    tnai,
    targil_false
FROM dbo.t_targil
ORDER BY targil_id;
GO

-- ---------------------------------------------------------------------
-- 7) דגימה מ-t_results (אחרי ריצת המנועים)
--     צלמי: 07-t_results-sample.png
--     הערה: אם אין עמודה results_id (אחרי HEAP) – זה תקין; לצלם את השורה כפי שיוצא.
-- ---------------------------------------------------------------------
SELECT TOP (30)
    *
FROM dbo.t_results
ORDER BY method, targil_id, data_id;
GO

-- ---------------------------------------------------------------------
-- 8) דגימה מ-t_log  (זמני ריצה)
--     צלמי: 08-t_log-sample.png
-- ---------------------------------------------------------------------
SELECT TOP (50)
    log_id,
    targil_id,
    method,
    run_time
FROM dbo.t_log
ORDER BY method, targil_id;
GO

-- ---------------------------------------------------------------------
-- 9) סיכום לפי method (יופיע יפה בבודק: כמה נוסחאות רצו, ממוצע זמן)
--     (אפשר צילום נוסף או להחליף את #8)
-- ---------------------------------------------------------------------
SELECT
    method,
    COUNT(*)   AS num_runs,
    ROUND(AVG(run_time), 4)  AS avg_run_time_sec,
    ROUND(MIN(run_time), 4)  AS min_run_time_sec,
    ROUND(MAX(run_time), 4)  AS max_run_time_sec
FROM dbo.t_log
GROUP BY method
ORDER BY method;
GO

-- ---------------------------------------------------------------------
-- 10) [אופציונלי] השורש של usp_RunDynamicFormula
--      צלמי: 09-usp_RunDynamicFormula.png
-- ---------------------------------------------------------------------
SELECT
    o.name   AS procedure_name,
    m.definition
FROM sys.sql_modules AS m
INNER JOIN sys.objects AS o ON m.object_id = o.object_id
WHERE o.name = 'usp_RunDynamicFormula' AND o.type = 'P';
GO

-- חלופה: רק "קיים" + גודל
-- SELECT name, create_date, modify_date FROM sys.procedures WHERE name = 'usp_RunDynamicFormula';

-- =====================================================================
-- אם Use FormulixDB נכשל (DB בשם אחר) – שני את השורה:
--   USE [Formulix];  או השם בדיוק כמו ב-Azure.
-- =====================================================================
