export const FOOD_CATEGORIES = [
  { id: 'grains', name: 'Grains & Cereals', emoji: '🌾', color: '#F59E0B', emissionFactor: 1.5, waterFootprint: 2500, avgShelfLife: 365, storageTemp: 'ambient' },
  { id: 'vegetables', name: 'Vegetables', emoji: '🥦', color: '#22C55E', emissionFactor: 0.4, waterFootprint: 300, avgShelfLife: 7, storageTemp: 'cool' },
  { id: 'fruits', name: 'Fruits', emoji: '🍎', color: '#EF4444', emissionFactor: 0.5, waterFootprint: 900, avgShelfLife: 10, storageTemp: 'cool' },
  { id: 'dairy', name: 'Dairy Products', emoji: '🥛', color: '#E0F2FE', emissionFactor: 2.8, waterFootprint: 1000, avgShelfLife: 14, storageTemp: 'cold' },
  { id: 'meat', name: 'Meat & Poultry', emoji: '🍗', color: '#B91C1C', emissionFactor: 25.0, waterFootprint: 15000, avgShelfLife: 5, storageTemp: 'frozen' },
  { id: 'seafood', name: 'Seafood', emoji: '🐟', color: '#0EA5E9', emissionFactor: 5.0, waterFootprint: 4000, avgShelfLife: 3, storageTemp: 'frozen' },
  { id: 'prepared', name: 'Prepared Food', emoji: '🍲', color: '#F97316', emissionFactor: 2.0, waterFootprint: 1500, avgShelfLife: 2, storageTemp: 'cold' },
  { id: 'beverages', name: 'Beverages', emoji: '🥤', color: '#8B5CF6', emissionFactor: 0.3, waterFootprint: 200, avgShelfLife: 180, storageTemp: 'ambient' },
  { id: 'spices', name: 'Spices & Condiments', emoji: '🌶️', color: '#D97706', emissionFactor: 1.2, waterFootprint: 7000, avgShelfLife: 730, storageTemp: 'ambient' },
  { id: 'others', name: 'Others', emoji: '📦', color: '#64748B', emissionFactor: 1.0, waterFootprint: 1000, avgShelfLife: 30, storageTemp: 'ambient' }
];

export const COMMON_FOOD_ITEMS = [
  { name: 'Rice (Sona Masoori)', category: 'grains', unit: 'kg', avgCostPerUnit: 60, shelfLife: 365, storageCondition: 'ambient' },
  { name: 'Rice (Basmati)', category: 'grains', unit: 'kg', avgCostPerUnit: 120, shelfLife: 365, storageCondition: 'ambient' },
  { name: 'Wheat Flour (Atta)', category: 'grains', unit: 'kg', avgCostPerUnit: 45, shelfLife: 180, storageCondition: 'ambient' },
  { name: 'Maida', category: 'grains', unit: 'kg', avgCostPerUnit: 40, shelfLife: 180, storageCondition: 'ambient' },
  { name: 'Toor Dal', category: 'grains', unit: 'kg', avgCostPerUnit: 160, shelfLife: 365, storageCondition: 'ambient' },
  { name: 'Moong Dal', category: 'grains', unit: 'kg', avgCostPerUnit: 110, shelfLife: 365, storageCondition: 'ambient' },
  { name: 'Chana Dal', category: 'grains', unit: 'kg', avgCostPerUnit: 90, shelfLife: 365, storageCondition: 'ambient' },
  { name: 'Urad Dal', category: 'grains', unit: 'kg', avgCostPerUnit: 130, shelfLife: 365, storageCondition: 'ambient' },
  { name: 'Cooking Oil (Sunflower)', category: 'others', unit: 'liter', avgCostPerUnit: 150, shelfLife: 180, storageCondition: 'ambient' },
  { name: 'Cooking Oil (Groundnut)', category: 'others', unit: 'liter', avgCostPerUnit: 200, shelfLife: 180, storageCondition: 'ambient' },
  { name: 'Sugar', category: 'others', unit: 'kg', avgCostPerUnit: 45, shelfLife: 730, storageCondition: 'ambient' },
  { name: 'Salt', category: 'spices', unit: 'kg', avgCostPerUnit: 25, shelfLife: 730, storageCondition: 'ambient' },
  { name: 'Milk (Full Cream)', category: 'dairy', unit: 'liter', avgCostPerUnit: 66, shelfLife: 2, storageCondition: 'cold' },
  { name: 'Milk (Toned)', category: 'dairy', unit: 'liter', avgCostPerUnit: 54, shelfLife: 2, storageCondition: 'cold' },
  { name: 'Curd', category: 'dairy', unit: 'kg', avgCostPerUnit: 80, shelfLife: 7, storageCondition: 'cold' },
  { name: 'Paneer', category: 'dairy', unit: 'kg', avgCostPerUnit: 350, shelfLife: 10, storageCondition: 'cold' },
  { name: 'Butter', category: 'dairy', unit: 'kg', avgCostPerUnit: 550, shelfLife: 90, storageCondition: 'cold' },
  { name: 'Ghee', category: 'dairy', unit: 'kg', avgCostPerUnit: 650, shelfLife: 180, storageCondition: 'ambient' },
  { name: 'Onions', category: 'vegetables', unit: 'kg', avgCostPerUnit: 40, shelfLife: 30, storageCondition: 'ambient' },
  { name: 'Tomatoes', category: 'vegetables', unit: 'kg', avgCostPerUnit: 50, shelfLife: 7, storageCondition: 'cool' },
  { name: 'Potatoes', category: 'vegetables', unit: 'kg', avgCostPerUnit: 30, shelfLife: 30, storageCondition: 'ambient' },
  { name: 'Green Chillies', category: 'vegetables', unit: 'kg', avgCostPerUnit: 80, shelfLife: 7, storageCondition: 'cool' },
  { name: 'Ginger', category: 'vegetables', unit: 'kg', avgCostPerUnit: 150, shelfLife: 15, storageCondition: 'cool' },
  { name: 'Garlic', category: 'vegetables', unit: 'kg', avgCostPerUnit: 200, shelfLife: 60, storageCondition: 'ambient' },
  { name: 'Carrots', category: 'vegetables', unit: 'kg', avgCostPerUnit: 60, shelfLife: 10, storageCondition: 'cool' },
  { name: 'Beans', category: 'vegetables', unit: 'kg', avgCostPerUnit: 80, shelfLife: 5, storageCondition: 'cool' },
  { name: 'Cauliflower', category: 'vegetables', unit: 'piece', avgCostPerUnit: 40, shelfLife: 5, storageCondition: 'cool' },
  { name: 'Cabbage', category: 'vegetables', unit: 'kg', avgCostPerUnit: 30, shelfLife: 14, storageCondition: 'cool' },
  { name: 'Spinach (Palak)', category: 'vegetables', unit: 'kg', avgCostPerUnit: 40, shelfLife: 3, storageCondition: 'cool' },
  { name: 'Peas (Green)', category: 'vegetables', unit: 'kg', avgCostPerUnit: 120, shelfLife: 5, storageCondition: 'cool' },
  { name: 'Capsicum', category: 'vegetables', unit: 'kg', avgCostPerUnit: 80, shelfLife: 7, storageCondition: 'cool' },
  { name: 'Banana (Robusta)', category: 'fruits', unit: 'kg', avgCostPerUnit: 50, shelfLife: 5, storageCondition: 'ambient' },
  { name: 'Apple (Fuji)', category: 'fruits', unit: 'kg', avgCostPerUnit: 150, shelfLife: 14, storageCondition: 'cool' },
  { name: 'Mango (Alphonso)', category: 'fruits', unit: 'kg', avgCostPerUnit: 400, shelfLife: 7, storageCondition: 'ambient' },
  { name: 'Watermelon', category: 'fruits', unit: 'kg', avgCostPerUnit: 20, shelfLife: 10, storageCondition: 'ambient' },
  { name: 'Chicken (Curry Cut)', category: 'meat', unit: 'kg', avgCostPerUnit: 250, shelfLife: 2, storageCondition: 'frozen' },
  { name: 'Mutton', category: 'meat', unit: 'kg', avgCostPerUnit: 800, shelfLife: 2, storageCondition: 'frozen' },
  { name: 'Fish (Rohu)', category: 'seafood', unit: 'kg', avgCostPerUnit: 250, shelfLife: 2, storageCondition: 'frozen' },
  { name: 'Eggs', category: 'meat', unit: 'dozen', avgCostPerUnit: 80, shelfLife: 21, storageCondition: 'cool' },
  { name: 'Bread (White)', category: 'prepared', unit: 'packet', avgCostPerUnit: 40, shelfLife: 5, storageCondition: 'ambient' },
  { name: 'Bread (Brown)', category: 'prepared', unit: 'packet', avgCostPerUnit: 50, shelfLife: 5, storageCondition: 'ambient' },
  { name: 'Roti', category: 'prepared', unit: 'piece', avgCostPerUnit: 10, shelfLife: 1, storageCondition: 'ambient' },
  { name: 'Idli Batter', category: 'prepared', unit: 'kg', avgCostPerUnit: 60, shelfLife: 3, storageCondition: 'cold' },
  { name: 'Dosa Batter', category: 'prepared', unit: 'kg', avgCostPerUnit: 60, shelfLife: 3, storageCondition: 'cold' },
  { name: 'Sambar', category: 'prepared', unit: 'liter', avgCostPerUnit: 100, shelfLife: 1, storageCondition: 'cold' },
  { name: 'Rasam', category: 'prepared', unit: 'liter', avgCostPerUnit: 80, shelfLife: 1, storageCondition: 'cold' },
  { name: 'Chicken Biryani', category: 'prepared', unit: 'kg', avgCostPerUnit: 400, shelfLife: 1, storageCondition: 'cold' },
  { name: 'Veg Pulao', category: 'prepared', unit: 'kg', avgCostPerUnit: 200, shelfLife: 1, storageCondition: 'cold' },
  { name: 'Fried Rice', category: 'prepared', unit: 'kg', avgCostPerUnit: 220, shelfLife: 1, storageCondition: 'cold' },
  { name: 'Tea Powder', category: 'beverages', unit: 'kg', avgCostPerUnit: 400, shelfLife: 365, storageCondition: 'ambient' },
  { name: 'Coffee Powder', category: 'beverages', unit: 'kg', avgCostPerUnit: 800, shelfLife: 365, storageCondition: 'ambient' },
  { name: 'Fruit Juice (Packaged)', category: 'beverages', unit: 'liter', avgCostPerUnit: 100, shelfLife: 180, storageCondition: 'ambient' },
  { name: 'Mixed Pickle', category: 'spices', unit: 'kg', avgCostPerUnit: 150, shelfLife: 365, storageCondition: 'ambient' },
  { name: 'Papad', category: 'spices', unit: 'packet', avgCostPerUnit: 50, shelfLife: 180, storageCondition: 'ambient' },
  { name: 'Coriander Powder', category: 'spices', unit: 'kg', avgCostPerUnit: 200, shelfLife: 180, storageCondition: 'ambient' },
  { name: 'Cumin Seeds', category: 'spices', unit: 'kg', avgCostPerUnit: 600, shelfLife: 180, storageCondition: 'ambient' },
  { name: 'Turmeric Powder', category: 'spices', unit: 'kg', avgCostPerUnit: 250, shelfLife: 365, storageCondition: 'ambient' },
  { name: 'Red Chilli Powder', category: 'spices', unit: 'kg', avgCostPerUnit: 350, shelfLife: 365, storageCondition: 'ambient' },
  { name: 'Garam Masala', category: 'spices', unit: 'kg', avgCostPerUnit: 800, shelfLife: 180, storageCondition: 'ambient' },
  { name: 'Mustard Seeds', category: 'spices', unit: 'kg', avgCostPerUnit: 100, shelfLife: 365, storageCondition: 'ambient' }
];

export const STORAGE_GUIDELINES = {
  ambient: { tempMin: 15, tempMax: 25, humidityMin: 40, humidityMax: 60, description: 'Dry pantry, room temperature' },
  cool: { tempMin: 8, tempMax: 15, humidityMin: 60, humidityMax: 80, description: 'Cool, dark place (e.g., root cellar)' },
  cold: { tempMin: 1, tempMax: 4, humidityMin: 70, humidityMax: 90, description: 'Refrigerator' },
  frozen: { tempMin: -18, tempMax: -15, humidityMin: 50, humidityMax: 70, description: 'Freezer' }
};

export const MEAL_TYPES = [
  { id: 'breakfast', name: 'Breakfast', emoji: '🌅', timeRange: '7:00-9:30', avgServings: 250 },
  { id: 'lunch', name: 'Lunch', emoji: '☀️', timeRange: '12:00-14:00', avgServings: 400 },
  { id: 'snacks', name: 'Snacks', emoji: '🍪', timeRange: '16:00-17:30', avgServings: 150 },
  { id: 'dinner', name: 'Dinner', emoji: '🌙', timeRange: '19:00-21:00', avgServings: 350 }
];

export const RECEIVER_TYPES = [
  { id: 'ngo', name: 'NGO', emoji: '🤝', description: 'Non-governmental organization distributing to the needy', avgCapacity: 100 },
  { id: 'food_bank', name: 'Food Bank', emoji: '🏦', description: 'Large scale storage and redistribution center', avgCapacity: 1000 },
  { id: 'shelter', name: 'Homeless Shelter', emoji: '🏠', description: 'Direct serving to residents', avgCapacity: 50 },
  { id: 'community_kitchen', name: 'Community Kitchen', emoji: '🍲', description: 'Free meals for local community', avgCapacity: 200 },
  { id: 'secondary_buyer', name: 'Secondary Buyer', emoji: '♻️', description: 'Purchases near-expiry items at discount', avgCapacity: 500 }
];

export const WASTE_REASONS = [
  { id: 'overproduction', name: 'Overproduction', emoji: '📈', preventable: true },
  { id: 'spoilage', name: 'Spoilage', emoji: '🥀', preventable: true },
  { id: 'expiration', name: 'Expired', emoji: '📅', preventable: true },
  { id: 'plate_waste', name: 'Plate Waste', emoji: '🍽️', preventable: false },
  { id: 'trimming', name: 'Prep Trimmings', emoji: '🔪', preventable: false },
  { id: 'spillage', name: 'Accidental Spillage', emoji: '💦', preventable: true },
  { id: 'quality', name: 'Poor Quality/Burnt', emoji: '🔥', preventable: true }
];

export const DISPOSAL_METHODS = [
  { id: 'compost', name: 'Composting', emoji: '🌱', environmentalImpact: 'low' },
  { id: 'animal_feed', name: 'Animal Feed', emoji: '🐄', environmentalImpact: 'low' },
  { id: 'biogas', name: 'Biogas/Anaerobic Digestion', emoji: '⚡', environmentalImpact: 'low' },
  { id: 'landfill', name: 'Landfill', emoji: '🗑️', environmentalImpact: 'high' },
  { id: 'incineration', name: 'Incineration', emoji: '🔥', environmentalImpact: 'medium' }
];

export const SURPLUS_STATUSES = {
  pending: { label: 'Pending Match', color: '#F59E0B', emoji: '⏳' },
  matched: { label: 'Matched', color: '#3B82F6', emoji: '🤝' },
  picked_up: { label: 'In Transit', color: '#8B5CF6', emoji: '🚚' },
  delivered: { label: 'Delivered', color: '#22C55E', emoji: '✅' },
  cancelled: { label: 'Cancelled', color: '#EF4444', emoji: '❌' }
};

export const QUALITY_LEVELS = [
  { minScore: 90, maxScore: 100, label: 'Excellent', color: '#22C55E', emoji: '🌟', recommendation: 'Premium distribution or secondary sale' },
  { minScore: 70, maxScore: 89, label: 'Good', color: '#3B82F6', emoji: '👍', recommendation: 'Standard donation to NGOs/Shelters' },
  { minScore: 50, maxScore: 69, label: 'Fair', color: '#F59E0B', emoji: '⚠️', recommendation: 'Immediate consumption required' },
  { minScore: 30, maxScore: 49, label: 'Poor', color: '#F97316', emoji: '📉', recommendation: 'Animal feed or biogas only' },
  { minScore: 0, maxScore: 29, label: 'Spoiled', color: '#EF4444', emoji: '☠️', recommendation: 'Compost or landfill' }
];

export const SAMPLE_RECEIVERS = [
  { id: 'r1', name: 'Akshaya Patra Foundation', type: 'ngo', city: 'Bangalore', lat: 12.9716, lng: 77.5946, capacityKg: 5000, preferences: ['grains', 'vegetables'], operatingHours: '06:00-18:00' },
  { id: 'r2', name: 'Robin Hood Army', type: 'ngo', city: 'Delhi', lat: 28.7041, lng: 77.1025, capacityKg: 1000, preferences: ['prepared', 'fruits', 'vegetables'], operatingHours: '18:00-23:00' },
  { id: 'r3', name: 'No Food Waste', type: 'ngo', city: 'Chennai', lat: 13.0827, lng: 80.2707, capacityKg: 1500, preferences: ['prepared', 'grains', 'vegetables'], operatingHours: '09:00-21:00' },
  { id: 'r4', name: 'Roti Bank', type: 'ngo', city: 'Mumbai', lat: 19.0760, lng: 72.8777, capacityKg: 2000, preferences: ['prepared', 'grains'], operatingHours: '10:00-22:00' },
  { id: 'r5', name: 'Little Sisters of the Poor', type: 'shelter', city: 'Hyderabad', lat: 17.3850, lng: 78.4867, capacityKg: 200, preferences: ['grains', 'vegetables', 'dairy', 'fruits'], operatingHours: '08:00-17:00' },
  { id: 'r6', name: 'Annalakshmi Community Kitchen', type: 'community_kitchen', city: 'Coimbatore', lat: 11.0168, lng: 76.9558, capacityKg: 800, preferences: ['grains', 'vegetables', 'spices'], operatingHours: '07:00-15:00' },
  { id: 'r7', name: 'Madurai Meenakshi Annadanam', type: 'community_kitchen', city: 'Madurai', lat: 9.9252, lng: 78.1198, capacityKg: 1200, preferences: ['grains', 'vegetables', 'dairy'], operatingHours: '09:00-14:00' },
  { id: 'r8', name: 'Trichy Food Bank', type: 'food_bank', city: 'Trichy', lat: 10.7905, lng: 78.7047, capacityKg: 2500, preferences: ['grains', 'spices', 'beverages'], operatingHours: '09:00-18:00' },
  { id: 'r9', name: 'Goonj', type: 'ngo', city: 'Delhi', lat: 28.5355, lng: 77.2910, capacityKg: 3000, preferences: ['grains', 'others'], operatingHours: '10:00-18:00' },
  { id: 'r10', name: 'Aashray Care Home', type: 'shelter', city: 'Mumbai', lat: 19.1136, lng: 72.8697, capacityKg: 150, preferences: ['prepared', 'dairy', 'fruits'], operatingHours: '08:00-20:00' },
  { id: 'r11', name: 'Chennai Corporation Shelter', type: 'shelter', city: 'Chennai', lat: 13.0500, lng: 80.2824, capacityKg: 300, preferences: ['prepared', 'grains'], operatingHours: '24:00-24:00' },
  { id: 'r12', name: 'Hope Foundation', type: 'ngo', city: 'Bangalore', lat: 13.0279, lng: 77.6271, capacityKg: 600, preferences: ['grains', 'vegetables', 'dairy'], operatingHours: '09:00-17:00' },
  { id: 'r13', name: 'Smile Foundation', type: 'ngo', city: 'Hyderabad', lat: 17.4399, lng: 78.4983, capacityKg: 800, preferences: ['grains', 'vegetables', 'fruits'], operatingHours: '10:00-18:00' },
  { id: 'r14', name: 'Sathyalokam Trust', type: 'shelter', city: 'Coimbatore', lat: 11.0333, lng: 76.9667, capacityKg: 100, preferences: ['prepared', 'dairy'], operatingHours: '07:00-19:00' },
  { id: 'r15', name: 'Feeding India', type: 'food_bank', city: 'Mumbai', lat: 19.0522, lng: 72.9005, capacityKg: 5000, preferences: ['grains', 'vegetables', 'prepared', 'dairy', 'fruits', 'beverages', 'spices', 'others'], operatingHours: '09:00-20:00' }
];
