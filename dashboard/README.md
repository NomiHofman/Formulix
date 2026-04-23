# FORMULIX

Premium dark-mode performance dashboard for a **dynamic tariff calculation engine benchmark**.
Compares four calculation engines (SQL, SQL Dynamic, Roslyn, AI) across 1M records / 48M
operations and proves that every engine produces **identical** results.

## Visual language

- Deep background `#050505` with layered glow orbs and a subtle cyber-grid overlay
- Glassmorphism cards (`backdrop-filter: blur(18px)`)
- Neon accents — Pink `#ff007a`, Blue `#0084ff`, Violet `#8a2bff`, Cyan `#00e5ff`
- `Orbitron` brand glow · `Inter` body · `JetBrains Mono` numerics

## Layout

1. **Header** — `FORMULIX` neon gradient brand + tagline
2. **Top Stats** — 4 glass cards with colored glows
   - Total records (1M) · Engines (4) · Total Ops (48M) · Avg Runtime (5.74s)
3. **Main grid** — 2 columns
   - Left: animated **Recharts `AreaChart`** comparing engine runtimes per batch size
   - Right: **System Insights** panel highlighting the best method (SQL Dynamic)
4. **Bottom Matrix** — wide `t_result` table with columns
   _Target ID · Formula · Category · SQL · Roslyn · AI · Match_
5. **Accuracy banner** — proves every engine produced identical values

Entry animations are orchestrated with **Framer Motion** (staggered children) and icons
come from **lucide-react**.

## Tech

- React 18 + Vite 5
- Recharts 2
- Framer Motion 11
- lucide-react

All data is served from a single `src/data/mockData.js` so every panel (stats, chart,
insights, matrix) stays in sync.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Build

```bash
npm run build
npm run preview
```

## Project structure

```
src/
├── App.jsx                 – composition & layout
├── main.jsx                – React bootstrap
├── index.css               – premium dark theme (glass, glows, cyber-grid)
├── data/
│   └── mockData.js         – single source of truth for the UI
└── components/
    ├── BackgroundFX.jsx    – floating orbs + grid overlay
    ├── Header.jsx          – brand + tagline + live indicator
    ├── StatsCards.jsx      – 4 KPI glass cards
    ├── RuntimeChart.jsx    – animated Recharts AreaChart
    ├── SystemInsights.jsx  – winning-method panel
    └── MatrixTable.jsx     – t_result comparison matrix
```
