import { motion } from 'framer-motion';
import { Database, Cpu, Activity, Timer } from 'lucide-react';
import { useData } from '../data/RunDataContext';
import AnimatedNumber from './AnimatedNumber';
import { revealStaggerStrong, staggerChildBig, SCROLL_VIEWPORT } from '../utils/scrollAnimations';

const ICONS = { Database, Cpu, Activity, Timer };

const TONE_MAP = {
  pink:   { glow: 'glow-pink',   icon: 'icon-pink'   },
  blue:   { glow: 'glow-blue',   icon: 'icon-blue'   },
  violet: { glow: 'glow-violet', icon: 'icon-violet' },
  cyan:   { glow: 'glow-cyan',   icon: 'icon-cyan'   },
};

export default function StatsCards() {
  const data = useData();
  const stats = data?.topStats ?? [];

  return (
    <motion.section
      key={data ? 'stats-ready' : 'stats-wait'}
      className="stats-grid"
      variants={revealStaggerStrong}
      initial="hidden"
      whileInView="show"
      viewport={SCROLL_VIEWPORT}
    >
      {stats.map((s) => {
        const Icon = ICONS[s.icon] ?? Activity;
        const tone = TONE_MAP[s.tone] ?? TONE_MAP.blue;

        const numericValue = typeof s.value === 'number' ? s.value :
          parseFloat(String(s.displayValue).replace(/[^0-9.]/g, '')) || 0;
        const isRuntime = s.id === 'runtime';
        const isTimeValue = !isRuntime && s.id === 'bestTime';

        return (
          <motion.div
            key={s.id}
            className={`glass stat-card ${tone.glow}`}
            variants={staggerChildBig}
            whileHover={{
              y: -8,
              scale: 1.025,
              transition: { type: 'spring', stiffness: 320, damping: 20 },
            }}
          >
            <div className="stat-top">
              <span className="stat-label">{s.label}</span>
              <div className="stat-icon">
                <Icon size={20} strokeWidth={2} className={tone.icon} />
              </div>
            </div>
            <div>
              <div className="stat-value">
                {isRuntime ? (
                  s.displayValue
                ) : numericValue > 0 ? (
                  <AnimatedNumber
                    value={numericValue}
                    duration={1200}
                    decimals={isTimeValue ? 2 : 0}
                    suffix={isTimeValue ? 's' : ''}
                  />
                ) : (
                  s.displayValue
                )}
              </div>
              <div className="stat-delta">{s.delta}</div>
            </div>
          </motion.div>
        );
      })}
    </motion.section>
  );
}
