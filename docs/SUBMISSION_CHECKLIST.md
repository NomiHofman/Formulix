# רשימת קבצים ותיקיות להגשה — FORMULIX

מסמך זה מסכם **מה לכלול** בגשה, בהתאם למסמך **«מנגנון חישוב דינמי — מבדק פיתוח רמה ג'»** (משרד החינוך) **ובהתאם** למבנה הפרויקט בקוד.

### הבהרה לבודק — Azure + Vercel וזמני ריצה

- **לידיעתכם:** **מסד הנתונים שעליו מסתמנת הגשה זו (בנצ'מרק, לוגים, דשבורד “חי”) הוא Azure SQL Database** — כלומר **DB ב-Azure**, לא LocalDB. LocalDB בפרויקט מיועד **רק** לשחזור/בדיקה מקומית (`FormulixCreate.sql`, ללא גישה לענן).
- הפרויקט נבנה כך ש־**הנתונים והבנצ'מרק** רצים מול **Azure SQL Database (מסד אמיתי בענן)**; **הדשבורד** מוצג ב־**Vercel (סביבת production)**. זו בחירה מכוונת שמדגימה **מערכת end-to-end** (לא הדמיה מקומית בלבד).
- **זמנים "ארוכים"** (רשת, כתיבת מיליוני שורות ל־`t_results`, מגבלת DTU, וכו') הם **צפויים** בסביבת ענן — ואינם סותרים ביצועים "טובים" יחסית. ההשוואה המקצועית היא **בין השיטות** (אותו DB, אותו תרחיש), לפי `t_log` ו־`compare_results.py`, ולא ביחס לריצה על מחשב ביתי בלבד.
- פירוט ניסוח: **`docs/SUMMARY_REPORT.md`** (סעיף "הצהרת סביבה").

---

## 0. מיפוי דרישות (מסמך PDF) — עמידה בפרויקט

| דרישה במסמך | איך היא ממומשת ב-FORMULIX |
|-------------|----------------------------|
| **לפחות 3 תוכניות שונות** | ארבע שיטות: **SQL Dynamic** (C# + SP + `sp_executesql`), **Roslyn** (C#), **Python** (SymPy/NumPy), **AI** (אופציונלי) — מעל המינימום. |
| **SQL דינמי / Stored Procedure** | `DB/FormulixCreate.sql` — `usp_RunDynamicFormula`; `Formulix.SqlDynamic` |
| **Python (eval/ספריות)** | `python/formulix_sympy/` — SymPy (לא `eval` גולמי; בטוח ומתאים לנוסחאות) |
| **.NET** | `Formulix.RoslynRunner` + `Formulix.Shared` |
| **מיליון רשומות ב־`t_data`** + קוד מילוי | `FormulixCreate.sql` — `INSERT`/`CREATE` + מילוי |
| **טבלאות `t_data`, `t_targil`, תוצאות, `t_log`** | `t_data`, `t_targil`, **`t_results`** (שם בפרויקט; במסמך כתוב `t_result` — אותו תפקיד), `t_log` |
| **מגוון נוסחאות: פשוטות, מורכבות, תנאי** | 12+8 ב־`t_targil` כולל `sqrt`, `log`, `abs`, `POWER`, `if` |
| **ריצה על כל נוסחה × כל רשומות, שמירה לתוצאות + זמן** | הראנרים + `t_results` / `t_log` |
| **דוח מסכם השוואתי** | `docs/SUMMARY_REPORT.md` + דשבורד |
| **מסך דיווח (React וכו') + קישור ענן** | `dashboard/` + פריסה (למשל Vercel) — ראו `README.md`, `DEPLOY_LIVE.md` |
| **אימות שתוצאות זהות + סקריפט השוואה** | `tools/compare_results.py` |
| **הסבר קצר לכל שיטה + המלצה** | `SUMMARY_REPORT`, `MethodsExplainer.jsx` |
| **קישור GitHub** + כל הקוד + סקריפטים | יש לשלוח **קישור לריפו אישי**; חבילת ZIP/תיקייה כמפורט למטה |
| **תצלומי מסך ממסד הנתונים** | ראו **סעיף 1א** — **חובה לפי המסמך** |

**הערה טכנית:** במסמך PDF עמודת המפתח בטבלת תוצאות מופיעה כ־`resultsl_id` (כנראה שגיאת הקלדה); בפרויקט: `t_results.results_id` עם `IDENTITY`.

---

### 1א. תצלומי מסך מבסיס הנתונים (לפי המסמך: "תצלומי מסך של בסיס הנתונים")

מומלץ ליצור תיקייה `docs/screenshots/` (או `submission/screenshots/`) ולשמור **PNG** עם שמות ברורים:

| # | מה לצלם | שם קובץ מוצע (דוגמה) |
|---|----------|------------------------|
| 1 | **SSMS** — עץ הטבלאות תחת מסד `Formulix`: `t_data`, `t_targil`, `t_results`, `t_log` | `01-tables-tree.png` |
| 2 | **מבנה `t_data`** — חלון Design / סקריפט `sp_help` / עמודות: `data_id`, `a`, `b`, `c`, `d` | `02-t_data-columns.png` |
| 3 | **מבנה `t_targil`** — `targil_id`, `targil`, `tnai`, `targil_false` | `03-t_targil-columns.png` |
| 4 | **מבנה `t_results`** + **`t_log`** | `04-t_results-t_log.png` |
| 5 | **אימות מיליון רשומות** — `SELECT COUNT(*) FROM t_data` → **1000000** | `05-t_data-count-1M.png` |
| 6 | **דגימה מ־`t_targil`** — ~5–20 שורות (מראה מגוון: פשוט, מורכב, תנאי) | `06-t_targil-sample.png` |
| 7 | **דגימה מ־`t_results`** (כמה `method` / `targil_id` שונים) | `07-t_results-sample.png` |
| 8 | **דגימה מ־`t_log`** — `method`, `run_time` בשניות | `08-t_log-sample.png` |
| 9 | (אופציונלי) **Stored Procedure** `usp_RunDynamicFormula` ב-SSMS | `09-usp_RunDynamicFormula.png` |

במצגת/קובץ Word להגשה: שזף את אותם צילומים או הדבק לינקים לריפו שבו התיקייה קיימת.

---

### 1ב. קישור GitHub (חובה במסמך המבחן)

- להעלות את **מלוא הפתרון** (או מראה מלא של הקוד) ל־**GitHub אישי**
- לשלוח **קישור תקין** לריפו (Readme בבית הריפו מפנה ל־`README.md`)

---

## 1. חובה — קבצי קוד ותיעוד

| מיקום | תיאור |
|--------|--------|
| `README.md` | קריאה ראשונה — הרצה, מבנה, Vercel, DB חי |
| `docs/SUMMARY_REPORT.md` | **דוח מסכם** מקצועי (תקציר, ארכיטקטורה, שיטות, מסקנות) — נדרש במבחן |
| `docs/SUBMISSION_CHECKLIST.md` | מסמך זה: רשימת הגשה + צילומים |
| `DB/` | כל קבצי ה-SQL: `FormulixCreate.sql`, `AddComplexFormulas.sql`, `FormulixChek.sql`, `AzureSetup.sql`, `AzureInsertData.sql`, `AzureStoredProcedure.sql`, `AzureSampleLogs.sql` |
| `src/Formulix/` | כל פרויקטי ה- .NET: `Formulix.Shared`, `Formulix.SqlDynamic`, `Formulix.RoslynRunner`, `Formulix.AITranslator`, `Formulix.API` |
| `python/formulix_sympy/` | Python SymPy: `main.py`, `runner.py`, `requirements.txt` ושאר המקור |
| `tools/` | `compare_results.py`, `export_logs.py` |
| `dashboard/` | מקור הדשבורד: `package.json`, `src/`, `public/`, `vite.config.js` (ללא `node_modules/`) |
| `DEPLOY_LIVE.md` | אם מגישים חיבור Azure — הוראות פריסה |

**לא לכלול ב-ZIP (או לנקות לפני שליחה):**  
`node_modules/`, `bin/`, `obj/`, `.vercel/`, `dist/`, `__pycache__/`, `.env`, מפתחות API.

---

## 2. סדר הרצה מקומי (לסיכום / מצורף בגשה)

1. `DB/FormulixCreate.sql` — טבלאות, 1M רשומות, 12 נוסחאות בסיס, `usp_RunDynamicFormula`  
2. `DB/AddComplexFormulas.sql` — 8 נוסחאות נוספות (סה״כ **20**)  
3. הרצת ארבע השיטות (לפי `README.md`)  
4. `python tools/compare_results.py`  
5. אופציונלי: `python tools/export_logs.py` + דשבורד `dashboard/`

---

## 3. חיבור ענן (אם הוגש כחלק מהדרישות)

- `DEPLOY_LIVE.md`  
- `Azure*.sql` ב-`DB/`  
- קישור לפריסת Vercel (מופיע ב-`README` או נשלח בנפרד)

---

## 4. קבצי מפתח שמבקשי המבדקה עשויים לבדוק ישירות

| קובץ | למה |
|------|-----|
| `tools/compare_results.py` | אימות שכל השיטות מחזירות אותו ערך |
| `DB/FormulixCreate.sql` + `DB/AddComplexFormulas.sql` | סכמת DB ו-20 נוסחאות |
| `docs/SUMMARY_REPORT.md` | דוח בכתב |
| `dashboard/src/components/MethodsExplainer.jsx` | הסבר השיטות ב-UI |
| `dashboard/src/components/FormulaTester.jsx` | בודק נוסחאות (אם נדרש כתוספת) |

---

**תאריך:** אפריל 2026 · **גרסה:** 1.0
