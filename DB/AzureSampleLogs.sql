-- =====================================================
-- FORMULIX - נתוני לוג לדוגמה (לדשבורד)
-- הרץ אחרי AzureInsertData.sql
-- =====================================================

-- הכנסת תוצאות benchmark לדוגמה
INSERT INTO t_log (targil_id, method, run_time) VALUES
-- SQLDynamic - הכי מהיר
(1, 'SQLDynamic', 8.2), (2, 'SQLDynamic', 7.8), (3, 'SQLDynamic', 8.1),
(4, 'SQLDynamic', 7.5), (5, 'SQLDynamic', 9.2), (6, 'SQLDynamic', 10.1),
(7, 'SQLDynamic', 8.8), (8, 'SQLDynamic', 9.5), (9, 'SQLDynamic', 11.2),
(10, 'SQLDynamic', 10.8), (11, 'SQLDynamic', 9.1), (12, 'SQLDynamic', 10.5),
(13, 'SQLDynamic', 12.3), (14, 'SQLDynamic', 11.8), (15, 'SQLDynamic', 10.2),
(16, 'SQLDynamic', 13.1), (17, 'SQLDynamic', 11.5), (18, 'SQLDynamic', 10.9),
(19, 'SQLDynamic', 14.2), (20, 'SQLDynamic', 13.8),

-- Roslyn
(1, 'Roslyn', 15.3), (2, 'Roslyn', 14.8), (3, 'Roslyn', 15.1),
(4, 'Roslyn', 14.2), (5, 'Roslyn', 16.5), (6, 'Roslyn', 18.2),
(7, 'Roslyn', 15.9), (8, 'Roslyn', 17.1), (9, 'Roslyn', 19.8),
(10, 'Roslyn', 18.5), (11, 'Roslyn', 16.2), (12, 'Roslyn', 18.9),
(13, 'Roslyn', 21.5), (14, 'Roslyn', 20.2), (15, 'Roslyn', 17.8),
(16, 'Roslyn', 22.8), (17, 'Roslyn', 19.5), (18, 'Roslyn', 18.8),
(19, 'Roslyn', 24.1), (20, 'Roslyn', 23.2),

-- PythonSymPy
(1, 'PythonSymPy', 12.1), (2, 'PythonSymPy', 11.5), (3, 'PythonSymPy', 12.0),
(4, 'PythonSymPy', 11.2), (5, 'PythonSymPy', 13.8), (6, 'PythonSymPy', 15.2),
(7, 'PythonSymPy', 12.9), (8, 'PythonSymPy', 14.2), (9, 'PythonSymPy', 16.5),
(10, 'PythonSymPy', 15.8), (11, 'PythonSymPy', 13.5), (12, 'PythonSymPy', 15.9),
(13, 'PythonSymPy', 18.2), (14, 'PythonSymPy', 17.1), (15, 'PythonSymPy', 14.8),
(16, 'PythonSymPy', 19.5), (17, 'PythonSymPy', 16.8), (18, 'PythonSymPy', 15.5),
(19, 'PythonSymPy', 21.2), (20, 'PythonSymPy', 20.1),

-- AITranslated
(1, 'AITranslated', 18.5), (2, 'AITranslated', 17.8), (3, 'AITranslated', 18.2),
(4, 'AITranslated', 17.1), (5, 'AITranslated', 19.8), (6, 'AITranslated', 21.5),
(7, 'AITranslated', 18.9), (8, 'AITranslated', 20.2), (9, 'AITranslated', 23.1),
(10, 'AITranslated', 22.1), (11, 'AITranslated', 19.5), (12, 'AITranslated', 22.5),
(13, 'AITranslated', 25.8), (14, 'AITranslated', 24.2), (15, 'AITranslated', 21.1),
(16, 'AITranslated', 27.2), (17, 'AITranslated', 23.5), (18, 'AITranslated', 22.1),
(19, 'AITranslated', 28.5), (20, 'AITranslated', 27.8);

-- בדיקה
SELECT method, COUNT(*) as formulas, ROUND(AVG(run_time), 2) as avg_time 
FROM t_log 
GROUP BY method 
ORDER BY avg_time;
