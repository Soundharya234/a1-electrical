import React from 'react';
import { TrendingUp, Sun, Wind, Zap, Leaf } from 'lucide-react';

export default function GenerationForecast({ weather, forecast, solarScore, windScore }) {
  if (!weather || !forecast) return null;

  const daily = weather.daily || {};
  const time = daily.time || [];
  const ghiArr = daily.shortwave_radiation_sum || [];
  const windArr = daily.windspeed_100m_max || [];

  // Calculate day-by-day estimated generation for 1 MW reference system
  // Solar: GHI (MJ/m²/day) / 3.6 = kWh/m²/day * 1000 kW * 0.78 (Performance Ratio)
  // Wind: Hub wind power estimate ~ 0.5 * rho * A * v^3 with turbine power curve approximation
  const dailyBreakdown = time.slice(0, 7).map((date, idx) => {
    const ghi_kWh = (ghiArr[idx] || 18) / 3.6;
    const solarGen_kWh = Math.round(ghi_kWh * 1000 * 0.78);

    const wind100m = windArr[idx] ? (windArr[idx] / 3.6) * 0.65 : 6.0;
    // Approximated 1 MW turbine daily output (kWh) based on hub speed
    let windCF_daily;
    if (wind100m >= 11) windCF_daily = 0.45;
    else if (wind100m >= 8.5) windCF_daily = 0.35;
    else if (wind100m >= 6.5) windCF_daily = 0.25;
    else if (wind100m >= 4.5) windCF_daily = 0.15;
    else windCF_daily = 0.05;

    const windGen_kWh = Math.round(1000 * windCF_daily * 24);

    return {
      date,
      solarGen_kWh,
      windGen_kWh,
      hybridGen_kWh: Math.round((solarGen_kWh + windGen_kWh) * 0.95), // shared curtailment factor
    };
  });

  const solarMWh = forecast.solarMWh || 1840;
  const windMWh = forecast.windMWh || 2100;
  const solarCF = forecast.solarCF || '21.0';
  const windCF = forecast.windCF || '24.0';

  // Indian Grid Emission Factor ~ 0.71 tonnes CO2 per MWh (CEA CO2 Baseline Database v19)
  const solarCO2 = Math.round(solarMWh * 0.71);
  const windCO2 = Math.round(windMWh * 0.71);

  return (
    <div>
      {/* 1 MW Reference System KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px',
        marginBottom: '20px',
      }}>
        <div style={{
          background: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: '10px',
          padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#92400E', fontWeight: 700, marginBottom: '4px' }}>
            <Sun size={16} /> Solar 1 MW Annual Yield
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#92400E' }}>
            {solarMWh.toLocaleString()} <span style={{ fontSize: '13px', fontWeight: 500 }}>MWh/yr</span>
          </div>
          <div style={{ fontSize: '11px', color: '#B45309', marginTop: '4px' }}>
            Capacity Factor: <strong>{solarCF}%</strong> | CO₂ Saved: <strong>{solarCO2} t/yr</strong>
          </div>
        </div>

        <div style={{
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '10px',
          padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#1E40AF', fontWeight: 700, marginBottom: '4px' }}>
            <Wind size={16} /> Wind 1 MW Annual Yield
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#1E40AF' }}>
            {windMWh.toLocaleString()} <span style={{ fontSize: '13px', fontWeight: 500 }}>MWh/yr</span>
          </div>
          <div style={{ fontSize: '11px', color: '#1D4ED8', marginTop: '4px' }}>
            Capacity Factor: <strong>{windCF}%</strong> | CO₂ Saved: <strong>{windCO2} t/yr</strong>
          </div>
        </div>

        <div style={{
          background: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: '10px',
          padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#166534', fontWeight: 700, marginBottom: '4px' }}>
            <Leaf size={16} /> CEA Grid Emission Offset
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#166534' }}>
            {Math.max(solarCO2, windCO2)} <span style={{ fontSize: '13px', fontWeight: 500 }}>tCO₂e/yr</span>
          </div>
          <div style={{ fontSize: '11px', color: '#15803D', marginTop: '4px' }}>
            Equiv to ~<strong>{Math.round(Math.max(solarCO2, windCO2) * 45)}</strong> trees planted
          </div>
        </div>
      </div>

      {/* 7-Day Predicted Generation Breakdown Table */}
      <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
        7-Day Daily Generation Forecast (1 MW Reference Installation)
      </div>
      <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #CBD5E1', color: '#475569' }}>Forecast Date</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '1px solid #CBD5E1', color: '#D97706' }}>Solar Output (kWh/day)</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '1px solid #CBD5E1', color: '#2563EB' }}>Wind Output (kWh/day)</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '1px solid #CBD5E1', color: '#7C3AED' }}>Combined Hybrid (kWh/day)</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #CBD5E1', color: '#64748B' }}>Dominant Daily Driver</th>
            </tr>
          </thead>
          <tbody>
            {dailyBreakdown.map((row, i) => {
              const dominant = row.solarGen_kWh >= row.windGen_kWh ? 'Solar Dominant' : 'Wind Dominant';
              return (
                <tr key={row.date} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? 'white' : '#FAFAFA' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0F172A' }}>{row.date}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#D97706' }}>
                    {row.solarGen_kWh.toLocaleString()}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#2563EB' }}>
                    {row.windGen_kWh.toLocaleString()}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#7C3AED' }}>
                    {row.hybridGen_kWh.toLocaleString()}
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 700,
                      background: dominant.includes('Solar') ? '#FEF3C7' : '#DBEAFE',
                      color: dominant.includes('Solar') ? '#92400E' : '#1E40AF',
                    }}>
                      {dominant}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
