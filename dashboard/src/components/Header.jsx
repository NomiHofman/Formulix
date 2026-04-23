import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import FormulixLogo from './FormulixLogo';

export default function Header() {
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
          whileHover={{ scale: 1.04 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        >
          <FormulixLogo size={32} />
        </motion.div>
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
