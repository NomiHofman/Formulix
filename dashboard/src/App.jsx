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

  return (
    <RunDataContext.Provider value={data}>
      <BackgroundFX />

      <AnimatePresence mode="wait">
        {loading && <LoadingOverlay key="run-data-loading" />}
      </AnimatePresence>

      <main className={`app-shell ${loading ? 'is-loading' : ''}`}>
        <Header
          source={source}
          lastRefresh={lastRefresh}
          exportedAt={data?.exportedAt}
          refresh={refresh}
          isLocalHost={isLocalHost}
        />

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
