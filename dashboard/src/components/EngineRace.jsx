import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Trophy, Zap } from 'lucide-react';
import { useData } from '../data/RunDataContext';
import { friendlyName } from '../data/methodNames';
import { fadeUp, SCROLL_VIEWPORT } from '../utils/scrollAnimations';

const DEFAULT_COLORS = {
  SQLDynamic: '#0084ff',
  Roslyn: '#8a2bff',
  PythonSymPy: '#ff007a',
  AITranslated: '#00e5ff',
};

export default function EngineRace() {
  const data = useData();
  const summary = data?.summary ?? {};
  const colors = data?.engineColors ?? DEFAULT_COLORS;

  const engines = Object.entries(summary).map(([name, s]) => ({
    name,
    avg: s.avg,
    color: colors[name] || '#888',
  })).sort((a, b) => a.avg - b.avg);

  const maxTime = engines.length ? Math.max(...engines.map(e => e.avg)) : 1;

  const [racing, setRacing] = useState(false);
  const [finished, setFinished] = useState(false);
  const [progress, setProgress] = useState({});
  const rafRef = useRef(null);
  const startRef = useRef(0);

  const RACE_DURATION = 4000;

  const resetRace = useCallback(() => {
    setRacing(false);
    setFinished(false);
    setProgress({});
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const startRace = useCallback(() => {
    resetRace();
    setRacing(true);
    setFinished(false);
    startRef.current = performance.now();

    function tick(now) {
      const elapsed = now - startRef.current;
      const t = Math.min(elapsed / RACE_DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3);

      const newProgress = {};
      engines.forEach(eng => {
        const speed = maxTime / eng.avg;
        const raw = eased * speed;
        newProgress[eng.name] = Math.min(raw, 1);
      });

      setProgress(newProgress);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setFinished(true);
        setRacing(false);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [engines, maxTime, resetRace]);

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  if (engines.length === 0) return null;

  const winner = engines[0];

  return (
    <motion.section
      className="glass engine-race"
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={SCROLL_VIEWPORT}
    >
      <div className="panel-header">
        <div>
          <div className="panel-title">
            <Zap size={18} className="icon-pink" />
            מרוץ מנועי חישוב
          </div>
          <div className="panel-subtitle">
            צפה במנועים מתחרים בזמן אמת — מי יסיים ראשון?
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button
            className="race-btn start"
            onClick={startRace}
            disabled={racing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play size={14} />
            {finished ? 'שוב!' : 'התחל מרוץ'}
          </motion.button>
          {(finished || racing) && (
            <button className="race-btn reset" onClick={resetRace}>
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="race-track-container">
        {engines.map((eng, i) => {
          const pct = (progress[eng.name] ?? 0) * 100;
          const isWinner = finished && eng.name === winner.name;

          return (
            <div key={eng.name} className="race-lane">
              <div className="race-label">
                <span className="race-label-name" style={{ color: eng.color }}>
                  {friendlyName(eng.name)}
                </span>
                <span className="race-label-time">{eng.avg.toFixed(1)}s</span>
              </div>
              <div className="race-track">
                <motion.div
                  className="race-bar"
                  style={{ background: eng.color, width: `${pct}%` }}
                  layout
                />
                <AnimatePresence>
                  {isWinner && (
                    <motion.div
                      className="race-winner-flag"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >
                      <Trophy size={16} />
                    </motion.div>
                  )}
                </AnimatePresence>
                {pct > 0 && (
                  <span className="race-pct" style={{ left: `calc(${Math.min(pct, 92)}% + 8px)` }}>
                    {Math.round(pct)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {finished && (
          <motion.div
            className="race-result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ borderColor: winner.color }}
          >
            <Trophy size={20} style={{ color: '#ffc94d' }} />
            <span>
              <strong style={{ color: winner.color }}>{friendlyName(winner.name)}</strong>
              {' '}מנצח עם זמן ממוצע של {winner.avg.toFixed(2)} שניות!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
