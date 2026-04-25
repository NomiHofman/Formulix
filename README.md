# FORMULIX — מערכת השוואת מנועי חישוב דינמיים

<div align="center">

![Version](https://img.shields.io/badge/version-1.0-blue)
![.NET](https://img.shields.io/badge/.NET-10-purple)
![Python](https://img.shields.io/badge/Python-3.11+-yellow)
![React](https://img.shields.io/badge/React-18-61dafb)
![Live DB](https://img.shields.io/badge/Live_DB-Azure_SQL-green)

**מבדק פיתוח רמה ג' — משרד החינוך**

🔴 **חיבור חי למסד נתונים** | 🔄 **רענון אוטומטי כל 30 שניות**

</div>

---

## 🎯 תקציר

מערכת FORMULIX משווה בין **ארבע שיטות שונות** לחישוב נוסחאות דינמיות על **מיליון רשומות**:

| שיטה | טכנולוגיה | זמן ממוצע |
|------|-----------|-----------|
| **SQL Dynamic** | sp_executesql | ~10 שניות ⭐ |
| Python SymPy | NumPy vectorized | ~15 שניות |
| Roslyn | C# Scripting | ~20 שניות |
| AI Translated | OpenAI GPT → Roslyn | ~22 שניות |

✅ **כל השיטות מייצרות תוצאות זהות** (אומת בסבילות 1e-9)

---

## 📮 הגשה (מבדק פיתוח רמה ג' — «מנגנון חישוב דינמי»)

לפי מסמך המבחן: **קוד + סקריפטים**, **תצלומי מסך ממסד הנתונים**, **דוח מסכם**, **קישור GitHub** לריפו אישי, **מסך דיווח בענן** (קישור עובד).  
רשימה מפורטת, מיפוי עמידה בדרישות, ורשימת צילומי DB — ב־**[`docs/SUBMISSION_CHECKLIST.md`](docs/SUBMISSION_CHECKLIST.md)**.

> **לידיעת הבודק — איפה ה־DB “האמיתי”:**  
> בפרויקט זה **מסד הנתונים התפעולי להגשה/לדמו החי** הוא **Azure SQL Database** (ענן). הדשבורד ב-Vercel והרצות מול `FORMULIX_DB_*` מצביעים על **אותו** DB ב-Azure. **LocalDB** אינו מחליף את מסד ההגשה; הוא **אופציה מקומית** לבודק/מפתח (הרצת `FormulixCreate.sql`, בלי סיסמת Azure — ראו להלן "משתני סביבה").

> **סנכרון Git:** שינויים אצלך בדיסק (כולל אופטימיזציית מנועים, `AzureOptimizeFast`, ניקוי סודות) **אינם** נראים בבודק עד `git add` → `commit` → `git push` ל-`main`. אחרי push, ודאי ב-GitHub שהקבצים עודכנו.

### הבהרה לבודק: Azure + Vercel (למה זמני ריצה "ארוכים" הם לגיטימיים)

- **DB:** **Azure SQL Database** — מסד **אמיתי בענם**; הבנצ'מרק (מיליון רשומות, `t_log`, `t_results`) נשען על **אותו DB**, לא על LocalDB/קובץ מקומי בלבד.  
- **מסך דיווח:** **Vercel (production)** — הדשבורד בקישור ההגשה מציג **סביבת production**; חיבור חי ל-DB (כאשר `AZURE_SQL_*` מוגדר) הוא **end-to-end אמיתי**.  
- **זמנים בשניות/דקות** נובעים מרשת, I/O, DTU, וכתיבה בכמות גדולה — **צפויים** ולא "באג" של כבידה. **ההשוואה הנכונה** היא **יחסית בין שיטות** (אותו DB, אותו תרחיש), לפי `t_log` + `compare_results.py` — כפי שמפורט ב־`docs/SUMMARY_REPORT.md` (הצהרת סביבה).

---

## 📁 מבנה הפרויקט

```
Formulix/
├── 📂 DB/                          # סקריפטי SQL
│   ├── FormulixCreate.sql          # טבלאות, 1M רשומות, 12 נוסחאות בסיס, usp_RunDynamicFormula
│   ├── AddComplexFormulas.sql      # +8 נוסחאות (סה״כ 20) — sqrt, log, abs, power
│   ├── FormulixChek.sql            # בדיקות / אימות
│   ├── AzureOptimizeFast.sql       # אופטימיזציה לסבב Azure (HEAP, אינדקסים, SP) – פעם אחת לריצה כבדה
│   ├── SubmissionScreenshots.sql  # שאילתות לצילומי DB להגשה
│   ├── AzureSetup.sql              # הקמת DB בענן (אופציונלי)
│   ├── AzureInsertData.sql
│   ├── AzureStoredProcedure.sql
│   └── AzureSampleLogs.sql
│
├── 📂 src/Formulix/                # קוד C# (.NET 10)
│   ├── Formulix.Shared/            # מודלים, Repository, Utilities
│   ├── Formulix.SqlDynamic/        # שיטה 1: SQL Dynamic
│   ├── Formulix.RoslynRunner/      # שיטה 2: Roslyn Scripting
│   ├── Formulix.AITranslator/      # שיטה 4: OpenAI + Roslyn
│   └── Formulix.API/               # 🌐 REST API לחיבור חי ל-DB
│
├── 📂 python/formulix_sympy/       # שיטה 3: Python
│   ├── main.py
│   ├── runner.py                   # הרצה על מיליון רשומות
│   ├── translator.py               # SymPy + lambdify
│   └── db.py                       # חיבור SQL Server
│
├── 📂 tools/                       # כלי עזר
│   ├── compare_results.py          # 📊 השוואת תוצאות בין השיטות
│   └── export_logs.py              # 📤 ייצוא לדשבורד
│
├── 📂 dashboard/                   # 🎨 React Dashboard
│   ├── api/                        # Vercel Serverless – חיבור ל-Azure SQL (summary, health, …)
│   └── src/
│       ├── components/
│       │   ├── Header.jsx
│       │   ├── StatsCards.jsx
│       │   ├── RuntimeChart.jsx    # גרף השוואת ביצועים
│       │   ├── SystemInsights.jsx  # תובנות מערכת
│       │   ├── MatrixTable.jsx     # טבלת תוצאות
│       │   ├── MethodsExplainer.jsx # 📖 הסבר השיטות
│       │   ├── FormulaTester.jsx, AIFormulaAssistant.jsx, EngineRace.jsx
│       │   └── (BackgroundFX, MatrixTable, LoadingOverlay, …)
│       ├── data/
│       │   ├── RunDataContext.jsx, useRunData.js, mockData.js, methodNames.js
│       │   └── run-log.json (נוצר מ-export_logs, לא ב-git חובה)
│       ├── App.jsx, main.jsx, index.css
│       └── public/                 # אייקונים, favicon
│
└── 📂 docs/
    ├── SUMMARY_REPORT.md            # 📋 דוח מסכם מקצועי
    ├── SUBMISSION_CHECKLIST.md      # רשימת קבצים + צילומי DB
    ├── RUN_AZURE_FAST.md            # סדר הרצה מלא מול Azure + Scale up
    └── RUN_FOUR_ENGINES.md          # LocalDB, משתנים, תקלות
```

---

## 🚀 הוראות הרצה

**רשת / פיירוול / Azure מול LocalDB:** [`docs/RUN_FOUR_ENGINES.md`](docs/RUN_FOUR_ENGINES.md) — פתרון תקלות.  
**הרצה מלאה מול Azure SQL (אופטימיזציה + 4 מנועים + זמנים):** [`docs/RUN_AZURE_FAST.md`](docs/RUN_AZURE_FAST.md).  
**צילומי מסך DB להגשה:** [`DB/SubmissionScreenshots.sql`](DB/SubmissionScreenshots.sql) (שאילתות מוכנות; ראו [`docs/SUBMISSION_CHECKLIST.md`](docs/SUBMISSION_CHECKLIST.md)).

### משתני סביבה (בלי סודות ב-Git)

| קהל | משתנה | הערה |
|-----|--------|------|
| .NET (כל `dotnet run` + `Formulix.API`) | `FORMULIX_DB_CONNECTION` | מחרוזת **ADO.NET** (Azure → *Connection strings*). אם **לא** מוגדר: ברירת מחדל **LocalDB** `Formulix` (בלי סיסמה). |
| Python (`formulix_sympy`, `tools/compare_results.py`, `export_logs.py`) | `FORMULIX_DB_ODBC` | מחרוזת **ODBC** (אותו שרת/DB, פורמט אחר). אם **לא** מוגדר: **LocalDB** כמו בטולס. |
| Vercel – פונקציות `/api/*` (דשבורד בפרודקשן) | `AZURE_SQL_SERVER`, `AZURE_SQL_DATABASE`, `AZURE_SQL_USER`, `AZURE_SQL_PASSWORD` | ב-**Vercel → Project → Environment Variables** (לא בקוד). בלי הערכים האלה, `/api/summary` מחזיר 503. |

**PowerShell (לפני `dotnet` / `python` מול Azure, באותו חלון):**
```powershell
$env:FORMULIX_DB_CONNECTION = "<ADO.NET מ-Azure Portal – כולל סיסמה, ללא {your_password}>"
$env:FORMULIX_DB_ODBC      = "<ODBC Driver 17/18, אותו DB ומשתמש>"
```

**אחרי `git pull` — אם הכל “לא מקושר ל-DB”:** ב-repo אין מחרוזות חיבור (by design). צרי `azure.env` מול [`azure.env.example`](azure.env.example) והריצי `Set-Location` לתיקיית הפרויקט ואז: `. .\scripts\Apply-AzureEnv.ps1` לפני כל מנוע.

**למה אי אפשר “להעתיק” ל-DB בדיוק את אחרי-הרצה ב-Azure, בלי export:** הזמנים תלויים ב-DTU, רשת ומכונה — אי אפשר לנבא אותם מבחוץ. **לדמו/לבודק** (בלי גישה ל-DB ב-Azure): אחרי `FormulixCreate` + `AddComplexFormulas` הריצי ב-SSMS/Query Editor [`DB/AzureSampleLogs.sql`](DB/AzureSampleLogs.sql) — זה **מייצר `t_log` מייצג** (20 נוסחאות × 4 שיטות) עם **זמנים אופייניים**, לא מספרי מד-מד מ-Azure. **במקביל** — מומלץ להריץ את המנועים מול **LocalDB** כדי לוודא שהקוד תקין; `t_results` ה“אמיתי” (מיליוני שורות) **נבנה בזמן ריצה** על-ידי המנועים, לא בזינון ידני. לעדכון JSON לדשבורד מקומי: `py -3 tools\export_logs.py` (אחרי שיש `t_log`).

**חומת אzure:** אפשרי `timeout` / 500 – הוסיפי *Client IP* (מקומי) או IP יוצא של Vercel (פרודקשן), ראו `RUN_FOUR_ENGINES.md`.

### שלב 0 (אופציונלי, Azure – פעם אחת לסבב “מהיר”)

אחרי `USE FormulixDB` (או שם ה-DB שלך), הרצה ב-Query Editor / SSMS:

- [`DB/AzureOptimizeFast.sql`](DB/AzureOptimizeFast.sql) — `TRUNCATE` תוצאות, HEAP+אינדקסים, פרוצדורה מותאמת ל-bulk.  
- אם **לא** משתמשים ב-Azure, אפשר לדלג (LocalDB + סכימה מ-`FormulixCreate.sql`).

### שלב 1: הקמת מסד הנתונים

```sql
-- ב-SSMS או sqlcmd — בסדר:
-- 1) DB/FormulixCreate.sql
-- 2) DB/AddComplexFormulas.sql   (חובה ל-20 נוסחאות כפי הדרישות)
```

`FormulixCreate.sql` יוצר:
- טבלת `t_data` עם **מיליון רשומות** אקראיות
- טבלת `t_targil` עם **12 נוסחאות** בסיס (פשוטות, תנאי)
- טבלאות `t_results` ו-`t_log`
- Stored Procedure `usp_RunDynamicFormula`

`AddComplexFormulas.sql` מוסיף **8 נוסחאות** נוספות (סה״כ **20** נוסחאות ב-`t_targil`)

כל הפקודות הבאות — מ**שורש הריפו** (התיקייה שבה קיימים `DB\`, `src\Formulix\`, `python\`).

### שלב 2: שיטה 1 — SQL Dynamic

```powershell
dotnet run --project src\Formulix\Formulix.SqlDynamic --configuration Release
```

### שלב 3: שיטה 2 — Roslyn

```powershell
dotnet run --project src\Formulix\Formulix.RoslynRunner --configuration Release
```

### שלב 4: שיטה 3 — Python SymPy

```powershell
cd python\formulix_sympy
py -3 -m pip install -r requirements.txt
py -3 main.py
cd ..\..
```

### שלב 5 (אופציונלי): שיטה 4 — AI

```powershell
# $env:OPENAI_API_KEY = "sk-..."   # אם חסר – רץ Mock דטרמיניסטי
dotnet run --project src\Formulix\Formulix.AITranslator --configuration Release
```

### שלב 6: אמת תוצאות

```powershell
py -3 tools\compare_results.py
```

פלט צפוי:
```text
RESULT: all methods produced IDENTICAL results (within tolerance).
```

### שלב 7: ייצא לדשבורד (אופציונלי, גיבוי JSON)

```powershell
py -3 tools\export_logs.py
```

### שלב 8: דשבורד מקומי

```powershell
cd dashboard
npm install
npm run dev
```

פתחי את הכתובת ש־Vite מדפיס (לרוב `http://localhost:5173`; אם התפוס – פורט אחר).  
ב**מקומי** לרוב: ניסיון `VITE_API_URL` + `Formulix.API` — ראו סעיף *חיבור חי* למטה. ב-**Vercel**: נתונים מ־`/api/summary` אם `AZURE_SQL_*` מוגדר.

---

## 🌐 העלאה לענן (Vercel)

```bash
cd dashboard
npm run build
npx vercel --prod
```

או באמצעות GitHub:
1. דחוף לריפוזיטורי
2. חבר ל-Vercel
3. הגדר `dashboard` כ-Root Directory
4. Deploy!

### שם בקישור (`formulix…vercel.app`)

שם הכתובת האוטומטית נקבע מ־**שם הפרויקט** ב־Vercel (לא מ־`package.json`):

1. [Vercel](https://vercel.com) → הפרויקט → **Settings** → **General**
2. ב־**Project Name** שימי למשל `formulix` (או `formulix-dashboard`) → **Save**
3. ב־**Domains** תראי את הדומיין המעודכן (למשל `formulix-….vercel.app`). אם השם תפוס גלובלית, Vercel יוסיף סיומת ייחודית.

לכתובת בלי מקף־מספרים: **דומיין משלך** תחת **Settings → Domains**, או שירות קצר (למשל `formulix.io`).

### גישה לבודקים (בלי להתחבר לחשבון Vercel שלך)

אם מי שפותח את קישור הפרודקשן רואה דרישת התחברות ל־Vercel, זה בדרך כלל **Deployment Protection** (או Toolbar לחברי צוות):

1. ב־[Vercel Dashboard](https://vercel.com) → בחרי את **הפרויקט** → **Settings**
2. פתחי **Deployment Protection** (או **Security** → Deployment Protection, לפי הממשק)
3. עבור סביבת **Production** — בחרי **Disabled** / **Public** / ביטול **Vercel Authentication** (כך שכל אחד עם ה־URL יכול לפתוח)
4. אופציונלי: **Settings → General → Vercel Toolbar** → **Production: Off** (מסיר כלים/שכבות לבודקים)

הלינק הציבורי (למשל `https://....vercel.app`) אמור לעבוד **ללא** התחברות אחרי השינוי.

---

## 🌐 חיבור חי למסד נתונים (Live DB)

הדשבורד תומך בשלושה מצבי עבודה:

| מצב | סימון | תיאור |
|-----|-------|-------|
| 🟢 **Live DB** | מחובר ל-DB חי | מקומי: Kestrel + `VITE_API_URL`. פרודקשן: `GET /api/summary` (Vercel) → Azure SQL |
| 🟡 **JSON** | קובץ סטטי | נתונים מקובץ `run-log.json` |
| 🔴 **Mock** | נתוני הדגמה | נתונים לדוגמה בלבד |

### הפעלת מצב Live DB (מקומי)

1. `FORMULIX_DB_CONNECTION` מכוונן (או LocalDB).  
2. API:

```powershell
cd src\Formulix\Formulix.API
dotnet run
# חכי ל-URL+פורט (Kestrel / launchSettings) — בדרך כלל http://localhost:5xxx
```

3. דשבורד (אותו מחשב, חלון נפרד):

```powershell
cd dashboard
$env:VITE_API_URL = "http://localhost:5000"   # או הפורט שה-API הדפיס
npm run dev
```

הדשבורד בוחר: Live דרך ה-API → אחרת `public/run-log.json` → אחרת mock (ראו `useRunData.js`).

### Live DB בפרודקשן (Vercel)

- `dashboard` נפרס ל-**Vercel**; נתונים חיים מ־`GET /api/summary` (Node + `mssql`) — רק אם `AZURE_SQL_SERVER` / `AZURE_SQL_USER` / `AZURE_SQL_PASSWORD` (ו-`AZURE_SQL_DATABASE` אם לא ברירת מחדל) מוגדרים ב-**Vercel Environment Variables**.  
- **GitHub Action** *Refresh DB Snapshot* (אופציונלי) דורש Secret `FORMULIX_DB_ODBC` — אם אין, אפשר להשבית את ה-Workflow; הדשבורד ב-Vercel **לא** תלוי בו אם Live עובר.

### פריסה לענן (מלא)

עייני בקובץ **`DEPLOY_LIVE.md`** — Azure SQL, App Service, Vercel, כולל:
- יצירת Azure SQL Database (חינם לשנה!)
- העלאת ה-API ל-Azure App Service
- הגדרת Vercel עם משתני סביבה

---

## ✨ תכונות יצירתיות (מעבר לדרישות)

| תכונה | תיאור |
|-------|-------|
| 🌐 **חיבור חי ל-DB** | רענון אוטומטי כל 30 שניות מ-Azure SQL |
| 🧪 **בודק נוסחאות אינטראקטיבי** | הזן נוסחה וערכים וראה תוצאה בזמן אמת |
| 🤖 **עוזר AI** | תרגום שפה טבעית לנוסחה באמצעות GPT-4 |
| 📖 **הסבר שיטות מפורט** | כרטיסים עם יתרונות, חסרונות, וטכנולוגיות |
| 🎨 **עיצוב RTL מלא** | ממשק בעברית עם אנימציות יוקרתיות |
| 📊 **גרפים אינטראקטיביים** | Recharts עם tooltips והשוואות |
| 🔄 **4 שיטות במקום 3** | כולל AI Translation כבונוס |
| 📝 **20 נוסחאות** | כולל sqrt, log, abs, pow |

---

## 📈 סוגי נוסחאות נתמכים

```
פשוטות:     a + b, c * 2, d / 4
מורכבות:   SQRT((a*a)+(b*b)), LOG(b+1), ABS(d-b), POWER(a,2)
תנאי:       if(a > 5, b * 2, b / 2)
משולבות:   if(a+b > 100, SQRT(a*a+b*b), LOG(a+b+1))
```

---

## 🛠 טכנולוגיות

| Layer | Technology |
|-------|------------|
| Database | SQL Server 2019 / LocalDB / **Azure SQL** |
| Backend | .NET 10, C# 13 |
| API | ASP.NET Core Minimal API |
| Dynamic Compiler | Microsoft.CodeAnalysis.CSharp.Scripting |
| Python | Python 3.11, SymPy, NumPy, pyodbc |
| AI | OpenAI GPT-4o-mini |
| Frontend | React 18, Vite 5, Recharts, Framer Motion |
| Styling | CSS3, Glassmorphism, RTL |
| Cloud | **Azure App Service**, **Vercel** |

---

## 📋 דרישות מערכת

- SQL Server 2019+ או LocalDB
- .NET SDK 10
- Python 3.11+
- Node.js 18+
- ODBC Driver 17/18 for SQL Server

---

## 📄 קבצים חשובים

| קובץ | מטרה |
|------|------|
| `docs/SUBMISSION_CHECKLIST.md` | **הגשה לפי מבדק רמה ג'** — מיפוי דרישות, רשימת קוד, **תצלומי DB**, GitHub, ענן |
| `DB/SubmissionScreenshots.sql` | שאילתות מוכנות לצילומי DB (להריץ ב-SSMS / Query Editor) |
| `docs/RUN_AZURE_FAST.md` | סבב מלא: `AzureOptimizeFast.sql` + 4 מנועים + `compare_results` |
| `tools/compare_results.py` | סקריפט השוואה (נדרש במבחן) |
| `tools/export_logs.py` | ייצוא `run-log.json` (גיבוי; ב-Vercel אפשר חי בלי קובץ) |
| `docs/SUMMARY_REPORT.md` | דוח מסכם מקצועי |
| `DB/FormulixCreate.sql` + `DB/AddComplexFormulas.sql` | סכמת DB ו-**20** נוסחאות |
| `DB/AzureOptimizeFast.sql` | אופטימיזציה לריצה כבדה ב-Azure (אופציונלי ל-LocalDB) |
| `dashboard/src/components/MethodsExplainer.jsx` | הסבר השיטות |
| `dashboard/.env.example` | דוגמה: `VITE_API_URL` + **הערה** ל-`AZURE_SQL_*` ב-Vercel (לא `VITE_`) |

---

## 🏆 המלצה

**שיטת SQL Dynamic** מומלצת כשיטה העיקרית:
- ⚡ הכי מהירה (~10 שניות על 1M רשומות)
- 💾 מינימום זיכרון
- 🔒 תוצאות מדויקות
- 🔧 קל לתחזוקה

---

<div align="center">

**FORMULIX** · v1.0 · מבדק פיתוח רמה ג'

Built with ❤️ using React, .NET, Python & AI

</div>
