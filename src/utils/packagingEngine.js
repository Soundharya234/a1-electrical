// ============================================================
//  PACKAGING AI — Recommendation Engine
//  Rule-based scoring system that matches food properties
//  to suitable packaging materials
// ============================================================

import { FOOD_ITEMS_PACKAGING, PACKAGING_MATERIALS, MAP_GAS_COMPOSITIONS } from '../data/packagingData';

// ─────────────────────────────────────────────────────────────
//  WEIGHT CONFIGURATION
//  How much each risk factor contributes to scoring
// ─────────────────────────────────────────────────────────────
const RISK_WEIGHTS = {
  moisture:       0.30,   // WVTR requirement weight
  oxygen:         0.25,   // OTR requirement weight
  breathability:  0.20,   // Need for gas exchange (fresh produce)
  mechanical:     0.10,   // Transport stress
  light:          0.10,   // Light sensitivity
  acidResistance: 0.05,   // pH / acid resistance
};

// ─────────────────────────────────────────────────────────────
//  MATERIAL CAPABILITY SCORES  (0 = poor, 10 = excellent)
//  How well each material handles each risk
// ─────────────────────────────────────────────────────────────
const MATERIAL_CAPABILITY = {
  'micro-perforated-pe': {
    moisture: 3,       // low barrier — not great for moisture sensitive
    oxygen: 2,         // very permeable — not an oxygen barrier
    breathability: 10, // designed for gas exchange — perfect for fresh produce
    mechanical: 5,
    light: 2,
    acidResistance: 7
  },
  'pet-pe-laminate': {
    moisture: 8,
    oxygen: 5,
    breathability: 1,  // not breathable
    mechanical: 8,
    light: 4,
    acidResistance: 9
  },
  'metalized-bopp': {
    moisture: 9,
    oxygen: 8,
    breathability: 0,
    mechanical: 5,
    light: 9,
    acidResistance: 5
  },
  'alu-foil-laminate': {
    moisture: 10,
    oxygen: 10,
    breathability: 0,
    mechanical: 8,
    light: 10,
    acidResistance: 8
  },
  'hdpe-rigid': {
    moisture: 5,
    oxygen: 3,
    breathability: 2,
    mechanical: 10,
    light: 6,
    acidResistance: 8
  },
  'map-film': {
    moisture: 7,
    oxygen: 7,
    breathability: 2,
    mechanical: 8,
    light: 3,
    acidResistance: 9
  },
  'bio-pla-film': {
    moisture: 2,
    oxygen: 2,
    breathability: 4,
    mechanical: 4,
    light: 2,
    acidResistance: 4
  },
  'pp-woven-bag': {
    moisture: 2,
    oxygen: 1,
    breathability: 8,
    mechanical: 10,
    light: 2,
    acidResistance: 5
  }
};

// ─────────────────────────────────────────────────────────────
//  DERIVE RISK PROFILE FROM FOOD PROPERTIES
//  Returns a 0–1 score for each risk dimension
// ─────────────────────────────────────────────────────────────
function getRiskProfile(food, storage, shelfLifeDays, transport) {
  const risks = {
    moisture:       0,
    oxygen:         0,
    breathability:  0,
    mechanical:     0,
    light:          0,
    acidResistance: 0,
  };

  // ── Moisture Risk ──────────────────────────────────────────
  if (food.isLivingProduce) {
    // Fresh produce: transpiration causes moisture loss → need breathability
    risks.moisture = food.moistureContent > 85 ? 0.7 : 0.5;
  } else {
    if (food.waterActivity < 0.4) {
      // Very dry food — ingress of moisture is the enemy
      risks.moisture = 0.9;
    } else if (food.waterActivity < 0.7) {
      risks.moisture = 0.6;
    } else {
      // High aw — moisture loss is the concern
      risks.moisture = 0.4;
    }
  }
  // Longer shelf life → higher moisture demand
  if (shelfLifeDays > 90) risks.moisture = Math.min(1, risks.moisture + 0.2);

  // ── Oxygen / Oxidation Risk ────────────────────────────────
  if (food.oilContent > 20) {
    risks.oxygen = 0.9;  // High fat → rancidity risk
  } else if (food.oilContent > 5) {
    risks.oxygen = 0.6;
  } else if (food.mainRisks.includes('oxidation')) {
    risks.oxygen = 0.7;
  } else if (food.mainRisks.includes('microbial')) {
    risks.oxygen = 0.5;
  } else {
    risks.oxygen = 0.2;
  }
  // Frozen storage reduces O2 urgency
  if (storage === 'frozen') risks.oxygen *= 0.7;

  // ── Breathability Risk ─────────────────────────────────────
  if (food.isLivingProduce && food.respirationRate !== 'none') {
    const rateMap = { 'low': 0.3, 'medium': 0.6, 'high': 0.85, 'very-high': 1.0 };
    risks.breathability = rateMap[food.respirationRate] || 0;
    // Cold storage reduces respiration need
    if (storage === 'chilled') risks.breathability *= 0.75;
  } else {
    risks.breathability = 0;
  }

  // ── Mechanical Risk ────────────────────────────────────────
  const mechMap = { 'local': 0.3, 'regional': 0.8, 'refrigerated': 0.5 };
  risks.mechanical = mechMap[transport] || 0.3;
  if (food.mainRisks.includes('bruising') || food.mainRisks.includes('breakage')) {
    risks.mechanical = Math.min(1, risks.mechanical + 0.2);
  }

  // ── Light Sensitivity Risk ─────────────────────────────────
  if (food.mainRisks.includes('light')) {
    risks.light = 0.85;
  } else if (food.oilContent > 15 || food.category === 'oil-fat') {
    risks.light = 0.7;
  } else if (food.mainRisks.includes('aroma-loss')) {
    risks.light = 0.5;
  } else {
    risks.light = 0.2;
  }

  // ── Acid Resistance ────────────────────────────────────────
  if (food.pH < 4.0) {
    risks.acidResistance = 0.9;
  } else if (food.pH < 5.0) {
    risks.acidResistance = 0.6;
  } else {
    risks.acidResistance = 0.2;
  }

  return risks;
}

// ─────────────────────────────────────────────────────────────
//  SCORE A MATERIAL AGAINST A RISK PROFILE
// ─────────────────────────────────────────────────────────────
function scoreMaterial(materialId, riskProfile) {
  const capability = MATERIAL_CAPABILITY[materialId];
  if (!capability) return 0;

  let totalScore = 0;
  let totalWeight = 0;

  for (const [risk, weight] of Object.entries(RISK_WEIGHTS)) {
    const riskLevel   = riskProfile[risk] || 0;      // 0–1 how critical this risk is
    const capScore    = capability[risk] || 0;        // 0–10 how good material is
    // Weighted match: when risk is high AND capability is high → high contribution
    totalScore  += weight * riskLevel * capScore;
    totalWeight += weight * riskLevel;
  }

  return totalWeight > 0 ? (totalScore / totalWeight) : 0;
}

// ─────────────────────────────────────────────────────────────
//  GENERATE REASONS (Explainable AI)
// ─────────────────────────────────────────────────────────────
function generateReasons(material, food, riskProfile) {
  const reasons = [];

  if (riskProfile.breathability > 0.5 && material.specs.mapSuitability) {
    reasons.push(`✅ ${food.name} actively respires — this material allows gas exchange`);
  }
  if (riskProfile.breathability > 0.5 && material.id === 'micro-perforated-pe') {
    reasons.push('✅ Micro-perforations manage O₂/CO₂ balance without sealing off the food');
  }
  if (riskProfile.moisture > 0.7 && ['metalized-bopp', 'alu-foil-laminate'].includes(material.id)) {
    reasons.push(`✅ Very low WVTR (${material.specs.wvtr}) prevents moisture ingress into ${food.name}`);
  }
  if (riskProfile.oxygen > 0.6 && ['metalized-bopp', 'alu-foil-laminate', 'map-film'].includes(material.id)) {
    reasons.push(`✅ Low OTR (${material.specs.otr}) blocks oxygen — prevents rancidity & oxidation`);
  }
  if (riskProfile.light > 0.6 && material.specs.lightBarrier) {
    reasons.push('✅ Metallised/foil layer acts as complete light barrier — prevents photo-oxidation');
  }
  if (riskProfile.mechanical > 0.6 && material.specs.mechanicalStrength === 'High') {
    reasons.push('✅ High mechanical strength protects against damage during long-distance transport');
  }
  if (riskProfile.acidResistance > 0.5 && material.specs.acidResistance === 'Excellent') {
    reasons.push(`✅ Excellent acid resistance — safe for ${food.name} with pH ${food.pH}`);
  }
  if (material.specs.mapSuitability && food.mainRisks.includes('microbial')) {
    reasons.push('✅ Compatible with MAP (Modified Atmosphere Packaging) to control microbial growth');
  }
  if (material.biodegradable) {
    reasons.push('✅ Biodegradable / compostable — eco-friendly option for sustainable packaging');
  }
  if (material.recyclable && !material.biodegradable) {
    reasons.push('✅ Recyclable material — good sustainability profile');
  }

  // Fallback
  if (reasons.length === 0) {
    reasons.push(`✅ Balanced barrier properties suitable for ${food.name}'s storage requirements`);
  }

  return reasons;
}

// ─────────────────────────────────────────────────────────────
//  SHELF LIFE PREDICTION
// ─────────────────────────────────────────────────────────────
function predictShelfLife(material, food, storage, targetDays) {
  const base = food.defaultShelfLifeDays;
  let multiplier = 1.0;

  // Storage contribution
  if (storage === 'chilled') multiplier += 1.5;
  if (storage === 'frozen')  multiplier += 4.0;

  // Material quality
  const capability = MATERIAL_CAPABILITY[material.id];
  const avgCapability = Object.values(capability).reduce((a, b) => a + b, 0) / Object.values(capability).length;
  multiplier += (avgCapability / 10) * 1.5;

  // MAP suitability bonus
  if (material.specs.mapSuitability) multiplier += 0.5;

  const predicted = Math.round(base * multiplier);
  const meets = predicted >= targetDays;

  return {
    predictedDays: predicted,
    meetsTarget: meets,
    confidence: meets ? 'High' : 'Moderate',
    note: meets
      ? `Estimated to meet your ${targetDays}-day target`
      : `May fall short of your ${targetDays}-day target — consider cold chain addition`
  };
}

// ─────────────────────────────────────────────────────────────
//  COST ESTIMATE
// ─────────────────────────────────────────────────────────────
function getCostEstimate(material, quantityKg) {
  // Rough: 1 kg product ≈ 0.2–0.5 m² packaging depending on food density
  const sqmPerKg = food_density_factor(quantityKg);
  const totalSqm = quantityKg * sqmPerKg;
  const totalCost = totalSqm * material.costPerSqm;

  return {
    costPerKg: Math.round(material.costPerSqm * sqmPerKg),
    totalCost: Math.round(totalCost),
    sqmPerKg,
    totalSqm: Math.round(totalSqm)
  };
}

function food_density_factor() {
  // Average packaging area per kg of food
  return 0.3; // m² per kg (approximate industry average)
}

// ─────────────────────────────────────────────────────────────
//  SUSTAINABILITY SCORE (0–100)
// ─────────────────────────────────────────────────────────────
function getSustainabilityDetails(material) {
  const score = material.sustainabilityScore;
  let rating, color, badge;

  if (score >= 80) { rating = 'Excellent'; color = '#22C55E'; badge = '🌟'; }
  else if (score >= 60) { rating = 'Good'; color = '#84CC16'; badge = '✅'; }
  else if (score >= 40) { rating = 'Moderate'; color = '#F59E0B'; badge = '⚠️'; }
  else { rating = 'Poor'; color = '#EF4444'; badge = '❌'; }

  return {
    score,
    rating,
    color,
    badge,
    recyclable: material.recyclable,
    biodegradable: material.biodegradable,
    notes: [
      material.recyclable ? '♻️ Recyclable' : '⛔ Not recyclable',
      material.biodegradable ? '🌱 Biodegradable/Compostable' : '🏭 Petroleum-based',
      score < 50 ? '⚠️ Consider sustainable alternatives for eco-conscious branding' : '✅ Good environmental profile'
    ]
  };
}

// ─────────────────────────────────────────────────────────────
//  PACKAGING DOCTOR — Analyze Existing Packaging
// ─────────────────────────────────────────────────────────────
export function analyzeExistingPackaging(currentMaterialId, food, storage, shelfLifeDays, transport) {
  const currentMaterial = PACKAGING_MATERIALS.find(m => m.id === currentMaterialId);
  if (!currentMaterial) return null;

  const riskProfile = getRiskProfile(food, storage, shelfLifeDays, transport);
  const currentScore = scoreMaterial(currentMaterialId, riskProfile);
  const recommendations = getRecommendations(food, storage, shelfLifeDays, transport);

  const issues = [];
  const capability = MATERIAL_CAPABILITY[currentMaterialId];

  if (riskProfile.breathability > 0.5 && capability.breathability < 4) {
    issues.push({
      type: 'critical',
      issue: 'Insufficient Gas Exchange',
      detail: `${food.name} respires actively. Current packaging blocks gas exchange, causing CO₂ buildup and premature spoilage.`,
      fix: 'Switch to breathable / micro-perforated film'
    });
  }
  if (riskProfile.moisture > 0.7 && capability.moisture < 5) {
    issues.push({
      type: 'critical',
      issue: 'Poor Moisture Barrier',
      detail: `Current packaging WVTR is too high for ${food.name}. Moisture ingress will cause quality loss.`,
      fix: 'Upgrade to metalized film or foil laminate'
    });
  }
  if (riskProfile.oxygen > 0.6 && capability.oxygen < 5) {
    issues.push({
      type: 'warning',
      issue: 'Inadequate Oxygen Barrier',
      detail: 'High OTR allows oxygen permeation, causing oxidation and rancidity.',
      fix: 'Use metalized BOPP or aluminium foil laminate'
    });
  }
  if (riskProfile.light > 0.6 && !currentMaterial.specs.lightBarrier) {
    issues.push({
      type: 'warning',
      issue: 'No Light Barrier',
      detail: 'UV/visible light causes photo-oxidation and nutrient degradation.',
      fix: 'Add metalized or opaque outer layer'
    });
  }

  return {
    currentMaterial,
    currentScore: Math.round(currentScore * 100) / 10,
    issues,
    hasIssues: issues.length > 0,
    betterOptions: recommendations.slice(0, 2),
    summary: issues.length === 0
      ? `✅ Your current packaging (${currentMaterial.name}) appears suitable for ${food.name}`
      : `⚠️ Found ${issues.length} issue(s) with ${currentMaterial.name} for ${food.name}`
  };
}

// ─────────────────────────────────────────────────────────────
//  WHAT-IF SIMULATOR
// ─────────────────────────────────────────────────────────────
export function whatIfSimulation(originalParams, newParams) {
  const original = getRecommendations(
    originalParams.food,
    originalParams.storage,
    originalParams.shelfLifeDays,
    originalParams.transport
  );
  const updated = getRecommendations(
    newParams.food || originalParams.food,
    newParams.storage || originalParams.storage,
    newParams.shelfLifeDays || originalParams.shelfLifeDays,
    newParams.transport || originalParams.transport
  );

  const changes = [];
  if (original[0]?.material.id !== updated[0]?.material.id) {
    changes.push({
      type: 'recommendation-change',
      message: `Primary recommendation changed from ${original[0]?.material.shortName} → ${updated[0]?.material.shortName}`
    });
  }
  if (newParams.shelfLifeDays && newParams.shelfLifeDays > originalParams.shelfLifeDays) {
    changes.push({
      type: 'info',
      message: `Longer target shelf life (${newParams.shelfLifeDays} days) requires higher barrier materials`
    });
  }
  if (newParams.storage === 'chilled' && originalParams.storage === 'ambient') {
    changes.push({
      type: 'improvement',
      message: 'Adding cold chain significantly extends shelf life and may allow lighter packaging'
    });
  }
  if (newParams.storage === 'frozen') {
    changes.push({
      type: 'info',
      message: 'Frozen storage requires materials that maintain flexibility at -18°C (PA/PE preferred)'
    });
  }

  return {
    original: original.slice(0, 3),
    updated: updated.slice(0, 3),
    changes,
    changed: original[0]?.material.id !== updated[0]?.material.id
  };
}

// ─────────────────────────────────────────────────────────────
//  MAP GAS RECOMMENDATION
// ─────────────────────────────────────────────────────────────
export function getMAPRecommendation(food) {
  if (food.isLivingProduce && food.respirationRate !== 'none') {
    if (food.subcategory === 'leafy-vegetable') return MAP_GAS_COMPOSITIONS['fresh-produce-leafy'];
    return MAP_GAS_COMPOSITIONS['fresh-produce-fruit'];
  }
  if (['meat', 'seafood'].includes(food.subcategory)) return MAP_GAS_COMPOSITIONS['meat-fresh'];
  if (food.category === 'dairy-fresh') return MAP_GAS_COMPOSITIONS['dairy-cheese'];
  if (['dry-processed', 'snack'].includes(food.category)) return MAP_GAS_COMPOSITIONS['dry-snack'];
  return null;
}

// ─────────────────────────────────────────────────────────────
//  MAIN: GET RECOMMENDATIONS
//  Returns top 3 ranked packaging options with full details
// ─────────────────────────────────────────────────────────────
export function getRecommendations(food, storage, shelfLifeDays, transport, quantityKg = 100) {
  const riskProfile = getRiskProfile(food, storage, shelfLifeDays, transport);

  const scored = PACKAGING_MATERIALS.map(material => {
    const score = scoreMaterial(material.id, riskProfile);
    const shelfLifeData = predictShelfLife(material, food, storage, shelfLifeDays);
    const costData = getCostEstimate(material, quantityKg);
    const sustainabilityData = getSustainabilityDetails(material);
    const reasons = generateReasons(material, food, riskProfile);
    const mapRec = getMAPRecommendation(food);

    // Penalty: if food is fresh produce and material has no breathability
    let finalScore = score;
    if (food.isLivingProduce && riskProfile.breathability > 0.5) {
      const breathCap = MATERIAL_CAPABILITY[material.id]?.breathability || 0;
      if (breathCap < 3) finalScore *= 0.4; // heavy penalty for non-breathable
    }

    return {
      material,
      score: Math.round(finalScore * 100),
      riskProfile,
      shelfLife: shelfLifeData,
      cost: costData,
      sustainability: sustainabilityData,
      reasons,
      mapRecommendation: mapRec,
      rank: 0
    };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Assign ranks and return top 3
  return scored.slice(0, 3).map((item, idx) => ({
    ...item,
    rank: idx + 1,
    rankLabel: idx === 0 ? '🥇 Best Match' : idx === 1 ? '🥈 Alternative' : '🥉 Eco Option'
  }));
}

// ─────────────────────────────────────────────────────────────
//  FOOD ITEM LOOKUP
// ─────────────────────────────────────────────────────────────
export function getFoodById(id) {
  return FOOD_ITEMS_PACKAGING.find(f => f.id === id) || null;
}

export { RISK_WEIGHTS, getRiskProfile };
