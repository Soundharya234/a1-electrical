import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  LayersControl,
  LayerGroup,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';

// ─── Fix Leaflet default icon paths in Vite ──────────────────────────────────
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

// ─── Custom Marker Icons with Distinct Colors & Badges ───────────────────────

function createMarkerIcon(color, emoji) {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background: ${color};
        width: 34px; height: 34px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex; align-items: center; justify-content: center;
        border: 2px solid white;
        box-shadow: 0 3px 8px rgba(0,0,0,0.35);
        cursor: pointer;
      ">
        <span style="transform: rotate(45deg); font-size: 15px; line-height: 1;">${emoji}</span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
}

const ICONS = {
  selected: createMarkerIcon('#EF4444', '📍'),
  solar: createMarkerIcon('#F59E0B', '☀️'),
  wind: createMarkerIcon('#3B82F6', '🌬️'),
  hybrid: createMarkerIcon('#8B5CF6', '⚡'),
  hydro: createMarkerIcon('#06B6D4', '💧'),
  biomass: createMarkerIcon('#16A34A', '🌱'),
};

// ─── Map Click Handler ───────────────────────────────────────────────────────

function MapClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      if (onClick) onClick(e.latlng);
    },
  });
  return null;
}

// ─── Map Recenter Sub-Component ──────────────────────────────────────────────

function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) {
      map.flyTo([lat, lng], 8, { duration: 1.2 });
    }
  }, [lat, lng, map]);
  return null;
}

// ─── Project Popup Card ──────────────────────────────────────────────────────

function ProjectPopup({ project }) {
  return (
    <div style={{ minWidth: '240px', fontSize: '12px', lineHeight: 1.5, color: '#0F172A' }}>
      <div style={{
        fontWeight: 800,
        fontSize: '13px',
        marginBottom: '6px',
        borderBottom: '1px solid #E2E8F0',
        paddingBottom: '4px',
        color: '#0F172A'
      }}>
        {project.name}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
        <tbody>
          <tr>
            <td style={{ color: '#64748B', fontWeight: 600, padding: '2px 0' }}>Type:</td>
            <td style={{ fontWeight: 700, textTransform: 'capitalize' }}>
              {project.type === 'hybrid' ? '☀️🌬️ Solar-Wind Hybrid' : project.type}
            </td>
          </tr>
          <tr>
            <td style={{ color: '#64748B', fontWeight: 600, padding: '2px 0' }}>Installed Capacity:</td>
            <td style={{ fontWeight: 800, color: '#059669' }}>
              {project.capacity_mw ? `${project.capacity_mw.toLocaleString()} MW` : '—'}
            </td>
          </tr>
          <tr>
            <td style={{ color: '#64748B', fontWeight: 600, padding: '2px 0' }}>Location:</td>
            <td>{project.location || project.district || '—'}</td>
          </tr>
          <tr>
            <td style={{ color: '#64748B', fontWeight: 600, padding: '2px 0' }}>District & State:</td>
            <td>{project.district ? `${project.district}, ` : ''}{project.state}</td>
          </tr>
          <tr>
            <td style={{ color: '#64748B', fontWeight: 600, padding: '2px 0' }}>Coordinates:</td>
            <td>
              {project.lat != null && project.lng != null ? (
                `${project.lat.toFixed(4)}, ${project.lng.toFixed(4)}`
              ) : (
                <span style={{ color: '#DC2626' }}>Project-level location data unavailable</span>
              )}
            </td>
          </tr>
          <tr>
            <td style={{ color: '#64748B', fontWeight: 600, padding: '2px 0' }}>Status:</td>
            <td>
              <span style={{
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 700,
                background: project.status === 'Commissioned' ? '#DCFCE7' : '#FEF3C7',
                color: project.status === 'Commissioned' ? '#166534' : '#92400E'
              }}>
                {project.status}
              </span>
            </td>
          </tr>
          {project.distance != null && (
            <tr>
              <td style={{ color: '#64748B', fontWeight: 600, padding: '2px 0' }}>Distance from Selected:</td>
              <td style={{ fontWeight: 700, color: '#2563EB' }}>
                {project.distance.toFixed(1)} km
              </td>
            </tr>
          )}
          <tr>
            <td style={{ color: '#64748B', fontWeight: 600, padding: '2px 0' }}>Data Level:</td>
            <td>
              <span style={{
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 600,
                background: project.dataLevel === 'project' ? '#E0F2FE' : '#F1F5F9',
                color: project.dataLevel === 'project' ? '#0369A1' : '#475569'
              }}>
                {project.dataLevel === 'project' ? '📌 Project-Level' : project.dataLevel === 'district' ? '📍 District-Level' : '🗺️ State-Level'}
              </span>
            </td>
          </tr>
          <tr>
            <td style={{ color: '#64748B', fontWeight: 600, padding: '2px 0' }}>Data Source:</td>
            <td>
              {project.source_url ? (
                <a
                  href={project.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#2563EB', textDecoration: 'underline' }}
                >
                  {project.source_name}
                </a>
              ) : (
                project.source_name || '—'
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─── Main IndiaMap Component ─────────────────────────────────────────────────

export default function IndiaMap({
  selectedLocation,
  nearbyProjects = [],
  allProjects = [],
  radiusKm = 50,
  onMapClick,
}) {
  const { lat, lng, name, district, state } = selectedLocation || {};
  const [showAllIndiaProjects, setShowAllIndiaProjects] = useState(false);

  // Projects to display based on toggle
  const activeProjectPool = showAllIndiaProjects ? allProjects : nearbyProjects;

  const solarProjects = (activeProjectPool || []).filter(p => p.type === 'solar' && p.lat != null && p.lng != null);
  const windProjects = (activeProjectPool || []).filter(p => p.type === 'wind' && p.lat != null && p.lng != null);
  const hybridProjects = (activeProjectPool || []).filter(p => p.type === 'hybrid' && p.lat != null && p.lng != null);
  const otherProjects = (activeProjectPool || []).filter(p => !['solar', 'wind', 'hybrid'].includes(p.type) && p.lat != null && p.lng != null);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Map Control Overlay */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(4px)',
        border: '1px solid #CBD5E1',
        borderRadius: '8px',
        padding: '8px 12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '12px',
      }}>
        <span style={{ fontWeight: 700, color: '#0F172A' }}>Project Display:</span>
        <button
          onClick={() => setShowAllIndiaProjects(false)}
          style={{
            padding: '4px 10px',
            borderRadius: '6px',
            border: !showAllIndiaProjects ? '1px solid #3B82F6' : '1px solid #CBD5E1',
            background: !showAllIndiaProjects ? '#EFF6FF' : 'white',
            color: !showAllIndiaProjects ? '#1D4ED8' : '#64748B',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          Nearby ({nearbyProjects.filter(p => p.lat != null).length} within {radiusKm} km)
        </button>
        <button
          onClick={() => setShowAllIndiaProjects(true)}
          style={{
            padding: '4px 10px',
            borderRadius: '6px',
            border: showAllIndiaProjects ? '1px solid #3B82F6' : '1px solid #CBD5E1',
            background: showAllIndiaProjects ? '#EFF6FF' : 'white',
            color: showAllIndiaProjects ? '#1D4ED8' : '#64748B',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          All India Projects ({allProjects.filter(p => p.lat != null).length})
        </button>
      </div>

      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: '100%', width: '100%', borderRadius: '10px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onClick={onMapClick} />
        {lat != null && lng != null && <MapRecenter lat={lat} lng={lng} />}

        <LayersControl position="topright">
          {/* Layer 1: Selected Location & Radius Circle */}
          <LayersControl.Overlay checked name="📍 Layer 1: Selected Location & Radius">
            <LayerGroup>
              {lat != null && lng != null && (
                <>
                  <Marker position={[lat, lng]} icon={ICONS.selected}>
                    <Popup>
                      <div style={{ fontSize: '12px' }}>
                        <strong style={{ color: '#EF4444' }}>📍 Selected Location</strong><br />
                        <strong>{name || 'Custom Coordinate'}</strong><br />
                        {district ? `${district}, ` : ''}{state || 'India'}<br />
                        <span style={{ color: '#64748B', fontSize: '11px' }}>
                          Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
                        </span><br />
                        <span style={{ color: '#2563EB', fontSize: '11px', fontWeight: 600 }}>
                          Search Radius: {radiusKm} km
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                  <Circle
                    center={[lat, lng]}
                    radius={radiusKm * 1000}
                    pathOptions={{
                      color: '#EF4444',
                      fillColor: '#EF4444',
                      fillOpacity: 0.08,
                      weight: 1.5,
                      dashArray: '4, 4',
                    }}
                  />
                </>
              )}
            </LayerGroup>
          </LayersControl.Overlay>

          {/* Layer 2: Existing Solar Projects */}
          <LayersControl.Overlay checked name="☀️ Layer 2: Existing Solar Projects">
            <LayerGroup>
              {solarProjects.map(p => (
                <Marker key={p.id} position={[p.lat, p.lng]} icon={ICONS.solar}>
                  <Popup><ProjectPopup project={p} /></Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          {/* Layer 3: Existing Wind Projects */}
          <LayersControl.Overlay checked name="🌬️ Layer 3: Existing Wind Projects">
            <LayerGroup>
              {windProjects.map(p => (
                <Marker key={p.id} position={[p.lat, p.lng]} icon={ICONS.wind}>
                  <Popup><ProjectPopup project={p} /></Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          {/* Layer 4: Existing Hybrid Projects */}
          <LayersControl.Overlay checked name="⚡ Layer 4: Existing Hybrid Projects">
            <LayerGroup>
              {hybridProjects.map(p => (
                <Marker key={p.id} position={[p.lat, p.lng]} icon={ICONS.hybrid}>
                  <Popup><ProjectPopup project={p} /></Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          {/* Layer 5: Other Renewable Projects (Hydro, Biomass) */}
          <LayersControl.Overlay checked name="💧/🌱 Layer 5: Other RE Projects (Hydro, Biomass)">
            <LayerGroup>
              {otherProjects.map(p => (
                <Marker key={p.id} position={[p.lat, p.lng]} icon={ICONS[p.type] || ICONS.biomass}>
                  <Popup><ProjectPopup project={p} /></Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>
    </div>
  );
}
