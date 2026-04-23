import { motion } from 'framer-motion';
import { X, Clock, Zap, Code2, Trophy } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';
import { friendlyName } from '../data/methodNames';

const DEFAULT_COLORS = {
  SQLDynamic: '#0084ff',
  Roslyn: '#8a2bff',
  PythonSymPy: '#ff007a',
  AITranslated: '#00e5ff',
};

function ModalTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rc-tooltip" style={{ minWidth: 140 }}>
      <div className="rc-tooltip-row">
        <span style={{ color: payload[0].payload.color }}>{payload[0].payload.label}</span>
        <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: '#fff' }}>
          {payload[0].value.toFixed(2)}s
        </span>
      </div>
    </div>
  );
}

export default function FormulaModal({ row, methods, colors, onClose }) {
  if (!row) return null;

  const engineColors = { ...DEFAULT_COLORS, ...colors };

  const chartData = methods
    .filter(m => row[m] != null)
    .map(m => ({
      method: m,
      label: friendlyName(m),
      time: row[m],
      color: engineColors[m] || '#888',
    }))
    .sort((a, b) => a.time - b.time);

  const fastest = chartData[0];
  const slowest = chartData[chartData.length - 1];
  const speedup = slowest && fastest ? (slowest.time / fastest.time).toFixed(1) : null;

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="glass modal-content"
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 30 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        onClick={e => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="modal-header">
          <div className="modal-formula-id">{row.targetId}</div>
          <div className="modal-formula-badge">
            <span className={`badge ${row.category === 'פשוטה' ? 'residential' : row.category === 'מורכבת' ? 'commercial' : 'industrial'}`}>
              {row.category}
            </span>
          </div>
        </div>

        <div className="modal-formula-display">
          <Code2 size={16} style={{ color: 'var(--neon-cyan)', flexShrink: 0 }} />
          <code>{row.formula}</code>
        </div>

        {/* Mini bar chart */}
        <div className="modal-chart-section">
          <h4><Clock size={14} /> זמני ריצה לפי מנוע</h4>
          <div style={{ width: '100%', height: 200, direction: 'ltr' }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }} layout="vertical">
                <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={v => `${v}s`} />
                <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} width={95}
                  tick={{ fill: '#a2a8b8', fontSize: 12 }} />
                <Tooltip content={<ModalTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="time" radius={[0, 8, 8, 0]} isAnimationActive animationDuration={800}>
                  {chartData.map((entry) => (
                    <Cell key={entry.method} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats row */}
        <div className="modal-stats-row">
          {fastest && (
            <div className="modal-stat">
              <Trophy size={16} style={{ color: '#ffc94d' }} />
              <div>
                <div className="modal-stat-label">מהיר ביותר</div>
                <div className="modal-stat-value" style={{ color: fastest.color }}>
                  {fastest.label} · {fastest.time.toFixed(2)}s
                </div>
              </div>
            </div>
          )}
          {speedup && (
            <div className="modal-stat">
              <Zap size={16} style={{ color: 'var(--neon-lime)' }} />
              <div>
                <div className="modal-stat-label">פער מהירות</div>
                <div className="modal-stat-value">
                  ×{speedup} מהיר מהאיטי ביותר
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
