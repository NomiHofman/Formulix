import { motion, useReducedMotion } from 'framer-motion';
import { Database, Cpu, Activity, Timer } from 'lucide-react';
import { useData } from '../data/RunDataContext';
import AnimatedNumber from './AnimatedNumber';

const ICONS = { Database, Cpu, Activity, Timer };

const TONE_MAP = {
  pink:   { glow: 'glow-pink',   icon: 'icon-pink'   },
  blue:   { glow: 'glow-blue',   icon: 'icon-blue'   },
  violet: { glow: 'glow-violet', icon: 'icon-violet' },
  cyan:   { glow: 'glow-cyan',   icon: 'icon-cyan'   },
};

/** מחזורים שונים לכל כרטיס — לא “במקצב אחד” */
const STAT_ICON_DURATIONS = [1.22, 1.66, 1.35, 1.54, 1.41, 1.58];

const COUNT_MS = 2800;

export default function StatsCards() {
  const data = useData();
  const stats = data?.topStats ?? [];
  const reduce = useReducedMotion();

  return (
    <section className="stats-grid" aria-label="מדדי ביצועים">
      {stats.map((s, index) => {
        const Icon = ICONS[s.icon] ?? Activity;
        const tone = TONE_MAP[s.tone] ?? TONE_MAP.blue;
        const isRuntime = s.id === 'runtime';
        const animNum = s.num ?? 0;
        const animSuffix = s.suffix ?? '';

        const iconPlay = !reduce;
        const loopDur = STAT_ICON_DURATIONS[index % STAT_ICON_DURATIONS.length];
        const phaseDelay = index * 0.16 + (index % 3) * 0.09;

        return (
          <motion.div
            key={s.id}
            className={`glass stat-card ${tone.glow}`}
            initial={false}
            whileHover={{
              y: -6,
              scale: 1.02,
              transition: { type: 'spring', stiffness: 380, damping: 28 },
            }}
          >
            <div className="stat-top">
              <span className="stat-label">{s.label}</span>
              <motion.div
                className="stat-icon stat-icon--motion"
                aria-hidden="true"
                initial={false}
                animate={
                  iconPlay
                    ? {
                        /* קפיצה עדינה: מעלה → נחיתה קלה מעל המקור → עוד “באנץ” */
                        y: [0, -7, 1.4, -4, 0],
                        rotate: [0, 7, -5, 3, 0],
                        scale: [1, 1.1, 0.96, 1.04, 1],
                      }
                    : { y: 0, rotate: 0, scale: 1 }
                }
                transition={{
                  duration: loopDur,
                  repeat: Infinity,
                  ease: [0.4, 0, 0.2, 1],
                  times: [0, 0.2, 0.38, 0.6, 1],
                  delay: phaseDelay,
                }}
                whileHover={
                  reduce
                    ? {}
                    : { scale: 1.16, y: -2, transition: { type: 'spring', stiffness: 480, damping: 16 } }
                }
              >
                <motion.span
                  className="stat-icon__glyph"
                  aria-hidden
                  animate={
                    iconPlay
                      ? { opacity: [0.75, 1, 0.88, 1, 0.75] }
                      : { opacity: 1 }
                  }
                  transition={{
                    duration: loopDur * 0.92,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: phaseDelay + 0.08,
                  }}
                  style={{ display: 'grid', placeItems: 'center' }}
                >
                  <Icon size={20} strokeWidth={2.1} className={tone.icon} />
                </motion.span>
              </motion.div>
            </div>
            <div>
              <div className="stat-value">
                {isRuntime ? (
                  <span className="stat-figure stat-figure--text">{s.displayValue}</span>
                ) : animNum > 0 ? (
                  <AnimatedNumber
                    value={animNum}
                    duration={COUNT_MS}
                    decimals={animNum % 1 !== 0 ? 1 : 0}
                    suffix={animSuffix}
                    className="stat-figure"
                  />
                ) : (
                  <span className="stat-figure stat-figure--text">{s.displayValue}</span>
                )}
              </div>
              <div className="stat-delta">{s.delta}</div>
            </div>
          </motion.div>
        );
      })}
    </section>
  );
}
