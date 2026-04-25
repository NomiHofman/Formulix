import { motion, useReducedMotion } from 'framer-motion';
import FormulixLogo from './FormulixLogo';
import ConnectionStatusPill from './ConnectionStatusPill';

export default function Header({ source, lastRefresh, exportedAt, refresh, isLocalHost }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.header
      className="header"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="brand">
        <motion.div
          className="brand-badge"
          whileHover={{ scale: 1.06 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        >
          <motion.div
            animate={reduceMotion ? {} : { y: [0, -4, 0] }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            <FormulixLogo size={32} />
          </motion.div>
        </motion.div>
        <div className="brand-text">
          <h1 className="brand-title">FORMULIX</h1>
          <p className="brand-tagline">
            השוואת ביצועים · <span className="accent-pink">מנועי חישוב</span> דינמיים
          </p>
        </div>
      </div>

      <ConnectionStatusPill
        source={source}
        lastRefresh={lastRefresh}
        exportedAt={exportedAt}
        refresh={refresh}
        isLocalHost={isLocalHost}
      />
    </motion.header>
  );
}
