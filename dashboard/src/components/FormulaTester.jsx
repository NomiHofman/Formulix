import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FlaskConical, Play, RotateCcw, Sparkles, 
  Calculator, CheckCircle2, AlertCircle, Lightbulb,
  Bot
} from 'lucide-react';
import { scaleIn } from '../utils/scrollAnimations';
import BouncyIconWrap from './BouncyIconWrap';

const SAMPLE_FORMULAS = [
  { formula: 'a + b', description: 'חיבור פשוט' },
  { formula: '(a + b) * 8', description: 'חיבור וכפל' },
  { formula: 'SQRT((a*a) + (b*b))', description: 'פיתגורס' },
  { formula: 'LOG(c + 1)', description: 'לוגריתם' },
  { formula: 'ABS(d - b)', description: 'ערך מוחלט' },
  { formula: 'POWER(a, 2) + POWER(b, 2)', description: 'סכום ריבועים' },
];

const DEFAULT_VALUES = { a: 10, b: 5, c: 100, d: 3 };

function evaluateFormula(formula, values) {
  try {
    const normalized = formula
      .replace(/SQRT\(/gi, 'Math.sqrt(')
      .replace(/LOG\(/gi, 'Math.log(')
      .replace(/ABS\(/gi, 'Math.abs(')
      .replace(/POWER\(/gi, 'Math.pow(')
      .replace(/SIN\(/gi, 'Math.sin(')
      .replace(/COS\(/gi, 'Math.cos(')
      .replace(/\ba\b/g, values.a)
      .replace(/\bb\b/g, values.b)
      .replace(/\bc\b/g, values.c)
      .replace(/\bd\b/g, values.d);
    
    const result = Function(`"use strict"; return (${normalized})`)();
    
    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('תוצאה לא תקינה');
    }
    
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message || 'שגיאה בנוסחה' };
  }
}

export default function FormulaTester({ initialFormula }) {
  const [formula, setFormula] = useState('a + b');
  const [fromAI, setFromAI] = useState(false);

  useEffect(() => {
    if (initialFormula) {
      setFormula(initialFormula);
      setFromAI(true);
      setResult(null);
      setTimeout(() => setFromAI(false), 5000);
    }
  }, [initialFormula]);
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [result, setResult] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleCalculate = useCallback(() => {
    setIsAnimating(true);
    const evalResult = evaluateFormula(formula, values);
    
    setTimeout(() => {
      setResult(evalResult);
      setIsAnimating(false);
    }, 300);
  }, [formula, values]);

  const handleReset = useCallback(() => {
    setFormula('a + b');
    setValues(DEFAULT_VALUES);
    setResult(null);
  }, []);

  const handleValueChange = useCallback((key, value) => {
    const numValue = parseFloat(value) || 0;
    setValues(prev => ({ ...prev, [key]: numValue }));
  }, []);

  const handleSampleClick = useCallback((sample) => {
    setFormula(sample.formula);
    setResult(null);
  }, []);

  return (
    <motion.section
      className="glass formula-tester"
      variants={scaleIn}
      initial="hidden"
      animate="show"
    >
      <div className="panel-header">
        <div>
          <div className="panel-title">
            <BouncyIconWrap name="ft-header-flask">
              <FlaskConical size={20} className="icon-violet" />
            </BouncyIconWrap>
            סביבת ניסוי נוסחאות
          </div>
          <div className="panel-subtitle">
            בדוק נוסחאות בזמן אמת - הזן נוסחה וערכים וראה את התוצאה
          </div>
        </div>
        <button type="button" className="tester-reset-btn" onClick={handleReset}>
          <RotateCcw size={14} />
          אפס
        </button>
      </div>

      <div className="tester-content">
        {/* Formula Input */}
        <div className="tester-formula-section">
          <label className="tester-label">
            <Calculator size={14} />
            נוסחה
            {fromAI && (
              <span className="from-ai-badge">
                <Bot size={12} />
                מ-AI
              </span>
            )}
          </label>
          <div className="tester-input-wrap">
            <input
              type="text"
              className={`tester-formula-input ${fromAI ? 'from-ai' : ''}`}
              value={formula}
              onChange={(e) => {
                setFormula(e.target.value);
                setFromAI(false);
              }}
              placeholder="לדוגמה: a + b * 2"
              dir="ltr"
            />
            <motion.button
              className="tester-run-btn"
              onClick={handleCalculate}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isAnimating}
            >
              {isAnimating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles size={16} />
                </motion.div>
              ) : (
                <>
                  <Play size={16} />
                  חשב
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Sample Formulas */}
        <div className="tester-samples">
          <label className="tester-label">
            <Lightbulb size={14} />
            נוסחאות לדוגמה
          </label>
          <div className="tester-sample-buttons">
            {SAMPLE_FORMULAS.map((sample, i) => (
              <button
                key={i}
                className="tester-sample-btn"
                onClick={() => handleSampleClick(sample)}
                title={sample.description}
              >
                {sample.formula}
              </button>
            ))}
          </div>
        </div>

        {/* Variables */}
        <div className="tester-variables">
          <label className="tester-label">משתנים</label>
          <div className="tester-vars-grid">
            {Object.entries(values).map(([key, value]) => (
              <div key={key} className="tester-var">
                <span className="tester-var-name">{key}</span>
                <input
                  type="number"
                  className="tester-var-input"
                  value={value}
                  onChange={(e) => handleValueChange(key, e.target.value)}
                  step="any"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Result */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              className={`tester-result ${result.success ? 'success' : 'error'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {result.success ? (
                <>
                  <CheckCircle2 size={20} />
                  <div className="tester-result-content">
                    <span className="tester-result-label">תוצאה</span>
                    <span className="tester-result-value">
                      {result.result.toLocaleString('en-US', { 
                        maximumFractionDigits: 6 
                      })}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle size={20} />
                  <div className="tester-result-content">
                    <span className="tester-result-label">שגיאה</span>
                    <span className="tester-result-error">{result.error}</span>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Supported Functions */}
        <div className="tester-help">
          <span className="tester-help-title">פונקציות נתמכות:</span>
          <span className="tester-help-funcs">
            SQRT · LOG · ABS · POWER · SIN · COS
          </span>
        </div>
      </div>
    </motion.section>
  );
}
