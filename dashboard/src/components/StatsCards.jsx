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

const COUNT_MS = 2800;

export default function StatsCards() {
  const data = useData();
  const stats = data?.topStats ?? [];

  return (
    <section className="stats-grid" aria-label="מדדי ביצועים">
      {stats.map((s) => {
        const Icon = ICONS[s.icon] ?? Activity;
        const tone = TONE_MAP[s.tone] ?? TONE_MAP.blue;
        const animNum = s.num ?? 0;
        const animSuffix = s.suffix ?? '';

        return (
          <motion.div
            key={s.id}
            className={`glass stat-card ${tone.glow}`}
            initial={false}
            whileHover={{
              y: -4,
              scale: 1.015,
              transition: { type: 'spring', stiffness: 400, damping: 30 },
            }}
          >
            <div className="stat-top">
              <span className="stat-label">{s.label}</span>
              <div className="stat-icon stat-icon--top-static" aria-hidden="true">
                <Icon size={20} strokeWidth={2.1} className={tone.icon} />
              </div>
            </div>
            <div>
              <div className="stat-value">
                {animNum > 0 ? (
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
