import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Database, Clock, Server } from 'lucide-react';

export default function ConnectionStatusPill({
  source,
  lastRefresh,
  exportedAt,
  refresh,
  isLocalHost,
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const meta = (() => {
    switch (source) {
      case 'live-db':
        return {
          dot: '#00ff9d',
          label: 'DB חי',
          title: 'מחובר ישירות לבסיס הנתונים',
          subtitle: 'שאילתות לייב מ-Azure SQL · רענון אוטומטי כל 30ש',
          icon: Database,
        };
      case 'json':
        return {
          dot: '#6e9fff',
          label: 'Snapshot',
          title: 'נתונים מ-snapshot (run-log.json)',
          subtitle: isLocalHost
            ? 'ה-API לא רץ — מוצג snapshot מקומי'
            : 'הרץ את המנועים ועדכן snapshot לנתונים אמיתיים',
          icon: Server,
        };
      case 'mock':
        return {
          dot: '#ff5d6c',
          label: 'הדגמה',
          title: 'נתוני הדגמה',
          subtitle: 'אין חיבור ל-DB ואין snapshot זמין',
          icon: Server,
        };
      default:
        return {
          dot: '#888',
          label: 'טוען…',
          title: 'מתחבר',
          subtitle: '',
          icon: Server,
        };
    }
  })();

  const Icon = meta.icon;

  const handleRefresh = async (e) => {
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      await Promise.resolve(refresh?.());
    } finally {
      setTimeout(() => setBusy(false), 600);
    }
  };

  return (
    <div className="status-pill-wrap" ref={wrapRef}>
      <motion.button
        type="button"
        className="status-pill"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.97 }}
        aria-expanded={open}
        aria-label={meta.title}
      >
        <span
          className="status-pill__dot"
          style={{
            background: meta.dot,
            boxShadow: `0 0 10px ${meta.dot}, 0 0 22px ${meta.dot}55`,
          }}
        />
        <span className="status-pill__label">{meta.label}</span>
        {lastRefresh && (
          <span className="status-pill__time">
            {lastRefresh.toLocaleTimeString('he-IL', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="status-pop"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
          >
            <div className="status-pop__head">
              <span
                className="status-pop__icon"
                style={{ color: meta.dot, borderColor: `${meta.dot}55` }}
              >
                <Icon size={16} strokeWidth={2.1} />
              </span>
              <div>
                <div className="status-pop__title">{meta.title}</div>
                {meta.subtitle && (
                  <div className="status-pop__sub">{meta.subtitle}</div>
                )}
              </div>
            </div>

            <div className="status-pop__rows">
              {exportedAt && source === 'json' && (
                <div className="status-pop__row">
                  <Clock size={13} strokeWidth={2.1} />
                  <span className="status-pop__row-label">Snapshot:</span>
                  <span className="status-pop__row-val">
                    {new Date(exportedAt).toLocaleString('he-IL')}
                  </span>
                </div>
              )}
              {lastRefresh && (
                <div className="status-pop__row">
                  <Clock size={13} strokeWidth={2.1} />
                  <span className="status-pop__row-label">עדכון אחרון:</span>
                  <span className="status-pop__row-val">
                    {lastRefresh.toLocaleString('he-IL')}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              className="status-pop__refresh"
              onClick={handleRefresh}
              disabled={busy}
            >
              {busy ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  style={{ display: 'inline-flex' }}
                >
                  <RefreshCw size={13} strokeWidth={2.2} />
                </motion.span>
              ) : (
                <RefreshCw size={13} strokeWidth={2.2} />
              )}
              {busy ? 'מרענן…' : 'רענן נתונים'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
