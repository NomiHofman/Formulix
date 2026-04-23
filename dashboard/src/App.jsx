import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import BackgroundFX   from './components/BackgroundFX';
import Header         from './components/Header';
import StatsCards     from './components/StatsCards';
import RuntimeChart   from './components/RuntimeChart';
import SystemInsights from './components/SystemInsights';
import MatrixTable    from './components/MatrixTable';
import EngineRace     from './components/EngineRace';
import MethodsExplainer from './components/MethodsExplainer';
import FormulaTester from './components/FormulaTester';
import AIFormulaAssistant from './components/AIFormulaAssistant';
import LoadingOverlay from './components/LoadingOverlay';
import { RunDataContext } from './data/RunDataContext';
import { useRunData }    from './data/useRunData';

/* =========================================================
   FORMULIX · App Shell (Hebrew RTL)
   
   Complete benchmark dashboard featuring:
   - LIVE DATABASE CONNECTION
   - Performance metrics & comparison
   - Runtime visualization
   - Results matrix with cross-engine verification
   - Detailed methods explanation
   - Interactive formula tester
   - AI-powered formula assistant (creative bonus!)
   ========================================================= */
export default function App() {
  const { data, loading, source, lastRefresh, refresh } = useRunData();
  const [aiGeneratedFormula, setAiGeneratedFormula] = useState(null);

  const handleFormulaFromAI = useCallback((formula) => {
    setAiGeneratedFormula(formula);
    document.querySelector('.formula-tester')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center'
    });
  }, []);

  const getSourceLabel = () => {
    switch (source) {
      case 'live-db': return { text: 'מחובר לDB חי', color: '#00ff88', icon: '🟢' };
      case 'json': return { text: 'נתונים נטענים מקובץ JSON', color: '#ffaa00', icon: '🟡' };
      case 'mock': return { text: 'נתוני הדגמה', color: '#ff5555', icon: '🔴' };
      default: return { text: 'טוען...', color: '#888', icon: '⏳' };
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

        {/* Connection Status Banner */}
        <div className="connection-banner" style={{ 
          borderColor: sourceInfo.color,
          background: `linear-gradient(90deg, ${sourceInfo.color}11, transparent)`
        }}>
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
            <button className="refresh-btn" onClick={refresh} title="רענן נתונים">
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

        <section className="main-grid">
          <SystemInsights />
          <RuntimeChart />
        </section>

        <EngineRace />

        <MatrixTable />

        <AIFormulaAssistant onFormulaGenerated={handleFormulaFromAI} />

        <FormulaTester initialFormula={aiGeneratedFormula} />

        <MethodsExplainer />

        <footer className="footer">
          <span>FORMULIX · v1.0 · Dynamic Tariff Benchmark</span>
          <span>© {new Date().getFullYear()} · Built with React · Recharts · Framer Motion · OpenAI</span>
        </footer>
      </main>
    </RunDataContext.Provider>
  );
}
