const mongoose = require('mongoose');

// 1. FoodItem
const foodItemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['grains', 'vegetables', 'fruits', 'dairy', 'meat', 'seafood', 'prepared', 'beverages', 'spices', 'others']
  },
  quantity: { type: Number, required: true },
  unit: { 
    type: String, 
    required: true,
    enum: ['kg', 'liters', 'pieces', 'servings', 'packets']
  },
  costPerUnit: { type: Number },
  expiryDate: { type: String, required: true },
  qualityScore: { type: Number, default: 10 },
  storageCondition: { 
    type: String,
    enum: ['ambient', 'refrigerated', 'frozen', 'dry']
  },
  batchId: { type: String },
  location: { type: String },
  status: { 
    type: String, 
    default: 'available',
    enum: ['available', 'low', 'expiring', 'expired', 'surplus']
  },
  alertThreshold: { type: Number, default: 5 },
  addedAt: { type: String }
});

// 2. DemandForecast
const demandForecastSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  mealType: { 
    type: String, 
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'snacks']
  },
  predictedServings: { type: Number, required: true },
  actualServings: { type: Number, default: 0 },
  confidence: { type: Number }, // 0-100
  foodItems: [{
    foodItemName: String,
    predictedQty: Number,
    actualQty: Number,
    unit: String
  }],
  dayOfWeek: { type: String },
  isSpecialEvent: { type: Boolean, default: false },
  eventName: { type: String },
  createdAt: { type: String }
});

// 3. SurplusEntry
const surplusEntrySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  foodItemId: { type: String },
  foodItemName: { type: String, required: true },
  category: { type: String },
  surplusQuantity: { type: Number, required: true },
  unit: { type: String },
  reason: { 
    type: String,
    enum: ['overproduction', 'cancellation', 'forecast_error', 'near_expiry', 'quality_decline', 'other']
  },
  status: { 
    type: String, 
    default: 'available',
    enum: ['available', 'claimed', 'in_transit', 'delivered', 'expired', 'composted']
  },
  qualityScore: { type: Number },
  bestBefore: { type: String },
  estimatedValue: { type: Number },
  carbonFootprint: { type: Number },
  createdAt: { type: String },
  updatedAt: { type: String }
});

// 4. Receiver
const receiverSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['ngo', 'food_bank', 'shelter', 'community_kitchen', 'secondary_buyer']
  },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  lat: { type: Number },
  lng: { type: Number },
  contactPerson: { type: String },
  phone: { type: String },
  email: { type: String },
  capacity: { type: Number },
  currentLoad: { type: Number, default: 0 },
  preferences: [{ type: String }],
  rating: { type: Number, default: 4.0 },
  totalReceived: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  operatingHours: { type: String },
  createdAt: { type: String }
});

// 5. RedistributionOrder
const redistributionOrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  surplusIds: [{ type: String }],
  receiverId: { type: String, required: true },
  receiverName: { type: String },
  status: { 
    type: String, 
    default: 'pending',
    enum: ['pending', 'confirmed', 'picked_up', 'in_transit', 'delivered', 'cancelled']
  },
  totalQuantity: { type: Number },
  totalValue: { type: Number },
  pickupTime: { type: String },
  estimatedDelivery: { type: String },
  actualDelivery: { type: String },
  distance: { type: Number },
  routeDetails: {
    stops: Array,
    totalDistance: Number,
    totalTime: Number
  },
  driverName: { type: String },
  vehicleId: { type: String },
  feedback: {
    rating: Number,
    comment: String
  },
  carbonSaved: { type: Number },
  createdAt: { type: String },
  updatedAt: { type: String }
});

// 6. SensorReading
const sensorReadingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  deviceId: { type: String, required: true },
  deviceName: { type: String },
  type: { 
    type: String, 
    required: true,
    enum: ['temperature', 'humidity', 'gas', 'weight']
  },
  value: { type: Number, required: true },
  unit: { type: String },
  location: { type: String, required: true },
  isAlert: { type: Boolean, default: false },
  alertMessage: { type: String },
  threshold: {
    min: Number,
    max: Number
  },
  timestamp: { type: String, required: true }
});

// 7. QualityAssessment
const qualityAssessmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  foodItemId: { type: String },
  foodItemName: { type: String },
  method: { 
    type: String, 
    required: true,
    enum: ['visual', 'sensor', 'manual', 'ai_vision']
  },
  score: { type: Number, required: true },
  freshness: { 
    type: String,
    enum: ['fresh', 'good', 'fair', 'poor', 'spoiled']
  },
  color: { type: String },
  texture: { type: String },
  odor: { type: String },
  recommendation: { 
    type: String,
    enum: ['consume_now', 'redistribute', 'discount', 'compost', 'dispose']
  },
  assessedBy: { type: String },
  timestamp: { type: String, required: true }
});

// 8. ProcessingUnit
const processingUnitSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['kitchen', 'bakery', 'dairy_processing', 'meat_processing', 'grain_mill', 'packaging', 'cold_storage']
  },
  status: { 
    type: String, 
    default: 'operational',
    enum: ['operational', 'maintenance', 'idle', 'fault']
  },
  efficiency: { type: Number, default: 85 },
  uptime: { type: Number, default: 95 },
  energyUsage: { type: Number },
  rawMaterialInput: { type: Number },
  outputRate: { type: Number },
  wastageRate: { type: Number },
  temperature: { type: Number },
  humidity: { type: Number },
  lastMaintenance: { type: String },
  nextMaintenance: { type: String },
  alerts: [{
    type: { type: String },
    message: { type: String },
    timestamp: { type: String }
  }]
});

// 9. WasteLog
const wasteLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  source: { 
    type: String, 
    required: true,
    enum: ['kitchen', 'storage', 'processing', 'serving', 'expired']
  },
  foodItemId: { type: String },
  foodItemName: { type: String },
  category: { type: String },
  quantity: { type: Number, required: true },
  unit: { type: String },
  reason: { 
    type: String,
    enum: ['expired', 'spoiled', 'overproduction', 'plate_waste', 'processing_loss', 'storage_failure', 'other']
  },
  cost: { type: Number },
  carbonFootprint: { type: Number },
  waterFootprint: { type: Number },
  disposalMethod: { 
    type: String,
    enum: ['compost', 'biogas', 'animal_feed', 'landfill', 'incineration']
  },
  preventable: { type: Boolean, default: true },
  timestamp: { type: String, required: true }
});

// 10. SustainabilityMetric
const sustainabilityMetricSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  period: { type: String, required: true },
  periodType: { 
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly']
  },
  wasteGenerated: { type: Number },
  wasteReduced: { type: Number },
  wasteDiverted: { type: Number },
  mealsRedistributed: { type: Number },
  carbonSaved: { type: Number },
  waterSaved: { type: Number },
  energySaved: { type: Number },
  costSaved: { type: Number },
  complianceScore: { type: Number },
  sdgContributions: {
    goal2: Number,
    goal12: Number,
    goal13: Number
  },
  createdAt: { type: String }
});

// 11. Settings
const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed },
  username: { type: String },
  password: { type: String }
});

const FoodItem = mongoose.model('FoodItem', foodItemSchema);
const DemandForecast = mongoose.model('DemandForecast', demandForecastSchema);
const SurplusEntry = mongoose.model('SurplusEntry', surplusEntrySchema);
const Receiver = mongoose.model('Receiver', receiverSchema);
const RedistributionOrder = mongoose.model('RedistributionOrder', redistributionOrderSchema);
const SensorReading = mongoose.model('SensorReading', sensorReadingSchema);
const QualityAssessment = mongoose.model('QualityAssessment', qualityAssessmentSchema);
const ProcessingUnit = mongoose.model('ProcessingUnit', processingUnitSchema);
const WasteLog = mongoose.model('WasteLog', wasteLogSchema);
const SustainabilityMetric = mongoose.model('SustainabilityMetric', sustainabilityMetricSchema);
const Settings = mongoose.model('Settings', settingsSchema);

module.exports = { 
  FoodItem, 
  DemandForecast, 
  SurplusEntry, 
  Receiver, 
  RedistributionOrder, 
  SensorReading, 
  QualityAssessment, 
  ProcessingUnit, 
  WasteLog, 
  SustainabilityMetric, 
  Settings 
};
