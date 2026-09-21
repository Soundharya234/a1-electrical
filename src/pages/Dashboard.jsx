import { useState, useEffect } from 'react';
import { useFoodWaste } from '../context/FoodWasteContext';
import KPICard from '../components/KPICard';
import { ChartContainer, BarChart, LineChart, GaugeChart } from '../components/ChartContainer';
import AlertBanner from '../components/AlertBanner';
import StatusBadge from '../components/StatusBadge';
import { Sparkline } from '../components/MiniChart';
import { formatCurrency, formatWeight, formatCO2, getExpiryStatus, getRelativeTime } from '../utils/wasteCalculator';
import { Leaf, TrendingDown, Utensils, Truck, Thermometer, AlertTriangle, Package, ArrowRight, RefreshCw, Zap, Droplets } from 'lucide-react';

export default function Dashboard() {
  const {
    foodItems = [],
    forecasts = [],
    surplus = [],
    wasteLogs = [],
    redistributionOrders = [],
    sensorReadings = [],
    dashboardStats,
    alerts = [],
    fetchFoodItems,
    fetchForecasts,
    fetchSurplus,
    fetchWasteLogs,
    fetchRedistributionOrders,
    fetchSensorReadings,
    fetchSustainabilityMetrics,
    getPrediction,
    simulateSensors,
    detectSurplus,
    getSustainabilityReport,
    runSetup
  } = useFoodWaste() || {};

  const [loadingAction, setLoadingAction] = useState(null);

  const fetchAllData = async () => {
    const fetchSafe = async (fn) => {
      try {
        if (fn) await fn();
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    await Promise.all([
      fetchSafe(fetchFoodItems),
      fetchSafe(fetchForecasts),
      fetchSafe(fetchSurplus),
      fetchSafe(fetchWasteLogs),
      fetchSafe(fetchRedistributionOrders),
      fetchSafe(fetchSensorReadings),
      fetchSafe(fetchSustainabilityMetrics)
    ]);
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefreshAll = async () => {
    await fetchAllData();
  };

  const handleAction = async (actionName, actionFn) => {
    setLoadingAction(actionName);
    try {
      if (actionFn) {
        await actionFn();
        await fetchAllData();
      }
    } catch (err) {
      console.error(`Error running ${actionName}:`, err);
    } finally {
      setLoadingAction(null);
    }
  };

  const stats = {
    wasteReduced: dashboardStats?.wasteReduced || wasteLogs.reduce((sum, w) => sum + (w.preventable ? w.quantity : 0), 0) || 2450,
    mealsRedistributed: dashboardStats?.mealsRedistributed || redistributionOrders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.totalQuantity || 0), 0) || 1830,
    carbonSaved: dashboardStats?.carbonSaved || 4200,
    forecastAccuracy: dashboardStats?.forecastAccuracy || 87,
    esgScore: dashboardStats?.esgScore || 89
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayForecasts = forecasts.filter(f => f.date === todayStr);
  const mealChartData = todayForecasts.length > 0 
    ? todayForecasts.map((f, i) => ({ 
        label: f.mealType, 
        value: f.predictedServings, 
        color: ['#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6'][i % 4] || '#3B82F6' 
      }))
    : [
      { label: 'Breakfast', value: 245, color: '#3B82F6' },
      { label: 'Lunch', value: 380, color: '#22C55E' },
      { label: 'Dinner', value: 320, color: '#F59E0B' },
      { label: 'Snacks', value: 140, color: '#8B5CF6' }
    ];

  const wasteTrendData = dashboardStats?.wasteTrend || [
    { label: 'Mon', value: 45 },
    { label: 'Tue', value: 52 },
    { label: 'Wed', value: 38 },
    { label: 'Thu', value: 65 },
    { label: 'Fri', value: 48 },
    { label: 'Sat', value: 35 },
    { label: 'Sun', value: 40 }
  ];

  const now = new Date();
  const seventyTwoHours = 72 * 60 * 60 * 1000;
  
  let expiringSoon = foodItems.filter(item => {
    if (!item.expiryDate) return false;
    const expiry = new Date(item.expiryDate);
    const diff = expiry.getTime() - now.getTime();
    return diff > 0 && diff <= seventyTwoHours;
  }).sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  if (expiringSoon.length === 0) {
    expiringSoon = [
      { id: '1', name: 'Fresh Milk', category: 'Dairy', quantity: 15, unit: 'L', expiryDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() },
      { id: '2', name: 'Tomatoes', category: 'Vegetables', quantity: 25, unit: 'kg', expiryDate: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString() },
      { id: '3', name: 'Bread', category: 'Bakery', quantity: 40, unit: 'loaves', expiryDate: new Date(now.getTime() + 70 * 60 * 60 * 1000).toISOString() }
    ];
  }

  const availableSurplus = surplus.filter(s => s.status === 'available');

  const getCategoryEmoji = (category) => {
    switch(category?.toLowerCase()) {
      case 'dairy': return '🥛';
      case 'vegetables': return '🍅';
      case 'bakery': return '🍞';
      case 'meat': return '🥩';
      case 'fruit': return '🍎';
      default: return '📦';
    }
  };

  const safeFormatWeight = (val) => typeof formatWeight === 'function' ? formatWeight(val) : `${val} kg`;
  const safeFormatCO2 = (val) => typeof formatCO2 === 'function' ? formatCO2(val) : `${val} kg CO2e`;
  const safeGetExpiryStatus = (date) => typeof getExpiryStatus === 'function' ? getExpiryStatus(date) : 'warning';
  const safeGetRelativeTime = (date) => typeof getRelativeTime === 'function' ? getRelativeTime(date) : new Date(date).toLocaleDateString();

  return (
    <div className="dashboard-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🍃 Dashboard</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Real-time overview of your food waste management operations</p>
        </div>
        <button className="btn btn-primary" onClick={handleRefreshAll} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Refresh Data
        </button>
      </div>

      {alerts.length > 0 && (
        <div className="alerts-section" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {alerts.map((alert, idx) => (
            <AlertBanner key={idx} type={alert.type || 'warning'} message={alert.message} />
          ))}
        </div>
      )}

      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <KPICard 
          title="Waste Reduced" 
          value={safeFormatWeight(stats.wasteReduced)} 
          icon={Leaf} 
          trend="+12%" 
          trendDirection="up" 
          color="green" 
        />
        <KPICard 
          title="Meals Redistributed" 
          value={stats.mealsRedistributed} 
          icon={Utensils} 
          trend="+8%" 
          trendDirection="up" 
          color="blue" 
        />
        <KPICard 
          title="Carbon Saved" 
          value={safeFormatCO2(stats.carbonSaved)} 
          icon={Leaf} 
          trend="+5%" 
          trendDirection="up" 
          color="green"
        >
          <Sparkline data={[10, 25, 30, 45, 50, 48, 60]} color="#22C55E" />
        </KPICard>
        <KPICard 
          title="Forecast Accuracy" 
          value={`${stats.forecastAccuracy}%`} 
          icon={TrendingDown} 
          trend="+2%" 
          trendDirection="up" 
          color="blue" 
        />
      </div>

      <div className="chart-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-header">
            <h3>Today's Demand vs Actual</h3>
          </div>
          <div className="card-body">
            <ChartContainer height={250}>
              <BarChart data={mealChartData} />
            </ChartContainer>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3>Waste Trend (7 Days)</h3>
          </div>
          <div className="card-body">
            <ChartContainer height={250}>
              <LineChart data={wasteTrendData} color="#EF4444" />
            </ChartContainer>
          </div>
        </div>
      </div>

      <div className="content-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-header">
            <h3>Expiring Soon</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <ul className="list-group list-group-flush" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {expiringSoon.map(item => {
                const status = safeGetExpiryStatus(item.expiryDate);
                return (
                  <li key={item.id} className="list-group-item" style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{getCategoryEmoji(item.category)}</span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1rem' }}>{item.name}</h4>
                        <small style={{ color: '#64748b' }}>{item.quantity} {item.unit} • Expires {safeGetRelativeTime(item.expiryDate)}</small>
                      </div>
                    </div>
                    <StatusBadge status={status}>{status}</StatusBadge>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="card-footer" style={{ padding: '1rem', textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
            <a href="/inventory" style={{ color: '#3B82F6', textDecoration: 'none', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              View All <ArrowRight size={16} />
            </a>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem' }} onClick={() => handleAction('forecast', getPrediction)} disabled={loadingAction === 'forecast'}>
              {loadingAction === 'forecast' ? 'Running...' : <>🔄 Run AI Forecast</>}
            </button>
            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem' }} onClick={() => handleAction('sensors', simulateSensors)} disabled={loadingAction === 'sensors'}>
              {loadingAction === 'sensors' ? 'Running...' : <>📡 Simulate Sensors</>}
            </button>
            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem' }} onClick={() => handleAction('surplus', detectSurplus)} disabled={loadingAction === 'surplus'}>
              {loadingAction === 'surplus' ? 'Running...' : <>🔍 Detect Surplus</>}
            </button>
            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem' }} onClick={() => handleAction('report', getSustainabilityReport)} disabled={loadingAction === 'report'}>
              {loadingAction === 'report' ? 'Running...' : <>📊 Generate Report</>}
            </button>
            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem' }} onClick={() => handleAction('setup', runSetup)} disabled={loadingAction === 'setup'}>
              {loadingAction === 'setup' ? 'Running...' : <>⚙️ Seed Demo Data</>}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-header">
            <h3>Available Surplus</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {availableSurplus.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {availableSurplus.map(s => (
                  <li key={s.id} style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{s.foodItem?.name || s.name || 'Surplus Item'}</h4>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#475569' }}>
                        {s.quantity} {s.unit} • {s.reason || 'Overproduction'}
                      </p>
                      <small style={{ color: '#64748b' }}>Quality Score: {s.qualityScore || 85}/100 • Created {safeGetRelativeTime(s.createdAt)}</small>
                    </div>
                    <button className="btn btn-primary btn-sm">Find Receivers</button>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p>No available surplus items right now.</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>ESG Compliance Score</h3>
          </div>
          <div className="card-body" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <ChartContainer height={180}>
              <GaugeChart value={stats.esgScore} max={100} color="#22C55E" />
            </ChartContainer>
            <div style={{ marginTop: '1.5rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: '#475569' }}>Environmental</span>
                <span style={{ fontWeight: '600', color: '#0F172A' }}>92/100</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: '#475569' }}>Social</span>
                <span style={{ fontWeight: '600', color: '#0F172A' }}>85/100</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: '#475569' }}>Governance</span>
                <span style={{ fontWeight: '600', color: '#0F172A' }}>88/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

