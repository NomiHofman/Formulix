import { useMemo } from 'react';

const SHAPES = ['✦', '◆', '●', '○', '△', '◇', '⬡', '✧', '+', '×'];

/* Canvas particle mesh removed: O(n²) per frame + full-screen blur = scroll jank. */
function FloatingShapes() {
  const items = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const colors = ['#ff007a', '#0084ff', '#8a2bff', '#00e5ff', '#ffffff'];
        return {
          id: i,
          shape: SHAPES[i % SHAPES.length],
          left: `${Math.random() * 95}%`,
          size: 8 + Math.random() * 16,
          duration: 24 + Math.random() * 28,
          delay: Math.random() * -35,
          drift: (Math.random() - 0.5) * 60,
          opacity: 0.035 + Math.random() * 0.08,
          color: colors[i % colors.length],
        };
      }),
    []
  );

  return (
    <div className="floating-icons">
      {items.map((it) => (
        <span
          key={it.id}
          className="floating-icon"
          style={{
            left: it.left,
            fontSize: it.size,
            opacity: it.opacity,
            color: it.color,
            animationDuration: `${it.duration}s`,
            animationDelay: `${it.delay}s`,
            '--drift': `${it.drift}px`,
          }}
        >
          {it.shape}
        </span>
      ))}
    </div>
  );
}

function DotField() {
  const items = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 2 + Math.random() * 2.5,
        color: ['#ff007a', '#0084ff', '#8a2bff', '#00e5ff'][i % 4],
        duration: 3.5 + Math.random() * 4,
        delay: Math.random() * -5,
      })),
    []
  );

  return (
    <div className="dot-field">
      {items.map((d) => (
        <span
          key={d.id}
          className="bg-dot"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            backgroundColor: d.color,
            boxShadow: `0 0 ${d.size * 3}px ${d.color}`,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function BackgroundFX() {
  return (
    <div className="bg-layer" aria-hidden="true">
      <div className="bg-aurora" />
      <div className="bg-aurora-2" />
      <DotField />
      <FloatingShapes />
      <div className="cyber-grid" />
      <div className="orb pink" />
      <div className="orb blue" />
      <div className="orb violet" />
    </div>
  );
}
