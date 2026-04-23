import { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

/* =========================================================
   AnimatedNumber
   
   Smooth counting animation for numbers - makes stats
   feel alive and engaging when data loads/updates!
   ========================================================= */

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
      
      // Easing function (ease-out cubic)
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
    <motion.span 
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}{formattedValue}{suffix}
    </motion.span>
  );
}

/* =========================================================
   AnimatedPercentageBar
   
   Animated progress bar that fills smoothly
   ========================================================= */
export function AnimatedPercentageBar({ 
  percentage, 
  color = '#00e5ff',
  height = 6,
  showLabel = true,
}) {
  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '6px',
          fontSize: '12px',
          color: 'var(--text-mute)',
        }}>
          <span>התקדמות</span>
          <AnimatedNumber value={percentage} suffix="%" decimals={1} />
        </div>
      )}
      <div style={{
        width: '100%',
        height,
        background: 'rgba(255, 255, 255, 0.06)',
        borderRadius: height / 2,
        overflow: 'hidden',
      }}>
        <motion.div
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
            borderRadius: height / 2,
            boxShadow: `0 0 10px ${color}66`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   PulsingDot
   
   Animated status indicator dot
   ========================================================= */
export function PulsingDot({ color = '#22ff88', size = 8 }) {
  return (
    <motion.div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 ${size * 1.5}px ${color}`,
      }}
      animate={{
        scale: [1, 1.3, 1],
        opacity: [1, 0.6, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}
