import { motion } from 'framer-motion';
import {
  BrainCircuit, Gauge, Zap, ShieldCheck, HardDrive, Trophy,
} from 'lucide-react';
import { useData } from '../data/RunDataContext';
import { scaleIn, SCROLL_VIEWPORT } from '../utils/scrollAnimations';

/* =========================================================
   SystemInsights (Hebrew RTL)
   Panel summarizing the best-performing method and KPIs.
   Icon on right, label in middle, value on left.
   ========================================================= */

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

export default function SystemInsights() {
  const data = useData();
  const { bestMethod, rows } = data?.insights ?? { bestMethod: {}, rows: [] };

  return (
    <motion.aside
      className="glass panel"
      variants={scaleIn}
      initial="hidden"
      whileInView="show"
      viewport={SCROLL_VIEWPORT}
    >
      <div className="panel-header">
        <div>
          <div className="panel-title">
            <BrainCircuit size={18} className="icon-pink" />
            תובנות מערכת
          </div>
          <div className="panel-subtitle">סיכום אוטומטי של הבנצ׳מרק</div>
        </div>
        <Trophy size={18} style={{ color: '#ffc94d' }} />
      </div>

      {/* Hero – winning method */}
      <div className="insight-hero">
        <div className="insight-hero-label">השיטה הטובה ביותר</div>
        <div className="insight-hero-value">{bestMethod.name ?? '—'}</div>
        <div className="insight-hero-desc">{bestMethod.summary ?? ''}</div>
      </div>

      {/* KPI rows - icon on right, text in middle, value on left */}
      <motion.div
        className="insight-list"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {rows.map((r) => {
          const Icon = ICONS[r.icon] ?? Gauge;
          const color = TONE_COLOR[r.tone] ?? '#0084ff';
          return (
            <motion.div key={r.id} className="insight-row" variants={rowAnim}>
              <div className="insight-row-left">
                <div
                  className="insight-row-icon"
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
