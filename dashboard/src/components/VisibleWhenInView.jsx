import { useState, useEffect, useRef } from 'react';

/**
 * Lazy-reveal wrapper: renders children only once they come close to the viewport.
 * Keeps initial paint light for huge sections (charts, tables). The children
 * themselves drive any whileInView animations.
 */
export default function VisibleWhenInView({ children, minHeight = 280, rootMargin = '260px 0px', className = '' }) {
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
      { root: null, rootMargin, threshold: 0.01 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [show, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {show ? (
        children
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
