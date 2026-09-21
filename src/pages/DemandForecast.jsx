import { useState, useEffect } from 'react';
import { useFoodWaste } from '../context/FoodWasteContext';
import KPICard from '../components/KPICard';
import { ChartContainer, BarChart, LineChart } from '../components/ChartContainer';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { TrendingUp, Calendar, Target, Brain, Utensils, Sun, Moon, Coffee, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { MEAL_TYPES } from '../data/foodData';

const SAMPLE_FORECASTS = [
  { id: '1', date: '2026-09-01', mealType: 'Breakfast', predicted: 120, actual: 115, confidence: 92 },
  { id: '2', date: '2026-09-01', mealType: 'Lunch', predicted: 250, actual: 260, confidence: 88 },
  { id: '3', date: '2026-09-01', mealType: 'Dinner', predicted: 180, actual: 170, confidence: 90 },
  { id: '4', date: '2026-09-01', mealType: 'Snacks', predicted: 80, actual: 85, confidence: 85 }
];

export default function DemandForecast() {
  const { forecasts = SAMPLE_FORECASTS, getPrediction, getWeeklyPlan, getForcastPatterns } = useFoodWaste();
  const [activeTab, setActiveTab] = useState('Daily View');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPredicting, setIsPredicting] = useState(false);
  const [dailyPredictions, setDailyPredictions] = useState([]);
  
  const forecastAccuracy = 87;
  const todaysPredicted = 630;
  
  useEffect(() => {
    // Generate daily predictions for the selected date
    const predictions = MEAL_TYPES.map(meal => {
      const existing = forecasts.find(f => f.date === selectedDate && f.mealType === meal);
      return existing || { id: Math.random().toString(), date: selectedDate, mealType: meal, predicted: Math.floor(Math.random() * 100 + 50), actual: 0, confidence: Math.floor(Math.random() * 20 + 80) };
    });
    setDailyPredictions(predictions);
  }, [selectedDate, forecasts]);

  const handleRunPrediction = () => {
    setIsPredicting(true);
    setTimeout(() => {
      setIsPredicting(false);
      // Simulate new predictions
      setDailyPredictions(dailyPredictions.map(p => ({ ...p, predicted: p.predicted + Math.floor(Math.random() * 20 - 10), confidence: 95 })));
    }, 1000);
  };

  const getMealIcon = (meal) => {
    switch(meal.toLowerCase()) {
      case 'breakfast': return <Coffee size={24} />;
      case 'lunch': return <Sun size={24} />;
      case 'dinner': return <Moon size={24} />;
      default: return <Utensils size={24} />;
    }
  };

  const renderDailyView = () => (
    <div className="daily-view space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <button onClick={() => {
          const d = new Date(selectedDate);
          d.setDate(d.getDate() - 1);
          setSelectedDate(d.toISOString().split('T')[0]);
        }} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft /></button>
        <h3 className="text-lg font-semibold flex items-center gap-2"><Calendar /> {selectedDate}</h3>
        <button onClick={() => {
          const d = new Date(selectedDate);
          d.setDate(d.getDate() + 1);
          setSelectedDate(d.toISOString().split('T')[0]);
        }} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight /></button>
      </div>

      <div className="flex justify-end">
        <button onClick={handleRunPrediction} disabled={isPredicting} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 font-medium transition-colors disabled:opacity-50">
          <RefreshCw className={isPredicting ? "animate-spin" : ""} size={18} />
          {isPredicting ? "Running AI..." : "Run AI Prediction"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dailyPredictions.map(meal => (
          <div key={meal.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-gray-700 font-semibold">
                {getMealIcon(meal.mealType)}
                {meal.mealType}
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">{meal.confidence}% confidence</span>
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">Predicted Servings</div>
              <div className="text-3xl font-bold text-gray-900">{meal.predicted}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Actual (Input)</div>
              <input type="number" defaultValue={meal.actual} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Predicted vs Actual</h3>
        <div style={{ height: '300px' }}>
           <ChartContainer title="">
             <BarChart data={dailyPredictions.map(p => ({ label: p.mealType, value1: p.predicted, value2: p.actual }))} />
           </ChartContainer>
        </div>
      </div>
    </div>
  );

  const renderWeeklyPlan = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const planData = days.map(day => ({
      day,
      breakfast: Math.floor(Math.random() * 50 + 100),
      lunch: Math.floor(Math.random() * 100 + 200),
      dinner: Math.floor(Math.random() * 80 + 150),
      snacks: Math.floor(Math.random() * 40 + 60)
    }));

    return (
      <div className="weekly-plan space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Weekly Production Plan</h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
            <Brain size={18} /> Generate Weekly Plan
          </button>
        </div>
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-4 font-semibold text-gray-600">Day</th>
                <th className="p-4 font-semibold text-gray-600">Breakfast</th>
                <th className="p-4 font-semibold text-gray-600">Lunch</th>
                <th className="p-4 font-semibold text-gray-600">Dinner</th>
                <th className="p-4 font-semibold text-gray-600">Snacks</th>
                <th className="p-4 font-semibold text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {planData.map((row, i) => {
                const total = row.breakfast + row.lunch + row.dinner + row.snacks;
                return (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{row.day}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded ${row.breakfast > 130 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>{row.breakfast}</span></td>
                    <td className="p-4"><span className={`px-2 py-1 rounded ${row.lunch > 250 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{row.lunch}</span></td>
                    <td className="p-4"><span className={`px-2 py-1 rounded ${row.dinner > 200 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>{row.dinner}</span></td>
                    <td className="p-4"><span className="px-2 py-1 rounded bg-green-100 text-green-800">{row.snacks}</span></td>
                    <td className="p-4 font-bold text-gray-700">{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPatterns = () => (
    <div className="patterns space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Demand Heatmap (Avg Servings)</h3>
        <div className="grid grid-cols-8 gap-2">
          <div className="font-semibold p-2"></div>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <div key={d} className="font-semibold p-2 text-center">{d}</div>)}
          
          {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map(meal => (
            <React.Fragment key={meal}>
              <div className="font-semibold p-2 flex items-center">{meal}</div>
              {[...Array(7)].map((_, i) => {
                const val = Math.floor(Math.random() * 200 + 50);
                let bg = 'bg-green-100';
                if(val > 150) bg = 'bg-yellow-200';
                if(val > 200) bg = 'bg-orange-300';
                if(val > 230) bg = 'bg-red-400';
                return <div key={i} className={`${bg} p-2 rounded text-center font-medium text-gray-800 flex items-center justify-center min-h-[60px]`}>{val}</div>
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAccuracy = () => {
    const columns = [
      { key: 'date', label: 'Date' },
      { key: 'mealType', label: 'Meal Type' },
      { key: 'predicted', label: 'Predicted' },
      { key: 'actual', label: 'Actual' },
      { key: 'accuracy', label: 'Accuracy %', render: (val, row) => {
        const acc = (1 - Math.abs(row.predicted - row.actual) / row.actual) * 100;
        return acc.toFixed(1) + '%';
      }},
      { key: 'status', label: 'Status', render: (val, row) => {
        const diff = row.predicted - row.actual;
        const pct = Math.abs(diff) / row.actual;
        if(pct <= 0.1) return <StatusBadge status="Accurate" type="success" />;
        if(diff > 0) return <StatusBadge status="Over" type="warning" />;
        return <StatusBadge status="Under" type="error" />;
      }}
    ];

    return (
      <div className="accuracy space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-500 mb-1">MAPE (Mean Abs Pct Error)</div>
            <div className="text-2xl font-bold text-gray-900">8.4%</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-500 mb-1">RMSE</div>
            <div className="text-2xl font-bold text-gray-900">12.3</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-500 mb-1">MAE</div>
            <div className="text-2xl font-bold text-gray-900">9.1</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Historical Forecast Accuracy</h3>
          <DataTable columns={columns} data={forecasts} />
        </div>
      </div>
    );
  };

  return (
    <div className="demand-forecast-page space-y-6 p-6 bg-slate-50 min-h-screen">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="text-blue-600" /> Demand Forecast
        </h1>
        <p className="text-gray-500 mt-1">AI-powered meal demand predictions and production planning</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Forecast Accuracy" value={`${forecastAccuracy}%`} icon={Target} trend="+2.1%" trendUp={true} color="bg-blue-500" />
        <KPICard title="Today's Predicted" value={todaysPredicted} icon={Brain} color="bg-indigo-500" />
        <KPICard title="Weekly Trend" value="Up 12%" icon={TrendingUp} trend="+12%" trendUp={true} color="bg-green-500" />
        <KPICard title="Surplus Risk" value="3 Meals" subtitle=">20% over-prediction" icon={Utensils} color="bg-orange-500" />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 tabs">
          {['Daily View', 'Weekly Plan', 'Patterns', 'Accuracy'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="p-6 bg-slate-50">
          {activeTab === 'Daily View' && renderDailyView()}
          {activeTab === 'Weekly Plan' && renderWeeklyPlan()}
          {activeTab === 'Patterns' && renderPatterns()}
          {activeTab === 'Accuracy' && renderAccuracy()}
        </div>
      </div>
    </div>
  );
}

