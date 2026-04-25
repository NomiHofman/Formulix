# FORMULIX — Dashboard (React + Vite)

ממשק דיווח להשוואת מנועי חישוב דינמיים (מבדק רמה ג׳). מסמך שורש הפרויקט: [`../README.md`](../README.md).

## איך הנתונים נטענים (`src/data/useRunData.js`)

| סדר | מקור | מתי |
|-----|------|-----|
| 1 | **localhost** | אם ה-API של `Formulix.API` רץ — בדיקת `/api/health` ואז `/api/summary` (דורש `VITE_API_URL`). |
| 2 | **פרודקשן (Vercel)** | `fetch('/api/summary')` — פונקציית שרת תחת `api/summary.js` (Node + `mssql`) — דורש משתני `AZURE_SQL_*` ב-Vercel. |
| 3 | **גיבוי** | `public/run-log.json` (נוצר מ־`tools/export_logs.py`). |
| 4 | **Mock** | `mockData.js` — אם אין חיבור. |

רענון אוטומטי כל ~30 שניות כשהמקור הוא Live.

## התקנה והרצה מקומית

```bash
npm install
npm run dev
```

פותחים את ה-URL ש-Vite מדפיס (בדרך כלל `http://localhost:5173`).

ל**נתונים חיים** מקומית: הריצי את `Formulix.API` והגדירי לפני `npm run dev`:

```powershell
$env:VITE_API_URL = "http://localhost:<פורט-שה-API-הדפיס>"
```

## Build / Preview

```bash
npm run build
npm run preview
```

## פריסה (Vercel)

- **Root Directory** של הפרויקט ב-Vercel: תיקיית `dashboard` (או כפי שהגדרת).
- **Environment Variables** (חשוב ל-`/api/summary`):
  - `AZURE_SQL_SERVER`
  - `AZURE_SQL_DATABASE` (אופציונלי, ברירת `FormulixDB` בקוד)
  - `AZURE_SQL_USER`
  - `AZURE_SQL_PASSWORD`  
  ראו `dashboard/.env.example` ואת סעיף *חיבור חי* ב-`README.md` בשורש.

## עיצוב וטכנולוגיות

- React 18, Vite 5, Recharts, Framer Motion, lucide-react  
- ערכת צבעים כהה, RTL — ראו היסטוריה בקומיטים / `index.css`

## מבנה (מקוצר)

```
dashboard/
├── api/                 # Vercel Serverless: summary, health, optimize, …
├── public/              # run-log.json (גיבוי), favicon
├── src/
│   ├── data/            # useRunData.js, RunDataContext, mockData
│   ├── components/
│   └── App.jsx
├── .env.example
└── vite.config.js
```
