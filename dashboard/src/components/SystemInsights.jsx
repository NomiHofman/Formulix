import { motion, useReducedMotion } from 'framer-motion';
import {
  BrainCircuit, Gauge, Zap, ShieldCheck, HardDrive, Trophy,
} from 'lucide-react';
import { useData } from '../data/RunDataContext';
import { scaleIn } from '../utils/scrollAnimations';

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

/** מחזורים שונים לשורות — לא מסנכרן לכרטיסי הסטט */
const ROW_ICON_DURATIONS = [1.18, 1.64, 1.32, 1.73, 1.4, 1.56, 1.5, 1.61];

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

const BRAIN_ICON_DURATION = 1.33;
const TROPHY_ICON_DURATION = 1.78;

function headerIconMotion(reduce) {
  if (reduce) return { y: 0, rotate: 0, scale: 1 };
  return { y: [0, -5, 1.1, -3, 0], rotate: [0, 9, -7, 4, 0], scale: [1, 1.1, 0.95, 1.04, 1] };
}

export default function SystemInsights() {
  const data = useData();
  const { bestMethod, rows } = data?.insights ?? { bestMethod: {}, rows: [] };
  const reduce = useReducedMotion();
  const play = !reduce;

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
            <motion.span
              className="insight-header-icon insight-header-icon--motion"
              initial={false}
              animate={headerIconMotion(reduce)}
              transition={{
                duration: BRAIN_ICON_DURATION,
                repeat: Infinity,
                ease: [0.4, 0, 0.2, 1],
                times: [0, 0.2, 0.4, 0.62, 1],
              }}
            >
              <motion.span
                style={{ display: 'inline-flex' }}
                animate={play ? { opacity: [0.7, 1, 0.85, 1] } : { opacity: 1 }}
                transition={{ duration: BRAIN_ICON_DURATION * 0.95, repeat: Infinity, ease: 'easeInOut', delay: 0.05 }}
              >
                <BrainCircuit size={18} className="icon-pink" />
              </motion.span>
            </motion.span>
            תובנות מערכת
          </div>
          <div className="panel-subtitle">סיכום אוטומטי של הבנצ׳מרק</div>
        </div>
        <motion.span
          className="insight-header-icon insight-header-icon--motion"
          initial={false}
          animate={
            play
              ? {
                  y: [0, -4, 0.8, -2.5, 0],
                  rotate: [0, -9, 6, -3, 0],
                  scale: [1, 1.1, 0.96, 1.03, 1],
                }
              : { rotate: 0, scale: 1, y: 0 }
          }
          transition={{
            duration: TROPHY_ICON_DURATION,
            repeat: Infinity,
            delay: 0.1,
            ease: [0.4, 0, 0.2, 1],
            times: [0, 0.2, 0.4, 0.65, 1],
          }}
        >
          <Trophy size={18} style={{ color: '#ffc94d' }} />
        </motion.span>
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
        {rows.map((r, i) => {
          const Icon = ICONS[r.icon] ?? Gauge;
          const color = TONE_COLOR[r.tone] ?? '#0084ff';
          const rowDur = ROW_ICON_DURATIONS[i % ROW_ICON_DURATIONS.length];
          const rowPhase = i * 0.14 + (i % 4) * 0.11;
          return (
            <motion.div
              key={r.id}
              className="insight-row"
              variants={rowAnim}
              whileHover={reduce ? undefined : rowHoverSpring}
            >
              <div className="insight-row-left">
                <motion.div
                  className="insight-row-icon insight-row-icon--motion"
                  style={{ color, boxShadow: `inset 0 0 18px ${color}22` }}
                  initial={false}
                  animate={
                    play
                      ? {
                          y: [0, -5, 1.1, -3.2, 0],
                          rotate: [0, 6, -5, 2.5, 0],
                          scale: [1, 1.08, 0.95, 1.02, 1],
                        }
                      : { y: 0, rotate: 0, scale: 1 }
                  }
                  transition={{
                    duration: rowDur,
                    repeat: Infinity,
                    ease: [0.4, 0, 0.2, 1],
                    times: [0, 0.2, 0.4, 0.6, 1],
                    delay: rowPhase,
                  }}
                  whileHover={
                    reduce
                      ? {}
                      : { scale: 1.15, y: -1, transition: { type: 'spring', stiffness: 440, damping: 20 } }
                  }
                >
                  <motion.span
                    style={{ display: 'grid', placeItems: 'center' }}
                    animate={play ? { opacity: [0.75, 1, 0.9, 1] } : { opacity: 1 }}
                    transition={{
                      duration: rowDur * 0.9,
                      repeat: Infinity,
                      delay: rowPhase + 0.07,
                      ease: 'easeInOut',
                    }}
                  >
                    <Icon size={16} strokeWidth={2.1} />
                  </motion.span>
                </motion.div>
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
