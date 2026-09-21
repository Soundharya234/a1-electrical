import React from 'react';
import ScoreGauge from './ScoreGauge';
import { Sun, Wind, Zap, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function AssessmentReport({
  assessment,
  locationName,
  stateName,
  districtName,
  lat,
  lng,
  stateCapacity,
}) {
  if (!assessment) return null;

  const {
    recommendation,
    primaryReason,
    existingContext,
    solar,
    wind,
    forecast,
    nearbySolar = [],
    nearbyWind = [],
    nearbyHybrid = [],
    nearbyOther = [],
    nearbySolarCap = 0,
    nearbyWindCap = 0,
    nearbyProjectCount = 0,
    nearestProject,
  } = assessment;

  const isSolarRecommended = recommendation.toLowerCase().includes('solar') && !recommendation.toLowerCase().includes('hybrid');
  const isWindRecommended = recommendation.toLowerCase().includes('wind') && !recommendation.toLowerCase().includes('hybrid');
  const isHybridRecommended = recommendation.toLowerCase().includes('hybrid');

  const themeGradient = isSolarRecommended
    ? 'linear-gradient(135deg, #D97706 0%, #B45309 100%)'
    : isWindRecommended
    ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)'
    : 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)';

  return (
    <div>
      {/* ─── OFFICIAL PRELIMINARY REPORT CARD ─────────────────────────────── */}
      <div style={{
        background: 'white',
        border: '2px solid #E2E8F0',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        marginBottom: '24px',
      }}>
        <div style={{
          borderBottom: '2px solid #0F172A',
          paddingBottom: '12px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '10px',
        }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748B', fontWeight: 800 }}>
              Independent Resource Analysis & Screening
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: '4px 0 0' }}>
              PRELIMINARY RENEWABLE ENERGY SUITABILITY ASSESSMENT
            </h2>
          </div>
          <div style={{ textAlign: 'right', fontSize: '12px', color: '#334155' }}>
            <div>Selected Location: <strong style={{ color: '#0F172A' }}>{locationName || 'Selected Location'}</strong>{stateName ? `, ${stateName}` : ''}</div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>
              Lat: {lat != null ? lat.toFixed(4) : '—'}, Lng: {lng != null ? lng.toFixed(4) : '—'}
            </div>
          </div>
        </div>

        {/* ─── SIDE-BY-SIDE RESOURCE BLOCKS ─────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}>
          {/* SOLAR BLOCK */}
          <div style={{
            border: '2px solid #FDE68A',
            borderRadius: '10px',
            background: '#FFFDF5',
            padding: '18px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #FDE68A',
              paddingBottom: '8px',
              marginBottom: '14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sun size={22} color="#D97706" />
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#92400E', letterSpacing: '0.04em' }}>
                  SOLAR
                </span>
              </div>
              <span style={{
                background: '#FEF3C7',
                color: '#92400E',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
              }}>
                GHI Irradiance
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0 16px' }}>
              <ScoreGauge score={solar.score} label="Solar Score" color="#D97706" />
            </div>

            <div style={{ fontSize: '12px', color: '#451A03', lineHeight: 1.8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #FDE68A', paddingBottom: '3px' }}>
                <span>Suitability Score:</span>
                <strong>{solar.score} / 100</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #FDE68A', paddingBottom: '3px' }}>
                <span>Nearby Solar Projects:</span>
                <strong>{nearbySolar.length} project(s)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #FDE68A', paddingBottom: '3px' }}>
                <span>Nearby Solar Capacity:</span>
                <strong>{nearbySolarCap.toLocaleString()} MW</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #FDE68A', paddingBottom: '3px' }}>
                <span>Average Solar Radiation:</span>
                <strong>{solar.ghiKwh} kWh/m²/day</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Sunshine Duration:</span>
                <strong>{solar.sunshineHrs} hrs/day</strong>
              </div>
            </div>
          </div>

          {/* WIND BLOCK */}
          <div style={{
            border: '2px solid #BFDBFE',
            borderRadius: '10px',
            background: '#F8FAFF',
            padding: '18px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #BFDBFE',
              paddingBottom: '8px',
              marginBottom: '14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wind size={22} color="#2563EB" />
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#1E40AF', letterSpacing: '0.04em' }}>
                  WIND
                </span>
              </div>
              <span style={{
                background: '#DBEAFE',
                color: '#1E40AF',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
              }}>
                100m Hub-Height
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0 16px' }}>
              <ScoreGauge score={wind.score} label="Wind Score" color="#2563EB" />
            </div>

            <div style={{ fontSize: '12px', color: '#1E3A8A', lineHeight: 1.8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #BFDBFE', paddingBottom: '3px' }}>
                <span>Suitability Score:</span>
                <strong>{wind.score} / 100</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #BFDBFE', paddingBottom: '3px' }}>
                <span>Nearby Wind Projects:</span>
                <strong>{nearbyWind.length} project(s)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #BFDBFE', paddingBottom: '3px' }}>
                <span>Nearby Wind Capacity:</span>
                <strong>{nearbyWindCap.toLocaleString()} MW</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #BFDBFE', paddingBottom: '3px' }}>
                <span>Average Wind Speed (Hub):</span>
                <strong>{wind.wind100m_ms} m/s</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>IEC Turbine Class:</span>
                <strong>{wind.iecClass}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* ─── RECOMMENDATION BANNER ────────────────────────────────────────── */}
        <div style={{
          padding: '20px 24px',
          borderRadius: '10px',
          background: themeGradient,
          color: 'white',
          marginBottom: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.85, marginBottom: '6px', fontWeight: 800 }}>
            RECOMMENDATION
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, marginBottom: '10px', letterSpacing: '0.02em' }}>
            {recommendation.toUpperCase()}
          </div>
          <div style={{ fontSize: '13px', lineHeight: 1.6, opacity: 0.95, background: 'rgba(0,0,0,0.15)', padding: '12px 16px', borderRadius: '8px' }}>
            <strong style={{ display: 'block', marginBottom: '4px' }}>Reason:</strong>
            {primaryReason}
          </div>
        </div>

        {/* ─── MANDATORY REFERENCE CLAUSE (EXISTING INSTALLATION ≠ AUTOMATIC RECOMMENDATION) ── */}
        <div style={{
          background: '#F8FAFC',
          border: '1px solid #CBD5E1',
          borderRadius: '10px',
          padding: '16px 20px',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
            <ShieldCheck size={18} color="#059669" />
            Existing Renewable Projects — Reference Context Only
          </div>
          <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
            {existingContext}
          </p>
          <p style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.5, margin: '6px 0 0', fontStyle: 'italic' }}>
            <strong>Integrity Rule:</strong> Existing projects indicate renewable-energy development in the surrounding area. They are displayed for reference and comparison only, and do not dictate the recommendation. The preliminary recommendation is driven objectively by the calculated solar and wind resource suitability scores.
          </p>
        </div>

        {/* State Capacity Summary */}
        {stateCapacity && (
          <div style={{
            background: '#FFFBEB',
            border: '1px solid #FEF3C7',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '11px',
            color: '#78350F',
          }}>
            <strong>{stateCapacity.state} Official State Capacity (MNRE {stateCapacity.data_date}):</strong>{' '}
            Solar: <strong>{stateCapacity.solar_mw.toLocaleString()} MW</strong> |{' '}
            Wind: <strong>{stateCapacity.wind_mw.toLocaleString()} MW</strong> |{' '}
            Small Hydro: <strong>{stateCapacity.smallHydro_mw.toLocaleString()} MW</strong> |{' '}
            Biomass: <strong>{stateCapacity.bio_mw.toLocaleString()} MW</strong>
          </div>
        )}
      </div>
    </div>
  );
}
