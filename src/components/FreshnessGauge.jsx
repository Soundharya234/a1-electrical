import React, { useEffect, useState } from 'react';

export default function FreshnessGauge({ score, size = 'md', showLabel = true }) {
  const [fill, setFill] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setFill(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const sizes = {
    sm: { width: 40, strokeWidth: 4, font: 12 },
    md: { width: 60, strokeWidth: 5, font: 16 },
    lg: { width: 80, strokeWidth: 6, font: 22 }
  };

  const getGaugeConfig = (val) => {
    if (val >= 8) return { color: '#22C55E', text: 'Fresh' };
    if (val >= 6) return { color: '#84CC16', text: 'Good' };
    if (val >= 4) return { color: '#F59E0B', text: 'Fair' };
    if (val > 3) return { color: '#F97316', text: 'Poor' };
    return { color: '#EF4444', text: 'Spoiled' };
  };

  const config = getGaugeConfig(score);
  const dims = sizes[size];
  const radius = (dims.width - dims.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.max(0, Math.min(fill / 10, 1));
  const offset = circumference - (percentage * circumference);

  return (
    <div className="freshness-gauge" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', width: dims.width, height: dims.width }}>
        <svg width={dims.width} height={dims.width} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={dims.width / 2}
            cy={dims.width / 2}
            r={radius}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={dims.strokeWidth}
          />
          <circle
            cx={dims.width / 2}
            cy={dims.width / 2}
            r={radius}
            fill="none"
            stroke={config.color}
            strokeWidth={dims.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${dims.font}px`,
          fontWeight: '700',
          color: '#0F172A'
        }}>
          {score}
        </div>
      </div>
      
      {showLabel && (
        <span style={{ fontSize: '13px', fontWeight: '500', color: config.color }}>
          {config.text}
        </span>
      )}
    </div>
  );
}
