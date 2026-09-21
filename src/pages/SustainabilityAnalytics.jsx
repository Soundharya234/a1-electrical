import React, { useState, useEffect } from 'react';
import { useFoodWaste } from '../context/FoodWasteContext';
import KPICard from '../components/KPICard';
import { ChartContainer, BarChart, PieChart, LineChart, GaugeChart } from '../components/ChartContainer';
import { Leaf, Droplets, Globe, Download, TrendingUp, IndianRupee, Heart } from 'lucide-react';
import { formatCurrency, formatWeight, formatCO2, formatWater } from '../utils/wasteCalculator';

const SustainabilityAnalytics = () => {
  const { stats } = useFoodWaste();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Fallback data if context is empty
  const defaultStats = {
    carbonPrevented: 12500,
    waterSaved: 450000,
    mealsRedistributed: 8500,
    economicValue: 450000
  };

  const currentStats = stats || defaultStats;
  const esgScore = 84;

  const carbonData = {
    labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    datasets: [
      {
        label: 'Carbon Savings (kg CO2e)',
        data: [1800, 2100, 1950, 2400, 2200, 2050],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
      }
    ]
  };

  const mealsData = {
    labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    datasets: [
      {
        label: 'Meals Redistributed',
        data: [1200, 1450, 1300, 1600, 1550, 1400],
        backgroundColor: '#3B82F6',
      }
    ]
  };

  const recentLogs = [
    { id: '1', event: 'Surplus Redistribution', amount: '250 kg', co2: '-625 kg', water: '-12,500 L' },
    { id: '2', event: 'Composting Batch', amount: '100 kg', co2: '-150 kg', water: '-2,000 L' },
    { id: '3', event: 'Spoilage Loss', amount: '50 kg', co2: '+125 kg', water: '+2,500 L' }
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Leaf className="animate-spin text-green-500 w-8 h-8" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Globe className="text-green-600" />
          Sustainability Analytics
        </h1>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
          <Download size={18} />
          Download ESG Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Carbon Prevented" 
          value={formatCO2 ? formatCO2(currentStats.carbonPrevented) : `${currentStats.carbonPrevented} kg CO2e`} 
          icon={Leaf} 
          trend="+12%" 
          trendUp={true} 
        />
        <KPICard 
          title="Water Saved" 
          value={formatWater ? formatWater(currentStats.waterSaved) : `${currentStats.waterSaved} L`} 
          icon={Droplets} 
          trend="+8%" 
          trendUp={true} 
        />
        <KPICard 
          title="Meals Redistributed" 
          value={(currentStats.mealsRedistributed || 0).toLocaleString()} 
          icon={Heart} 
          trend="+15%" 
          trendUp={true} 
        />
        <KPICard 
          title="Economic Value" 
          value={formatCurrency ? formatCurrency(currentStats.economicValue) : `₹${currentStats.economicValue}`} 
          icon={IndianRupee} 
          trend="+5%" 
          trendUp={true} 
        />
      </div>

      {/* ESG Compliance Score */}
      <div className="bg-white p-6 rounded-lg shadow border border-slate-100">
        <h2 className="text-xl font-semibold text-slate-800 mb-6 border-b pb-2">ESG Compliance Score</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="h-48 flex flex-col items-center justify-center md:col-span-1">
            <GaugeChart value={esgScore} min={0} max={100} title="Overall Score" />
            <span className="text-lg font-bold text-green-600 mt-2">Excellent</span>
          </div>
          <div className="md:col-span-2 space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">Waste Reduction</span>
                <span className="text-sm font-medium text-slate-700">88/100</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">Resource Efficiency</span>
                <span className="text-sm font-medium text-slate-700">76/100</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '76%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">Social Impact</span>
                <span className="text-sm font-medium text-slate-700">92/100</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Carbon Savings Trend">
          <div className="h-64">
            <LineChart data={carbonData} />
          </div>
        </ChartContainer>
        
        <ChartContainer title="Meals Redistributed">
          <div className="h-64">
            <BarChart data={mealsData} />
          </div>
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SDG Alignment */}
        <div className="bg-white p-5 rounded-lg shadow border border-slate-100 lg:col-span-1">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">UN SDG Alignment</h2>
          <div className="space-y-4 mt-4">
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-md border border-yellow-100">
              <div className="bg-yellow-500 text-white p-2 rounded shrink-0 font-bold">2</div>
              <div>
                <h4 className="font-semibold text-yellow-800">Zero Hunger</h4>
                <p className="text-xs text-yellow-700 mt-1">Provided {currentStats.mealsRedistributed?.toLocaleString()} meals to local communities.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-md border border-orange-100">
              <div className="bg-orange-500 text-white p-2 rounded shrink-0 font-bold">12</div>
              <div>
                <h4 className="font-semibold text-orange-800">Responsible Consumption</h4>
                <p className="text-xs text-orange-700 mt-1">Diverted 24 tons of organic waste from landfills.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-md border border-green-100">
              <div className="bg-green-600 text-white p-2 rounded shrink-0 font-bold">13</div>
              <div>
                <h4 className="font-semibold text-green-800">Climate Action</h4>
                <p className="text-xs text-green-700 mt-1">Prevented {currentStats.carbonPrevented?.toLocaleString()} kg of CO2 equivalent emissions.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Waste Logs Footprint */}
        <div className="bg-white p-5 rounded-lg shadow border border-slate-100 lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Environmental Impact Logs</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-slate-200 py-2 text-sm font-semibold text-slate-600">Event</th>
                  <th className="border-b border-slate-200 py-2 text-sm font-semibold text-slate-600">Amount</th>
                  <th className="border-b border-slate-200 py-2 text-sm font-semibold text-slate-600">CO2 Impact</th>
                  <th className="border-b border-slate-200 py-2 text-sm font-semibold text-slate-600">Water Impact</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                    <td className="py-3 text-sm text-slate-800 font-medium">{log.event}</td>
                    <td className="py-3 text-sm text-slate-600">{log.amount}</td>
                    <td className={`py-3 text-sm font-medium ${log.co2.startsWith('-') ? 'text-green-600' : 'text-red-500'}`}>
                      {log.co2}
                    </td>
                    <td className={`py-3 text-sm font-medium ${log.water.startsWith('-') ? 'text-blue-600' : 'text-red-500'}`}>
                      {log.water}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SustainabilityAnalytics;

