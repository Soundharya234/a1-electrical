import React from 'react';

const WIND_DIRS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];

function windDirLabel(deg) {
  if (deg == null) return 'N/A';
  return WIND_DIRS[Math.round(deg / 22.5) % 16];
}

function weatherEmoji(code) {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 49) return '🌫️';
  if (code <= 69) return '🌧️';
  if (code <= 79) return '🌨️';
  if (code <= 99) return '⛈️';
  return '🌤️';
}

function avg(arr) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function MetricCard({ icon, label, value, color }) {
  return (
    <div style={{
      padding: '12px 14px',
      border: '1px solid #E2E8F0',
      borderRadius: '10px',
      background: 'white',
    }}>
      <div style={{ fontSize: '20px', marginBottom: '4px' }}>{icon}</div>
      <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: '15px', fontWeight: 800, color: color || '#0F172A' }}>{value}</div>
    </div>
  );
}

export default function WeatherPanel({ weather }) {
  if (!weather) return null;

  const current = weather.current || {};
  const daily = weather.daily || {};

  const avgTemp = avg(daily.temperature_2m_mean || []).toFixed(1);
  const avgCloud = avg(daily.cloud_cover_mean || daily.cloudcover_mean || []).toFixed(0);
  const avgHumidity = avg(daily.relative_humidity_2m_mean || daily.relativehumidity_2m_mean || []).toFixed(0);
  const avgWind10m = avg(daily.wind_speed_10m_max || daily.windspeed_10m_max || []).toFixed(1);
  const avgWind100m = avg(daily.wind_speed_100m_max || daily.windspeed_100m_max || []).toFixed(1);
  const avgGHI_kWh = (avg(daily.shortwave_radiation_sum || []) / 3.6).toFixed(2);
  const avgSunshineHrs = (avg(daily.sunshine_duration || []) / 3600).toFixed(1);

  const curWeatherCode = current.weather_code ?? current.weathercode ?? 0;
  const curWindSpeed = current.wind_speed_10m ?? current.windspeed_10m ?? 0;
  const curCloudCover = current.cloud_cover ?? current.cloudcover ?? 0;
  const curHumidity = current.relative_humidity_2m ?? 0;
  const curWindDir = current.wind_direction_10m ?? current.winddirection_10m ?? null;

  return (
    <div>
      {/* Current conditions bar */}
      {current.temperature_2m !== undefined && (
        <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '16px',
          padding: '14px 18px',
          background: '#F8FAFC',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '36px' }}>{weatherEmoji(curWeatherCode)}</span>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
              {current.temperature_2m}°C
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Current temperature</div>
          </div>
          {[
            { label: 'Wind speed', value: `${curWindSpeed} km/h`, color: '#3B82F6' },
            { label: 'Solar radiation', value: `${current.shortwave_radiation || 0} W/m²`, color: '#F59E0B' },
            { label: 'Cloud cover', value: `${curCloudCover}%`, color: '#64748B' },
            { label: 'Humidity', value: `${curHumidity}%`, color: '#06B6D4' },
          ].map((item, i) => (
            <div key={i} style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '20px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>{item.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* 7-day averages */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
        gap: '10px',
        marginBottom: '16px',
      }}>
        <MetricCard icon="🌡️" label="Temperature (7d avg)" value={`${avgTemp}°C`} color="#EF4444" />
        <MetricCard icon="💧" label="Relative Humidity (7d avg)" value={`${avgHumidity}%`} color="#06B6D4" />
        <MetricCard icon="☁️" label="Cloud Cover (7d avg)" value={`${avgCloud}%`} color="#64748B" />
        <MetricCard icon="💨" label="Wind Speed 10 m (7d avg max)" value={`${avgWind10m} km/h`} color="#3B82F6" />
        <MetricCard icon="🌬️" label="Wind Speed 100 m (7d avg max)" value={`${avgWind100m} km/h`} color="#1E40AF" />
        <MetricCard icon="🧭" label="Wind Direction (current)" value={`${curWindDir ?? 'N/A'}° (${windDirLabel(curWindDir)})`} color="#8B5CF6" />
        <MetricCard icon="☀️" label="Solar GHI (7d avg)" value={`${avgGHI_kWh} kWh/m²/day`} color="#F59E0B" />
        <MetricCard icon="🌤️" label="Sunshine Duration (7d avg)" value={`${avgSunshineHrs} hrs/day`} color="#F97316" />
      </div>

      {/* 7-day table */}
      {daily.time && daily.time.length > 0 && (
        <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#475569', padding: '10px 12px 6px', background: '#F8FAFC' }}>
            7-Day Meteorological Breakdown (Open-Meteo)
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Date','Temp °C','Cloud %','Wind 10m (km/h)','Wind 100m (km/h)','GHI (MJ/m²)','Sunshine (h)'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Date' ? 'left' : 'right', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {daily.time.map((date, i) => (
                <tr key={date} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 600, color: '#0F172A' }}>{date}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', color: '#EF4444' }}>{daily.temperature_2m_mean?.[i]?.toFixed(1) ?? '—'}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', color: '#64748B' }}>{(daily.cloud_cover_mean?.[i] ?? daily.cloudcover_mean?.[i])?.toFixed(0) ?? '—'}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', color: '#3B82F6' }}>{(daily.wind_speed_10m_max?.[i] ?? daily.windspeed_10m_max?.[i])?.toFixed(1) ?? '—'}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', color: '#1E40AF' }}>{(daily.wind_speed_100m_max?.[i] ?? daily.windspeed_100m_max?.[i])?.toFixed(1) ?? '—'}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', color: '#F59E0B' }}>{daily.shortwave_radiation_sum?.[i]?.toFixed(1) ?? '—'}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', color: '#F97316' }}>{((daily.sunshine_duration?.[i] || 0) / 3600).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
