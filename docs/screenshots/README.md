# Formulix – צילומי מסך מבסיס הנתונים

תיקייה זו מכילה ראיות חזותיות לכך שכל הדרישות של ההגשה מומשו במלואן ב‑Azure SQL Database
(`formulix-srv-22042026 / FormulixDB`). כל צילום מסך הופק מתוך **Azure Portal → Query editor (preview)**.

המספור עוקב אחרי סדר ההצגה המומלץ – מהמבנה הבסיסי ועד להוכחות המתקדמות.

---

## קבצים

| # | קובץ | מה הוא מוכיח |
|---|------|----------------|
| 01 | `01-t_data-sample.png` | טבלת `t_data` קיימת ומכילה את העמודות `data_id, a, b, c, d` (חמש עמודות, נתוני קלט) |
| 02 | `02-tables-tree-and-t_log.png` | עץ הסכמה (`t_data, t_log, t_results, t_targil`) + דגימה מ‑`t_log` עם `log_id, targil_id, method, run_time` |
| 03 | `03-t_results-sample.png` | טבלת `t_results` עם `data_id, targil_id, method, result, results_id` |
| 04 | `04-t_targil-sample.png` | טבלת `t_targil` עם `targil_id, targil, tnai, targil_false` (סך הכל **20 שורות**) |
| 05 | `05-t_data-count-1M.png` | **`SELECT COUNT(*) FROM t_data` → 1,000,000** – מיליון רשומות אמיתיות, כפי שנדרש |
| 06 | `06-t_targil-all-20-formulas.png` | כל **20 הנוסחאות** ב‑`t_targil` (כולל הביטויים `a + b`, `c * 2`, `a - b`, `d / 4`, …) |
| 07 | `07-t_log-methods-comparison.png` | **השוואת ביצועים בין כל ארבע השיטות** – `SQLDynamic`, `Roslyn`, `AITranslated`, `PythonSymPy` עם `num_runs`, `avg_time_sec`, `min_time_sec`, `max_time_sec` |
| 08 | `08-t_results-cross-methods.png` | תוצאות עבור אותו `data_id` ושיטות שונות (`Roslyn`, `AITranslated`) – הוכחה שכל השיטות שמרו תוצאות לאותם נתונים |
| 09 | `09-usp_RunDynamicFormula.png` | קיומה של ה‑Stored Procedure `usp_RunDynamicFormula` (תאריך יצירה + תאריך עדכון אחרון) |

---

## השאילתות ששימשו להפקת הצילומים

```sql
-- 01 / 03 / 04
SELECT TOP 1000 * FROM dbo.t_data;
SELECT TOP 1000 * FROM dbo.t_results;
SELECT TOP 1000 * FROM dbo.t_targil;

-- 02 (דגימה מ‑t_log עם הסכמה השמאלית פתוחה)
SELECT TOP 1000 * FROM dbo.t_log;

-- 05  ★ הוכחת מיליון רשומות
SELECT COUNT(*) FROM dbo.t_data;

-- 06
SELECT * FROM dbo.t_targil ORDER BY targil_id;

-- 07  ★ ההשוואה המרכזית בין כל המנועים
SELECT method,
       COUNT(*)            AS num_runs,
       ROUND(AVG(run_time), 2) AS avg_time_sec,
       ROUND(MIN(run_time), 2) AS min_time_sec,
       ROUND(MAX(run_time), 2) AS max_time_sec
FROM dbo.t_log
GROUP BY method
ORDER BY avg_time_sec;

-- 08
SELECT TOP 100 * FROM dbo.t_results ORDER BY data_id, method;

-- 09
SELECT name, create_date, modify_date
FROM sys.procedures
WHERE name = 'usp_RunDynamicFormula';
```

> כל השאילתות הללו שמורות גם ב‑[`DB/SubmissionScreenshots.sql`](../../DB/SubmissionScreenshots.sql)
> כך שאפשר להריץ אותן מחדש בקלות ולשחזר את התוצאות.

---

## איך זה משתלב בדרישות ההגשה

* **מבנה ה‑DB ושם השרת** – צילומים 01‑04 (כותרת החלון מציגה `formulix-srv-22042026/FormulixDB`).
* **מיליון רשומות בטבלת הנתונים** – צילום 05.
* **20 נוסחאות שונות** – צילום 06.
* **השוואת ביצועים בין כל ארבע השיטות** – צילום 07.
* **שמירת תוצאות לכל שיטה** – צילום 08.
* **Stored Procedure לחישוב דינמי** – צילום 09.

לפירוט ההתאמה המלאה בין הדרישות לפיצ'רים בקוד, ראה [`docs/SUBMISSION_CHECKLIST.md`](../SUBMISSION_CHECKLIST.md).
