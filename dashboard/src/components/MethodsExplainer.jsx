import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, Code2, Sparkles, Brain, 
  Zap, Server, Cpu, ArrowLeftRight,
  CheckCircle2, Clock, ChevronDown
} from 'lucide-react';
import {
  revealStaggerStrong,
  staggerChildBig,
  fadeUp,
} from '../utils/scrollAnimations';
import BouncyIconWrap from './BouncyIconWrap';

const methods = [
  {
    id: 'sql',
    name: 'SQL Dynamic',
    nameEn: 'SQL Dynamic (sp_executesql)',
    icon: Database,
    color: '#0084ff',
    description: 'מעביר את חישוב הנוסחאות ישירות למנוע מסד הנתונים באמצעות SQL דינמי.',
    howItWorks: [
      'הנוסחה נקראת מטבלת t_targil',
      'נבנית שאילתת SQL דינמית עם הנוסחה',
      'sp_executesql מריץ את השאילתה על כל מיליון הרשומות',
      'התוצאות נכתבות ישירות ל-t_results',
    ],
    pros: [
      'הכי מהיר - אין העברת נתונים ברשת',
      'מנוע ה-DB מבצע אופטימיזציות',
      'מינימום זיכרון בצד האפליקציה',
      'תומך בכל פונקציות SQL מובנות',
    ],
    cons: [
      'פחות גמיש לנוסחאות מורכבות מאוד',
      'תלוי בסינטקס של SQL Server',
      'קשה יותר לדבג',
    ],
    techStack: ['SQL Server', 'T-SQL', 'sp_executesql', 'Stored Procedure'],
    complexity: 'נמוכה',
    avgTime: '~10s',
    recommendation: true,
  },
  {
    id: 'roslyn',
    name: 'Roslyn',
    nameEn: 'Roslyn C# Scripting',
    icon: Code2,
    color: '#8a2bff',
    description: 'מקמפל כל נוסחה פעם אחת לקוד C# נייטיבי ומריץ על כל רשומה.',
    howItWorks: [
      'הנוסחה מתורגמת לביטוי C# תקין',
      'Roslyn מקמפל לדלגייט נייטיבי',
      'הנתונים נשלפים ב-streaming מה-DB',
      'הדלגייט רץ על כל רשומה בזיכרון',
    ],
    pros: [
      'גמישות מלאה - כל קוד C# אפשרי',
      'קומפילציה חד-פעמית, ריצה מהירה',
      'קל לדבג ולבדוק',
      'אין תלות בסוג מסד הנתונים',
    ],
    cons: [
      'צריך להעביר נתונים מה-DB לזיכרון',
      'צורך יותר זיכרון',
      'איטי יותר מ-SQL על כמויות גדולות',
    ],
    techStack: ['.NET 10', 'Roslyn', 'CSharpScript', 'Microsoft.CodeAnalysis'],
    complexity: 'בינונית',
    avgTime: '~20s',
    recommendation: false,
  },
  {
    id: 'python',
    name: 'Python SymPy',
    nameEn: 'Python SymPy + NumPy',
    icon: Sparkles,
    color: '#ff007a',
    description: 'משתמש בספריית SymPy לפרסור הנוסחה וב-NumPy לחישוב וקטורי מהיר.',
    howItWorks: [
      'SymPy מפרסר את הנוסחה לעץ ביטויים',
      'lambdify ממיר לפונקציית NumPy',
      'הנתונים נטענים כמערכי NumPy',
      'חישוב וקטורי על עמודה שלמה בפעולה אחת',
    ],
    pros: [
      'חישוב וקטורי - מהיר מאוד',
      'תומך בכל פונקציה מתמטית',
      'קוד פייתון קריא ופשוט',
      'קל להרחבה ולשינויים',
    ],
    cons: [
      'דורש התקנת Python וספריות',
      'העברת נתונים מ-SQL לפייתון',
      'פחות אינטגרציה עם .NET',
    ],
    techStack: ['Python 3.11', 'SymPy', 'NumPy', 'pyodbc'],
    complexity: 'בינונית',
    avgTime: '~15s',
    recommendation: false,
  },
  {
    id: 'ai',
    name: 'AI Translated',
    nameEn: 'OpenAI GPT → Roslyn',
    icon: Brain,
    color: '#00e5ff',
    description: 'שולח את הנוסחה ל-GPT לתרגום אוטומטי ל-C#, ואז מקמפל עם Roslyn.',
    howItWorks: [
      'הנוסחה העסקית נשלחת ל-GPT-4o-mini',
      'ה-AI מחזיר ביטוי C# תקין',
      'Roslyn מקמפל את התוצאה',
      'הריצה זהה לשיטת Roslyn הרגילה',
    ],
    pros: [
      'מבין נוסחאות בשפה טבעית',
      'יכול לתרגם פורמטים שונים',
      'גמיש לשינויים עתידיים',
      'מדגים שימוש ב-AI במערכת',
    ],
    cons: [
      'תלות בשירות חיצוני (OpenAI)',
      'עלות לכל קריאת API',
      'לא דטרמיניסטי - תוצאות עלולות להשתנות',
      'איטי יותר בגלל קריאות רשת',
    ],
    techStack: ['OpenAI GPT-4o-mini', '.NET 10', 'Roslyn', 'REST API'],
    complexity: 'גבוהה',
    avgTime: '~22s',
    recommendation: false,
  },
];

function MethodCard({ method }) {
  const [open, setOpen] = useState(false);
  const Icon = method.icon;
  
  return (
    <motion.div
      className="glass method-card"
      variants={staggerChildBig}
      style={{ borderColor: `${method.color}33`, cursor: 'pointer' }}
      onClick={() => setOpen((o) => !o)}
      whileHover={{ y: -6, transition: { type: 'spring', stiffness: 320, damping: 22 } }}
      layout={false}
    >
      {/* Header — always visible */}
      <div className="method-header">
        <div className="method-icon" style={{ background: `${method.color}22`, color: method.color }}>
          <BouncyIconWrap name={`me-card-${method.id}`}>
            <Icon size={24} strokeWidth={1.8} />
          </BouncyIconWrap>
        </div>
        <div className="method-titles">
          <h3 className="method-name" style={{ color: method.color }}>{method.name}</h3>
          <span className="method-name-en">{method.nameEn}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {method.recommendation && (
            <div className="method-badge recommended">
              <CheckCircle2 size={14} />
              מומלץ
            </div>
          )}
          <div className="method-stat" style={{ margin: 0 }}>
            <Clock size={14} />
            <span>{method.avgTime}</span>
          </div>
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ color: 'var(--text-mute)', display: 'grid', placeItems: 'center' }}
          >
            <ChevronDown size={18} />
          </motion.div>
        </div>
      </div>

      <p className="method-description">{method.description}</p>

      {/* Expandable detail */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="method-section">
              <h4>
                <Zap size={14} />
                {' '}איך זה עובד
              </h4>
              <ol className="method-steps">
                {method.howItWorks.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>

            <div className="method-pros-cons">
              <div className="method-pros">
                <h4 style={{ color: '#22ff88' }}>יתרונות</h4>
                <ul>
                  {method.pros.map((pro, i) => (
                    <li key={i}>
                      <CheckCircle2 size={12} />
                      {' '}{pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="method-cons">
                <h4 style={{ color: '#ff6b6b' }}>חסרונות</h4>
                <ul>
                  {method.cons.map((con, i) => (
                    <li key={i}><span className="x-mark">×</span> {con}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="method-section">
              <h4>
                <Server size={14} />
                {' '}טכנולוגיות
              </h4>
              <div className="method-tags">
                {method.techStack.map((tech, i) => (
                  <span key={i} className="method-tag" style={{ borderColor: `${method.color}55` }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="method-stats">
              <div className="method-stat">
                <Cpu size={14} />
                <span>מורכבות: {method.complexity}</span>
              </div>
              <div className="method-stat">
                <Clock size={14} />
                <span>זמן ממוצע: {method.avgTime}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function MethodsExplainer() {
  return (
    <motion.section
      className="methods-section"
      variants={fadeUp}
      initial="hidden"
      animate="show"
    >
      <div className="methods-header">
        <div>
          <h2 className="methods-title">
            <ArrowLeftRight size={24} className="icon-violet" />
            השוואת שיטות החישוב
          </h2>
          <p className="methods-subtitle">
            ניתוח מעמיק של ארבע השיטות — לחץ על כרטיס לפירוט מלא
          </p>
        </div>
      </div>

      <motion.div 
        className="methods-grid"
        variants={revealStaggerStrong}
      >
        {methods.map((method) => (
          <MethodCard key={method.id} method={method} />
        ))}
      </motion.div>

      <motion.div 
        className="glass recommendation-box"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <div className="recommendation-content">
          <div className="recommendation-icon">
            <BouncyIconWrap name="me-recommendation-check">
              <CheckCircle2 size={32} />
            </BouncyIconWrap>
          </div>
          <div>
            <h3>המלצה: SQL Dynamic</h3>
            <p>
              על בסיס הבדיקות שבוצעו, שיטת <strong>SQL Dynamic</strong> מומלצת כשיטה העיקרית 
              לחישוב נוסחאות דינמיות. היא מספקת את הביצועים הטובים ביותר (9.8 שניות על מיליון רשומות),
              צורכת מינימום זיכרון, ומייצרת תוצאות זהות לכל השיטות האחרות.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
