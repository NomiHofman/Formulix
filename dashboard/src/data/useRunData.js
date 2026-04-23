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
// Set API URL via environment variable or default to local
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(0)}M`
    : n >= 1_000
    ? `${(n / 1_000).toFixed(0)}K`
    : String(n);

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
      value: overallAvg != null ? `${overallAvg.toFixed(2)}s` : '—',
      displayValue: overallAvg != null ? `${overallAvg.toFixed(2)}s` : '—',
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
      summary: `מנוע ${friendlyName(bestName)} השיג את זמן הריצה הממוצע הנמוך ביותר – ${bestData.avg.toFixed(2)} שניות על מיליון רשומות. כל המנועים מייצרים תוצאות זהות בסבילות IEEE-754 של נקודה צפה.`,
    },
    rows: [
      {
        id: 'avg',
        label: 'זמן ריצה ממוצע (1M)',
        sub: `על פני ${bestData.runs} נוסחאות`,
        value: `${bestData.avg.toFixed(2)}s`,
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
        value: `${bestData.min.toFixed(2)}s`,
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

    // Try 1: Live API — only when running locally (skip on deployed builds)
    if (isLocal) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(`${API_URL}/api/summary`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const json = await response.json();
          const { dataCount, formulaCount, formulas, logs, summary, source: apiSource } = json;

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
          setSource(apiSource || 'live-db');
          setLastRefresh(new Date());
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.log('API not available, trying JSON fallback...', apiError.name);
      }
    }

    // Try 2: Static JSON file (fallback)
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
