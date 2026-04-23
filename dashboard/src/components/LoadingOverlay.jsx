import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

/* =========================================================
   LoadingOverlay
   
   Floating blurred overlay shown above the dashboard
   while data is being fetched from the API.
   Features:
   - Spinning neon ring with gradient
   - Pulsing logo icon in center
   - Progress-style animated bar
   - Semi-transparent backdrop with blur
   ========================================================= */
export default function LoadingOverlay() {
  return (
    <motion.div
      className="loading-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="loading-content">
        {/* Spinning ring */}
        <div className="loading-ring-wrap">
          <div className="loading-ring" />
          <div className="loading-ring-glow" />
          <motion.div
            className="loading-icon"
            animate={{
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Sparkles size={32} strokeWidth={2.2} />
          </motion.div>
        </div>

        {/* Title */}
        <motion.div
          className="loading-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          FORMULIX
        </motion.div>

        {/* Subtitle */}
        <motion.div
          className="loading-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          טוען נתוני ביצועים מהמסד…
        </motion.div>

        {/* Progress bar */}
        <div className="loading-progress">
          <motion.div
            className="loading-progress-bar"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
