import { useEffect, useState, useRef } from 'react';

/* AnimatedNumber — ספירה חלקה; בלי motion נוסף על הטקסט (לא מסתיר את הספירה). */

export default function AnimatedNumber({
  value,
  duration = 2000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValue = useRef(0);
  const animationRef = useRef(null);

  useEffect(() => {
    const startValue = prevValue.current;
    const endValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        prevValue.current = endValue;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  const formattedValue = displayValue.toLocaleString('he-IL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={className}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}

export function AnimatedPercentageBar({
  percentage,
  color = '#00e5ff',
  height = 6,
  showLabel = true,
}) {
  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '6px',
            fontSize: '12px',
            color: 'var(--text-mute)',
          }}
        >
          <span>התקדמות</span>
          <AnimatedNumber value={percentage} suffix="%" decimals={1} className="stat-figure" />
        </div>
      )}
      <div
        style={{
          width: '100%',
          height,
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: height / 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
            borderRadius: height / 2,
            boxShadow: `0 0 10px ${color}66`,
            transition: 'width 1.5s ease-out',
          }}
        />
      </div>
    </div>
  );
}

export function PulsingDot({ color = '#22ff88', size = 8 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 ${size * 1.5}px ${color}`,
        animation: 'pulseDot 2s ease-in-out infinite',
      }}
    />
  );
}
