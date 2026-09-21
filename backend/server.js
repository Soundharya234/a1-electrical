require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const {
  FoodItem, DemandForecast, SurplusEntry, Receiver, RedistributionOrder,
  SensorReading, QualityAssessment, ProcessingUnit, WasteLog,
  SustainabilityMetric, Settings
} = require('./models');

const forecastEngine = require('./forecast-engine');
const redistributionEngine = require('./redistribution-engine');
const sustainabilityEngine = require('./sustainability-engine');

const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------
// Food Items (/api/food-items)
// ---------------------------------------------------------
app.get('/api/food-items', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: 'i' };
    const items = await FoodItem.find(query);
    res.json(items);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/food-items', async (req, res) => {
  try {
    const item = new FoodItem({ ...req.body, id: uuidv4() });
    await item.save();
    res.status(201).json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/food-items/:id', async (req, res) => {
  try {
    const item = await FoodItem.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/food-items/:id', async (req, res) => {
  try {
    const item = await FoodItem.findOneAndDelete({ id: req.params.id });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/food-items/expiring', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 3;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    const items = await FoodItem.find({ expiryDate: { $lte: targetDate.toISOString() } });
    res.json(items);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/food-items/stats', async (req, res) => {
  try {
    const items = await FoodItem.find();
    let total = items.length;
    let expiring = 0;
    let expired = 0;
    let lowStock = 0;
    let totalValue = 0;
    const byCategoryMap = {};

    const now = new Date();
    const expiryTarget = new Date();
    expiryTarget.setDate(now.getDate() + 3);

    items.forEach(item => {
      totalValue += (item.quantity * item.unitPrice) || 0;
      if (item.quantity < item.threshold) lowStock++;
      
      const itemExpiry = new Date(item.expiryDate);
      if (itemExpiry < now) expired++;
      else if (itemExpiry <= expiryTarget) expiring++;

      if (!byCategoryMap[item.category]) {
        byCategoryMap[item.category] = { category: item.category, count: 0, value: 0 };
      }
      byCategoryMap[item.category].count++;
      byCategoryMap[item.category].value += (item.quantity * item.unitPrice) || 0;
    });

    res.json({
      total, expiring, expired, lowStock, totalValue,
      byCategory: Object.values(byCategoryMap)
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ---------------------------------------------------------
// Demand Forecasts (/api/forecasts)
// ---------------------------------------------------------
app.get('/api/forecasts', async (req, res) => {
  try {
    const { date, mealType } = req.query;
    let query = {};
    if (date) query.date = date;
    if (mealType) query.mealType = mealType;
    const forecasts = await DemandForecast.find(query);
    res.json(forecasts);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/forecasts', async (req, res) => {
  try {
    const entry = new DemandForecast({ ...req.body, id: uuidv4() });
    await entry.save();
    res.status(201).json(entry);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/forecasts/:id', async (req, res) => {
  try {
    const entry = await DemandForecast.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!entry) return res.status(404).json({ error: 'Not found' });
    res.json(entry);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/forecasts/predict', async (req, res) => {
  try {
    const { date, mealType } = req.query;
    if (!date || !mealType) return res.status(400).json({ error: 'date and mealType required' });
    
    const history = await DemandForecast.find({ mealType }).sort({ date: -1 }).lean();
    const prediction = forecastEngine.generateForecast(history, date, mealType);
    res.json(prediction);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/forecasts/accuracy', async (req, res) => {
  try {
    const forecasts = await DemandForecast.find().lean();
    const accuracy = forecastEngine.calculateAccuracy(forecasts);
    res.json(accuracy);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/forecasts/patterns', async (req, res) => {
  try {
    const forecasts = await DemandForecast.find().lean();
    const patterns = forecastEngine.detectPatterns(forecasts);
    res.json(patterns);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/forecasts/weekly-plan', async (req, res) => {
  try {
    const forecasts = await DemandForecast.find().lean();
    const plan = forecastEngine.generateWeeklyPlan(forecasts);
    res.json(plan);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ---------------------------------------------------------
// Surplus (/api/surplus)
// ---------------------------------------------------------
app.get('/api/surplus', async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;
    const items = await SurplusEntry.find(query);
    res.json(items);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/surplus', async (req, res) => {
  try {
    const entry = new SurplusEntry({ ...req.body, id: uuidv4() });
    await entry.save();
    res.status(201).json(entry);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/surplus/:id', async (req, res) => {
  try {
    const entry = await SurplusEntry.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!entry) return res.status(404).json({ error: 'Not found' });
    res.json(entry);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/surplus/match/:id', async (req, res) => {
  try {
    const surplus = await SurplusEntry.findOne({ id: req.params.id }).lean();
    if (!surplus) return res.status(404).json({ error: 'Not found' });
    const receivers = await Receiver.find({ active: true }).lean();
    
    const matches = redistributionEngine.matchSurplusToReceivers(surplus, receivers);
    res.json(matches);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/surplus/stats', async (req, res) => {
  try {
    const surplusItems = await SurplusEntry.find();
    let total = surplusItems.length;
    let available = 0;
    let claimed = 0;
    let delivered = 0;
    let totalValue = 0;
    let carbonFootprint = 0;

    surplusItems.forEach(item => {
      if (item.status === 'available') available++;
      if (item.status === 'claimed') claimed++;
      if (item.status === 'delivered') delivered++;
      totalValue += item.estimatedValue || 0;
      carbonFootprint += item.carbonFootprint || 0;
    });

    res.json({ total, available, claimed, delivered, totalValue, carbonFootprint });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/surplus/detect', async (req, res) => {
  try {
    const forecasts = await DemandForecast.find();
    let detected = 0;
    for (const f of forecasts) {
      if (f.actualServings != null && f.actualServings < f.predictedServings * 0.8) {
        const excess = f.predictedServings - f.actualServings;
        // Check if surplus already generated for this forecast
        const existing = await SurplusEntry.findOne({ sourceForecastId: f.id });
        if (!existing) {
          const entry = new SurplusEntry({
            id: uuidv4(),
            name: `Surplus from ${f.mealType}`,
            quantity: excess,
            unit: 'servings',
            status: 'available',
            sourceForecastId: f.id,
            dateIdentified: new Date().toISOString(),
            estimatedValue: excess * 50 // approx INR 50 per serving
          });
          await entry.save();
          detected++;
        }
      }
    }
    res.json({ success: true, detected });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ---------------------------------------------------------
// Receivers (/api/receivers)
// ---------------------------------------------------------
app.get('/api/receivers', async (req, res) => {
  try {
    const { type, city, active } = req.query;
    let query = {};
    if (type) query.type = type;
    if (city) query.city = city;
    if (active !== undefined) query.active = active === 'true';
    const items = await Receiver.find(query);
    res.json(items);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/receivers', async (req, res) => {
  try {
    const entry = new Receiver({ ...req.body, id: uuidv4() });
    await entry.save();
    res.status(201).json(entry);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/receivers/:id', async (req, res) => {
  try {
    const entry = await Receiver.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!entry) return res.status(404).json({ error: 'Not found' });
    res.json(entry);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/receivers/:id', async (req, res) => {
  try {
    const entry = await Receiver.findOneAndDelete({ id: req.params.id });
    if (!entry) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/receivers/stats', async (req, res) => {
  try {
    const receivers = await Receiver.find();
    let total = receivers.length;
    let totalCapacity = 0;
    let totalReceived = 0;
    const byTypeMap = {};

    receivers.forEach(r => {
      totalCapacity += r.capacity || 0;
      totalReceived += r.totalReceived || 0;
      byTypeMap[r.type] = (byTypeMap[r.type] || 0) + 1;
    });

    res.json({ total, byType: byTypeMap, totalCapacity, totalReceived });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ---------------------------------------------------------
// Redistribution Orders (/api/redistribution)
// ---------------------------------------------------------
app.get('/api/redistribution', async (req, res) => {
  try {
    const orders = await RedistributionOrder.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/redistribution', async (req, res) => {
  try {
    const order = new RedistributionOrder({ ...req.body, id: uuidv4() });
    await order.save();

    // Link surplus items
    if (order.surplusItemIds && order.surplusItemIds.length > 0) {
      await SurplusEntry.updateMany(
        { id: { $in: order.surplusItemIds } },
        { $set: { status: 'claimed' } }
      );
    }
    res.status(201).json(order);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/redistribution/:id', async (req, res) => {
  try {
    const order = await RedistributionOrder.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!order) return res.status(404).json({ error: 'Not found' });

    if (req.body.status === 'delivered') {
      if (order.surplusItemIds && order.surplusItemIds.length > 0) {
        await SurplusEntry.updateMany(
          { id: { $in: order.surplusItemIds } },
          { $set: { status: 'delivered' } }
        );
      }
      if (order.receiverId) {
        await Receiver.findOneAndUpdate(
          { id: order.receiverId },
          { $inc: { totalReceived: order.totalQuantity || 0 } }
        );
      }
    }
    res.json(order);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/redistribution/optimize-route', async (req, res) => {
  try {
    const { origin_lat, origin_lng, destination_ids } = req.query;
    if (!origin_lat || !origin_lng || !destination_ids) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    const destIdsArray = destination_ids.split(',');
    const receivers = await Receiver.find({ id: { $in: destIdsArray } }).lean();
    
    const origin = { lat: parseFloat(origin_lat), lng: parseFloat(origin_lng) };
    const route = redistributionEngine.optimizeRoute(origin, receivers);
    res.json(route);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/redistribution/stats', async (req, res) => {
  try {
    const orders = await RedistributionOrder.find();
    let total = orders.length;
    let pending = 0;
    let inTransit = 0;
    let delivered = 0;
    let totalQuantity = 0;
    let totalCarbonSaved = 0;

    orders.forEach(o => {
      if (o.status === 'pending') pending++;
      if (o.status === 'in_transit') inTransit++;
      if (o.status === 'delivered') delivered++;
      totalQuantity += o.totalQuantity || 0;
      totalCarbonSaved += o.carbonSaved || 0;
    });

    res.json({ total, pending, inTransit, delivered, totalQuantity, totalCarbonSaved });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ---------------------------------------------------------
// Sensors (/api/sensors)
// ---------------------------------------------------------
app.get('/api/sensors', async (req, res) => {
  try {
    const { type, location } = req.query;
    let query = {};
    if (type) query.type = type;
    if (location) query.location = location;
    const readings = await SensorReading.find(query).sort({ timestamp: -1 }).limit(100);
    res.json(readings);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/sensors', async (req, res) => {
  try {
    const reading = new SensorReading({ ...req.body, id: uuidv4() });
    await reading.save();
    res.status(201).json(reading);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/sensors/alerts', async (req, res) => {
  try {
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);
    const alerts = await SensorReading.find({ 
      isAlert: true,
      timestamp: { $gte: yesterday.toISOString() }
    }).sort({ timestamp: -1 });
    res.json(alerts);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/sensors/dashboard', async (req, res) => {
  try {
    // Latest reading per device grouped by location
    const latestReadings = await SensorReading.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: { _id: "$location", readings: { $push: "$$ROOT" } } },
      { $project: {
          location: "$_id",
          latest: { $slice: ["$readings", 5] } // top 5 recent per location
      }}
    ]);
    res.json(latestReadings);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/sensors/simulate', async (req, res) => {
  try {
    const locations = ['Cold Storage A', 'Cold Storage B', 'Dry Storage', 'Kitchen Main', 'Kitchen Prep', 'Serving Area'];
    let generated = 0;
    
    for (const loc of locations) {
      for (let i = 0; i < 12; i++) { // 12 readings (1 hour, every 5 mins)
        const t = new Date();
        t.setMinutes(t.getMinutes() - (i * 5));
        
        let tempRange, humRange;
        if (loc.includes('Cold')) { tempRange = [2, 8]; humRange = [70, 85]; }
        else if (loc.includes('Dry')) { tempRange = [20, 28]; humRange = [40, 60]; }
        else if (loc.includes('Kitchen')) { tempRange = [22, 35]; humRange = [50, 75]; }
        else { tempRange = [20, 30]; humRange = [45, 65]; }

        let temp = tempRange[0] + Math.random() * (tempRange[1] - tempRange[0]);
        let hum = humRange[0] + Math.random() * (humRange[1] - humRange[0]);
        
        let isAlert = false;
        let alertMessage = null;

        if (Math.random() < 0.1) {
          temp += 10;
          hum -= 20;
          isAlert = true;
          alertMessage = "Anomaly detected!";
        }

        const reading = new SensorReading({
          id: uuidv4(),
          deviceId: `DEV-${loc.replace(/\s+/g, '')}`,
          location: loc,
          type: 'environment',
          value: temp,
          unit: 'C',
          temperature: temp,
          humidity: hum,
          timestamp: t.toISOString(),
          isAlert,
          alertMessage
        });
        await reading.save();
        generated++;
      }
    }
    res.json({ success: true, message: `Generated ${generated} readings` });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ---------------------------------------------------------
// Quality (/api/quality)
// ---------------------------------------------------------
app.get('/api/quality', async (req, res) => {
  try {
    const { foodItemId, freshness } = req.query;
    let query = {};
    if (foodItemId) query.foodItemId = foodItemId;
    if (freshness) query.freshness = freshness;
    const items = await QualityAssessment.find(query).sort({ assessmentDate: -1 });
    res.json(items);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/quality', async (req, res) => {
  try {
    const entry = new QualityAssessment({ ...req.body, id: uuidv4() });
    await entry.save();
    res.status(201).json(entry);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/quality/assess/:foodItemId', async (req, res) => {
  try {
    const item = await FoodItem.findOne({ id: req.params.foodItemId });
    if (!item) return res.status(404).json({ error: 'Food item not found' });
    
    // Auto-assess quality
    const expiry = new Date(item.expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.max(0, (expiry - now) / (1000 * 60 * 60 * 24));
    
    let score = 10;
    if (daysUntilExpiry < 1) score = 2;
    else if (daysUntilExpiry < 3) score = 5;
    else if (daysUntilExpiry < 7) score = 8;
    
    let freshness = 'good';
    if (score < 4) freshness = 'spoiled';
    else if (score < 7) freshness = 'fair';
    
    let recommendation = 'Safe to use';
    if (freshness === 'spoiled') recommendation = 'Dispose immediately';
    else if (freshness === 'fair') recommendation = 'Use within 24 hours';
    
    res.json({ score, freshness, recommendation });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/quality/history/:foodItemId', async (req, res) => {
  try {
    const history = await QualityAssessment.find({ foodItemId: req.params.foodItemId }).sort({ assessmentDate: 1 });
    res.json(history);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ---------------------------------------------------------
// Processing Units (/api/processing)
// ---------------------------------------------------------
app.get('/api/processing', async (req, res) => {
  try {
    const units = await ProcessingUnit.find();
    res.json(units);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/processing', async (req, res) => {
  try {
    const unit = new ProcessingUnit({ ...req.body, id: uuidv4() });
    await unit.save();
    res.status(201).json(unit);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/processing/:id', async (req, res) => {
  try {
    const unit = await ProcessingUnit.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!unit) return res.status(404).json({ error: 'Not found' });
    res.json(unit);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/processing/efficiency', async (req, res) => {
  try {
    const units = await ProcessingUnit.find();
    let avgEfficiency = 0, avgUptime = 0, totalEnergy = 0, totalWastage = 0;
    
    if (units.length > 0) {
      avgEfficiency = units.reduce((acc, u) => acc + (u.oee || 0), 0) / units.length;
      avgUptime = units.reduce((acc, u) => acc + (u.availability || 0), 0) / units.length;
      totalEnergy = units.reduce((acc, u) => acc + (u.energyConsumed || 0), 0);
      totalWastage = units.reduce((acc, u) => acc + (u.wastageGenerated || 0), 0);
    }

    res.json({ avgEfficiency, avgUptime, totalEnergy, totalWastage, units });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/processing/anomalies', async (req, res) => {
  try {
    const units = await ProcessingUnit.find();
    const anomalies = units.filter(u => (u.oee < 70 || u.wastageGenerated > 15 || u.availability < 80)).map(u => {
      return {
        unit: u.name,
        issue: u.oee < 70 ? 'Low Efficiency' : (u.wastageGenerated > 15 ? 'High Wastage' : 'Low Uptime'),
        recommendation: 'Inspect unit immediately and check maintenance logs.'
      };
    });
    res.json(anomalies);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ---------------------------------------------------------
// Waste Logs (/api/waste)
// ---------------------------------------------------------
app.get('/api/waste', async (req, res) => {
  try {
    const { source, reason, from, to } = req.query;
    let query = {};
    if (source) query.source = source;
    if (reason) query.reason = reason;
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = from;
      if (to) query.date.$lte = to;
    }
    const logs = await WasteLog.find(query);
    res.json(logs);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/waste', async (req, res) => {
  try {
    // Mock calculate carbon & water using engine
    const carbonFootprint = sustainabilityEngine.calculateCarbonImpact(req.body.quantity, 'landfill');
    const entry = new WasteLog({ 
      ...req.body, 
      id: uuidv4(),
      carbonFootprint: carbonFootprint,
      waterFootprint: (req.body.quantity * 10) // Mock water
    });
    await entry.save();
    res.status(201).json(entry);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/waste/stats', async (req, res) => {
  try {
    const logs = await WasteLog.find();
    let totalWaste = 0;
    let totalCost = 0;
    let totalCarbon = 0;
    let totalWater = 0;
    const bySource = {};
    const byReason = {};

    logs.forEach(l => {
      totalWaste += l.quantity || 0;
      totalCost += l.cost || 0;
      totalCarbon += l.carbonFootprint || 0;
      totalWater += l.waterFootprint || 0;

      if (!bySource[l.source]) bySource[l.source] = 0;
      bySource[l.source] += l.quantity || 0;

      if (!byReason[l.reason]) byReason[l.reason] = 0;
      byReason[l.reason] += l.quantity || 0;
    });

    res.json({ totalWaste, totalCost, totalCarbon, totalWater, bySource, byReason, preventablePercentage: 45 });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ---------------------------------------------------------
// Sustainability (/api/sustainability)
// ---------------------------------------------------------
app.get('/api/sustainability', async (req, res) => {
  try {
    const metrics = await SustainabilityMetric.find().sort({ period: -1 });
    res.json(metrics);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/sustainability/dashboard', async (req, res) => {
  try {
    const metrics = await SustainabilityMetric.find().sort({ period: -1 }).limit(1);
    if (metrics.length > 0) {
      res.json(metrics[0]);
    } else {
      res.json({ totalCarbonSaved: 0, waterSaved: 0, mealsRedistributed: 0, esgScore: 0, wasteDiversionRate: 0 });
    }
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/sustainability/report', async (req, res) => {
  try {
    const data = await SustainabilityMetric.find().lean();
    const report = sustainabilityEngine.generateSustainabilityReport(data);
    res.json(report);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/sustainability/trends', async (req, res) => {
  try {
    const trends = await SustainabilityMetric.find().sort({ period: -1 }).limit(6);
    res.json(trends);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ---------------------------------------------------------
// Settings (/api/settings)
// ---------------------------------------------------------
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({ id: uuidv4() });
      await settings.save();
    }
    res.json(settings);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({ ...req.body, id: uuidv4() });
      await settings.save();
      return res.json(settings);
    }
    Object.assign(settings, req.body);
    await settings.save();
    res.json(settings);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ---------------------------------------------------------
// Setup / Seed (/api/setup)
// ---------------------------------------------------------
app.get('/api/setup', async (req, res) => {
  try {
    await Promise.all([
      FoodItem.deleteMany({}), DemandForecast.deleteMany({}), SurplusEntry.deleteMany({}),
      Receiver.deleteMany({}), RedistributionOrder.deleteMany({}), SensorReading.deleteMany({}),
      QualityAssessment.deleteMany({}), ProcessingUnit.deleteMany({}), WasteLog.deleteMany({}),
      SustainabilityMetric.deleteMany({}), Settings.deleteMany({})
    ]);

    // Create Food Items
    const foodItems = [];
    const categories = ['Produce', 'Dairy', 'Meat', 'Grains', 'Prepared'];
    for(let i=0; i<50; i++) {
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + (Math.floor(Math.random() * 17) - 2)); // -2 to +15 days
      foodItems.push(new FoodItem({
        id: uuidv4(),
        name: `Demo Food ${i+1}`,
        category: categories[i % categories.length],
        quantity: Math.floor(Math.random() * 100) + 10,
        unit: 'kg',
        expiryDate: expDate.toISOString(),
        location: 'Storage A',
        status: expDate < new Date() ? 'expired' : 'in_stock',
        threshold: 20,
        unitPrice: Math.floor(Math.random() * 100) + 10
      }));
    }
    await FoodItem.insertMany(foodItems);

    // Demand Forecasts
    const forecasts = [];
    const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
    for(let i=0; i<120; i++) { // 30 days * 4 meals
      const d = new Date();
      d.setDate(d.getDate() - Math.floor(i/4));
      const predicted = Math.floor(Math.random() * 500) + 100;
      const actual = predicted - Math.floor(Math.random() * 100);
      forecasts.push(new DemandForecast({
        id: uuidv4(),
        date: d.toISOString().split('T')[0],
        mealType: meals[i % 4],
        predictedServings: predicted,
        actualServings: actual,
        weather: 'Sunny',
        events: []
      }));
    }
    await DemandForecast.insertMany(forecasts);

    // Receivers
    const receivers = [];
    for(let i=0; i<15; i++) {
      receivers.push(new Receiver({
        id: uuidv4(),
        name: `NGO / Shelter ${i+1}`,
        type: ['ngo', 'food_bank', 'shelter'][i % 3],
        city: 'Mumbai',
        address: 'Demo Address',
        contactPerson: 'John Doe',
        contactPhone: '1234567890',
        capacity: 100 + (i * 10),
        active: true,
        location: { lat: 19.0760 + (i * 0.01), lng: 72.8777 + (i * 0.01) },
        totalReceived: Math.floor(Math.random() * 1000)
      }));
    }
    await Receiver.insertMany(receivers);

    res.json({ success: true, message: 'Seeded comprehensive demo data successfully.' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-order').then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('MongoDB connection error:', err);
});
