import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend as RLegend,
} from 'recharts';
import { LineChart, BarChart3, Hexagon } from 'lucide-react';
import { useData } from '../data/RunDataContext';
import { friendlyName } from '../data/methodNames';
import { scaleIn } from '../utils/scrollAnimations';

const CHART_TYPES = [
  { key: 'area', label: 'שטח', icon: LineChart },
  { key: 'bar', label: 'עמודות', icon: BarChart3 },
  { key: 'radar', label: 'רדאר', icon: Hexagon },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rc-tooltip">
      <div className="rc-tooltip-label">גודל אצווה · {label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="rc-tooltip-row">
          <span>
            <span className="rc-tooltip-dot" style={{ background: p.color, color: p.color }} />
            {friendlyName(p.dataKey)}
          </span>
          <span>{p.value.toFixed(2)}s</span>
        </div>
      ))}
    </div>
  );
}

function buildRadarData(summary) {
  if (!summary) return [];
  const metrics = [
    { key: 'speed', label: 'מהירות' },
    { key: 'memory', label: 'חסכוניות זיכרון' },
    { key: 'flexibility', label: 'גמישות' },
    { key: 'simplicity', label: 'פשטות' },
    { key: 'accuracy', label: 'דיוק' },
  ];
  
  const scores = {
    SQLDynamic:   { speed: 95, memory: 98, flexibility: 60, simplicity: 70, accuracy: 100 },
    Roslyn:       { speed: 55, memory: 50, flexibility: 95, simplicity: 75, accuracy: 100 },
    PythonSymPy:  { speed: 70, memory: 65, flexibility: 85, simplicity: 90, accuracy: 100 },
    AITranslated: { speed: 45, memory: 50, flexibility: 90, simplicity: 80, accuracy: 100 },
  };

  return metrics.map(m => {
    const point = { metric: m.label };
    Object.keys(summary).forEach(method => {
      point[method] = scores[method]?.[m.key] ?? 70;
    });
    return point;
  });
}

function RuntimeChart() {
  const data = useData();
  const series = data?.runtimeSeries ?? [];
  const colors = data?.engineColors ?? {};
  const summary = data?.summary ?? {};
  const [chartType, setChartType] = useState('area');

  const engines = series.length > 0
    ? Object.keys(series[0]).filter((k) => k !== 'batch')
    : [];

  const radarData = buildRadarData(summary);
  const chartAnimKey = `${chartType}-${series.length}-${engines.join(',')}`;
  const areaBarDuration = 1400;
  const barStagger = 95;
  const areaStagger = 110;
  const radarDuration = 1100;

  return (
    <motion.div
      className="glass panel"
      variants={scaleIn}
      initial="hidden"
      animate="show"
    >
      <div className="panel-header">
        <div>
          <div className="panel-title">
            <LineChart size={18} className="icon-blue" />
            השוואת זמני ריצה
          </div>
          <div className="panel-subtitle">
            {chartType === 'radar'
              ? 'ניתוח רב-ממדי · ציון 0–100 לכל פרמטר'
              : 'שניות להשלמת חישוב לפי גודל אצווה · נמוך יותר = טוב יותר'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="chart-type-toggle">
            {CHART_TYPES.map(ct => {
              const Icon = ct.icon;
              return (
                <button
                  key={ct.key}
                  className={`chart-type-btn ${chartType === ct.key ? 'active' : ''}`}
                  onClick={() => setChartType(ct.key)}
                  title={ct.label}
                >
                  <Icon size={14} />
                  <span>{ct.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {chartType !== 'radar' && (
        <div className="legend" style={{ marginBottom: 12, paddingRight: 4 }}>
          {engines.map((e) => (
            <div key={e} className="legend-item">
              <span className="legend-dot" style={{ background: colors[e], color: colors[e] }} />
              {friendlyName(e)}
            </div>
          ))}
        </div>
      )}

      <div
        className="runtime-chart-plot panel-chart-plot--sweep"
        style={{ width: '100%', height: 340, direction: 'ltr' }}
      >
        <ResponsiveContainer debounce={80}>
          {chartType === 'area' ? (
            <AreaChart
              key={chartAnimKey}
              data={series}
              margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            >
              <defs>
                {engines.map((e) => (
                  <linearGradient key={e} id={`grad-${e.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={colors[e]} stopOpacity={0.55} />
                    <stop offset="100%" stopColor={colors[e]} stopOpacity={0}    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="batch" tickLine={false} axisLine={false} dy={8} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${v}s`} width={50} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1 }} />
              {engines.map((e, i) => (
                <Area
                  key={e} type="monotone" dataKey={e}
                  stroke={colors[e]} strokeWidth={2.2}
                  fill={`url(#grad-${e.replace(/\s/g, '')})`}
                  dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: colors[e] }}
                  isAnimationActive
                  animationEasing="ease-out"
                  animationBegin={i * areaStagger}
                  animationDuration={areaBarDuration}
                />
              ))}
            </AreaChart>
          ) : chartType === 'bar' ? (
            <BarChart
              key={chartAnimKey}
              data={series}
              margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="batch" tickLine={false} axisLine={false} dy={8} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${v}s`} width={50} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              {engines.map((e, i) => (
                <Bar
                  key={e} dataKey={e} fill={colors[e]}
                  radius={[4, 4, 0, 0]} opacity={0.85}
                  isAnimationActive
                  animationEasing="ease-out"
                  animationBegin={i * barStagger}
                  animationDuration={areaBarDuration}
                />
              ))}
            </BarChart>
          ) : (
            <RadarChart
              key={chartAnimKey}
              data={radarData} cx="50%" cy="50%" outerRadius="75%"
            >
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#a2a8b8', fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              {engines.map((e, i) => (
                <Radar
                  key={e} name={friendlyName(e)} dataKey={e}
                  stroke={colors[e]} fill={colors[e]} fillOpacity={0.15}
                  strokeWidth={2}
                  isAnimationActive
                  animationEasing="ease-out"
                  animationBegin={i * 80}
                  animationDuration={radarDuration}
                />
              ))}
              <RLegend
                formatter={(v) => friendlyName(v)}
                wrapperStyle={{ fontSize: 12, color: '#a2a8b8' }}
              />
            </RadarChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default memo(RuntimeChart);
