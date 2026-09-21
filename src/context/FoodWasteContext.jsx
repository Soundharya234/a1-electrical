import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FoodWasteContext = createContext();
export const useFoodWaste = () => useContext(FoodWasteContext);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const FoodWasteProvider = ({ children }) => {
  const [foodItems, setFoodItems] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [surplusEntries, setSurplusEntries] = useState([]);
  const [receivers, setReceivers] = useState([]);
  const [redistributionOrders, setRedistributionOrders] = useState([]);
  const [sensorReadings, setSensorReadings] = useState([]);
  const [qualityAssessments, setQualityAssessments] = useState([]);
  const [processingUnits, setProcessingUnits] = useState([]);
  const [wasteLogs, setWasteLogs] = useState([]);
  const [sustainabilityMetrics, setSustainabilityMetrics] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({});

  const handleError = (err) => {
    console.error('API Error:', err);
    setError(err.message || 'An error occurred');
  };

  const handleResponse = async (response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  };

  // ---------------- Food Items ---------------- //
  const fetchFoodItems = useCallback(async (filters = '') => {
    try {
      const res = await fetch(`${API_URL}/api/food-items${filters ? `?${new URLSearchParams(filters)}` : ''}`);
      const data = await handleResponse(res);
      setFoodItems(data);
      return data;
    } catch (err) { handleError(err); return []; }
  }, []);

  const addFoodItem = useCallback(async (item) => {
    try {
      const res = await fetch(`${API_URL}/api/food-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = await handleResponse(res);
      setFoodItems((prev) => [...prev, data]);
      return data;
    } catch (err) { handleError(err); throw err; }
  }, []);

  const updateFoodItem = useCallback(async (id, item) => {
    try {
      const res = await fetch(`${API_URL}/api/food-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = await handleResponse(res);
      setFoodItems((prev) => prev.map((f) => (f._id === id || f.id === id ? data : f)));
      return data;
    } catch (err) { handleError(err); throw err; }
  }, []);

  const deleteFoodItem = useCallback(async (id) => {
    try {
      await handleResponse(await fetch(`${API_URL}/api/food-items/${id}`, { method: 'DELETE' }));
      setFoodItems((prev) => prev.filter((f) => f._id !== id && f.id !== id));
    } catch (err) { handleError(err); throw err; }
  }, []);

  const getExpiringItems = useCallback(async (days = 3) => {
    try {
      const res = await fetch(`${API_URL}/api/food-items/expiring?days=${days}`);
      return await handleResponse(res);
    } catch (err) { handleError(err); return []; }
  }, []);

  const getFoodItemStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/food-items/stats`);
      return await handleResponse(res);
    } catch (err) { handleError(err); return {}; }
  }, []);

  // ---------------- Forecasts ---------------- //
  const fetchForecasts = useCallback(async (filters = '') => {
    try {
      const res = await fetch(`${API_URL}/api/forecasts${filters ? `?${new URLSearchParams(filters)}` : ''}`);
      const data = await handleResponse(res);
      setForecasts(data);
      return data;
    } catch (err) { handleError(err); return []; }
  }, []);

  const createForecast = useCallback(async (item) => {
    try {
      const res = await fetch(`${API_URL}/api/forecasts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = await handleResponse(res);
      setForecasts((prev) => [...prev, data]);
      return data;
    } catch (err) { handleError(err); throw err; }
  }, []);

  const updateForecast = useCallback(async (id, item) => {
    try {
      const res = await fetch(`${API_URL}/api/forecasts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = await handleResponse(res);
      setForecasts((prev) => prev.map((f) => (f._id === id || f.id === id ? data : f)));
      return data;
    } catch (err) { handleError(err); throw err; }
  }, []);

  const getPrediction = useCallback(async (date, mealType) => {
    try {
      const res = await fetch(`${API_URL}/api/forecasts/predict?date=${date}&mealType=${mealType}`);
      return await handleResponse(res);
    } catch (err) { handleError(err); return null; }
  }, []);

  const getForecastAccuracy = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/forecasts/accuracy`);
      return await handleResponse(res);
    } catch (err) { handleError(err); return null; }
  }, []);

  const getForecastPatterns = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/forecasts/patterns`);
      return await handleResponse(res);
    } catch (err) { handleError(err); return []; }
  }, []);

  const getWeeklyPlan = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/forecasts/weekly-plan`);
      return await handleResponse(res);
    } catch (err) { handleError(err); return []; }
  }, []);

  // ---------------- Surplus ---------------- //
  const fetchSurplus = useCallback(async (filters = '') => {
    try {
      const res = await fetch(`${API_URL}/api/surplus${filters ? `?${new URLSearchParams(filters)}` : ''}`);
      const data = await handleResponse(res);
      setSurplusEntries(data);
      return data;
    } catch (err) { handleError(err); return []; }
  }, []);

  const createSurplus = useCallback(async (item) => {
    try {
      const res = await fetch(`${API_URL}/api/surplus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = await handleResponse(res);
      setSurplusEntries((prev) => [...prev, data]);
      return data;
    } catch (err) { handleError(err); throw err; }
  }, []);

  const updateSurplus = useCallback(async (id, item) => {
    try {
      const res = await fetch(`${API_URL}/api/surplus/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = await handleResponse(res);
      setSurplusEntries((prev) => prev.map((f) => (f._id === id || f.id === id ? data : f)));
      return data;
    } catch (err) { handleError(err); throw err; }
  }, []);

  const findSurplusMatches = useCallback(async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/surplus/match/${id}`);
      return await handleResponse(res);
    } catch (err) { handleError(err); return []; }
  }, []);

  const getSurplusStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/surplus/stats`);
      return await handleResponse(res);
    } catch (err) { handleError(err); return null; }
  }, []);

  const detectSurplus = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/surplus/detect`, { method: 'POST' });
      return await handleResponse(res);
    } catch (err) { handleError(err); return null; }
  }, []);

  // ---------------- Receivers ---------------- //
  const fetchReceivers = useCallback(async (filters = '') => {
    try {
      const res = await fetch(`${API_URL}/api/receivers${filters ? `?${new URLSearchParams(filters)}` : ''}`);
      const data = await handleResponse(res);
      setReceivers(data);
      return data;
    } catch (err) { handleError(err); return []; }
  }, []);

  const addReceiver = useCallback(async (item) => {
    try {
      const res = await fetch(`${API_URL}/api/receivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = await handleResponse(res);
      setReceivers((prev) => [...prev, data]);
      return data;
    } catch (err) { handleError(err); throw err; }
  }, []);

  const updateReceiver = useCallback(async (id, item) => {
    try {
      const res = await fetch(`${API_URL}/api/receivers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = await handleResponse(res);
      setReceivers((prev) => prev.map((f) => (f._id === id || f.id === id ? data : f)));
      return data;
    } catch (err) { handleError(err); throw err; }
  }, []);

  const deleteReceiver = useCallback(async (id) => {
    try {
      await handleResponse(await fetch(`${API_URL}/api/receivers/${id}`, { method: 'DELETE' }));
      setReceivers((prev) => prev.filter((f) => f._id !== id && f.id !== id));
    } catch (err) { handleError(err); throw err; }
  }, []);

  // ---------------- Redistribution ---------------- //
  const fetchRedistributionOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/redistribution`);
      const data = await handleResponse(res);
      setRedistributionOrders(data);
      return data;
    } catch (err) { handleError(err); return []; }
  }, []);

  const createRedistributionOrder = useCallback(async (item) => {
    try {
      const res = await fetch(`${API_URL}/api/redistribution`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = await handleResponse(res);
      setRedistributionOrders((prev) => [...prev, data]);
      return data;
    } catch (err) { handleError(err); throw err; }
  }, []);

  const updateRedistributionOrder = useCallback(async (id, item) => {
    try {
      const res = await fetch(`${API_URL}/api/redistribution/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = await handleResponse(res);
      setRedistributionOrders((prev) => prev.map((f) => (f._id === id || f.id === id ? data : f)));
      return data;
    } catch (err) { handleError(err); throw err; }
  }, []);

  const optimizeRoute = useCallback(async (originLat, originLng, destinationIds) => {
    try {
      const qs = new URLSearchParams({ originLat, originLng, destinationIds: destinationIds.join(',') });
      const res = await fetch(`${API_URL}/api/redistribution/optimize-route?${qs}`);
      return await handleResponse(res);
    } catch (err) { handleError(err); return null; }
  }, []);

  const getRedistributionStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/redistribution/stats`);
      return await handleResponse(res);
    } catch (err) { handleError(err); return null; }
  }, []);

  // ---------------- Sensors ---------------- //
  const fetchSensorReadings = useCallback(async (filters = '') => {
    try {
      const res = await fetch(`${API_URL}/api/sensors${filters ? `?${new URLSearchParams(filters)}` : ''}`);
      const data = await handleResponse(res);
      setSensorReadings(data);
      return data;
    } catch (err) { handleError(err); return []; }
  }, []);

  const getSensorAlerts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/sensors/alerts`);
      return await handleResponse(res);
    } catch (err) { handleError(err); return []; }
  }, []);

  const getSensorDashboard = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/sensors/dashboard`);
      return await handleResponse(res);
    } catch (err) { handleError(err); return null; }
  }, []);

  const simulateSensors = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/sensors/simulate`, { method: 'POST' });
      return await handleResponse(res);
    } catch (err) { handleError(err); return null; }
  }, []);

  // ---------------- Quality ---------------- //
  const fetchQualityAssessments = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/quality`);
      const data = await handleResponse(res);
      setQualityAssessments(data);
      return data;
    } catch (err) { handleError(err); return []; }
  }, []);

  const assessQuality = useCallback(async (foodItemId) => {
    try {
      const res = await fetch(`${API_URL}/api/quality/assess/${foodItemId}`);
      return await handleResponse(res);
    } catch (err) { handleError(err); return null; }
  }, []);

  const getQualityHistory = useCallback(async (foodItemId) => {
    try {
      const res = await fetch(`${API_URL}/api/quality/history/${foodItemId}`);
      return await handleResponse(res);
    } catch (err) { handleError(err); return []; }
  }, []);

  // ---------------- Processing ---------------- //
  const fetchProcessingUnits = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/processing`);
      const data = await handleResponse(res);
      setProcessingUnits(data);
      return data;
    } catch (err) { handleError(err); return []; }
  }, []);

  const addProcessingUnit = useCallback(async (item) => {
    try {
      const res = await fetch(`${API_URL}/api/processing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = await handleResponse(res);
      setProcessingUnits((prev) => [...prev, data]);
      return data;
    } catch (err) { handleError(err); throw err; }
  }, []);

  const updateProcessingUnit = useCallback(async (id, item) => {
    try {
      const res = await fetch(`${API_URL}/api/processing/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = await handleResponse(res);
      setProcessingUnits((prev) => prev.map((f) => (f._id === id || f.id === id ? data : f)));
      return data;
    } catch (err) { handleError(err); throw err; }
  }, []);

  const getProcessingEfficiency = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/processing/efficiency`);
      return await handleResponse(res);
    } catch (err) { handleError(err); return null; }
  }, []);

  const getProcessingAnomalies = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/processing/anomalies`);
      return await handleResponse(res);
    } catch (err) { handleError(err); return []; }
  }, []);

  // ---------------- Waste ---------------- //
  const fetchWasteLogs = useCallback(async (filters = '') => {
    try {
      const res = await fetch(`${API_URL}/api/waste${filters ? `?${new URLSearchParams(filters)}` : ''}`);
      const data = await handleResponse(res);
      setWasteLogs(data);
      return data;
    } catch (err) { handleError(err); return []; }
  }, []);

  const createWasteLog = useCallback(async (item) => {
    try {
      const res = await fetch(`${API_URL}/api/waste`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = await handleResponse(res);
      setWasteLogs((prev) => [...prev, data]);
      return data;
    } catch (err) { handleError(err); throw err; }
  }, []);

  const getWasteStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/waste/stats`);
      return await handleResponse(res);
    } catch (err) { handleError(err); return null; }
  }, []);

  // ---------------- Sustainability ---------------- //
  const fetchSustainabilityMetrics = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/sustainability`);
      const data = await handleResponse(res);
      setSustainabilityMetrics(data);
      return data;
    } catch (err) { handleError(err); return []; }
  }, []);

  const getSustainabilityDashboard = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/sustainability/dashboard`);
      return await handleResponse(res);
    } catch (err) { handleError(err); return null; }
  }, []);

  const getSustainabilityReport = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/sustainability/report`);
      return await handleResponse(res);
    } catch (err) { handleError(err); return null; }
  }, []);

  const getSustainabilityTrends = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/sustainability/trends`);
      return await handleResponse(res);
    } catch (err) { handleError(err); return []; }
  }, []);

  // ---------------- Settings ---------------- //
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/settings`);
      return await handleResponse(res);
    } catch (err) { handleError(err); return null; }
  }, []);

  const updateSettings = useCallback(async (data) => {
    try {
      const res = await fetch(`${API_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await handleResponse(res);
    } catch (err) { handleError(err); throw err; }
  }, []);

  // ---------------- Setup ---------------- //
  const runSetup = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/setup`);
      return await handleResponse(res);
    } catch (err) { handleError(err); return null; }
  }, []);

  // ---------------- Initial Load ---------------- //
  useEffect(() => {
    let isMounted = true;
    
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.allSettled([
          fetchFoodItems(),
          fetchForecasts(),
          fetchSurplus(),
          fetchReceivers(),
          fetchRedistributionOrders(),
          fetchSensorReadings(),
          fetchProcessingUnits(),
          fetchWasteLogs(),
          fetchSustainabilityMetrics(),
        ]);
      } catch (err) {
        console.error('Failed to load initial data', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInitialData();
    return () => { isMounted = false; };
  }, [
    fetchFoodItems, fetchForecasts, fetchSurplus, fetchReceivers, 
    fetchRedistributionOrders, fetchSensorReadings, fetchProcessingUnits, 
    fetchWasteLogs, fetchSustainabilityMetrics
  ]);

  const value = {
    // State
    foodItems, forecasts, surplusEntries, receivers, redistributionOrders,
    sensorReadings, qualityAssessments, processingUnits, wasteLogs,
    sustainabilityMetrics, alerts, loading, error, dashboardStats,
    
    // Setters
    setAlerts, setDashboardStats,

    // API Functions
    fetchFoodItems, addFoodItem, updateFoodItem, deleteFoodItem, getExpiringItems, getFoodItemStats,
    fetchForecasts, createForecast, updateForecast, getPrediction, getForecastAccuracy, getForecastPatterns, getWeeklyPlan,
    fetchSurplus, createSurplus, updateSurplus, findSurplusMatches, getSurplusStats, detectSurplus,
    fetchReceivers, addReceiver, updateReceiver, deleteReceiver,
    fetchRedistributionOrders, createRedistributionOrder, updateRedistributionOrder, optimizeRoute, getRedistributionStats,
    fetchSensorReadings, getSensorAlerts, getSensorDashboard, simulateSensors,
    fetchQualityAssessments, assessQuality, getQualityHistory,
    fetchProcessingUnits, addProcessingUnit, updateProcessingUnit, getProcessingEfficiency, getProcessingAnomalies,
    fetchWasteLogs, createWasteLog, getWasteStats,
    fetchSustainabilityMetrics, getSustainabilityDashboard, getSustainabilityReport, getSustainabilityTrends,
    fetchSettings, updateSettings,
    runSetup
  };

  return (
    <FoodWasteContext.Provider value={value}>
      {children}
    </FoodWasteContext.Provider>
  );
};
