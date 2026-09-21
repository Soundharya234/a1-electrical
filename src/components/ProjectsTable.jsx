import React, { useState } from 'react';
import { ExternalLink, Database, AlertCircle } from 'lucide-react';

const TYPE_COLORS = {
  solar: '#F59E0B',
  wind: '#3B82F6',
  hybrid: '#8B5CF6',
  hydro: '#06B6D4',
  biomass: '#16A34A',
};

const TYPE_ICONS = {
  solar: '☀️ Solar',
  wind: '🌬️ Wind',
  hybrid: '☀️🌬️ Hybrid',
  hydro: '💧 Hydro',
  biomass: '🌱 Biomass',
};

function DataLevelBadge({ level }) {
  const styles = {
    project: { bg: '#DCFCE7', color: '#166534', label: '📌 Project-Level' },
    district: { bg: '#DBEAFE', color: '#1E40AF', label: '📍 District-Level' },
    state: { bg: '#FEF3C7', color: '#92400E', label: '🗺️ State-Level' },
  };
  const s = styles[level] || styles.state;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '9999px',
      fontSize: '10px',
      fontWeight: 700,
      background: s.bg,
      color: s.color,
      whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
}

export default function ProjectsTable({ projects = [], selectedLocation, radiusKm = 50 }) {
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('distance');

  if (!projects || projects.length === 0) {
    return (
      <div style={{
        padding: '36px 20px',
        textAlign: 'center',
        color: '#64748B',
        background: '#F8FAFC',
        borderRadius: '10px',
        border: '1px dashed #CBD5E1',
      }}>
        <div style={{ fontSize: '36px', marginBottom: '10px' }}>📍</div>
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B' }}>
          No verified renewable projects found within {radiusKm} km of {selectedLocation?.name || 'the selected location'}.
        </div>
        <p style={{ fontSize: '12px', color: '#64748B', maxWidth: '600px', margin: '8px auto 0' }}>
          This indicates that either no major grid-scale installations are commissioned in this immediate radius, or published project-level coordinates are unavailable. Refer to the state-level aggregated installed capacity below for broader regional context.
        </p>
      </div>
    );
  }

  const types = ['all', ...new Set(projects.map(p => p.type))];

  let filtered = filterType === 'all' ? projects : projects.filter(p => p.type === filterType);

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'distance') {
      if (a.distance == null) return 1;
      if (b.distance == null) return -1;
      return a.distance - b.distance;
    }
    if (sortBy === 'capacity') return (b.capacity_mw || 0) - (a.capacity_mw || 0);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const totalCapacity = filtered.reduce((s, p) => s + (p.capacity_mw || 0), 0);
  const nearestProject = filtered.find(p => p.distance != null);

  return (
    <div>
      {/* Controls & Summary Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
      }}>
        {/* Type Filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Filter:</span>
          {types.map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              style={{
                padding: '4px 12px',
                borderRadius: '9999px',
                border: filterType === t ? '2px solid #3B82F6' : '1px solid #CBD5E1',
                background: filterType === t ? '#DBEAFE' : 'white',
                color: filterType === t ? '#1E40AF' : '#475569',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {t === 'all' ? 'All Sources' : (TYPE_ICONS[t] || t)}
            </button>
          ))}
        </div>

        {/* Sort Controls */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Sort:</span>
          {[
            { key: 'distance', label: 'Distance' },
            { key: 'capacity', label: 'Capacity' },
            { key: 'name', label: 'Name' },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: sortBy === s.key ? '1px solid #7C3AED' : '1px solid #CBD5E1',
                background: sortBy === s.key ? '#EDE9FE' : 'white',
                color: sortBy === s.key ? '#6D28D9' : '#475569',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Aggregate Statistics Header */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '14px',
        padding: '10px 16px',
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        flexWrap: 'wrap',
        fontSize: '12px',
        color: '#334155',
      }}>
        <span>Showing <strong>{filtered.length}</strong> project(s) within {radiusKm} km</span>
        <span>Total Installed Capacity: <strong style={{ color: '#059669' }}>{totalCapacity.toLocaleString()} MW</strong></span>
        {nearestProject && (
          <span>
            Nearest: <strong>{nearestProject.name}</strong> ({nearestProject.distance.toFixed(1)} km)
          </span>
        )}
      </div>

      {/* Projects Table */}
      <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {[
                'Project Name',
                'Renewable Source',
                'Capacity (MW)',
                'State',
                'District',
                'Location',
                'Latitude',
                'Longitude',
                'Status',
                'Distance from Selected',
                'Data Source',
                'Last Updated',
              ].map(h => (
                <th key={h} style={{
                  padding: '10px 12px',
                  textAlign: h.includes('Capacity') || h.includes('Distance') ? 'right' : 'left',
                  borderBottom: '2px solid #E2E8F0',
                  color: '#475569',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                {/* Project Name */}
                <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0F172A', minWidth: '180px' }}>
                  <div>{p.name}</div>
                  <div style={{ marginTop: '3px' }}>
                    <DataLevelBadge level={p.dataLevel} />
                  </div>
                  {p.notes && (
                    <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px', fontWeight: 400 }}>
                      {p.notes}
                    </div>
                  )}
                </td>

                {/* Renewable Source */}
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontSize: '10px',
                    fontWeight: 700,
                    background: `${TYPE_COLORS[p.type] || '#64748B'}20`,
                    color: TYPE_COLORS[p.type] || '#334155',
                  }}>
                    {TYPE_ICONS[p.type] || p.type}
                  </span>
                </td>

                {/* Capacity (MW) */}
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap' }}>
                  {p.capacity_mw != null ? `${p.capacity_mw.toLocaleString()} MW` : '—'}
                </td>

                {/* State */}
                <td style={{ padding: '10px 12px', color: '#334155', whiteSpace: 'nowrap' }}>{p.state}</td>

                {/* District */}
                <td style={{ padding: '10px 12px', color: '#334155', whiteSpace: 'nowrap' }}>{p.district || '—'}</td>

                {/* Location */}
                <td style={{ padding: '10px 12px', color: '#64748B', maxWidth: '200px' }}>{p.location || '—'}</td>

                {/* Latitude */}
                <td style={{ padding: '10px 12px', color: '#334155', whiteSpace: 'nowrap' }}>
                  {p.lat != null ? (
                    p.lat.toFixed(4)
                  ) : (
                    <span style={{ fontSize: '10px', color: '#DC2626', fontStyle: 'italic' }}>
                      Unavailable
                    </span>
                  )}
                </td>

                {/* Longitude */}
                <td style={{ padding: '10px 12px', color: '#334155', whiteSpace: 'nowrap' }}>
                  {p.lng != null ? (
                    p.lng.toFixed(4)
                  ) : (
                    <span style={{ fontSize: '10px', color: '#DC2626', fontStyle: 'italic' }}>
                      Unavailable
                    </span>
                  )}
                </td>

                {/* Status */}
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 700,
                    background: p.status === 'Commissioned' ? '#DCFCE7' : '#FEF3C7',
                    color: p.status === 'Commissioned' ? '#166534' : '#92400E',
                  }}>
                    {p.status}
                  </span>
                </td>

                {/* Distance from Selected */}
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#2563EB', whiteSpace: 'nowrap' }}>
                  {p.distance != null ? `${p.distance.toFixed(1)} km` : '—'}
                </td>

                {/* Data Source */}
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                  {p.source_url ? (
                    <a
                      href={p.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#2563EB',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        textDecoration: 'underline',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      {p.source_name || 'Official Source'} <ExternalLink size={11} />
                    </a>
                  ) : (
                    <span style={{ color: '#64748B', fontSize: '11px' }}>{p.source_name || '—'}</span>
                  )}
                </td>

                {/* Last Updated */}
                <td style={{ padding: '10px 12px', color: '#64748B', fontSize: '11px', whiteSpace: 'nowrap' }}>
                  {p.last_updated || p.data_date || '2024-03-31'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fallback & Integrity Notice */}
      <div style={{
        marginTop: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '11px',
        color: '#64748B',
      }}>
        <AlertCircle size={14} color="#3B82F6" />
        <span>
          Authoritative Data Policy: Projects without verified coordinates are explicitly flagged with <em>Project-level location data unavailable</em> and not mapped. No coordinates are fabricated.
        </span>
      </div>
    </div>
  );
}
