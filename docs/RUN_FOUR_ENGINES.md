# הרצת ארבעת המנועים — רשת, פורט 1433, Azure / LocalDB

מסמך זה מיועד לעבודה **בלי Cursor** (מחשב אחר / רשת שבה פורט 1433 פתוח).  
**אל תדביקי סיסמאות או מחרוזות חיבור מלאות לצ'אטים (כולל Gemini)** — השתמשי במשתני סביבה או בקובץ מקומי שלא נכנס לגיט.

---

## ⚡ קריטי: אופטימיזציה לביצועים (לפני הרצה בפעם הבאה)

אם מנוע אחד רץ **דקות ארוכות על 4 נוסחאות**, רוב הסיכויים שזה לא הקוד אלא הסביבה.
עשיתי שינויים בסכימה + SP — צריך להריץ **פעם אחת**:

### 1) Azure SQL — סכימה + SP מהירה יותר

ב-**Azure Query Editor** (או SSMS), הריצי את הסקריפט:

```
DB\AzureOptimizeFast.sql
```

מה הוא עושה:
- `t_results` הופך ל-**HEAP** בלי IDENTITY — INSERT הופך מהיר משמעותית.
- אינדקס על `method` + `targil_id` → `DELETE WHERE method='...'` נמשך שניות במקום דקות.
- `usp_RunDynamicFormula` מקבל `WITH (TABLOCK)` + `MAXDOP 0` — minimally-logged insert, הרבה פחות log IO.
- אינדקס גם ל-`t_log`.

**בטוח להריץ:** הסקריפט idempotent ולא מוחק את הנתונים ב-`t_data` / `t_targil`.

### 2) ה-tier של Azure SQL — הכי משפיע

- **Basic** = **5 DTU**. על tier כזה 1M insert עם `SQRT`/`LOG` **באמת** לוקחים מספר דקות לנוסחה, ואין שום קוד שיציל.
- **S3** (100 DTU) או **P1** (125 DTU) → **פי 5–10 מהירים**.

בפורטל Azure → ה-DB → **Compute + storage** → העלי tier לזמן הריצה, ואחריה אפשר להוריד חזרה.

### 3) C# (Roslyn/AI) — חיבור יחיד + TABLOCK בבולק

שיניתי את `SqlFormulixRepository.cs`:
- `InsertResultsStreamAsync` חדש — **חיבור בודד** לכל הריצה (במקום 200 פתיחות ל־5K שורות)
- `BulkCopy` עם `SqlBulkCopyOptions.TableLock` + `BatchSize=50_000` + `EnableStreaming=true` (חוסך גם זיכרון)

*בהמשך*: אפשר להעביר את `Formulix.RoslynRunner` ו-`Formulix.AITranslator` לשימוש ב־`InsertResultsStreamAsync`. הקיים (`InsertResultsBulkAsync`) גם שופר.

### 4) Roslyn/Python/AI מול Azure — צוואר בקבוק זה הרשת

הם שולפים **1M שורות מ-Azure** → מחשבים לוקאלית → מכניסים **1M בחזרה**. ברשת ביתית זה **5–20 דקות לנוסחה** בלי קשר לקוד.

**פתרונות (לפי סדר יעילות):**

1. **להריץ את .NET/Python על Azure VM** באותו region של ה-DB — ביצועים ×10 (אין latency).
2. אם את חייבת להריץ מהבית — להשתמש ב-**LocalDB/SQL Express** מקומי (`FORMULIX_DB_CONNECTION` ו-`FORMULIX_DB_ODBC` מכוונים מקומית), לעשות את הבנצ'מרק הכבד שם, ולהעלות רק את `t_log` ל-Azure לראווה.
3. להפחית זמנית ל-**100K שורות** רק לבנצ'מרק של שיטות לא-SQL (כדי שזמני הריצה יהיו ריאליים על רשת ביתית). **לא מבטל** את דרישת ה-1M — SQL Dynamic ממשיך על כל 1M.

---

## 1. מה חוסם ומה צריך

| בעיה | משמעות |
|------|--------|
| **פורט 1433 חסום** | SQL Server (מקומי או Azure) לא נגיש דרך TCP. צריך רשת אחרת, VPN ארגוני, או hotspot. |
| **Azure SQL** | אותו פורט **1433**, אבל לרוב פתוח מהאינטרנט (אם Firewall ב-Azure מאפשר את ה-IP שלך). |
| **LocalDB** | לא דרך 1433 רגיל — עובד על אותו מחשב; מתאים אם כל הרצה מקומית בלי ענן. |

**דרישות תוכנה (פעם אחת):**

- **.NET SDK 10** — `dotnet --version`
- **Python 3.11+** — `python --version`
- **ODBC Driver 17 או 18 for SQL Server** (ל־Python + `compare_results` + `export_logs`)
- **SQL Server Management Studio** או **sqlcmd** (אם מריצים סקריפטים SQL מקומיים)

---

## 2. משתני סביבה (חשוב לפני הרצה)

### 2.1 .NET (כל ארבעת פרויקטי ה-C#)

ב־PowerShell (החליפי את הערכים — **לא** מעתיקים פה סיסמאות אמיתיות לשיחה):

```powershell
$env:FORMULIX_DB_CONNECTION = "Server=tcp:YOUR_SERVER.database.windows.net,1433;Initial Catalog=YOUR_DB;User ID=YOUR_USER;Password=YOUR_PASSWORD;Encrypt=True;TrustServerCertificate=False;Connection Timeout=300;"
```

אם עובדים מול **LocalDB** בלי ענן, אפשר בדרך כלל **בלי** למחוק — ברירת המחדל בקוד מכוונת ל-Azure; ל-LocalDB הגדירי מחרוזת מקומית (למשל `Server=(localdb)\MSSQLLocalDB;Database=Formulix;Trusted_Connection=True;`).

### 2.2 Python (SymPy, `compare_results`, `export_logs`)

אותה מערכת באמצעות **ODBC** (מחרוזת ארוכה עם `DRIVER=...`):

```powershell
$env:FORMULIX_DB_ODBC = "DRIVER={ODBC Driver 17 for SQL Server};SERVER=tcp:YOUR_SERVER.database.windows.net,1433;DATABASE=YOUR_DB;UID=...;PWD=...;Encrypt=yes;TrustServerCertificate=no;Connection Timeout=300;"
```

**אותו משתנה** `FORMULIX_DB_ODBC` משמש:

- `python/formulix_sympy/main.py` (דרך `db.py`)
- `python tools/compare_results.py`
- `python tools/export_logs.py`

אחרי `Set-Location` לתיקיית הפרויקט, כל `python` יקרא את המשתנה.

### 2.3 AI (רק מנוע רביעי)

```powershell
$env:OPENAI_API_KEY = "sk-..."   # או מפתח ב-Azure OpenAI — לפי הקוד בפרויקט
```

---

## 3. סדר עבודה מדויק (מומלץ)

נניח שתיקיית השורש של הריפו היא:

`C:\Users\<שם>\Formulix\Formulix`  
(התאימי לנתיב אצלך.)

### שלב A — מסד נתונים מוכן

- אם **Azure**: ודאי שה-DB כבר הוקם (סקריפטים תחת `DB/` — הוראות ב-`README.md`).  
- `t_data` = **1,000,000** שורות, `t_targil` = **20** נוסחאות (אחרי `AddComplexFormulas.sql`).

### שלב B — מנוע 1: SQL Dynamic

```powershell
cd C:\Users\<שם>\Formulix\Formulix\src\Formulix
# כבר הוגדר $env:FORMULIX_DB_CONNECTION
dotnet run --project Formulix.SqlDynamic
```

**שם מתודה ב-DB:** `SQLDynamic` (נדרש ל־`compare_results`).

### שלב C — מנוע 2: Roslyn

```powershell
# מאותה תיקיית src\Formulix
dotnet run --project Formulix.RoslynRunner
```

**שם מתודה:** `Roslyn`

### שלב D — מנוע 3: Python SymPy

```powershell
cd C:\Users\<שם>\Formulix\Formulix\python\formulix_sympy
# כבר הוגדר $env:FORMULIX_DB_ODBC
pip install -r requirements.txt
python main.py
```

**שם מתודה:** `PythonSymPy`

### שלב E — מנוע 4: AI (אופציונלי)

```powershell
cd C:\Users\<שם>\Formulix\Formulix\src\Formulix
$env:OPENAI_API_KEY = "sk-..."
dotnet run --project Formulix.AITranslator
```

**שם מתודה:** `AITranslated`  
(עלות זמן/כסף; אם מדלגים — `compare_results` ישווה רק את מה שקיים ב-`t_results`.)

### שלב F — אימות זהות תוצאות

```powershell
cd C:\Users\<שם>\Formulix\Formulix
# אותו FORMULIX_DB_ODBC
python tools\compare_results.py
```

פלט מצוין:  
`RESULT: all methods produced IDENTICAL results (within tolerance).`

### שלב G — ייצוא לדשבורד

```powershell
python tools\export_logs.py
```

נוצר: `dashboard/public/run-log.json` — הדשבורד ב-`npm run dev` יציג נתונים אמיתיים.

---

## 4. בדיקות מהירות אם משהו נכשל

| סימptom | מה לבדוק |
|--------|-----------|
| `timeout` / `cannot connect` | Firewall (Windows + Azure), פורט 1433, נכון `SERVER=`, `Encrypt=` |
| `Login failed` | משתמש/סיסמה; `AZURE` firewall rule ל-IP שלך |
| `ODBC Driver not found` | התקנת [Microsoft ODBC Driver for SQL Server](https://learn.microsoft.com/sql/connect/odbc/download-odbc-driver-for-sql-server) |
| `reference method 'SQLDynamic' not found` | להריץ **קודם** `Formulix.SqlDynamic` |
| `compare` נכשל | סטייה אמיתית — לבדוק נוסחה או נתונים; סטייה קטנה — טולרנס `1e-9` בקוד |
| Python מצליח, .NET לא | שני channel אחרים — לוודא `FORMULIX_DB_CONNECTION` ו-`FORMULIX_DB_ODBC` **לאותו שרת/DB** |

---

## 5. פרומפט מוכן ל־**Google Gemini (Pro)** — העתקה כש־Cursor לא זמין

**הנחה:** הדבקי את הטקסט הבא, והשלימי בכיתוב: איפה את עובדת (Azure / LocalDB), **בלי** להדביק סיסמאות — כתבי "I use env vars FORMULIX_DB_CONNECTION and FORMULIX_DB_ODBC".

```
You are helping debug a project called FORMULix — a "Level C" benchmark that compares 4 ways to evaluate the same dynamic formulas on 1,000,000 rows in SQL Server (or Azure SQL).

DATA MODEL (read-only for context):
- t_data: data_id, a, b, c, d (floats)
- t_targil: targil_id, targil, tnai, targil_false (formula strings + optional condition)
- t_results: one row per (data_id, targil_id, method) with computed float "result"
- t_log: per (targil_id, method) run_time in seconds

FOUR "ENGINES" (separate programs):
1) C# "Formulix.SqlDynamic" — calls SQL Server stored procedure usp_RunDynamicFormula with @Method = "SQLDynamic" and dynamic SQL (sp_executesql).
2) C# "Formulix.RoslynRunner" — compiles/executes formulas with Roslyn; method tag "Roslyn".
3) Python "formulix_sympy" — SymPy/NumPy; method tag "PythonSymPy". Uses pyodbc and env FORMULIX_DB_ODBC.
4) C# "Formulix.AITranslator" — OpenAI to translate natural language to code then run; method tag "AITranslated"; requires OPENAI_API_KEY.

C# projects read connection string from env var FORMULIX_DB_CONNECTION (see Formulix.Shared Configuration DatabaseSettings). Python and tools (compare_results, export_logs) use FORMULIX_DB_ODBC for pyodbc.

POST-RUN:
- tools/compare_results.py: verifies all methods match reference SQLDynamic within 1e-9.
- tools/export_logs.py: writes dashboard/public/run-log.json

COMMON ISSUES: port 1433 blocked on some networks; Azure firewall must allow client IP; ODBC driver must be installed; methods must be run in practical order (SQLDynamic first for reference in compare). Local dev may use (localdb)\MSSQLLocalDB with database name Formulix.

When I paste build/runtime errors, suggest concrete checks (env vars, firewall, order of runs, which table is empty) without asking for my password. Respond in a mix of Hebrew and English if the user writes in Hebrew.
```

---

**סיכום:** ברשת שבה **פורט 1433 פתוח**, הגדירי משתנים, הריצי 1→2→3→(4), אז `compare_results` ו-`export_logs`.  
אם יש שגיאה — שלחי ל-Gemini את **הודעת השגיאה המלאה** + טקסט הפרומפט למעלה, בלי מפתחות.
