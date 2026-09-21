const carbonFactors = {
  meat: 27.0, seafood: 11.7, dairy: 3.2, vegetables: 2.0, fruits: 1.1, grains: 1.4, prepared: 4.5, beverages: 0.8, spices: 1.0
};

const waterFactors = {
  meat: 15400, seafood: 3691, dairy: 1020, vegetables: 322, fruits: 962, grains: 1644, prepared: 2500, beverages: 200, spices: 500
};

function calculateCarbonFootprint(foodCategory, quantityKg) {
  const factor = carbonFactors[(foodCategory || '').toLowerCase()] || 2.5; // default factor if unknown
  return factor * quantityKg;
}

function calculateWaterFootprint(foodCategory, quantityKg) {
  const factor = waterFactors[(foodCategory || '').toLowerCase()] || 1000; // default factor if unknown
  return factor * quantityKg;
}

function calculateEconomicValue(items) {
  if (!items || !items.length) return 0;
  return items.reduce((total, item) => total + ((item.quantityKg || 0) * (item.unitValue || 10)), 0);
}

function generateESGScore(metrics) {
  const w1 = 0.30;
  const w2 = 0.25;
  const w3 = 0.20;
  const w4 = 0.15;
  const w5 = 0.10;
  
  const score = ((metrics.wasteReductionRate || 0) * w1) +
                ((metrics.redistributionEfficiency || 0) * w2) +
                ((metrics.carbonReduction || 0) * w3) +
                ((metrics.waterConservation || 0) * w4) +
                ((metrics.energyEfficiency || 0) * w5);
                
  return Math.min(100, Math.max(0, Math.round(score)));
}

function calculateSDGContributions(metrics) {
  const sdg2 = ((metrics.redistributionEfficiency || 0) * 0.7) + ((metrics.wasteReductionRate || 0) * 0.3);
  const sdg12 = ((metrics.wasteReductionRate || 0) * 0.6) + ((metrics.energyEfficiency || 0) * 0.4);
  const sdg13 = ((metrics.carbonReduction || 0) * 0.6) + ((metrics.waterConservation || 0) * 0.4);
  
  return {
    sdg2: Math.min(100, Math.max(0, Math.round(sdg2))),
    sdg12: Math.min(100, Math.max(0, Math.round(sdg12))),
    sdg13: Math.min(100, Math.max(0, Math.round(sdg13)))
  };
}

function generateSustainabilityReport(metrics, period) {
  const esgScore = generateESGScore(metrics);
  const sdgs = calculateSDGContributions(metrics);
  
  const recommendations = [];
  if ((metrics.wasteReductionRate || 0) < 70) recommendations.push("Improve portion control to reduce initial waste.");
  else recommendations.push("Maintain excellent waste reduction rates.");
  
  if ((metrics.redistributionEfficiency || 0) < 80) recommendations.push("Expand local receiver network to improve redistribution efficiency.");
  else recommendations.push("Redistribution network is highly efficient.");
  
  if ((metrics.carbonReduction || 0) < 50) recommendations.push("Focus on reducing high-impact food waste like meat and dairy.");
  else recommendations.push("Carbon reduction targets are being met effectively.");

  return {
    period,
    timestamp: new Date().toISOString(),
    overallEsgScore: esgScore,
    metrics: { ...metrics },
    sdgContributions: sdgs,
    recommendations
  };
}

module.exports = {
  calculateCarbonFootprint,
  calculateWaterFootprint,
  calculateEconomicValue,
  generateESGScore,
  generateSustainabilityReport,
  calculateSDGContributions
};
