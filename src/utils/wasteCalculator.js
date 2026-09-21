import { FOOD_CATEGORIES } from '../data/foodData.js';

export const calculateCarbonSaved = (category, quantityKg) => {
  const cat = FOOD_CATEGORIES.find(c => c.id === category);
  const factor = cat ? cat.emissionFactor : 1.0;
  return quantityKg * factor;
};

export const calculateWaterSaved = (category, quantityKg) => {
  const cat = FOOD_CATEGORIES.find(c => c.id === category);
  const factor = cat ? cat.waterFootprint : 1000;
  return quantityKg * factor;
};

export const calculateEconomicValue = (costPerUnit, quantity) => {
  return costPerUnit * quantity;
};

export const calculateFreshnessScore = (expiryDate, currentDate = new Date()) => {
  const expDate = new Date(expiryDate);
  const currDate = new Date(currentDate);
  const diffTime = expDate - currDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return 0;
  if (diffDays > 30) return 10; // Capped at 10 for long shelf life
  
  // Linear scale from 1 to 10 based on days left (up to 30)
  return Math.max(1, Math.min(10, (diffDays / 30) * 10));
};

export const getFreshnessLabel = (score) => {
  if (score >= 8) return { label: 'Excellent', color: '#22C55E', emoji: '🌟' };
  if (score >= 5) return { label: 'Good', color: '#3B82F6', emoji: '👍' };
  if (score >= 2) return { label: 'Expiring Soon', color: '#F59E0B', emoji: '⚠️' };
  if (score > 0) return { label: 'Critical', color: '#F97316', emoji: '📉' };
  return { label: 'Spoiled/Expired', color: '#EF4444', emoji: '☠️' };
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatWeight = (kg) => {
  if (kg < 1) return `${(kg * 1000).toFixed(0)} g`;
  if (kg >= 1000) return `${(kg / 1000).toFixed(2)} t`;
  return `${kg.toFixed(2)} kg`;
};

export const formatCO2 = (kg) => {
  if (kg >= 1000) return `${(kg / 1000).toFixed(2)} t CO₂e`;
  return `${kg.toFixed(1)} kg CO₂e`;
};

export const formatWater = (liters) => {
  if (liters >= 1000000) return `${(liters / 1000000).toFixed(2)} ML`;
  if (liters >= 1000) return `${(liters / 1000).toFixed(1)} kL`;
  return `${liters.toFixed(0)} L`;
};

export const calculateForecastAccuracy = (predicted, actual) => {
  if (actual === 0) return predicted === 0 ? 100 : 0;
  const error = Math.abs(predicted - actual);
  const percentError = (error / actual) * 100;
  return Math.max(0, 100 - percentError).toFixed(1);
};

export const getExpiryStatus = (expiryDate) => {
  const diffDays = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { status: 'expired', label: 'Expired', color: '#EF4444', daysLeft: diffDays };
  if (diffDays === 0) return { status: 'today', label: 'Expires Today', color: '#F97316', daysLeft: 0 };
  if (diffDays <= 3) return { status: 'critical', label: 'Expires Soon', color: '#F59E0B', daysLeft: diffDays };
  return { status: 'good', label: 'Safe', color: '#22C55E', daysLeft: diffDays };
};

export const calculateESGScore = (wasteRate, redistributionRate, carbonReduction) => {
  // Mock scoring logic for ESG (Environmental, Social, Governance)
  // Lower wasteRate is better (max 40 pts)
  const wasteScore = Math.max(0, 40 - (wasteRate * 100)); // assumes wasteRate is decimal
  // Higher redistribution is better (max 40 pts)
  const redisScore = Math.min(40, (redistributionRate * 100) * 0.8); 
  // Higher carbon reduction is better (max 20 pts)
  const carbonScore = Math.min(20, carbonReduction / 100); 
  
  return Math.round(wasteScore + redisScore + carbonScore);
};

export const generateTimeSeriesData = (days, baseValue, variance) => {
  const data = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const randomVar = (Math.random() * variance * 2) - variance;
    data.push({
      date: d.toISOString().split('T')[0],
      value: Math.max(0, Math.round(baseValue + randomVar))
    });
  }
  return data;
};

export const getDayOfWeek = (dateString) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date(dateString).getDay()];
};

export const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};
