import React, { useState, useEffect, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import {
  Search, MapPin, Navigation, Sun, Wind, Zap, Layers,
  Compass, AlertTriangle, RefreshCw, BarChart2, ShieldCheck, Database, Info, Filter
} from 'lucide-react';
import IndiaMap from '../components/IndiaMap';
import WeatherPanel from '../components/WeatherPanel';
import ProjectsTable from '../components/ProjectsTable';
import ComparisonMatrix from '../components/ComparisonMatrix';
import GenerationForecast from '../components/GenerationForecast';
import AssessmentReport from '../components/AssessmentReport';
import ScoreGauge from '../components/ScoreGauge';
import {
  VERIFIED_PROJECTS,
  STATE_CAPACITY,
  DATA_SOURCES,
  INDIA_STATES_DISTRICTS
} from '../data/renewableProjects';
import {
  calculateSolarScore,
  calculateWindScore,
  getProjectsNearLocation,
  generateAssessment,
  forecastGeneration
} from '../utils/renewableEngine';

const RADIUS_OPTIONS = [5, 10, 25, 50, 100, 250];

// Preset locations to test arbitrary regions across India as required
const PRESET_LOCATIONS = [
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558 },
  { name: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lng: 78.1198 },
  { name: 'Tirunelveli', state: 'Tamil Nadu', lat: 8.7139, lng: 77.7567 },
  { name: 'Thoothukudi', state: 'Tamil Nadu', lat: 8.7642, lng: 78.1348 },
  { name: 'Kanyakumari', state: 'Tamil Nadu', lat: 8.0883, lng: 77.5385 },
  { name: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lng: 73.0243 },
  { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
  { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
  { name: 'Kutch', state: 'Gujarat', lat: 23.7337, lng: 69.8597 },
  { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { name: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673 },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185 },
];

export default function RenewableEnergy() {
  // Location selection state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    name: 'Coimbatore',
    nearestCity: 'Coimbatore',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    lat: 11.0168,
    lng: 76.9558,
  });

  // Direct lat/lng inputs
  const [customLat, setCustomLat] = useState('11.0168');
  const [customLng, setCustomLng] = useState('76.9558');

  // Optional State & District filter
  const [filterState, setFilterState] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');

  // Search radius
  const [radiusKm, setRadiusKm] = useState(50);

  // Weather & engine outputs
  const [weatherData, setWeatherData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  // Computed state
  const [solarScore, setSolarScore] = useState(null);
  const [windScore, setWindScore] = useState(null);
  const [nearbyProjects, setNearbyProjects] = useState([]);
  const [assessment, setAssessment] = useState(null);

  // Reverse geocoding helper via Nominatim
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
        { headers: { 'User-Agent': 'RenewableEnergyIndiaApp/1.0' } }
      );
      if (!res.ok) throw new Error('Geocoding failed');
      const data = await res.json();
      const addr = data.address || {};
      const name = addr.city || addr.town || addr.village || addr.suburb || addr.county || 'Selected Location';
      const district = addr.state_district || addr.county || addr.district || '';
      const state = addr.state || '';
      const nearestCity = addr.city || addr.town || district || name;

      return {
        name,
        nearestCity,
        district,
        state,
        lat,
        lng,
      };
    } catch (e) {
      console.warn('Reverse geocode fallback:', e);
      return {
        name: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        nearestCity: 'Nearby Settlement',
        district: 'Regional District',
        state: 'India',
        lat,
        lng,
      };
    }
  };

  // Fetch Open-Meteo weather data
  const fetchWeather = useCallback(async (lat, lng) => {
    setLoadingWeather(true);
    setWeatherError(null);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,shortwave_radiation&daily=temperature_2m_mean,relative_humidity_2m_mean,cloud_cover_mean,wind_speed_10m_max,wind_speed_100m_max,shortwave_radiation_sum,sunshine_duration&timezone=Asia%2FKolkata`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Weather API error (${res.status})`);
      const data = await res.json();
      setWeatherData(data);

      const solar = calculateSolarScore(data);
      const wind = calculateWindScore(data);
      setSolarScore(solar);
      setWindScore(wind);

      // Distance analysis: Filter nearby projects within radius
      const nearby = getProjectsNearLocation(lat, lng, radiusKm, VERIFIED_PROJECTS);
      setNearbyProjects(nearby);

      // Generate preliminary assessment
      const ass = generateAssessment(solar, wind, nearby, data);
      setAssessment(ass);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setWeatherError('Failed to fetch real-time weather from Open-Meteo. Please check internet connectivity or retry.');
    } finally {
      setLoadingWeather(false);
    }
  }, [radiusKm]);

  // Recalculate distance and assessment when radius changes
  useEffect(() => {
    if (selectedLocation?.lat != null && weatherData) {
      const nearby = getProjectsNearLocation(selectedLocation.lat, selectedLocation.lng, radiusKm, VERIFIED_PROJECTS);
      setNearbyProjects(nearby);
      if (solarScore && windScore) {
        setAssessment(generateAssessment(solarScore, windScore, nearby, weatherData));
      }
    }
  }, [radiusKm, selectedLocation, weatherData, solarScore, windScore]);

  // Fetch weather when selectedLocation coordinates change
  useEffect(() => {
    if (selectedLocation?.lat != null && selectedLocation?.lng != null) {
      setCustomLat(selectedLocation.lat.toFixed(4));
      setCustomLng(selectedLocation.lng.toFixed(4));
      fetchWeather(selectedLocation.lat, selectedLocation.lng);
    }
  }, [selectedLocation?.lat, selectedLocation?.lng, fetchWeather]);

  // Handle Interactive Map Click (SEARCH LOCATION -> MAP -> SELECT LOCATION)
  const handleMapClick = async ({ lat, lng }) => {
    const loc = await reverseGeocode(lat, lng);
    setSelectedLocation(loc);
  };

  // Handle Text Search via Nominatim
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&q=${encodeURIComponent(searchQuery)}&limit=6&addressdetails=1`,
        { headers: { 'User-Agent': 'RenewableEnergyIndiaApp/1.0' } }
      );
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const addr = item.address || {};
    const name = addr.city || addr.town || addr.village || addr.suburb || item.display_name.split(',')[0];
    const district = addr.state_district || addr.county || '';
    const state = addr.state || '';
    setSelectedLocation({
      name,
      nearestCity: addr.city || addr.town || district || name,
      district,
      state,
      lat,
      lng,
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  // Handle GPS / Geolocation
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const loc = await reverseGeocode(latitude, longitude);
        setSelectedLocation(loc);
      },
      (err) => {
        alert('Could not retrieve GPS coordinates: ' + err.message);
      }
    );
  };

  // Handle direct Latitude / Longitude entry
  const handleManualCoordSubmit = async (e) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (isNaN(lat) || isNaN(lng) || lat < 6 || lat > 38 || lng < 68 || lng > 98) {
      alert('Please enter valid coordinates within India (Lat: 6.0 to 38.0, Lng: 68.0 to 98.0).');
      return;
    }
    const loc = await reverseGeocode(lat, lng);
    setSelectedLocation(loc);
  };

  // Handle optional State / District filter selection
  const handleStateFilterChange = (stateName) => {
    setFilterState(stateName);
    setFilterDistrict('');
    const stateObj = INDIA_STATES_DISTRICTS.find(s => s.state === stateName);
    if (stateObj) {
      setSelectedLocation({
        name: stateObj.state,
        nearestCity: stateObj.districts[0]?.name || stateObj.state,
        district: stateObj.districts[0]?.name || '',
        state: stateObj.state,
        lat: stateObj.lat,
        lng: stateObj.lng,
      });
    }
  };

  const handleDistrictFilterChange = (districtName) => {
    setFilterDistrict(districtName);
    const stateObj = INDIA_STATES_DISTRICTS.find(s => s.state === filterState);
    const distObj = stateObj?.districts.find(d => d.name === districtName);
    if (distObj) {
      setSelectedLocation({
        name: distObj.name,
        nearestCity: distObj.name,
        district: distObj.name,
        state: filterState,
        lat: distObj.lat,
        lng: distObj.lng,
      });
    }
  };

  // Matched state capacity from MNRE
  const matchedStateCap = STATE_CAPACITY.find(
    (s) => selectedLocation?.state && s.state.toLowerCase() === selectedLocation.state.toLowerCase()
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto', color: '#0F172A', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* ─── APP HEADER ──────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            color: 'white',
          }}>
            <Zap size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, margin: 0, color: '#0F172A' }}>
              India Renewable Energy Assessment & Location Intelligence
            </h1>
            <p style={{ margin: '2px 0 0', color: '#64748B', fontSize: '13px' }}>
              Select ANY location in India via Search, Interactive Map, or Coordinates. Retrieve live weather, discover verified existing projects, and view objective resource suitability assessments.
            </p>
          </div>
        </div>
      </div>

      {/* ─── SECTION 1: LOCATION SEARCH (ANY LOCATION IN INDIA) ──────────────── */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        marginBottom: '20px',
        border: '1px solid #E2E8F0',
      }}>
        <div style={{ fontSize: '15px', fontWeight: 800, color: '#1E293B', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={18} color="#3B82F6" />
          1. Location Selection (Any Location in India)
        </div>

        {/* Search, Lat/Lng & GPS Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          
          {/* 1.1 Text Search Box */}
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              Search Any City, Town, Village, or Landmark in India:
            </label>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Coimbatore, Jodhpur, Kutch, Thoothukudi, Kochi..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                }}
              />
              <button
                type="submit"
                disabled={isSearching}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: '#3B82F6',
                  color: 'white',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Search size={16} />
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>

            {/* Nominatim Autocomplete Suggestions */}
            {searchResults.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'white',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                marginTop: '4px',
                boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                zIndex: 1000,
                maxHeight: '240px',
                overflowY: 'auto',
              }}>
                {searchResults.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectSearchResult(item)}
                    style={{
                      padding: '10px 14px',
                      borderBottom: idx < searchResults.length - 1 ? '1px solid #F1F5F9' : 'none',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{item.display_name}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      Lat: {parseFloat(item.lat).toFixed(4)}, Lng: {parseFloat(item.lon).toFixed(4)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 1.2 Direct Latitude / Longitude & GPS */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              Direct Coordinates & GPS Device Input:
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <form onSubmit={handleManualCoordSubmit} style={{ display: 'flex', gap: '8px', flex: 1 }}>
                <input
                  type="text"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  placeholder="Latitude (6 to 38)"
                  style={{ width: '45%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
                <input
                  type="text"
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  placeholder="Longitude (68 to 98)"
                  style={{ width: '45%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#0F172A',
                    color: 'white',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Locate
                </button>
              </form>
              <button
                onClick={handleUseGPS}
                title="Detect GPS coordinates from device"
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <Navigation size={16} /> GPS
              </button>
            </div>
          </div>
        </div>

        {/* 1.3 Optional State / District Filter */}
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          padding: '10px 14px',
          background: '#F8FAFC',
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
          marginBottom: '14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>
            <Filter size={15} color="#6366F1" /> Optional Administrative Filters:
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={filterState}
              onChange={(e) => handleStateFilterChange(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: 600 }}
            >
              <option value="">Select State (Optional)...</option>
              {INDIA_STATES_DISTRICTS.map((s) => (
                <option key={s.state} value={s.state}>{s.state}</option>
              ))}
            </select>

            <select
              value={filterDistrict}
              onChange={(e) => handleDistrictFilterChange(e.target.value)}
              disabled={!filterState}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '12px',
                fontWeight: 600,
                opacity: filterState ? 1 : 0.6,
              }}
            >
              <option value="">Select District / City...</option>
              {(INDIA_STATES_DISTRICTS.find(s => s.state === filterState)?.districts || []).map((d) => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 1.4 Quick Select Presets across India */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, marginRight: '4px' }}>Quick Presets:</span>
          {PRESET_LOCATIONS.map((loc) => (
            <button
              key={loc.name}
              onClick={() => setSelectedLocation({
                name: loc.name,
                nearestCity: loc.name,
                district: loc.name,
                state: loc.state,
                lat: loc.lat,
                lng: loc.lng,
              })}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: selectedLocation?.name === loc.name ? '1px solid #3B82F6' : '1px solid #E2E8F0',
                background: selectedLocation?.name === loc.name ? '#EFF6FF' : '#F8FAFC',
                color: selectedLocation?.name === loc.name ? '#1D4ED8' : '#475569',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {loc.name}
            </button>
          ))}
        </div>
      </div>

      {/* ─── MANDATORY SELECTED LOCATION CARD (6 ATTRIBUTES) ────────────────── */}
      <div style={{
        background: '#F8FAFC',
        border: '2px solid #CBD5E1',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: '#FEE2E2',
            padding: '10px',
            borderRadius: '50%',
            display: 'flex',
            color: '#EF4444',
          }}>
            <MapPin size={26} />
          </div>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', fontWeight: 700 }}>
              Active Analyzed Location
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A' }}>
              {selectedLocation.name || 'Selected Location'}
            </div>
            <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
              Nearest City: <strong>{selectedLocation.nearestCity || '—'}</strong> | District: <strong>{selectedLocation.district || '—'}</strong> | State: <strong>{selectedLocation.state || '—'}</strong>
            </div>
          </div>
        </div>

        {/* Coordinates & Search Radius Selector */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '12px', color: '#334155', background: 'white', padding: '6px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
            <span>Latitude: <strong style={{ color: '#0F172A' }}>{selectedLocation.lat?.toFixed(4)}</strong></span>
            <span style={{ marginLeft: '12px' }}>Longitude: <strong style={{ color: '#0F172A' }}>{selectedLocation.lng?.toFixed(4)}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#475569', fontWeight: 700 }}>Search Radius:</span>
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '2px solid #3B82F6',
                background: 'white',
                fontSize: '12px',
                fontWeight: 800,
                color: '#1E40AF',
                cursor: 'pointer',
              }}
            >
              {RADIUS_OPTIONS.map((r) => (
                <option key={r} value={r}>{r} km radius</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ─── SECTION 2: INTERACTIVE MAP (MULTI-LAYER LEAFLET) ───────────────── */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        marginBottom: '24px',
        border: '1px solid #E2E8F0',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#6366F1" />
            2. Interactive Map (India-wide Selection & Renewable Projects Layers)
          </div>
          <span style={{ fontSize: '12px', color: '#3B82F6', fontWeight: 600 }}>
            Click anywhere on the map to reverse-geocode & analyze coordinates
          </span>
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          gap: '14px',
          flexWrap: 'wrap',
          marginBottom: '12px',
          fontSize: '11px',
          padding: '8px 12px',
          background: '#F8FAFC',
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
        }}>
          <span style={{ fontWeight: 700 }}>Map Legend:</span>
          <span>📍 Layer 1: Selected Location ({radiusKm} km radius circle)</span>
          <span style={{ color: '#D97706', fontWeight: 700 }}>☀️ Layer 2: Solar Projects</span>
          <span style={{ color: '#2563EB', fontWeight: 700 }}>🌬️ Layer 3: Wind Projects</span>
          <span style={{ color: '#7C3AED', fontWeight: 700 }}>⚡ Layer 4: Hybrid Projects</span>
          <span style={{ color: '#06B6D4', fontWeight: 700 }}>💧/🌱 Layer 5: Other RE (Hydro, Biomass)</span>
        </div>

        <div style={{ height: '500px', width: '100%', borderRadius: '10px', overflow: 'hidden' }}>
          <IndiaMap
            selectedLocation={selectedLocation}
            nearbyProjects={nearbyProjects}
            allProjects={VERIFIED_PROJECTS}
            radiusKm={radiusKm}
            onMapClick={handleMapClick}
          />
        </div>
      </div>

      {/* ─── SECTION 3: LIVE WEATHER AND METEOROLOGICAL PARAMETERS ──────────── */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        marginBottom: '24px',
        border: '1px solid #E2E8F0',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sun size={18} color="#F59E0B" />
            3. Live Meteorological & Resource Conditions (Open-Meteo API)
          </div>
          {loadingWeather && (
            <span style={{ fontSize: '12px', color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} className="animate-spin" /> Fetching live observations...
            </span>
          )}
        </div>

        {weatherError ? (
          <div style={{ padding: '14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#991B1B', fontSize: '13px' }}>
            {weatherError}
          </div>
        ) : (
          <WeatherPanel weather={weatherData} />
        )}
      </div>

      {/* ─── SECTION 4 & 5: SOLAR & WIND ANALYSIS WITH SUITABILITY SCORES ───── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Section 4: Solar Analysis */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          border: '1px solid #E2E8F0',
        }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#92400E', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sun size={18} color="#F59E0B" />
            4. Solar Resource & Suitability Analysis
          </div>
          {solarScore ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 16px' }}>
                <ScoreGauge score={solarScore.score} label="Solar Score" color="#F59E0B" />
              </div>
              <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '4px' }}>
                  <span>Daily Solar GHI:</span>
                  <strong>{solarScore.ghiKwh} kWh/m²/day</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '4px' }}>
                  <span>Sunshine Duration:</span>
                  <strong>{solarScore.sunshineHrs} hrs/day</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '4px' }}>
                  <span>Mean Cloud Cover:</span>
                  <strong>{solarScore.cloudCover}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '4px' }}>
                  <span>Irradiance Points:</span>
                  <strong>{solarScore.components.ghi} / 60</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '4px' }}>
                  <span>Sunshine Hours Points:</span>
                  <strong>{solarScore.components.sunshine} / 25</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Cloud Clearance Points:</span>
                  <strong>{solarScore.components.cloudClearance} / 15</strong>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: '#94A3B8', fontSize: '13px' }}>Awaiting weather data...</div>
          )}
        </div>

        {/* Section 5: Wind Analysis */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          border: '1px solid #E2E8F0',
        }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#1E40AF', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wind size={18} color="#3B82F6" />
            5. Wind Resource & Suitability Analysis
          </div>
          {windScore ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 16px' }}>
                <ScoreGauge score={windScore.score} label="Wind Score" color="#3B82F6" />
              </div>
              <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '4px' }}>
                  <span>Wind Speed (10m surface):</span>
                  <strong>{windScore.wind10m_ms} m/s ({windScore.wind10m_kmh} km/h)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '4px' }}>
                  <span>Wind Speed (100m hub height):</span>
                  <strong>{windScore.wind100m_ms} m/s</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '4px' }}>
                  <span>IEC Wind Turbine Class:</span>
                  <strong style={{ fontSize: '11px' }}>{windScore.iecClass}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '4px' }}>
                  <span>Hub-Height Class Points:</span>
                  <strong>{windScore.components.hubHeight} / 75</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Surface Wind Velocity Points:</span>
                  <strong>{windScore.components.surface} / 25</strong>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: '#94A3B8', fontSize: '13px' }}>Awaiting weather data...</div>
          )}
        </div>
      </div>

      {/* ─── SECTION 6: EXISTING RENEWABLE PROJECTS (DISTANCE & CAPACITY) ────── */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        marginBottom: '24px',
        border: '1px solid #E2E8F0',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} color="#059669" />
              Existing Renewable Energy Projects Near Selected Location
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
              Identified within {radiusKm} km search radius | Verified records from CEA, MNRE, NIWE & SECI
            </div>
          </div>
        </div>

        <ProjectsTable
          projects={nearbyProjects}
          selectedLocation={selectedLocation}
          radiusKm={radiusKm}
        />
      </div>

      {/* ─── SECTION 7: PROJECT MAP & CAPACITY DISTRIBUTION ─────────────────── */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        marginBottom: '24px',
        border: '1px solid #E2E8F0',
      }}>
        <div style={{ fontSize: '15px', fontWeight: 800, color: '#1E293B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={18} color="#059669" />
          7. Project Map & Regional Capacity Distribution
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '14px',
        }}>
          {[
            { label: 'Nearby Solar Capacity', val: `${nearbyProjects.filter(p => p.type === 'solar').reduce((s, p) => s + (p.capacity_mw || 0), 0).toLocaleString()} MW`, color: '#D97706' },
            { label: 'Nearby Wind Capacity', val: `${nearbyProjects.filter(p => p.type === 'wind').reduce((s, p) => s + (p.capacity_mw || 0), 0).toLocaleString()} MW`, color: '#2563EB' },
            { label: 'Nearby Hybrid Capacity', val: `${nearbyProjects.filter(p => p.type === 'hybrid').reduce((s, p) => s + (p.capacity_mw || 0), 0).toLocaleString()} MW`, color: '#7C3AED' },
            { label: 'Nearby Other RE', val: `${nearbyProjects.filter(p => !['solar', 'wind', 'hybrid'].includes(p.type)).reduce((s, p) => s + (p.capacity_mw || 0), 0).toLocaleString()} MW`, color: '#059669' },
          ].map(c => (
            <div key={c.label} style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>{c.label}</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: c.color, marginTop: '2px' }}>{c.val}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
          Interactive geographical layer positions are rendered on Section 2 above. You can toggle between <em>Nearby ({radiusKm} km)</em> and <em>All India</em> project views using the overlay control in the top-left of the map.
        </p>
      </div>

      {/* ─── SECTION 8: COMPARISON (SOLAR vs WIND vs HYBRID) ────────────────── */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        marginBottom: '24px',
        border: '1px solid #E2E8F0',
      }}>
        <div style={{ fontSize: '15px', fontWeight: 800, color: '#1E293B', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 size={18} color="#7C3AED" />
          8. Multi-Resource Comparison (Solar vs Wind vs Hybrid)
        </div>
        <ComparisonMatrix
          solarScore={solarScore}
          windScore={windScore}
          nearbyProjects={nearbyProjects}
          forecast={assessment?.forecast}
        />
      </div>

      {/* ─── SECTION 9: FORECAST (PREDICTED RENEWABLE GENERATION) ────────────── */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        marginBottom: '24px',
        border: '1px solid #E2E8F0',
      }}>
        <div style={{ fontSize: '15px', fontWeight: 800, color: '#1E293B', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} color="#2563EB" />
          9. Renewable Generation Forecast & Yield Projections
        </div>
        <GenerationForecast
          weather={weatherData}
          forecast={assessment?.forecast}
          solarScore={solarScore}
          windScore={windScore}
        />
      </div>

      {/* ─── SECTION 10: FINAL ASSESSMENT REPORT ────────────────────────────── */}
      <div style={{ marginBottom: '24px' }}>
        <AssessmentReport
          assessment={assessment}
          locationName={selectedLocation.name}
          stateName={selectedLocation.state}
          districtName={selectedLocation.district}
          lat={selectedLocation.lat}
          lng={selectedLocation.lng}
          stateCapacity={matchedStateCap}
        />
      </div>

      {/* ─── SECTION 11: DATA SOURCES & ATTRIBUTION ─────────────────────────── */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        border: '1px solid #E2E8F0',
      }}>
        <div style={{ fontSize: '15px', fontWeight: 800, color: '#1E293B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="#2563EB" />
          11. Official Data Sources & Attributions
        </div>
        <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '14px' }}>
          In accordance with the transparency requirements, all meteorological, geographic, and installed-capacity data are linked directly to authoritative public datasets:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {Object.entries(DATA_SOURCES).map(([key, src]) => (
            <div key={key} style={{ padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', background: '#F8FAFC' }}>
              <div style={{ fontWeight: 800, fontSize: '13px', color: '#0F172A', marginBottom: '2px' }}>{src.name}</div>
              <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '6px' }}>{src.description}</div>
              <div style={{ fontSize: '11px', color: '#475569' }}>
                Data Level: <strong>{src.note}</strong> | Data Date: <strong>{src.data_date}</strong>
              </div>
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '11px', color: '#2563EB', textDecoration: 'underline', marginTop: '4px', display: 'inline-block', fontWeight: 600 }}
              >
                View Official Source &rarr;
              </a>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
