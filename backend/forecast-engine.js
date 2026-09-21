const getDayOfWeek = (dateString) => new Date(dateString).getDay();

function getAverage(data, days) {
  const recent = data.slice(0, days);
  if (recent.length === 0) return 0;
  const sum = recent.reduce((acc, curr) => acc + curr.servings, 0);
  return sum / recent.length;
}

const generateForecast = (historicalData, targetDate, mealType) => {
  const sorted = [...historicalData].sort((a, b) => new Date(b.date) - new Date(a.date));
  const filtered = sorted.filter(d => d.mealType.toLowerCase() === mealType.toLowerCase());
  
  const wma7 = getAverage(filtered, 7) || 0;
  const wma14 = getAverage(filtered, 14) || 0;
  const wma30 = getAverage(filtered, 30) || 0;
  
  const basePrediction = (wma7 * 0.5) + (wma14 * 0.3) + (wma30 * 0.2);
  
  const targetDay = new Date(targetDate).getDay();
  const seasonalFactor = (targetDay > 0 && targetDay < 6) ? 1.1 : 0.8;
  
  let mealFactor = 1.0;
  if (mealType.toLowerCase() === 'lunch') mealFactor = 1.2;
  else if (mealType.toLowerCase() === 'breakfast' || mealType.toLowerCase() === 'dinner') mealFactor = 1.0;
  else if (mealType.toLowerCase() === 'snacks') mealFactor = 0.7;
  
  const predictedServings = Math.round(basePrediction * seasonalFactor * mealFactor) || 0;
  const confidence = (wma7 > 0 && wma14 > 0 && wma30 > 0) ? 0.85 : 0.60;
  
  return {
    predictedServings,
    confidence,
    breakdown: { wma7, wma14, wma30, seasonalFactor, mealFactor }
  };
};

const calculateAccuracy = (forecasts) => {
  if (!forecasts || forecasts.length === 0) {
    return { mape: 0, rmse: 0, mae: 0, accuracy: 0 };
  }
  
  let sumPe = 0;
  let sumSe = 0;
  let sumAe = 0;
  let validCount = 0;
  
  forecasts.forEach(f => {
    const error = f.predictedServings - f.actualServings;
    const absError = Math.abs(error);
    if (f.actualServings > 0) {
      sumPe += absError / f.actualServings;
      validCount++;
    }
    sumSe += error * error;
    sumAe += absError;
  });
  
  const n = forecasts.length;
  const mape = validCount > 0 ? (sumPe / validCount) * 100 : 0;
  const rmse = Math.sqrt(sumSe / n);
  const mae = sumAe / n;
  const accuracy = Math.max(0, 100 - mape);
  
  return { mape, rmse, mae, accuracy };
};

const detectPatterns = (historicalData) => {
  const dayTotals = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const dayCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  let totalServings = 0;
  
  historicalData.forEach(d => {
    const day = new Date(d.date).getDay();
    if (!isNaN(day)) {
      dayTotals[day] += d.servings;
      dayCounts[day] += 1;
      totalServings += d.servings;
    }
  });
  
  const dayOfWeekPattern = {};
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  
  let peakDay = '';
  let lowDay = '';
  let maxAvg = -1;
  let minAvg = Infinity;
  
  for (let i = 0; i < 7; i++) {
    const avg = dayCounts[i] > 0 ? dayTotals[i] / dayCounts[i] : 0;
    dayOfWeekPattern[days[i]] = avg;
    
    if (avg > maxAvg && dayCounts[i] > 0) { maxAvg = avg; peakDay = days[i]; }
    if (avg < minAvg && dayCounts[i] > 0) { minAvg = avg; lowDay = days[i]; }
  }
  
  if (minAvg === Infinity) minAvg = 0;
  const averageServings = historicalData.length > 0 ? totalServings / historicalData.length : 0;
  
  const sorted = [...historicalData].sort((a, b) => new Date(a.date) - new Date(b.date));
  let trendDirection = 'stable';
  if (sorted.length >= 4) {
    const half = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, half);
    const secondHalf = sorted.slice(half);
    
    const avgFirst = firstHalf.reduce((acc, curr) => acc + curr.servings, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((acc, curr) => acc + curr.servings, 0) / secondHalf.length;
    
    if (avgSecond > avgFirst * 1.05) trendDirection = 'increasing';
    else if (avgSecond < avgFirst * 0.95) trendDirection = 'decreasing';
  }
  
  return { dayOfWeekPattern, trendDirection, averageServings, peakDay, lowDay };
};

const generateWeeklyPlan = (historicalData, startDate) => {
  const plan = [];
  const start = new Date(startDate);
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
  
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    const dateString = currentDate.toISOString().split('T')[0];
    
    const dayPlan = { date: dateString, meals: [] };
    
    mealTypes.forEach(mealType => {
      const forecast = generateForecast(historicalData, dateString, mealType);
      dayPlan.meals.push({
        mealType,
        plannedServings: forecast.predictedServings,
        confidence: forecast.confidence
      });
    });
    
    plan.push(dayPlan);
  }
  
  return plan;
};

module.exports = {
  generateForecast,
  calculateAccuracy,
  detectPatterns,
  generateWeeklyPlan
};
