import {
  Zap,
  Cpu,
  Database,
  Braces,
  Binary,
  Workflow,
  Sparkles,
  Layers,
  Code2,
  Sigma,
  Activity,
} from 'lucide-react';
import BouncyIconWrap from './BouncyIconWrap';

/**
 * רקע: שכבה שקטה + רשת עדינה + אייקונים “מעופפים” + שדה נקודות.
 * ללא aurora/blur כבד (מניעת jank). אנימציות ב-transform בלבד.
 */
const ICON_CONFIG = [
  { Icon: Zap, left: 8, drift: 28, dur: 18, delay: 0, color: 'var(--neon-cyan)' },
  { Icon: Cpu, left: 18, drift: -35, dur: 22, delay: -2, color: 'var(--neon-blue)' },
  { Icon: Database, left: 28, drift: 22, dur: 20, delay: -5, color: 'var(--neon-pink)' },
  { Icon: Braces, left: 42, drift: -18, dur: 16, delay: -1, color: 'var(--neon-violet)' },
  { Icon: Binary, left: 55, drift: 40, dur: 19, delay: -7, color: 'var(--neon-cyan)' },
  { Icon: Workflow, left: 65, drift: -25, dur: 21, delay: -3, color: 'var(--neon-blue)' },
  { Icon: Sparkles, left: 78, drift: 15, dur: 17, delay: -9, color: 'var(--neon-lime)' },
  { Icon: Layers, left: 88, drift: -32, dur: 23, delay: -4, color: 'var(--neon-violet)' },
  { Icon: Code2, left: 12, drift: 20, dur: 24, delay: -11, color: 'var(--neon-pink)' },
  { Icon: Sigma, left: 72, drift: -20, dur: 20, delay: -6, color: 'var(--neon-cyan)' },
  { Icon: Activity, left: 48, drift: 30, dur: 15, delay: -8, color: 'var(--neon-blue)' },
];

const DOTS = [
  { t: '12%', l: '22%', d: 4.2, del: 0 },
  { t: '28%', l: '78%', d: 5.1, del: -1.2 },
  { t: '55%', l: '12%', d: 3.8, del: -2.1 },
  { t: '72%', l: '88%', d: 4.5, del: -0.7 },
  { t: '38%', l: '48%', d: 5.5, del: -3 },
  { t: '18%', l: '62%', d: 3.2, del: -1.5 },
  { t: '82%', l: '35%', d: 4.8, del: -2.8 },
  { t: '62%', l: '92%', d: 3.5, del: -0.3 },
];

export default function BackgroundFX() {
  return (
    <>
      <div className="bg-layer bg-layer--static" aria-hidden="true" />

      <div className="bg-layer bg-layer--ambient" aria-hidden="true">
        <div className="cyber-grid cyber-grid--ambient" />

        <div className="floating-icons">
          {ICON_CONFIG.map((row, i) => (
            <div
              key={i}
              className="floating-icon-wrap"
              style={{
                left: `${row.left}%`,
                animationDuration: `${row.dur}s`,
                animationDelay: `${row.delay}s`,
                ['--drift']: `${row.drift}px`,
                color: row.color,
              }}
            >
              <BouncyIconWrap name={`bg-float-${i}`} className="floating-icon-bouncy">
                <row.Icon
                  className="floating-icon-svg"
                  size={24}
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </BouncyIconWrap>
            </div>
          ))}
        </div>

        <div className="dot-field dot-field--lite">
          {DOTS.map((d, i) => (
            <span
              key={i}
              className="bg-dot bg-dot--lite"
              style={{
                top: d.t,
                left: d.l,
                animationDuration: `${d.d}s`,
                animationDelay: `${d.del}s`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
