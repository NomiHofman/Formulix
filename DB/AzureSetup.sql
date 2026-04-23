-- =====================================================
-- FORMULIX - Azure SQL Database Setup
-- הרץ את הסקריפט הזה ב-Azure Query Editor
-- =====================================================

-- 1. טבלת נתונים t_data
CREATE TABLE t_data (
    data_id INT NOT NULL PRIMARY KEY,
    a FLOAT NOT NULL,
    b FLOAT NOT NULL,
    c FLOAT NOT NULL,
    d FLOAT NOT NULL
);

-- 2. טבלת נוסחאות t_targil
CREATE TABLE t_targil (
    targil_id INT NOT NULL PRIMARY KEY,
    targil VARCHAR(500) NOT NULL,
    tnai VARCHAR(1000) NULL,
    targil_false VARCHAR(500) NULL
);

-- 3. טבלת תוצאות t_results
CREATE TABLE t_results (
    results_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    data_id INT NOT NULL,
    targil_id INT NOT NULL,
    method VARCHAR(50) NOT NULL,
    result FLOAT NULL
);

-- 4. טבלת לוג t_log
CREATE TABLE t_log (
    log_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    targil_id INT NOT NULL,
    method VARCHAR(50) NOT NULL,
    run_time FLOAT NOT NULL
);

-- 5. הכנסת נוסחאות
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
    (12, '(a + b) * 2',              'c > d',   '(a + b) / 2'),
    (13, 'SQRT((a*a)+(b*b))',        NULL,      NULL),
    (14, 'LOG(b+1)',                 NULL,      NULL),
    (15, 'ABS(d-b)',                 NULL,      NULL),
    (16, 'POWER(a,2) + POWER(b,2)',  NULL,      NULL),
    (17, 'SQRT(ABS(c-d))',           NULL,      NULL),
    (18, 'LOG(a+b+1)',               NULL,      NULL),
    (19, 'SQRT(a*a + b*b)',          'c > 50',  'LOG(c+1)'),
    (20, 'POWER(a,2)',               'a > b',   'POWER(b,2)');
