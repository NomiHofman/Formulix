import { motion } from 'framer-motion';
import FormulixLogo from './FormulixLogo';

/* Minimal loader — no top-style progress bar (avoids “stuck” cyan line artifacts). */
export default function LoadingOverlay() {
  return (
    <motion.div
      className="loading-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="loading-content">
        <div className="loading-ring-wrap">
          <div className="loading-ring" />
          <div className="loading-ring-glow" />
          <motion.div
            className="loading-icon"
            animate={{
              scale: [1, 1.08, 1],
              rotate: [0, 6, -6, 0],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <FormulixLogo size={42} idSuffix="-loader" />
          </motion.div>
        </div>

        <motion.div
          className="loading-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          FORMULIX
        </motion.div>

        <motion.div
          className="loading-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          טוען נתוני ביצועים…
        </motion.div>
      </div>
    </motion.div>
  );
}
