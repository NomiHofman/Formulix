import { motion } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { LineChart } from 'lucide-react';
import { useData } from '../data/RunDataContext';
import { friendlyName } from '../data/methodNames';

/* =========================================================
   RuntimeChart (Hebrew RTL)
   Animated Recharts AreaChart comparing engine runtimes.
   ========================================================= */

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rc-tooltip">
      <div className="rc-tooltip-label">גודל אצווה · {label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="rc-tooltip-row">
          <span>
            <span
              className="rc-tooltip-dot"
              style={{ background: p.color, color: p.color }}
            />
            {friendlyName(p.dataKey)}
          </span>
          <span>{p.value.toFixed(2)}s</span>
        </div>
      ))}
    </div>
  );
}

export default function RuntimeChart() {
  const data = useData();
  const series = data?.runtimeSeries ?? [];
  const colors = data?.engineColors ?? {};

  const engines = series.length > 0
    ? Object.keys(series[0]).filter((k) => k !== 'batch')
    : [];

  return (
    <motion.div
      className="glass panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
    >
      <div className="panel-header">
        <div>
          <div className="panel-title">
            <LineChart size={18} className="icon-blue" />
            השוואת זמני ריצה
          </div>
          <div className="panel-subtitle">
            שניות להשלמת חישוב לפי גודל אצווה · נמוך יותר = טוב יותר
          </div>
        </div>
        <div className="legend">
          {engines.map((e) => (
            <div key={e} className="legend-item">
              <span
                className="legend-dot"
                style={{ background: colors[e], color: colors[e] }}
              />
              {friendlyName(e)}
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', height: 340, direction: 'ltr' }}>
        <ResponsiveContainer>
          <AreaChart
            data={series}
            margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
          >
            <defs>
              {engines.map((e) => (
                <linearGradient
                  key={e}
                  id={`grad-${e.replace(/\s/g, '')}`}
                  x1="0" y1="0" x2="0" y2="1"
                >
                  <stop offset="0%"   stopColor={colors[e]} stopOpacity={0.55} />
                  <stop offset="100%" stopColor={colors[e]} stopOpacity={0}    />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="batch" tickLine={false} axisLine={false} dy={8} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}s`}
              width={50}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1 }}
            />

            {engines.map((e, i) => (
              <Area
                key={e}
                type="monotone"
                dataKey={e}
                stroke={colors[e]}
                strokeWidth={2.2}
                fill={`url(#grad-${e.replace(/\s/g, '')})`}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
                isAnimationActive
                animationBegin={i * 180}
                animationDuration={1100}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
