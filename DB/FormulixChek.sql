SELECT COUNT(*) AS total_rows FROM t_data;
SELECT TOP 10 * FROM t_data ORDER BY data_id;

SELECT COUNT(*) AS total_rows
FROM t_data;

SELECT 
    MIN(a) AS min_a, MAX(a) AS max_a,
    MIN(b) AS min_b, MAX(b) AS max_b,
    MIN(c) AS min_c, MAX(c) AS max_c,
    MIN(d) AS min_d, MAX(d) AS max_d
FROM t_data;

SELECT *
FROM t_targil
ORDER BY targil_id;


EXEC usp_RunDynamicFormula 
    @TargilId = 1, 
    @Method = 'SQLDynamic';

SELECT TOP 10 *
FROM t_results
ORDER BY results_id DESC;

SELECT COUNT(*) AS total_results
FROM t_results
WHERE method = 'SQLDynamic';

SELECT *
FROM t_log
WHERE method = 'SQLDynamic'
ORDER BY log_id DESC;

SELECT TOP 20 *
FROM t_results
WHERE method = 'SQLDynamic'
ORDER BY results_id DESC;


SELECT COUNT(*) AS total_results
FROM t_results
WHERE method = 'Roslyn';

SELECT *
FROM t_log
WHERE method = 'Roslyn'
ORDER BY log_id DESC;

SELECT 
    method,
    AVG(run_time) AS avg_time,
    MIN(run_time) AS min_time,
    MAX(run_time) AS max_time
FROM t_log
WHERE method IN ('SQLDynamic', 'Roslyn')
GROUP BY method;

SELECT COUNT(*) 
FROM t_results
WHERE method = 'PythonSymPy';