import React, { useState, useEffect } from 'react';
import { useFoodWaste } from '../context/FoodWasteContext';
import KPICard from '../components/KPICard';
import { ChartContainer, BarChart, LineChart, GaugeChart } from '../components/ChartContainer';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { Factory, Zap, AlertTriangle, CheckCircle, Activity, Thermometer, Droplets, RefreshCw } from 'lucide-react';

const ProcessingUnits = () => {
  const { processingUnits = [], wasteLogs = [] } = useFoodWaste();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Calculate KPIs
  const avgEfficiency = processingUnits.length 
    ? processingUnits.reduce((acc, unit) => acc + (unit.oee || 0), 0) / processingUnits.length 
    : 85.4; // Fallback
  
  const totalUptime = '98.2%';
  const energyUsage = '12,450 kWh';
  const materialWastage = processingUnits.length
    ? processingUnits.reduce((acc, unit) => acc + (unit.wastage || 0), 0) / processingUnits.length
    : 12.5;

  const anomalousUnits = processingUnits.filter(unit => (unit.oee || 0) < 70 || (unit.wastage || 0) > 15);

  const processingWasteLogs = wasteLogs.filter(log => log.source === 'processing');

  const efficiencyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Average OEE (%)',
        data: [82, 85, 84, 88, 86, 90, 87],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      }
    ]
  };

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'date', header: 'Date' },
    { key: 'unitName', header: 'Unit' },
    { key: 'wasteType', header: 'Waste Type' },
    { key: 'quantity', header: 'Quantity (kg)' }
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-full"><RefreshCw className="animate-spin text-blue-500 w-8 h-8" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Factory className="text-blue-600" />
          Processing Units
        </h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
          <Activity size={18} />
          Add Unit
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Avg Efficiency (OEE)" 
          value={`${avgEfficiency.toFixed(1)}%`} 
          icon={Activity} 
          trend="+2.1%" 
          trendUp={true} 
        />
        <KPICard 
          title="Total Uptime" 
          value={totalUptime} 
          icon={CheckCircle} 
          trend="+0.5%" 
          trendUp={true} 
        />
        <KPICard 
          title="Energy Usage" 
          value={energyUsage} 
          icon={Zap} 
          trend="-1.2%" 
          trendUp={true} 
        />
        <KPICard 
          title="Material Wastage" 
          value={`${materialWastage.toFixed(1)}%`} 
          icon={AlertTriangle} 
          trend="-0.8%" 
          trendUp={true} 
        />
      </div>

      {/* Anomalies Alert Panel */}
      {anomalousUnits.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex items-start">
            <AlertTriangle className="text-red-500 mt-0.5 mr-3" size={20} />
            <div>
              <h3 className="text-red-800 font-semibold">Attention Required: Underperforming Units</h3>
              <ul className="mt-2 space-y-1 text-sm text-red-700">
                {anomalousUnits.map(unit => (
                  <li key={unit.id || unit.name}>
                    • <strong>{unit.name}</strong> - OEE: {unit.oee}%, Wastage: {unit.wastage}%
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Unit Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(processingUnits.length > 0 ? processingUnits : [
          { id: '1', name: 'Unit Alpha', type: 'Sorting', status: 'active', oee: 88, input: 1500, output: 1420 },
          { id: '2', name: 'Unit Beta', type: 'Packaging', status: 'maintenance', oee: 65, input: 1200, output: 1050 }
        ]).map(unit => (
          <div key={unit.id} className="bg-white rounded-lg shadow p-5 border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{unit.name}</h3>
                <p className="text-sm text-slate-500">{unit.type}</p>
              </div>
              <StatusBadge status={unit.status} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="h-32 flex flex-col items-center justify-center">
                <GaugeChart value={unit.oee} min={0} max={100} title="OEE" />
                <span className="text-sm font-medium mt-2">{unit.oee}% OEE</span>
              </div>
              <div className="flex flex-col justify-center space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1"><Droplets size={14}/> Input</span>
                  <span className="font-semibold">{unit.input} kg</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1"><CheckCircle size={14}/> Output</span>
                  <span className="font-semibold">{unit.output} kg</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1"><Thermometer size={14}/> Temp</span>
                  <span className="font-semibold">22°C</span>
                </div>
              </div>
            </div>
            
            <button className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-blue-600 font-medium rounded text-sm transition-colors border border-slate-200">
              View Details
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Efficiency Trends */}
        <ChartContainer title="Efficiency Trends (OEE)">
          <div className="h-64">
            <LineChart data={efficiencyData} />
          </div>
        </ChartContainer>

        {/* Wastage Breakdown */}
        <div className="bg-white p-5 rounded-lg shadow border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Processing Wastage</h2>
          <DataTable 
            columns={columns} 
            data={processingWasteLogs.length > 0 ? processingWasteLogs : [
              { id: 'PW-001', date: '2023-10-25', unitName: 'Unit Alpha', wasteType: 'Trimmings', quantity: 45 },
              { id: 'PW-002', date: '2023-10-26', unitName: 'Unit Beta', wasteType: 'Damaged', quantity: 120 }
            ]} 
          />
        </div>
      </div>
    </div>
  );
};

export default ProcessingUnits;

