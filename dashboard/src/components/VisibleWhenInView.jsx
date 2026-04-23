import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Renders children only when the block nears the viewport.
 * Cuts first-paint & scroll work for huge sections; keeps all inner animations.
 * Adds a subtle fade-in + slide-up transition on reveal (Ofisense-style).
 */
export default function VisibleWhenInView({ children, minHeight = 280, rootMargin = '200px 0px', className = '' }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShow(true);
          obs.disconnect();
        }
      },
      { root: null, rootMargin, threshold: 0.01 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [show, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {show ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      ) : (
        <div
          className="deferred-section-placeholder"
          style={{ minHeight }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
