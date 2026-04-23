import SystemInsights from './components/SystemInsights';
import RuntimeChart from './components/RuntimeChart';
import EngineRace from './components/EngineRace';
import MatrixTable from './components/MatrixTable';
import AIFormulaAssistant from './components/AIFormulaAssistant';
import FormulaTester from './components/FormulaTester';
import MethodsExplainer from './components/MethodsExplainer';

export default function DashboardBelowFold({ aiGeneratedFormula, onFormulaFromAI }) {
  return (
    <>
      <section className="main-grid">
        <SystemInsights />
        <RuntimeChart />
      </section>

      <EngineRace />

      <MatrixTable />

      <AIFormulaAssistant onFormulaGenerated={onFormulaFromAI} />

      <FormulaTester initialFormula={aiGeneratedFormula} />

      <MethodsExplainer />

      <footer className="footer">
        <span>FORMULIX · v1.0 · Dynamic Tariff Benchmark</span>
        <span>© {new Date().getFullYear()} · Built with React · Recharts · Framer Motion · OpenAI</span>
      </footer>
    </>
  );
}
