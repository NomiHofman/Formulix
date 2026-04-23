import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import BackgroundFX from './components/BackgroundFX';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import LoadingOverlay from './components/LoadingOverlay';
import DashboardBelowFold from './DashboardBelowFold';
import { RunDataContext } from './data/RunDataContext';
import { useRunData } from './data/useRunData';

/* Eager import of below-the-fold: lazy() caused a *second* JS download wave; Chrome/Edge
   show a top “loading” bar until *all* module requests finish — looks like a stuck bar. */

export default function App() {
  const { data, loading, source, lastRefresh, refresh } = useRunData();
  const [aiGeneratedFormula, setAiGeneratedFormula] = useState(null);

  const handleFormulaFromAI = useCallback((formula) => {
    setAiGeneratedFormula(formula);
    document.querySelector('.formula-tester')?.scrollIntoView({
      behavior: 'auto',
      block: 'center',
    });
  }, []);

  const isLocalHost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');

  const getSourceLabel = () => {
    switch (source) {
      case 'live-db':
        return { text: 'מחובר ל-DB חי', color: '#00ff88', icon: '🟢' };
      case 'json':
        return isLocalHost
          ? {
              text: 'API לא מגיב — נתונים מ-snapshot מקומי',
              color: '#ffaa00',
              icon: '🟡',
            }
          : {
              text: 'מחובר לנתוני בנצ׳מרק (snapshot מה-DB החי)',
              color: '#00ff88',
              icon: '🟢',
            };
      case 'mock':
        return { text: 'נתוני הדגמה', color: '#ff5555', icon: '🔴' };
      default:
        return { text: 'טוען...', color: '#888', icon: '⏳' };
    }
  };

  const sourceInfo = getSourceLabel();
  const isLiveLike = source === 'live-db' || (source === 'json' && !isLocalHost);

  return (
    <RunDataContext.Provider value={data}>
      <BackgroundFX />

      <AnimatePresence mode="wait">
        {loading && <LoadingOverlay key="run-data-loading" />}
      </AnimatePresence>

      <main className={`app-shell ${loading ? 'is-loading' : ''}`}>
        <Header />

        <div
          className="connection-banner"
          style={{
            borderColor: sourceInfo.color,
            background: `linear-gradient(90deg, ${sourceInfo.color}11, transparent)`,
          }}
        >
          <div className="connection-status">
            <span className="connection-icon">{sourceInfo.icon}</span>
            <span className="connection-text" style={{ color: sourceInfo.color }}>
              {sourceInfo.text}
            </span>
            {source === 'live-db' && (
              <span className="auto-refresh-badge">רענון אוטומטי כל 30 שניות</span>
            )}
            {source === 'json' && !isLocalHost && data?.exportedAt && (
              <span className="auto-refresh-badge">
                snapshot: {new Date(data.exportedAt).toLocaleString('he-IL')}
              </span>
            )}
          </div>
          <div className="connection-actions">
            {lastRefresh && (
              <span className="last-refresh">
                עדכון אחרון: {lastRefresh.toLocaleTimeString('he-IL')}
              </span>
            )}
            <button type="button" className="refresh-btn" onClick={refresh} title="רענן נתונים">
              🔄 רענן
            </button>
          </div>
        </div>

        {data?.usingMock && (
          <div className="mock-banner">
            ⚠ מוצגים נתוני הדגמה. הפעל את ה-API והעלה את ה-DB לענן לחיבור חי.
          </div>
        )}

        <StatsCards />

        <DashboardBelowFold
          aiGeneratedFormula={aiGeneratedFormula}
          onFormulaFromAI={handleFormulaFromAI}
        />
      </main>
    </RunDataContext.Provider>
  );
}
