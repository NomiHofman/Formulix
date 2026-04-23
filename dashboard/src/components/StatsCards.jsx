import { motion } from 'framer-motion';
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

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function StatsCards() {
  const data = useData();
  const stats = data?.topStats ?? [];

  return (
    <motion.section
      className="stats-grid"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {stats.map((s) => {
        const Icon = ICONS[s.icon] ?? Activity;
        const tone = TONE_MAP[s.tone] ?? TONE_MAP.blue;

        const numericValue = typeof s.value === 'number' ? s.value :
          parseFloat(String(s.displayValue).replace(/[^0-9.]/g, '')) || 0;
        const isTimeValue = s.id === 'bestTime' || s.displayValue?.includes('שניות');

        return (
          <motion.div
            key={s.id}
            className={`glass stat-card ${tone.glow}`}
            variants={item}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
          >
            <div className="stat-top">
              <span className="stat-label">{s.label}</span>
              <div className="stat-icon">
                <Icon size={20} strokeWidth={2} className={tone.icon} />
              </div>
            </div>
            <div>
              <div className="stat-value">
                {numericValue > 0 ? (
                  <AnimatedNumber
                    value={numericValue}
                    duration={1200}
                    decimals={isTimeValue ? 2 : 0}
                    suffix={isTimeValue ? ' שניות' : s.id === 'methods' ? '' : ''}
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
