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

---

## 📁 מבנה הפרויקט

```
Formulix/
├── 📂 DB/                          # סקריפטי SQL
│   ├── FormulixCreate.sql          # טבלאות, 1M רשומות, 12 נוסחאות בסיס, usp_RunDynamicFormula
│   ├── AddComplexFormulas.sql      # +8 נוסחאות (סה״כ 20) — sqrt, log, abs, power
│   ├── FormulixChek.sql            # בדיקות / אימות
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
    └── SUBMISSION_CHECKLIST.md     # רשימת קבצים מלאה להגשה
```

---

## 🚀 הוראות הרצה

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

### שלב 2: הרץ שיטה 1 — SQL Dynamic

```powershell
cd src\Formulix
dotnet run --project Formulix.SqlDynamic
```

### שלב 3: הרץ שיטה 2 — Roslyn

```powershell
dotnet run --project Formulix.RoslynRunner
```

### שלב 4: הרץ שיטה 3 — Python SymPy

```powershell
cd python\formulix_sympy
pip install -r requirements.txt
python main.py
```

### שלב 5 (אופציונלי): הרץ שיטה 4 — AI

```powershell
$env:OPENAI_API_KEY = "sk-..."
dotnet run --project Formulix.AITranslator
```

### שלב 6: אמת תוצאות

```powershell
python tools\compare_results.py
```

פלט צפוי:
```
RESULT: all methods produced IDENTICAL results (within tolerance).
```

### שלב 7: ייצא לדשבורד

```powershell
python tools\export_logs.py
```

### שלב 8: הרץ את הדשבורד

```powershell
cd dashboard
npm install
npm run dev
```

פתח http://localhost:5173

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
| 🟢 **Live DB** | מחובר לDB חי | API מתחבר ל-Azure SQL בזמן אמת |
| 🟡 **JSON** | קובץ סטטי | נתונים מקובץ `run-log.json` |
| 🔴 **Mock** | נתוני הדגמה | נתונים לדוגמה בלבד |

### הפעלת מצב Live DB

```bash
# 1. הפעל את ה-API מקומית
cd src/Formulix/Formulix.API
dotnet run

# 2. הפעל את הדשבורד
cd dashboard
set VITE_API_URL=http://localhost:5000
npm run dev
```

### פריסה לענן

עיין בקובץ **`DEPLOY_LIVE.md`** למדריך מלא הכולל:
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
| `tools/compare_results.py` | סקריפט השוואה (נדרש במבחן) |
| `tools/export_logs.py` | ייצוא נתונים לדשבורד |
| `docs/SUMMARY_REPORT.md` | דוח מסכם מקצועי |
| `DB/FormulixCreate.sql` + `DB/AddComplexFormulas.sql` | סכמת DB ו-**20** נוסחאות |
| `dashboard/src/components/MethodsExplainer.jsx` | הסבר השיטות |

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
