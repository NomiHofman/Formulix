import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

function FormulixLogo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M28 7 L12 7 L20 20 L12 33 L28 33"
        stroke="url(#sigmaGrad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="28" cy="7" r="2.5" fill="url(#nodeGrad1)" />
      <circle cx="20" cy="20" r="3" fill="url(#nodeGrad2)" />
      <circle cx="28" cy="33" r="2.5" fill="url(#nodeGrad3)" />
      <circle cx="12" cy="7" r="1.5" fill="#ff007a" opacity="0.7" />
      <circle cx="12" cy="33" r="1.5" fill="#00e5ff" opacity="0.7" />
      <defs>
        <linearGradient id="sigmaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff007a" />
          <stop offset="50%" stopColor="#8a2bff" />
          <stop offset="100%" stopColor="#00e5ff" />
        </linearGradient>
        <radialGradient id="nodeGrad1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#ff007a" />
        </radialGradient>
        <radialGradient id="nodeGrad2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#8a2bff" />
        </radialGradient>
        <radialGradient id="nodeGrad3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#00e5ff" />
        </radialGradient>
      </defs>
    </svg>
  );
}

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
