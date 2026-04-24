/* =========================================================
   FORMULIX – Central mock data file (Hebrew)
   All UI panels read from this single file for consistency.
   ========================================================= */

// --- Top-line KPIs shown in the 4 glass stat cards ---------
export const topStats = [
  {
    id: 'records',
    label: 'סה״כ רשומות',
    value: '1,000,000',
    displayValue: '1M',
    delta: 'בטבלת t_data',
    icon: 'Database',
    tone: 'pink'
  },
  {
    id: 'engines',
    label: 'מנועי חישוב',
    value: '4',
    displayValue: '4',
    delta: 'SQL Dynamic · Roslyn · Python · AI',
    icon: 'Cpu',
    tone: 'blue'
  },
  {
    id: 'operations',
    label: 'סה״כ פעולות',
    value: '48,000,000',
    displayValue: '48M',
    delta: 'על פני כל המנועים',
    icon: 'Activity',
    tone: 'violet'
  },
  {
    id: 'runtime',
    label: 'זמן ריצה ממוצע',
    value: 5.74,
    displayValue: '5.74s',
    delta: 'לנוסחה על 1M רשומות',
    icon: 'Timer',
    tone: 'cyan'
  }
];

// --- Engine color map (shared by chart + table) ------------
// Keys match the TECHNICAL names used in the DB/API (summary keys).
// Friendly display names are applied via methodNames.js (friendlyName).
export const engineColors = {
  SQLDynamic:   '#0084ff', // neon blue   → "SQL Dynamic"
  Roslyn:       '#8a2bff', // neon violet → "Roslyn"
  PythonSymPy:  '#ff007a', // neon pink   → "Python"
  AITranslated: '#00e5ff'  // neon cyan   → "AI"
};

// --- Runtime series per batch size (seconds, lower = better)
// Keys match the 4 real engines so fallback stays consistent with live data.
export const runtimeSeries = [
  { batch: '10K',  SQLDynamic: 0.9,  Roslyn: 1.4,  PythonSymPy: 1.8,  AITranslated: 2.1 },
  { batch: '50K',  SQLDynamic: 1.7,  Roslyn: 3.0,  PythonSymPy: 3.9,  AITranslated: 4.2 },
  { batch: '100K', SQLDynamic: 2.6,  Roslyn: 4.6,  PythonSymPy: 6.2,  AITranslated: 6.5 },
  { batch: '250K', SQLDynamic: 4.1,  Roslyn: 8.1,  PythonSymPy: 11.4, AITranslated: 11.9 },
  { batch: '500K', SQLDynamic: 6.2,  Roslyn: 12.9, PythonSymPy: 18.7, AITranslated: 18.4 },
  { batch: '750K', SQLDynamic: 8.0,  Roslyn: 16.8, PythonSymPy: 24.9, AITranslated: 24.0 },
  { batch: '1M',   SQLDynamic: 9.8,  Roslyn: 20.6, PythonSymPy: 31.2, AITranslated: 29.7 }
];

// --- System Insights right-side panel ----------------------
export const insights = {
  bestMethod: {
    name: 'SQL DYNAMIC',
    summary:
      'מנוע SQL Dynamic מעביר את חישוב הנוסחאות לשכבת מסד הנתונים באמצעות ביטויים פרמטריים. הוא מציג את זמן הריצה הממוצע הנמוך ביותר (9.8 שניות על מיליון רשומות) תוך הפקת תוצאות זהות לכל מנוע אחר.'
  },
  rows: [
    {
      id: 'avg',
      label: 'זמן ריצה ממוצע (1M)',
      sub: 'נמדד על 12 נוסחאות',
      value: '9.80s',
      icon: 'Gauge',
      tone: 'pink'
    },
    {
      id: 'throughput',
      label: 'תפוקה',
      sub: 'רשומות / שנייה',
      value: '102,040',
      icon: 'Zap',
      tone: 'blue'
    },
    {
      id: 'accuracy',
      label: 'דיוק',
      sub: 'מול Roslyn ו-AI',
      value: '100.00%',
      icon: 'ShieldCheck',
      tone: 'cyan'
    },
    {
      id: 'memory',
      label: 'שיא זיכרון',
      sub: '−41% לעומת Roslyn',
      value: '312 MB',
      icon: 'HardDrive',
      tone: 'violet'
    }
  ]
};

// --- t_result detail rows ---------------------------------
// Keys match the 4 real engines (friendlyName is applied in the UI).
const row = (targetId, formula, category, val) => ({
  targetId,
  formula,
  category,
  SQLDynamic:   val,
  Roslyn:       val,
  PythonSymPy:  val,
  AITranslated: val,
});

export const tResult = [
  row('TRG-000001', 'a + b',                       'פשוטה',  128.42),
  row('TRG-000002', 'c * 2',                       'פשוטה',  742.18),
  row('TRG-000005', '8 * (a + b)',                 'מורכבת', 216.07),
  row('TRG-000006', '(c * c) + (d * d)',           'מורכבת', 12480.55),
  row('TRG-000009', 'if(a > 5, b * 2, b / 2)',     'תנאי',   54.93),
  row('TRG-000010', 'if(b < 10, a + 1, d - 1)',    'תנאי',   392.61),
  row('TRG-000011', 'if(a == c, 1, 0)',            'תנאי',   178.24),
  row('TRG-000012', 'if(c > d, (a+b)*2, (a+b)/2)', 'תנאי',   988.76),
];

// All engines match when every row has identical values across the 4 methods.
export const allEnginesMatch = tResult.every(
  (r) => r.SQLDynamic === r.Roslyn && r.Roslyn === r.PythonSymPy && r.PythonSymPy === r.AITranslated
);
