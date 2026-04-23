import SystemInsights from './components/SystemInsights';
import RuntimeChart from './components/RuntimeChart';
import EngineRace from './components/EngineRace';
import MatrixTable from './components/MatrixTable';
import AIFormulaAssistant from './components/AIFormulaAssistant';
import FormulaTester from './components/FormulaTester';
import MethodsExplainer from './components/MethodsExplainer';
import VisibleWhenInView from './components/VisibleWhenInView';

export default function DashboardBelowFold({ aiGeneratedFormula, onFormulaFromAI }) {
  return (
    <>
      <VisibleWhenInView minHeight={380} rootMargin="200px 0px">
        <section className="main-grid">
          <SystemInsights />
          <RuntimeChart />
        </section>
      </VisibleWhenInView>

      <VisibleWhenInView minHeight={320} rootMargin="200px 0px">
        <EngineRace />
      </VisibleWhenInView>

      <VisibleWhenInView minHeight={420} rootMargin="160px 0px">
        <MatrixTable />
      </VisibleWhenInView>

      <VisibleWhenInView minHeight={260} rootMargin="180px 0px">
        <AIFormulaAssistant onFormulaGenerated={onFormulaFromAI} />
      </VisibleWhenInView>

      <VisibleWhenInView minHeight={320} rootMargin="180px 0px">
        <FormulaTester initialFormula={aiGeneratedFormula} />
      </VisibleWhenInView>

      <VisibleWhenInView minHeight={480} rootMargin="120px 0px">
        <MethodsExplainer />
      </VisibleWhenInView>

      <footer className="footer">
        <span>FORMULIX · v1.0 · Dynamic Tariff Benchmark</span>
        <span>© {new Date().getFullYear()} · Built with React · Recharts · Framer Motion · OpenAI</span>
      </footer>
    </>
  );
}
