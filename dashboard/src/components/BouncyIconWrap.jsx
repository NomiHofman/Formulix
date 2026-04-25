import { motion, useReducedMotion } from 'framer-motion';

/**
 * 8 different motion "personalities" so icons on the same screen never share the same pattern.
 * Each profile varies keyframes, timing distribution, and loop length.
 */
const PROFILES = [
  {
    y: [0, -5.5, 1.1, -3.2, 0],
    rotate: [0, 5.5, -4, 2.2, 0],
    scale: [1, 1.08, 0.96, 1.03, 1],
    opacity: [0.86, 1, 0.91, 1, 0.86],
    times: [0, 0.2, 0.38, 0.6, 1],
    baseDur: 1.22,
  },
  {
    y: [0, -7.2, 1.6, -1.2, 0],
    rotate: [0, 1.2, -1.0, 0.6, 0],
    scale: [1, 1.04, 0.99, 1.01, 1],
    opacity: [0.88, 0.98, 0.94, 1, 0.88],
    times: [0, 0.15, 0.36, 0.58, 1],
    baseDur: 1.5,
  },
  {
    y: [0, -2.6, 0.6, -1.1, 0],
    rotate: [0, 8.2, -6.5, 3.2, 0],
    scale: [1, 1.1, 0.94, 1.04, 1],
    opacity: [0.9, 1, 0.88, 0.95, 0.9],
    times: [0, 0.22, 0.4, 0.62, 1],
    baseDur: 1.1,
  },
  {
    y: [0, -1.0, 0.3, -0.5, 0],
    rotate: [0, 0, 0, 0, 0],
    scale: [1, 1.1, 0.92, 1.11, 1],
    opacity: [0.8, 1, 0.85, 0.95, 0.8],
    times: [0, 0.18, 0.4, 0.65, 1],
    baseDur: 1.4,
  },
  {
    y: [0, -4, 0.8, -2.1, 0],
    rotate: [0, -4.2, 3.0, -2.0, 0],
    scale: [1, 1.02, 0.98, 1.0, 1],
    opacity: [0.87, 0.96, 0.9, 1, 0.87],
    times: [0, 0.12, 0.28, 0.5, 1],
    baseDur: 0.95,
  },
  {
    y: [0, -3.0, 1.2, -4.0, 0],
    rotate: [0, 3.0, -2.5, 1.0, 0],
    scale: [1, 1.12, 0.98, 1.06, 1],
    opacity: [0.85, 0.99, 0.92, 0.98, 0.85],
    times: [0, 0.25, 0.45, 0.7, 1],
    baseDur: 1.64,
  },
  {
    y: [0, -6.0, 2.0, -2.0, 0],
    rotate: [0, 6, -3, 0, 0],
    scale: [1, 0.99, 1.05, 0.98, 1],
    opacity: [0.9, 1, 0.86, 0.94, 0.9],
    times: [0, 0.17, 0.33, 0.55, 1],
    baseDur: 1.32,
  },
  {
    y: [0, 1.0, -5.0, 0.6, 0],
    rotate: [0, -2.0, 4.0, -3.0, 0],
    scale: [1, 1.0, 1.1, 0.97, 1],
    opacity: [0.88, 0.95, 1, 0.9, 0.88],
    times: [0, 0.2, 0.42, 0.64, 1],
    baseDur: 1.18,
  },
];

function pickProfileId(name) {
  let h = 5381;
  const s = name || 'default';
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  return ((h >>> 0) + s.length) % PROFILES.length;
}

function phaseDelayFor(name) {
  let h = 0;
  const s = name || 'x';
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) % 1000;
  }
  return (h % 60) * 0.01;
}

/**
 * @param {string} name - Stable id per icon; picks one of 8 motion profiles and a unique time offset.
 * @param {number} [index=0] - Optional extra nudge to desync (e.g. when `name` is not unique in a list).
 */
export default function BouncyIconWrap({ children, name = 'bouncy', index = 0, className = '' }) {
  const reduce = useReducedMotion();
  const play = !reduce;
  const pid = (pickProfileId(name) + index) % PROFILES.length;
  const p = PROFILES[pid];
  const loopDur = p.baseDur * (1 + (name.length * 0.006) * 0.3) + ((index * 0.04) % 0.2);
  const delay = (phaseDelayFor(name) + index * 0.07) % 0.45;

  return (
    <motion.span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      initial={false}
      animate={
        play
          ? {
              y: p.y,
              rotate: p.rotate,
              scale: p.scale,
              opacity: p.opacity,
            }
          : { y: 0, rotate: 0, scale: 1, opacity: 1 }
      }
      transition={{
        duration: loopDur,
        repeat: Infinity,
        ease: [0.4, 0, 0.2, 1],
        times: p.times,
        delay,
      }}
    >
      {children}
    </motion.span>
  );
}
