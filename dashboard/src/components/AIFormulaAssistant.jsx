import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Send, Sparkles, Wand2, Copy, Check,
  MessageSquare, Lightbulb, ArrowLeft
} from 'lucide-react';
import { scaleIn, SCROLL_VIEWPORT } from '../utils/scrollAnimations';

/* =========================================================
   AIFormulaAssistant (Hebrew)
   
   AI-powered natural language to formula converter.
   Users can describe what they want in Hebrew and the AI
   converts it to a valid formula.
   
   This demonstrates practical AI integration in the system!
   ========================================================= */

const EXAMPLE_PROMPTS = [
  { text: 'חשב את סכום הריבועים של a ו-b', icon: '📐' },
  { text: 'מצא את הממוצע של כל המשתנים', icon: '📊' },
  { text: 'אם a גדול מ-10 תכפיל את b ב-2, אחרת חלק ב-2', icon: '🔀' },
  { text: 'חשב מרחק בין שתי נקודות (פיתגורס)', icon: '📏' },
  { text: 'הוסף 15% מס לערך c', icon: '💰' },
];

const SYSTEM_PROMPT = `You are a formula translator for a dynamic calculation system.
The system supports variables: a, b, c, d (all are floating-point numbers).
Supported functions: SQRT, LOG, ABS, POWER, SIN, COS, TAN, EXP, CEILING, FLOOR, ROUND

Rules:
1. Return ONLY the formula, nothing else
2. Use the exact function names above (uppercase)
3. For conditions, use: condition ? trueValue : falseValue
4. Keep formulas simple and efficient
5. Use parentheses to ensure correct order of operations

Examples:
- "sum of squares" → POWER(a, 2) + POWER(b, 2)
- "average of all" → (a + b + c + d) / 4
- "if a > 5 multiply b by 2" → a > 5 ? b * 2 : b
- "distance formula" → SQRT(POWER(a - c, 2) + POWER(b - d, 2))
- "add 15% tax to c" → c * 1.15`;

async function translateWithAI(userPrompt, apiKey) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 150,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error('שגיאה בתקשורת עם OpenAI');
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

function simulateAI(userPrompt) {
  const prompt = userPrompt.toLowerCase();
  
  if (prompt.includes('סכום') && prompt.includes('ריבוע')) {
    return 'POWER(a, 2) + POWER(b, 2)';
  }
  if (prompt.includes('ממוצע')) {
    return '(a + b + c + d) / 4';
  }
  if (prompt.includes('פיתגורס') || prompt.includes('מרחק')) {
    return 'SQRT(POWER(a - c, 2) + POWER(b - d, 2))';
  }
  if (prompt.includes('מס') || prompt.includes('15%')) {
    return 'c * 1.15';
  }
  if (prompt.includes('אם') && prompt.includes('גדול')) {
    return 'a > 10 ? b * 2 : b / 2';
  }
  if (prompt.includes('שורש')) {
    return 'SQRT(a * a + b * b)';
  }
  if (prompt.includes('לוג')) {
    return 'LOG(a + 1)';
  }
  if (prompt.includes('מוחלט') || prompt.includes('הפרש')) {
    return 'ABS(a - b)';
  }
  if (prompt.includes('חיבור') || prompt.includes('סכום')) {
    return 'a + b + c + d';
  }
  if (prompt.includes('כפל')) {
    return 'a * b * c * d';
  }
  
  return '(a + b) * 2';
}

export default function AIFormulaAssistant({ onFormulaGenerated }) {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [useRealAI, setUseRealAI] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiInput, setShowApiInput] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setResult(null);
    
    try {
      let formula;
      
      if (useRealAI && apiKey) {
        formula = await translateWithAI(prompt, apiKey);
      } else {
        await new Promise(resolve => setTimeout(resolve, 800));
        formula = simulateAI(prompt);
      }
      
      setResult({
        success: true,
        formula,
        explanation: `הנוסחה נוצרה על בסיס הבקשה: "${prompt}"`,
      });
    } catch (error) {
      setResult({
        success: false,
        error: error.message || 'שגיאה ביצירת הנוסחה',
      });
    } finally {
      setIsLoading(false);
    }
  }, [prompt, useRealAI, apiKey]);

  const handleCopy = useCallback(() => {
    if (result?.formula) {
      navigator.clipboard.writeText(result.formula);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  const handleUseFormula = useCallback(() => {
    if (result?.formula && onFormulaGenerated) {
      onFormulaGenerated(result.formula);
    }
  }, [result, onFormulaGenerated]);

  const handleExampleClick = useCallback((example) => {
    setPrompt(example.text);
    setResult(null);
  }, []);

  return (
    <motion.div
      className="glass ai-assistant"
      variants={scaleIn}
      initial="hidden"
      whileInView="show"
      viewport={SCROLL_VIEWPORT}
    >
      <div className="panel-header">
        <div>
          <div className="panel-title">
            <Bot size={20} className="icon-cyan" />
            עוזר AI ליצירת נוסחאות
          </div>
          <div className="panel-subtitle">
            תאר מה אתה רוצה לחשב בעברית והבינה המלאכותית תיצור את הנוסחה
          </div>
        </div>
        <div className="ai-mode-toggle">
          <button
            className={`ai-mode-btn ${!useRealAI ? 'active' : ''}`}
            onClick={() => setUseRealAI(false)}
          >
            דמו
          </button>
          <button
            className={`ai-mode-btn ${useRealAI ? 'active' : ''}`}
            onClick={() => {
              setUseRealAI(true);
              setShowApiInput(true);
            }}
          >
            <Sparkles size={12} />
            GPT-4
          </button>
        </div>
      </div>

      {/* API Key Input */}
      <AnimatePresence>
        {useRealAI && showApiInput && (
          <motion.div
            className="ai-api-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <input
              type="password"
              className="ai-api-input"
              placeholder="הזן OpenAI API Key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              dir="ltr"
            />
            <span className="ai-api-hint">
              המפתח נשמר רק בדפדפן שלך ולא נשלח לשרת
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Examples */}
      <div className="ai-examples">
        <span className="ai-examples-label">
          <Lightbulb size={14} />
          דוגמאות לנסות:
        </span>
        <div className="ai-examples-list">
          {EXAMPLE_PROMPTS.map((example, i) => (
            <button
              key={i}
              className="ai-example-btn"
              onClick={() => handleExampleClick(example)}
            >
              <span>{example.icon}</span>
              {example.text}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="ai-input-section">
        <div className="ai-input-wrap">
          <MessageSquare size={18} className="ai-input-icon" />
          <input
            type="text"
            className="ai-input"
            placeholder="תאר את החישוב שאתה רוצה..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <motion.button
            className="ai-send-btn"
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles size={18} />
              </motion.div>
            ) : (
              <Send size={18} />
            )}
          </motion.button>
        </div>
      </div>

      {/* Result */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            className={`ai-result ${result.success ? 'success' : 'error'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {result.success ? (
              <>
                <div className="ai-result-header">
                  <Wand2 size={18} />
                  <span>הנוסחה שנוצרה:</span>
                </div>
                <div className="ai-result-formula">
                  <code>{result.formula}</code>
                  <div className="ai-result-actions">
                    <button
                      className="ai-action-btn"
                      onClick={handleCopy}
                      title="העתק"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                    {onFormulaGenerated && (
                      <button
                        className="ai-action-btn primary"
                        onClick={handleUseFormula}
                        title="השתמש בנוסחה"
                      >
                        <ArrowLeft size={16} />
                        השתמש
                      </button>
                    )}
                  </div>
                </div>
                <p className="ai-result-explanation">{result.explanation}</p>
              </>
            ) : (
              <div className="ai-result-error">
                <span>❌ {result.error}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
