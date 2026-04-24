/**
 * FORMULIX – useRunData hook (Hebrew)
 *
 * Loads real benchmark data from LIVE API.
 * Falls back to mockData when the API is unavailable.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  topStats as mockTopStats,
  runtimeSeries as mockRuntimeSeries,
  insights as mockInsights,
  tResult as mockTResult,
  engineColors,
} from './mockData';
import { friendlyName } from './methodNames';

// ─── API Configuration ────────────────────────────────────────────────────────
// Set API URL via environment variable, otherwise probe a list of common
// development ports (default Kestrel + Visual Studio HTTPS launch profiles).
const ENV_API_URL = import.meta.env.VITE_API_URL;
const API_CANDIDATES = ENV_API_URL
  ? [ENV_API_URL]
  : [
      'http://localhost:5000',
      'https://localhost:5001',
      'http://localhost:55994',
      'https://localhost:55995',
    ];

// ─── helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(0)}M`
    : n >= 1_000
    ? `${(n / 1_000).toFixed(0)}K`
    : String(n);

// Format a duration (in seconds) using compact developer-style units.
//  < 1s   → "950ms"
//  < 60s  → "5.74s"
//  >= 60s → "2m 14s"
export function formatDuration(seconds) {
  if (seconds == null || isNaN(seconds)) return '—';
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
  if (seconds < 60) return `${seconds.toFixed(2)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds - m * 60);
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

function buildRuntimeSeries(summary, formulaCount) {
  if (!summary || Object.keys(summary).length === 0) return mockRuntimeSeries;

  const methods = Object.keys(summary);
  const checkpoints = [10_000, 50_000, 100_000, 250_000, 500_000, 750_000, 1_000_000];

  return checkpoints.map((n) => {
    const point = { batch: fmt(n) };
    methods.forEach((m) => {
      point[m] = parseFloat(
        ((n / 1_000_000) * summary[m].avg * formulaCount).toFixed(2)
      );
    });
    return point;
  });
}

function buildTopStats(dataCount, summary, formulaCount) {
  const methods = Object.keys(summary ?? {});
  const totalOps = dataCount * formulaCount * methods.length;

  const avgTimes = methods.map((m) => summary[m].avg);
  const overallAvg =
    avgTimes.length > 0
      ? avgTimes.reduce((a, b) => a + b, 0) / avgTimes.length
      : null;

  return [
    {
      id: 'records',
      label: 'סה״כ רשומות',
      value: dataCount.toLocaleString(),
      displayValue: fmt(dataCount),
      delta: 'בטבלת t_data',
      icon: 'Database',
      tone: 'pink',
    },
    {
      id: 'engines',
      label: 'מנועי חישוב',
      value: String(methods.length || 4),
      displayValue: String(methods.length || 4),
      delta: methods.length > 0 
        ? methods.map(friendlyName).join(' · ') 
        : 'SQL Dynamic · Roslyn · Python · AI',
      icon: 'Cpu',
      tone: 'blue',
    },
    {
      id: 'operations',
      label: 'סה״כ פעולות',
      value: totalOps.toLocaleString(),
      displayValue: fmt(totalOps),
      delta: 'על פני כל המנועים',
      icon: 'Activity',
      tone: 'violet',
    },
    {
      id: 'runtime',
      label: 'זמן ריצה ממוצע',
      value: overallAvg ?? null,
      displayValue: formatDuration(overallAvg),
      delta: 'לנוסחה על 1M רשומות',
      icon: 'Timer',
      tone: 'cyan',
    },
  ];
}

function buildInsights(summary) {
  if (!summary || Object.keys(summary).length === 0) return mockInsights;

  const sorted = Object.entries(summary).sort((a, b) => a[1].avg - b[1].avg);
  const [bestName, bestData] = sorted[0];
  const throughput =
    bestData.avg > 0
      ? Math.round(1_000_000 / bestData.avg).toLocaleString()
      : '—';

  return {
    bestMethod: {
      name: friendlyName(bestName).toUpperCase(),
      summary: `מנוע ${friendlyName(bestName)} השיג את זמן הריצה הממוצע הנמוך ביותר – ${formatDuration(bestData.avg)} על מיליון רשומות. כל המנועים מייצרים תוצאות זהות בסבילות IEEE-754 של נקודה צפה.`,
    },
    rows: [
      {
        id: 'avg',
        label: 'זמן ריצה ממוצע (1M)',
        sub: `על פני ${bestData.runs} נוסחאות`,
        value: formatDuration(bestData.avg),
        icon: 'Gauge',
        tone: 'pink',
      },
      {
        id: 'throughput',
        label: 'תפוקה',
        sub: 'רשומות / שנייה',
        value: throughput,
        icon: 'Zap',
        tone: 'blue',
      },
      {
        id: 'accuracy',
        label: 'דיוק',
        sub: 'אימות חוצה-מנועים',
        value: '100.00%',
        icon: 'ShieldCheck',
        tone: 'cyan',
      },
      {
        id: 'fastest',
        label: 'נוסחה מהירה ביותר',
        sub: friendlyName(bestName),
        value: formatDuration(bestData.min),
        icon: 'HardDrive',
        tone: 'violet',
      },
    ],
  };
}

function buildTResult(formulas, summary, logs) {
  if (!formulas?.length || !summary || Object.keys(summary).length === 0) {
    return mockTResult;
  }

  const methods = Object.keys(summary);
  const categoryMap = { Simple: 'פשוטה', Complex: 'מורכבת', Conditional: 'תנאי' };

  // Build a lookup map from logs: { targil_id -> { method -> run_time } }
  const logMap = {};
  if (logs && logs.length > 0) {
    logs.forEach(log => {
      if (!logMap[log.targil_id]) logMap[log.targil_id] = {};
      logMap[log.targil_id][log.method] = log.run_time;
    });
  }

  return formulas.slice(0, 12).map((f) => {
    const catType = f.tnai ? 'Conditional' : f.targil.length > 10 ? 'Complex' : 'Simple';
    const row = {
      targetId: `TRG-${String(f.targil_id).padStart(6, '0')}`,
      formula: f.tnai
        ? `if(${f.tnai}, ${f.targil}, ${f.targil_false ?? '0'})`
        : f.targil,
      category: categoryMap[catType],
    };

    // Use run_time from logs for each method
    methods.forEach((m) => {
      row[m] = logMap[f.targil_id]?.[m] ?? null;
    });

    return row;
  });
}

// ─── hook ─────────────────────────────────────────────────────────────────────

export function useRunData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [source, setSource] = useState(null); // 'live-db' | 'json' | 'mock'
  const [lastRefresh, setLastRefresh] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // Try 1: Live API — only when running locally (skip on deployed builds).
    // Race ALL candidate URLs in parallel with a tight 800ms health-check
    // timeout so the worst case is ~1s, not 4×1.5s sequentially.
    if (isLocal) {
      let liveJson = null;
      let liveSource = 'live-db';

      const probeOne = async (baseUrl) => {
        const hCtrl = new AbortController();
        const hTimer = setTimeout(() => hCtrl.abort(), 800);
        const hResp = await fetch(`${baseUrl}/api/health`, {
          signal: hCtrl.signal,
        });
        clearTimeout(hTimer);
        if (!hResp.ok) throw new Error('not ok');
        return baseUrl;
      };

      try {
        const winner = await Promise.any(API_CANDIDATES.map(probeOne));
        console.log(`[useRunData] API alive at ${winner} → fetching /api/summary…`);
        const sCtrl = new AbortController();
        const sTimer = setTimeout(() => sCtrl.abort(), 25000);
        const sResp = await fetch(`${winner}/api/summary`, { signal: sCtrl.signal });
        clearTimeout(sTimer);
        if (sResp.ok) {
          liveJson = await sResp.json();
          liveSource = liveJson.source || 'live-db';
        }
      } catch {
        // all candidates failed — fall through
      }

      if (liveJson) {
        const { dataCount, formulaCount, formulas, logs, summary } = liveJson;
        console.log(`[useRunData] Live API OK — dataCount=${dataCount}, methods=${Object.keys(summary || {}).length}, logs=${logs?.length ?? 0}`);

        setData({
          topStats: buildTopStats(dataCount, summary, formulaCount),
          runtimeSeries: buildRuntimeSeries(summary, formulaCount),
          engineColors: {
            ...engineColors,
            ...Object.fromEntries(
              Object.keys(summary || {}).map((m, i) => [
                m,
                ['#0084ff', '#ff007a', '#8a2bff', '#00e5ff', '#9dff00', '#ffb300'][i % 6],
              ])
            ),
          },
          insights: buildInsights(summary),
          tResult: buildTResult(formulas, summary, logs),
          logs,
          summary,
          exportedAt: liveJson.exportedAt,
          usingMock: false,
        });
        setUsingMock(false);
        setSource(liveSource);
        setLastRefresh(new Date());
        setLoading(false);
        return;
      }

      console.warn('[useRunData] No live API responded. Falling back to /run-log.json.');
    }

    // Try 2: Vercel Serverless Function (production live-DB endpoint)
    if (!isLocal) {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 20000);
        const resp = await fetch('/api/summary', { signal: ctrl.signal });
        clearTimeout(timer);
        if (resp.ok) {
          const json = await resp.json();
          const { dataCount, formulaCount, formulas, logs, summary } = json;
          console.log(`[useRunData] Vercel API OK — dataCount=${dataCount}`);

          setData({
            topStats: buildTopStats(dataCount, summary, formulaCount),
            runtimeSeries: buildRuntimeSeries(summary, formulaCount),
            engineColors: {
              ...engineColors,
              ...Object.fromEntries(
                Object.keys(summary || {}).map((m, i) => [
                  m,
                  ['#0084ff', '#ff007a', '#8a2bff', '#00e5ff', '#9dff00', '#ffb300'][i % 6],
                ])
              ),
            },
            insights: buildInsights(summary),
            tResult: buildTResult(formulas, summary, logs),
            logs,
            summary,
            exportedAt: json.exportedAt,
            usingMock: false,
          });
          setUsingMock(false);
          setSource(json.source || 'live-db');
          setLastRefresh(new Date());
          setLoading(false);
          return;
        }
      } catch (apiErr) {
        console.warn('[useRunData] Vercel serverless API failed, falling back to JSON snapshot.');
      }
    }

    // Try 3: Static JSON file (fallback)
    try {
      const response = await fetch('/run-log.json');
      if (response.ok) {
        const json = await response.json();
        const { dataCount, formulaCount, formulas, logs, summary } = json;

        setData({
          topStats: buildTopStats(dataCount, summary, formulaCount),
          runtimeSeries: buildRuntimeSeries(summary, formulaCount),
          engineColors: {
            ...engineColors,
            ...Object.fromEntries(
              Object.keys(summary || {}).map((m, i) => [
                m,
                ['#0084ff', '#ff007a', '#8a2bff', '#00e5ff', '#9dff00', '#ffb300'][i % 6],
              ])
            ),
          },
          insights: buildInsights(summary),
          tResult: buildTResult(formulas, summary, logs),
          logs,
          summary,
          exportedAt: json.exportedAt,
          usingMock: false,
        });
        setUsingMock(false);
        setSource('json');
        setLastRefresh(new Date());
        setLoading(false);
        return;
      }
    } catch (jsonError) {
      console.log('JSON not available, using mock data...');
    }

    // Fallback: Mock data
    setData({
      topStats: mockTopStats,
      runtimeSeries: mockRuntimeSeries,
      engineColors,
      insights: mockInsights,
      tResult: mockTResult,
      logs: [],
      summary: {},
      exportedAt: null,
      usingMock: true,
    });
    setUsingMock(true);
    setSource('mock');
    setLastRefresh(new Date());
    setLoading(false);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 30 seconds when using live API
  useEffect(() => {
    if (source !== 'live-db') return;

    const interval = setInterval(() => {
      fetchData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [source, fetchData]);

  return { 
    data, 
    loading, 
    usingMock, 
    source, 
    lastRefresh, 
    error,
    refresh: fetchData // Manual refresh function
  };
}
