import React from 'react';

export function ChartContainer({ title, subtitle, children, action }) {
  return (
    <div className="chart-container" style={{
      background: '#FFFFFF',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div className="chart-title-group">
          <h3 className="chart-title" style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#0F172A' }}>{title}</h3>
          {subtitle && <p className="chart-subtitle" style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748B' }}>{subtitle}</p>}
        </div>
        {action && <div className="chart-action">{action}</div>}
      </div>
      <div className="chart-content">
        {children}
      </div>
    </div>
  );
}

export function BarChart({ data, maxValue, height = 200, showLabels = true }) {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);
  return (
    <div className="bar-chart" style={{ height }}>
      <svg width="100%" height="100%" preserveAspectRatio="none">
        {data.map((item, i) => {
          const barWidth = 100 / data.length;
          const barHeight = (item.value / max) * 100;
          return (
            <g key={i}>
              <rect
                x={`${i * barWidth + (barWidth * 0.1)}%`}
                y={`${100 - barHeight}%`}
                width={`${barWidth * 0.8}%`}
                height={`${barHeight}%`}
                fill={item.color || '#3B82F6'}
                rx="4"
              />
              {showLabels && (
                <text
                  x={`${(i + 0.5) * barWidth}%`}
                  y={`${Math.max(100 - barHeight - 4, 10)}%`}
                  textAnchor="middle"
                  fill="#64748B"
                  fontSize="12"
                >
                  {item.value}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {showLabels && (
        <div className="bar-chart-labels" style={{ display: 'flex', justifyContent: 'space-around', marginTop: '12px' }}>
          {data.map((item, i) => (
            <span key={i} style={{ fontSize: '12px', color: '#64748B', textAlign: 'center', width: `${100/data.length}%` }}>
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function LineChart({ data, color = '#22C55E', height = 200, showDots = true, showArea = true }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - (d.value / max) * 100}`).join(' ');
  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <div className="line-chart" style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        {showArea && (
          <polygon points={areaPoints} fill={`${color}33`} />
        )}
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" />
        {showDots && data.map((d, i) => (
          <circle
            key={i}
            cx={(i / (data.length - 1)) * 100}
            cy={100 - (d.value / max) * 100}
            r="1.5"
            fill={color}
            stroke="#fff"
            strokeWidth="0.5"
          />
        ))}
      </svg>
      <div className="line-chart-labels" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
        {data.map((item, i) => (
          <span key={i} style={{ fontSize: '12px', color: '#64748B' }}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}

export function GaugeChart({ value, maxValue = 100, color, label, size = 150 }) {
  const percentage = Math.min(value / maxValue, 1);
  const strokeColor = color || (percentage > 0.8 ? '#22C55E' : percentage > 0.5 ? '#F59E0B' : '#EF4444');
  const dasharray = 125.6; // ~40 * PI
  const offset = dasharray * (1 - percentage);
  
  return (
    <div className="gauge-chart" style={{ width: size, textAlign: 'center', margin: '0 auto' }}>
      <svg viewBox="0 0 100 50" style={{ overflow: 'visible' }}>
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke={strokeColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={dasharray}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
        <text x="50" y="45" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#0F172A">
          {value}
        </text>
      </svg>
      {label && <div style={{ marginTop: '8px', fontSize: '13px', color: '#64748B', fontWeight: '500' }}>{label}</div>}
    </div>
  );
}

export function PieChart({ data, size = 200, showLegend = true }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentOffset = 0;

  return (
    <div className="pie-chart" style={{ width: size, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg viewBox="0 0 32 32" style={{ transform: 'rotate(-90deg)', borderRadius: '50%', width: '100%', height: 'auto' }}>
        {data.map((item, i) => {
          const dasharray = (item.value / total) * 100.53; // 16 * 2 * PI
          const offset = currentOffset;
          currentOffset += dasharray;
          return (
            <circle
              key={i}
              r="16"
              cx="16"
              cy="16"
              fill="none"
              stroke={item.color}
              strokeWidth="32"
              strokeDasharray={`${dasharray} 100.53`}
              strokeDashoffset={`-${offset}`}
            />
          );
        })}
      </svg>
      {showLegend && (
        <div className="pie-legend" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '20px', justifyContent: 'center' }}>
          {data.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#475569' }}>
              <span style={{ width: '10px', height: '10px', backgroundColor: item.color, borderRadius: '50%', marginRight: '6px' }}></span>
              {item.label} ({item.value})
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
