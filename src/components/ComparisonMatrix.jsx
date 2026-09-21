import React from 'react';
import { Sun, Wind, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ComparisonMatrix({ solarScore, windScore, nearbyProjects = [], forecast }) {
  if (!solarScore || !windScore) return null;

  const nearbySolar = nearbyProjects.filter(p => p.type === 'solar');
  const nearbyWind = nearbyProjects.filter(p => p.type === 'wind');
  const nearbyHybrid = nearbyProjects.filter(p => p.type === 'hybrid');

  const solarCap = nearbySolar.reduce((s, p) => s + (p.capacity_mw || 0), 0);
  const windCap = nearbyWind.reduce((s, p) => s + (p.capacity_mw || 0), 0);
  const hybridCap = nearbyHybrid.reduce((s, p) => s + (p.capacity_mw || 0), 0);

  const solarCF = forecast?.solarCF || '21.0';
  const windCF = forecast?.windCF || '24.0';
  const hybridCF = (parseFloat(solarCF) * 0.5 + parseFloat(windCF) * 0.5 + 4).toFixed(1); // Co-located complementary gain

  const solarMWh = forecast?.solarMWh || 1840;
  const windMWh = forecast?.windMWh || 2100;
  const hybridMWh = Math.round(((solarMWh + windMWh) / 2) * 1.15);

  const rows = [
    {
      metric: 'Suitability Score',
      solar: `${solarScore.score} / 100`,
      solarHighlight: solarScore.score >= 70 ? '#166534' : '#92400E',
      wind: `${windScore.score} / 100`,
      windHighlight: windScore.score >= 70 ? '#166534' : '#92400E',
      hybrid: `${Math.round((solarScore.score * 0.55) + (windScore.score * 0.45))} / 100`,
      hybridHighlight: '#6D28D9',
    },
    {
      metric: 'Primary Resource Parameter',
      solar: `${solarScore.ghiKwh} kWh/m²/day GHI (${solarScore.sunshineHrs} hrs sunshine)`,
      wind: `${windScore.wind100m_ms} m/s hub-height (${windScore.iecClass.split(' ')[0]} ${windScore.iecClass.split(' ')[1] || ''})`,
      hybrid: 'Combined Irradiance + Wind Velocity Spectrum',
    },
    {
      metric: 'Estimated Capacity Factor (CF)',
      solar: `${solarCF}%`,
      wind: `${windCF}%`,
      hybrid: `${hybridCF}% (Complementary benefit)`,
    },
    {
      metric: 'Est. Annual Generation (per 1 MW)',
      solar: `${solarMWh.toLocaleString()} MWh / year`,
      wind: `${windMWh.toLocaleString()} MWh / year`,
      hybrid: `${hybridMWh.toLocaleString()} MWh / year (blended 1 MW equiv)`,
    },
    {
      metric: 'Nearby Verified Capacity (within radius)',
      solar: `${nearbySolar.length} project(s) (${solarCap.toLocaleString()} MW)`,
      wind: `${nearbyWind.length} project(s) (${windCap.toLocaleString()} MW)`,
      hybrid: `${nearbyHybrid.length} project(s) (${hybridCap.toLocaleString()} MW)`,
    },
    {
      metric: 'Generation Timing Profile',
      solar: 'Daytime only (peaks 11:00 AM – 2:30 PM). Zero generation at night.',
      wind: 'Often diurnal & nocturnal (peaks during evening & SW/NE monsoon months).',
      hybrid: 'Smoother 24-hour generation curve. Reduces grid ramping stress.',
    },
    {
      metric: 'Land & Siting Footprint',
      solar: '~3.5 to 4.5 acres per MW ground-mounted PV array.',
      wind: '~0.2 to 0.5 acres per turbine pad; allows farming between towers.',
      hybrid: 'Shared transmission evacuation lines, sub-station, and pooling point.',
    },
    {
      metric: 'Grid Integration Complexity',
      solar: 'Predictable diurnal ramps; duck-curve evening impact without storage.',
      wind: 'Variable output linked to gustiness & seasonal fronts.',
      hybrid: 'Highest utilization of PPA grid interconnection capacity.',
    },
  ];

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '14px',
        marginBottom: '16px',
      }}>
        {/* Solar Card */}
        <div style={{
          background: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: '10px',
          padding: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sun size={20} color="#D97706" />
            <strong style={{ fontSize: '15px', color: '#92400E' }}>Solar Energy Profile</strong>
          </div>
          <p style={{ fontSize: '12px', color: '#78350F', margin: 0, lineHeight: 1.5 }}>
            Suitability Score: <strong>{solarScore.score}/100</strong>. Favorable for rooftop, commercial C&I, and utility solar farms given {solarScore.ghiKwh} kWh/m²/day average irradiance.
          </p>
        </div>

        {/* Wind Card */}
        <div style={{
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '10px',
          padding: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Wind size={20} color="#2563EB" />
            <strong style={{ fontSize: '15px', color: '#1E40AF' }}>Wind Energy Profile</strong>
          </div>
          <p style={{ fontSize: '12px', color: '#1E3A8A', margin: 0, lineHeight: 1.5 }}>
            Suitability Score: <strong>{windScore.score}/100</strong>. Hub-height wind speed of {windScore.wind100m_ms} m/s classifies this location as <em>{windScore.iecClass}</em>.
          </p>
        </div>

        {/* Hybrid Card */}
        <div style={{
          background: '#F5F3FF',
          border: '1px solid #DDD6FE',
          borderRadius: '10px',
          padding: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Zap size={20} color="#7C3AED" />
            <strong style={{ fontSize: '15px', color: '#5B21B6' }}>Hybrid Potential</strong>
          </div>
          <p style={{ fontSize: '12px', color: '#4C1D95', margin: 0, lineHeight: 1.5 }}>
            {solarScore.score >= 60 && windScore.score >= 50
              ? 'Co-locating wind and solar at this site unlocks high combined capacity utilization and shared substation savings.'
              : 'One resource dominates; hybrid may be explored for grid smoothing if backup generation is required.'}
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '2px solid #CBD5E1', color: '#475569', fontWeight: 700, width: '25%' }}>
                Evaluation Parameter
              </th>
              <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '2px solid #CBD5E1', color: '#D97706', fontWeight: 700, width: '25%' }}>
                ☀️ Solar Energy
              </th>
              <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '2px solid #CBD5E1', color: '#2563EB', fontWeight: 700, width: '25%' }}>
                🌬️ Wind Energy
              </th>
              <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '2px solid #CBD5E1', color: '#7C3AED', fontWeight: 700, width: '25%' }}>
                ⚡ Solar–Wind Hybrid
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? 'white' : '#FAFAFA' }}>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: '#334155' }}>
                  {r.metric}
                </td>
                <td style={{ padding: '10px 14px', color: r.solarHighlight || '#0F172A', fontWeight: r.solarHighlight ? 700 : 500 }}>
                  {r.solar}
                </td>
                <td style={{ padding: '10px 14px', color: r.windHighlight || '#0F172A', fontWeight: r.windHighlight ? 700 : 500 }}>
                  {r.wind}
                </td>
                <td style={{ padding: '10px 14px', color: r.hybridHighlight || '#0F172A', fontWeight: r.hybridHighlight ? 700 : 500 }}>
                  {r.hybrid}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
