import React from 'react';

export function Sparkline({ data, color = '#3B82F6', width = 100, height = 30 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MiniBar({ data, color = '#3B82F6', width = 100, height = 30 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  const barWidth = width / data.length;

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      {data.map((val, i) => {
        const barHeight = (val / max) * height;
        return (
          <rect
            key={i}
            x={i * barWidth + (barWidth * 0.1)}
            y={height - barHeight}
            width={barWidth * 0.8}
            height={barHeight}
            fill={color}
            rx="1"
          />
        );
      })}
    </svg>
  );
}

export function MiniPie({ segments, size = 40 }) {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
  const radius = size / 2;
  const circumference = 2 * Math.PI * (radius / 2); // Stroke is centered on radius/2
  let currentOffset = 0;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', borderRadius: '50%' }}>
      {segments.map((seg, i) => {
        const dasharray = (seg.value / total) * circumference;
        const offset = currentOffset;
        currentOffset += dasharray;
        
        return (
          <circle
            key={i}
            r={radius / 2}
            cx={radius}
            cy={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={radius}
            strokeDasharray={`${dasharray} ${circumference}`}
            strokeDashoffset={`-${offset}`}
          />
        );
      })}
    </svg>
  );
}

export function ProgressBar({ value, maxValue = 100, color = '#3B82F6', label, showPercentage = true }) {
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);
  
  return (
    <div style={{ width: '100%' }}>
      {(label || showPercentage) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
          {label && <span style={{ color: '#475569', fontWeight: '500' }}>{label}</span>}
          {showPercentage && <span style={{ color: '#64748B' }}>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
        <div 
          style={{ 
            height: '100%', 
            width: `${percentage}%`, 
            backgroundColor: color, 
            borderRadius: '4px',
            transition: 'width 0.5s ease-in-out'
          }} 
        />
      </div>
    </div>
  );
}
