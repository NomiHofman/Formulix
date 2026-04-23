import { useState, useCallback, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import BackgroundFX from './components/BackgroundFX';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import LoadingOverlay from './components/LoadingOverlay';
import { RunDataContext } from './data/RunDataContext';
import { useRunData } from './data/useRunData';

const DashboardBelowFold = lazy(() => import('./DashboardBelowFold'));

function BelowFoldFallback() {
  return (
    <div className="below-fold-fallback" aria-busy="true">
      <span className="below-fold-fallback-text">טוען ויזואליזציות…</span>
    </div>
  );
}

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

  const getSourceLabel = () => {
    switch (source) {
      case 'live-db':
        return { text: 'מחובר לDB חי', color: '#00ff88', icon: '🟢' };
      case 'json':
        return { text: 'נתונים נטענים מקובץ JSON', color: '#ffaa00', icon: '🟡' };
      case 'mock':
        return { text: 'נתוני הדגמה', color: '#ff5555', icon: '🔴' };
      default:
        return { text: 'טוען...', color: '#888', icon: '⏳' };
    }
  };

  const sourceInfo = getSourceLabel();

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

        <Suspense fallback={<BelowFoldFallback />}>
          <DashboardBelowFold
            aiGeneratedFormula={aiGeneratedFormula}
            onFormulaFromAI={handleFormulaFromAI}
          />
        </Suspense>
      </main>
    </RunDataContext.Provider>
  );
}
