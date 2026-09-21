/**
 * Renewable Energy Suitability Engine
 *
 * Calculates solar and wind suitability scores from Open-Meteo weather data,
 * filters nearby projects using Haversine distance, and generates a final
 * preliminary assessment report.
 *
 * Scoring methodology:
 *   Solar (0–100): GHI contribution (max 60) + Sunshine hours (max 25) + Cloud clearance (max 15)
 *   Wind  (0–100): Hub-height wind class (max 75) + Surface wind bonus (max 25)
 */

// ─── Haversine Distance ───────────────────────────────────────────────────────

/**
 * Calculate great-circle distance between two coordinates (km).
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function avg(arr) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// ─── Solar Score ─────────────────────────────────────────────────────────────

/**
 * Calculate solar suitability score (0–100) from Open-Meteo daily data.
 *
 * @param {object} weather - Open-Meteo API response
 * @returns {object|null} score breakdown or null if no data
 */
export function calculateSolarScore(weather) {
  if (!weather || !weather.daily) return null;

  const daily = weather.daily;

  // Global Horizontal Irradiance (GHI)
  // Open-Meteo: shortwave_radiation_sum is in MJ/m²/day → divide by 3.6 for kWh/m²/day
  const avgGHI_MJ = avg(daily.shortwave_radiation_sum || []);
  const avgGHI_kWh = avgGHI_MJ / 3.6;
  // India range: ~3–7.5 kWh/m²/day. Score: 6.5 kWh/m²/day earns max 60 pts.
  const ghiScore = Math.min(60, (avgGHI_kWh / 6.5) * 60);

  // Sunshine duration (seconds → hours)
  const avgSunshineHrs = avg(daily.sunshine_duration || []) / 3600;
  // 9+ hours/day earns max 25 pts.
  const sunshineScore = Math.min(25, (avgSunshineHrs / 9) * 25);

  // Cloud cover: lower is better. 100% clear sky earns max 15 pts.
  const avgCloud = avg(daily.cloud_cover_mean || daily.cloudcover_mean || [50]);
  const cloudScore = Math.max(0, ((100 - avgCloud) / 100) * 15);

  const total = Math.round(ghiScore + sunshineScore + cloudScore);

  return {
    score: Math.min(100, Math.max(0, total)),
    ghiKwh: avgGHI_kWh.toFixed(2),
    sunshineHrs: avgSunshineHrs.toFixed(1),
    cloudCover: avgCloud.toFixed(0),
    components: {
      ghi: Math.round(ghiScore),
      sunshine: Math.round(sunshineScore),
      cloudClearance: Math.round(cloudScore),
    },
  };
}

// ─── Wind Score ───────────────────────────────────────────────────────────────

/**
 * Calculate wind suitability score (0–100) from Open-Meteo daily data.
 *
 * IEC Wind Energy Classes (hub height ≈ 100 m):
 *   Class I:  > 10 m/s  — Excellent
 *   Class II:   8.5–10  — Good
 *   Class III:  6.5–8.5 — Moderate
 *   Below III:  < 6.5   — Low / sub-commercial
 *
 * @param {object} weather - Open-Meteo API response
 * @returns {object|null} score breakdown or null if no data
 */
export function calculateWindScore(weather) {
  if (!weather || !weather.daily) return null;

  const daily = weather.daily;

  // Open-Meteo daily max wind speed (km/h) → estimated daily mean (m/s)
  // Daily max ÷ 3.6 (→ m/s) × 0.65 (estimated mean-to-max ratio)
  const avgWind10m_kmh = avg(daily.wind_speed_10m_max || daily.windspeed_10m_max || []);
  const avgWind10m_ms = (avgWind10m_kmh / 3.6) * 0.65;

  const avgWind100m_kmh = avg(daily.wind_speed_100m_max || daily.windspeed_100m_max || []);
  // Extrapolate 10m → 100m if 100m data is unavailable
  const hubWind_ms =
    avgWind100m_kmh > 0
      ? (avgWind100m_kmh / 3.6) * 0.65
      : avgWind10m_ms * 1.35; // power-law extrapolation approximation

  // Score based on hub-height wind speed (IEC classes)
  let windBaseScore;
  if (hubWind_ms >= 10) windBaseScore = 75;
  else if (hubWind_ms >= 8.5) windBaseScore = 62;
  else if (hubWind_ms >= 7.0) windBaseScore = 50;
  else if (hubWind_ms >= 5.5) windBaseScore = 37;
  else if (hubWind_ms >= 4.0) windBaseScore = 22;
  else windBaseScore = Math.max(0, hubWind_ms * 5);

  // Bonus for surface wind (useful for small wind or pre-screening)
  const surfaceBonus = Math.min(25, (avgWind10m_ms / 6) * 25);

  const total = Math.round(windBaseScore + surfaceBonus);

  return {
    score: Math.min(100, Math.max(0, total)),
    wind10m_ms: avgWind10m_ms.toFixed(1),
    wind100m_ms: hubWind_ms.toFixed(1),
    wind10m_kmh: avgWind10m_kmh.toFixed(1),
    iecClass: getIECClass(hubWind_ms),
    components: {
      hubHeight: Math.round(windBaseScore),
      surface: Math.round(surfaceBonus),
    },
  };
}

export function getIECClass(speedMs) {
  if (speedMs >= 10) return 'Class I (Excellent, >10 m/s)';
  if (speedMs >= 8.5) return 'Class II (Good, 8.5–10 m/s)';
  if (speedMs >= 6.5) return 'Class III (Moderate, 6.5–8.5 m/s)';
  if (speedMs >= 5.0) return 'Below Class III (Low, 5–6.5 m/s)';
  return 'Sub-commercial (<5 m/s)';
}

// ─── Nearby Projects ──────────────────────────────────────────────────────────

/**
 * Filter and rank projects within a given radius from a coordinate.
 *
 * @param {number} lat - Selected latitude
 * @param {number} lng - Selected longitude
 * @param {number} radiusKm - Search radius in km
 * @param {Array}  projects - Full project list from renewableProjects.js
 * @returns {Array} Sorted array of projects with `distance` (km) added
 */
export function getProjectsNearLocation(lat, lng, radiusKm, projects) {
  if (lat == null || lng == null || !projects) return [];

  return projects
    .filter((p) => p.lat != null && p.lng != null)
    .map((p) => ({
      ...p,
      distance: haversineDistance(lat, lng, p.lat, p.lng),
    }))
    .filter((p) => p.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}

// ─── Forecasted Generation ────────────────────────────────────────────────────

/**
 * Estimate annual generation (MWh/yr) for a 1 MW reference installation.
 * Uses India-specific capacity factor ranges interpolated from suitability score.
 *
 * Solar CF range: 15–30% (score 0→100)
 * Wind  CF range: 10–35% (score 0→100)
 */
export function forecastGeneration(solarScore, windScore) {
  const solarCF = 0.15 + ((solarScore || 0) / 100) * 0.15;
  const windCF = 0.10 + ((windScore || 0) / 100) * 0.25;
  return {
    solarMWh: Math.round(1 * solarCF * 8760),
    windMWh: Math.round(1 * windCF * 8760),
    solarCF: (solarCF * 100).toFixed(1),
    windCF: (windCF * 100).toFixed(1),
  };
}

// ─── Final Assessment ────────────────────────────────────────────────────────

/**
 * Generate a structured recommendation from score + project data.
 *
 * IMPORTANT: Existing projects are treated as REFERENCE INFORMATION only.
 * The recommendation is driven by the calculated resource scores, NOT
 * by the presence or absence of existing nearby projects.
 */
export function generateAssessment(solarResult, windResult, nearbyProjects, weather) {
  if (!solarResult || !windResult) return null;

  const solar = solarResult.score;
  const wind = windResult.score;

  const nearbySolar = nearbyProjects.filter((p) => p.type === 'solar');
  const nearbyWind = nearbyProjects.filter((p) => p.type === 'wind');
  const nearbyHybrid = nearbyProjects.filter((p) => p.type === 'hybrid');
  const nearbyOther = nearbyProjects.filter(
    (p) => !['solar', 'wind', 'hybrid'].includes(p.type)
  );

  const nearbySolarCap = nearbySolar.reduce((s, p) => s + (p.capacity_mw || 0), 0);
  const nearbyWindCap = nearbyWind.reduce((s, p) => s + (p.capacity_mw || 0), 0);

  // Determine recommendation based on resource scores (NOT existing projects)
  let recommendation;
  let primaryReason;

  if (solar >= 75 && wind >= 65) {
    recommendation = 'Solar–Wind Hybrid';
    primaryReason = `Both solar (${solar}/100) and wind (${wind}/100) scores are strong. A hybrid installation would maximise capacity utilisation and provide complementary generation patterns — solar peaks during the day while wind can generate at night.`;
  } else if (solar >= wind + 10) {
    recommendation = 'Solar Energy';
    primaryReason = `Solar suitability score (${solar}/100) is notably higher than wind (${wind}/100), driven by higher solar irradiance, longer sunshine hours, and/or lower cloud cover at this location.`;
  } else if (wind >= solar + 10) {
    recommendation = 'Wind Energy';
    primaryReason = `Wind suitability score (${wind}/100) is notably higher than solar (${solar}/100), driven by stronger wind speeds at hub height at this location.`;
  } else if (solar >= wind) {
    recommendation = 'Solar Energy (marginal preference)';
    primaryReason = `Solar score (${solar}/100) marginally exceeds wind (${wind}/100). Both resources show comparable potential at this location. A detailed site-level study is recommended.`;
  } else {
    recommendation = 'Wind Energy (marginal preference)';
    primaryReason = `Wind score (${wind}/100) marginally exceeds solar (${solar}/100). Both resources show comparable potential at this location. A detailed site-level study is recommended.`;
  }

  // Context sentence about existing projects (reference only — does not affect recommendation)
  const existingContext =
    nearbyProjects.length > 0
      ? `${nearbyProjects.length} existing renewable energy project(s) are present within the selected search radius. Existing projects indicate prior renewable energy development activity in the surrounding area. They are displayed as reference information and do not determine this recommendation.`
      : `No verified project-level data was found within the selected search radius. State-level installed capacity data for this state is shown above for context.`;

  const forecast = forecastGeneration(solar, wind);

  return {
    recommendation,
    primaryReason,
    existingContext,
    solar: { score: solar, ...solarResult },
    wind: { score: wind, ...windResult },
    nearbySolar,
    nearbyWind,
    nearbyHybrid,
    nearbyOther,
    nearbySolarCap,
    nearbyWindCap,
    nearbyProjectCount: nearbyProjects.length,
    nearestProject: nearbyProjects[0] || null,
    forecast,
  };
}
