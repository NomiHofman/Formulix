import { motion } from 'framer-motion';
import { Sparkles, Activity } from 'lucide-react';

/* =========================================================
   Header (Hebrew RTL)
   Logo and tagline stay in English (exam requirement).
   Icon on far right, then brand name.
   ========================================================= */
export default function Header() {
  return (
    <motion.header
      className="header"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="brand">
        <div className="brand-badge">
          <Sparkles size={28} strokeWidth={2} />
        </div>
        <div className="brand-text">
          <h1 className="brand-title">FORMULIX</h1>
          <p className="brand-tagline">
            השוואת ביצועים · <span className="accent-pink">מנועי חישוב</span> דינמיים
          </p>
        </div>
      </div>

      <div className="header-meta">
        <span className="pulse-dot" />
        <Activity size={13} strokeWidth={2.2} />
        <span>פעיל&nbsp;·&nbsp;מנועי החישוב מסונכרנים</span>
      </div>
    </motion.header>
  );
}
