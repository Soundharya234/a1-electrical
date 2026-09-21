import React from 'react';

/**
 * SVG arc gauge displaying a score from 0–100.
 * Arc goes from bottom-left to bottom-right (semicircle).
 * Color: green ≥75, yellow ≥50, orange ≥25, red <25.
 */
export default function ScoreGauge({ score, label, color }) {
  const value = Math.min(100, Math.max(0, score || 0));

  // Arc geometry: center (60,62), radius 48, semicircle top
  // Total semicircle arc length ≈ π × 48 ≈ 150.8
  const arcLen = Math.PI * 48;
  const filled = (value / 100) * arcLen;

  const autoColor =
    value >= 75 ? '#22C55E' :
    value >= 50 ? '#F59E0B' :
    value >= 25 ? '#F97316' : '#EF4444';

  const gaugeColor = color || autoColor;

  const ratingLabel =
    value >= 80 ? 'Excellent' :
    value >= 65 ? 'Good' :
    value >= 45 ? 'Moderate' :
    value >= 25 ? 'Low' : 'Very Low';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <svg width="130" height="80" viewBox="0 0 130 80">
        {/* Background arc */}
        <path
          d="M 14 68 A 51 51 0 0 1 116 68"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="11"
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <path
          d="M 14 68 A 51 51 0 0 1 116 68"
          fill="none"
          stroke={gaugeColor}
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${arcLen}`}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
        {/* Score number */}
        <text
          x="65"
          y="60"
          textAnchor="middle"
          fontSize="24"
          fontWeight="800"
          fill={gaugeColor}
        >
          {value}
        </text>
        {/* /100 */}
        <text x="65" y="73" textAnchor="middle" fontSize="9" fill="#94A3B8">
          /100
        </text>
        {/* Min/Max ticks */}
        <text x="14" y="80" textAnchor="middle" fontSize="8" fill="#CBD5E1">0</text>
        <text x="116" y="80" textAnchor="middle" fontSize="8" fill="#CBD5E1">100</text>
      </svg>
      {label && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>{label}</div>
          <div style={{ fontSize: '11px', color: gaugeColor, fontWeight: 700 }}>{ratingLabel}</div>
        </div>
      )}
    </div>
  );
}
