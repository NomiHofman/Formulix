-- =====================================================
-- FORMULIX - הוספת נוסחאות מורכבות
-- נדרש לפי דרישות המבחן: sqrt, log, abs, pow
-- =====================================================

USE Formulix;
GO

-- נוסחאות מתמטיות מורכבות
INSERT INTO t_targil (targil_id, targil, tnai, targil_false)
VALUES
    -- שורש ריבועי של סכום ריבועים (פיתגורס)
    (13, 'SQRT((c * c) + (d * d))', NULL, NULL),
    
    -- לוגריתם טבעי
    (14, 'LOG(b + 1)', NULL, NULL),
    
    -- ערך מוחלט של הפרש
    (15, 'ABS(d - b)', NULL, NULL),
    
    -- חזקה
    (16, 'POWER(a, 2) + POWER(b, 2)', NULL, NULL),
    
    -- שילוב מורכב: שורש של ערך מוחלט
    (17, 'SQRT(ABS(a - c))', NULL, NULL),
    
    -- נוסחה עם תנאי מורכב ופונקציות מתמטיות
    (18, 'SQRT(a * a + b * b)', 'a + b > 100', 'LOG(a + b + 1)'),
    
    -- ממוצע גיאומטרי
    (19, 'SQRT(a * b)', NULL, NULL),
    
    -- נוסחה משולבת: (a^2 + b^2) / (c + d)
    (20, '(POWER(a, 2) + POWER(b, 2)) / (c + d + 1)', NULL, NULL);
GO

-- אימות שהנוסחאות נוספו
SELECT * FROM t_targil ORDER BY targil_id;
GO

PRINT 'נוספו 8 נוסחאות מורכבות חדשות (13-20)';
GO
