# הרצה מהירה ב-Azure SQL — סבב מלא של 4 מנועים על 1M רשומות

מסמך זה מתאר את הסדר המדויק להרצת הסבב המלא מול **Azure SQL Database**,
לאחר האופטימיזציה (Bulk loads + HEAP + indexes + connection re-use).

---

## 0. דרישות מקדימות

* **שדרוג זמני של ה-DB** — מאוד מומלץ לפני ההרצה:
  * Azure Portal → SQL Database → **Compute + storage** → גררי את הסליידר ל-**S3 (100 DTU)** או יותר.
  * אחרי שהסבב מסתיים, אפשר להחזיר ל-Basic / S0 (ההיסטוריה ב-`t_log` נשמרת).
* `ODBC Driver 17/18 for SQL Server` מותקן.
* `FORMULIX_DB_CONNECTION` (.NET) ו-`FORMULIX_DB_ODBC` (Python) — מוגדרים ב-PowerShell (`$env:...`) **לפני** הרצה, לפי *Connection strings* ב-Azure (אין סודות בקוד; ברירת מחדל ב-קוד: LocalDB).

---

## 1. הרצת סקריפט האופטימיזציה (פעם אחת לסבב)

ב-**Azure Query Editor** (או SSMS / Azure Data Studio), פתחי וריצי:

```text
DB/AzureOptimizeFast.sql
```

הסקריפט הזה:

1. עושה `TRUNCATE` ל-`t_results` ו-`t_log`.
2. ממיר את `t_results` ל-**HEAP** (מסיר PK, IDENTITY, FKs).
3. יוצר `IX_t_results_method_targil` ו-`IX_t_log_method`.
4. מחליף את `usp_RunDynamicFormula` בגרסה אופטימלית
   (`TABLOCK` + `MAXDOP 0` + `RECOMPILE`).

✅ הסקריפט הוא **idempotent** — בטוח להרצה חוזרת בלי לפגוע בנתונים ב-`t_data` / `t_targil`.

---

## 2. הרצת ארבע המנועים (בסדר הזה)

מהשורש של הפרויקט, ב-PowerShell:

```powershell
# שיטה 1 — SQL Dynamic (הכי מהירה — הכל מתבצע בתוך השרת).
dotnet run --project src\Formulix\Formulix.SqlDynamic --configuration Release

# שיטה 2 — Roslyn (C# Scripting + SqlBulkCopy).
dotnet run --project src\Formulix\Formulix.RoslynRunner --configuration Release

# שיטה 3 — Python SymPy (NumPy vectorized + pyodbc fast_executemany).
cd python\formulix_sympy
python main.py
cd ..\..

# שיטה 4 — AI Translator (OpenAI → Roslyn + SqlBulkCopy).
$env:OPENAI_API_KEY = "sk-..."     # אופציונלי; בלי זה רץ עם Mock דטרמיניסטי.
dotnet run --project src\Formulix\Formulix.AITranslator --configuration Release
```

> כל מנוע מנקה רק את הרשומות שלו (`DELETE WHERE method=...`). האינדקס החדש
> `IX_t_results_method_targil` הופך את הניקוי הזה למהיר מאוד גם על מיליוני שורות,
> כך שאפשר להריץ מנוע מסוים בנפרד ולהחליף ניסויים בלי TRUNCATE כללי.

---

## 3. אימות תוצאות והשוואה

```powershell
python tools\compare_results.py
```

הסקריפט קורא את כל המנועים מ-`t_results`, משווה אותם מול `SQLDynamic` בסבילות
1e-9 (סטיות נקודה צפה של IEEE-754), ומדפיס PASS/FAIL לכל נוסחה ולכל שיטה.

**יציאה צפויה:**
```text
RESULT: all methods produced IDENTICAL results (within tolerance).
```

---

## 4. ייצוא ל-Dashboard (אופציונלי — הדשבורד גם ככה חי)

```powershell
python tools\export_logs.py
```

יוצר את `dashboard/public/run-log.json` כגיבוי סטטי. בפרודקשן הדשבורד
ב-Vercel קורא ישירות מ-`/api/summary` (Vercel Serverless Function) שמתחבר חי
ל-Azure SQL, אז זה רק fallback.

---

## 5. מה שונה מהזרימה הקודמת? (לסקרניות בלבד)

| איפה | הזרימה הקודמת | הזרימה החדשה | למה זה חשוב |
|------|----------------|---------------|--------------|
| `t_results` | Clustered PK + IDENTITY + 2 FKs | HEAP בלי PK / FK / IDENTITY | INSERT כותב ישר לעמוד נתונים, בלי לעדכן indexes ולהריץ FK checks. |
| Indexes | אין | `IX_t_results_method_targil INCLUDE (data_id, result)` | DELETE/SELECT לפי method מהיר, וגם compare_results.py סורק רק את מה שצריך. |
| .NET Roslyn / AI | פתיחת connection לכל batch של 5000 (200 פעמים ל-1M) | Connection אחת + SqlBulkCopy עם batch 50K (20 פעמים ל-1M) | חוסך ~190 פתיחות TLS handshake בכל נוסחה. |
| .NET SqlBulkCopy | `SqlBulkCopyOptions.TableLock` + streaming | (זהה — היה כבר טוב) | `TABLOCK` מאפשר minimally-logged bulk insert, חיוני ל-Azure SQL. |
| Python writes | פתיחת connection לכל batch, batch=10K | Connection אחת persistent, batch=100K, `fast_executemany=True`, UTF-8 encoding pinned | עובר מ-~100 פתיחות + decoding overhead לפעולה אחת רציפה. |
| Stored procedure | `MAXDOP 0` בלבד | `OPTION (MAXDOP 0, RECOMPILE)` + `WITH (TABLOCK, NOLOCK)` | RECOMPILE מבטיח שכל נוסחה מקבלת execution plan נקי במקום cached generic. |

---

## 6. צפיות זמני ריצה (S3 / 100 DTU)

| מנוע | זמן צפוי לנוסחה אחת | סה״כ ל-20 נוסחאות |
|------|---------------------|-------------------|
| SQL Dynamic | 5–10 שניות | ~2–3 דקות |
| Roslyn | 30–60 שניות | ~10–20 דקות |
| Python SymPy | 25–50 שניות | ~8–17 דקות |
| AI Translator | 30–60 שניות | ~10–20 דקות |

**סה״כ סבב מלא: בערך 30–60 דקות** (במקום שעות בזרימה הקודמת).

> טיפ: אפשר להריץ את 4 המנועים בשלוש חלונות PowerShell במקביל, אבל זה ייצור עומס
> משמעותי על ה-DTU וזמני הריצה האישיים יעלו. עדיף לרוץ ברצף ולקבל מספרים נקיים לבנצ'מרק.

---

## 7. אחרי ההרצה

1. (אם שדרגת ל-S3) הורידי בחזרה ל-Basic / S0 ב-Azure Portal — חיסכון של ~$15/חודש.
2. צלמי לעצמך תצלומי מסך מ-`t_data` / `t_results` / `t_log` (ראי
   `docs/SUBMISSION_CHECKLIST.md` סעיף 1א).
3. ודאי ש-`compare_results.py` מסיים ב-PASS.

🎉 **המערכת מוכנה להגשה.**
