import { motion, useReducedMotion } from 'framer-motion';
import {
  BrainCircuit, Gauge, Zap, ShieldCheck, HardDrive, Trophy,
} from 'lucide-react';
import { useData } from '../data/RunDataContext';
import { scaleIn } from '../utils/scrollAnimations';
import BouncyIconWrap from './BouncyIconWrap';

const ICONS = { Gauge, Zap, ShieldCheck, HardDrive };

const TONE_COLOR = {
  pink:   '#ff007a',
  blue:   '#0084ff',
  violet: '#8a2bff',
  cyan:   '#00e5ff',
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.3 } },
};
const rowAnim = {
  hidden: { opacity: 0, x: 28 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const rowHoverSpring = {
  scale: 1.01,
  y: -2,
  zIndex: 2,
  backgroundColor: 'rgba(255, 255, 255, 0.045)',
  boxShadow: '0 8px 28px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)',
  borderColor: 'rgba(255, 255, 255, 0.1)',
  transition: { type: 'spring', stiffness: 420, damping: 30 },
};

export default function SystemInsights() {
  const data = useData();
  const { bestMethod, rows } = data?.insights ?? { bestMethod: {}, rows: [] };
  const reduce = useReducedMotion();

  return (
    <motion.aside
      className="glass panel system-insights-panel"
      variants={scaleIn}
      initial="hidden"
      animate="show"
    >
      <div className="panel-header">
        <div>
          <div className="panel-title">
            <span className="insight-header-icon">
              <BrainCircuit size={18} className="icon-pink" />
            </span>
            תובנות מערכת
          </div>
          <div className="panel-subtitle">סיכום אוטומטי של הבנצ׳מרק</div>
        </div>
        <BouncyIconWrap name="si-hero-trophy" className="insight-header-icon insight-header-icon--motion">
          <Trophy size={18} style={{ color: '#ffc94d' }} />
        </BouncyIconWrap>
      </div>

      <div className="insight-hero">
        <div className="insight-hero-label">השיטה הטובה ביותר</div>
        <div className="insight-hero-value">{bestMethod.name ?? '—'}</div>
        <div className="insight-hero-desc">{bestMethod.summary ?? ''}</div>
      </div>

      <motion.div
        className="insight-list"
        variants={container}
      >
        {rows.map((r) => {
          const Icon = ICONS[r.icon] ?? Gauge;
          const color = TONE_COLOR[r.tone] ?? '#0084ff';
          return (
            <motion.div
              key={r.id}
              className="insight-row"
              variants={rowAnim}
              whileHover={reduce ? undefined : rowHoverSpring}
            >
              <div className="insight-row-left">
                <div
                  className="insight-row-icon insight-row-icon--motion"
                  style={{ color, boxShadow: `inset 0 0 18px ${color}22` }}
                >
                  <Icon size={16} strokeWidth={2.1} />
                </div>
                <div>
                  <div className="insight-row-label">{r.label}</div>
                  <div className="insight-row-sub">{r.sub}</div>
                </div>
              </div>
              <div className="insight-row-value" style={{ color }}>{r.value}</div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.aside>
  );
}
