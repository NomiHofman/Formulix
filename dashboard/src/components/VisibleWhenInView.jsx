import { useState, useEffect, useRef } from 'react';

/**
 * Renders children only when the block nears the viewport.
 * Cuts first-paint & scroll work for huge sections; keeps all inner animations.
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
