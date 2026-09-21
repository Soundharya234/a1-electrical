import React, { useState, useEffect } from 'react';
import { useFoodWaste } from '../context/FoodWasteContext';
import KPICard from '../components/KPICard';
import { ChartContainer, LineChart, GaugeChart } from '../components/ChartContainer';
import AlertBanner from '../components/AlertBanner';
import StatusBadge from '../components/StatusBadge';
import FreshnessGauge from '../components/FreshnessGauge';
import DataTable from '../components/DataTable';
import { Thermometer, Droplets, Wind, Activity, ShieldCheck, AlertTriangle, RefreshCw, Camera } from 'lucide-react';
import { STORAGE_GUIDELINES } from '../data/foodData';

const QualityMonitor = () => {
  const { sensorReadings, qualityAssessments } = useFoodWaste();
  const [activeTab, setActiveTab] = useState('live');
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Cold Storage A');

  const defaultSensors = [
    { location: 'Cold Storage A', temperature: 4.2, humidity: 85, status: 'operational', type: 'cold' },
    { location: 'Cold Storage B', temperature: 3.8, humidity: 82, status: 'operational', type: 'cold' },
    { location: 'Dry Storage', temperature: 24.5, humidity: 45, status: 'operational', type: 'dry' },
    { location: 'Kitchen Main', temperature: 28.3, humidity: 55, status: 'operational', type: 'kitchen' },
    { location: 'Kitchen Prep', temperature: 26.1, humidity: 50, status: 'operational', type: 'kitchen' },
    { location: 'Serving Area', temperature: 25.0, humidity: 48, status: 'operational', type: 'kitchen' },
  ];

  const readings = sensorReadings && sensorReadings.length > 0 ? sensorReadings : defaultSensors;
  
  const assessments = qualityAssessments && qualityAssessments.length > 0 ? qualityAssessments : [
    { id: '1', foodItem: 'Tomatoes', method: 'Camera', score: 85, freshness: 'good', color: 'Red', texture: 'Firm', odor: 'Normal', recommendation: 'Use within 3 days', assessedAt: new Date().toISOString() },
    { id: '2', foodItem: 'Milk', method: 'Sensor', score: 95, freshness: 'fresh', color: 'White', texture: 'Liquid', odor: 'Sweet', recommendation: 'Store in Cold Storage A', assessedAt: new Date().toISOString() },
    { id: '3', foodItem: 'Lettuce', method: 'Visual', score: 45, freshness: 'fair', color: 'Pale Green', texture: 'Wilted', odor: 'Normal', recommendation: 'Use immediately', assessedAt: new Date().toISOString() },
  ];

  const activeAlerts = readings.filter(r => r.status === 'alert').length;
  const avgTemp = readings.reduce((acc, r) => acc + r.temperature, 0) / readings.length;
  const avgHumidity = readings.reduce((acc, r) => acc + r.humidity, 0) / readings.length;

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 1000);
  };

  const getTemperatureRange = (type) => {
    switch (type) {
      case 'cold': return [0, 15];
      case 'dry': return [15, 35];
      case 'kitchen': return [15, 40];
      default: return [0, 50];
    }
  };

  const trendData = Array.from({ length: 24 }).map((_, i) => ({
    label: `${i}:00`,
    value: Math.random() * 10 + 20
  }));

  return (
    <div className="page-container p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="text-blue-500" /> Quality Monitor</h1>
        <button onClick={handleSimulate} className="btn bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} /> Simulate Sensor Data
        </button>
      </div>

      {activeAlerts > 0 && (
        <AlertBanner type="error" message={`${activeAlerts} sensor(s) reporting out of range values!`} className="mb-6" />
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Active Sensors" value={readings.length} icon={Activity} color="text-green-500" />
        <KPICard title="Active Alerts" value={activeAlerts} icon={AlertTriangle} color={activeAlerts > 0 ? "text-red-500" : "text-green-500"} />
        <KPICard title="Avg Temperature" value={`${avgTemp.toFixed(1)}°C`} icon={Thermometer} color="text-blue-500" />
        <KPICard title="Avg Humidity" value={`${avgHumidity.toFixed(1)}%`} icon={Droplets} color="text-blue-500" />
      </div>

      <div className="flex border-b mb-6">
        {['live', 'assessments', 'zones'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 capitalize font-medium ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab === 'live' ? 'Live Sensors' : tab === 'assessments' ? 'Quality Assessments' : 'Storage Zones'}
          </button>
        ))}
      </div>

      {activeTab === 'live' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {readings.map((sensor, idx) => (
              <div key={idx} className="card bg-white p-4 border rounded shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedLocation(sensor.location)}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">{sensor.location}</h3>
                  <StatusBadge status={sensor.status} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-1"><Thermometer className="w-4 h-4"/> Temp</p>
                    <GaugeChart value={sensor.temperature} min={getTemperatureRange(sensor.type)[0]} max={getTemperatureRange(sensor.type)[1]} unit="°C" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-1"><Droplets className="w-4 h-4"/> Humidity</p>
                    <GaugeChart value={sensor.humidity} min={0} max={100} unit="%" />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-4 text-right">Updated just now</p>
              </div>
            ))}
          </div>
          <div className="card bg-white p-4 border rounded shadow-sm">
            <h3 className="font-semibold mb-4">Temperature Trend: {selectedLocation} (Last 24h)</h3>
            <ChartContainer height={300}>
              <LineChart data={trendData} xKey="label" yKey="value" color="#3B82F6" />
            </ChartContainer>
          </div>
        </div>
      )}

      {activeTab === 'assessments' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button className="bg-gray-100 text-gray-800 px-4 py-2 rounded flex items-center gap-2"><Camera className="w-4 h-4"/> Run Quality Assessment</button>
          </div>
          <DataTable 
            data={assessments}
            columns={[
              { header: 'Food Item', accessor: 'foodItem' },
              { header: 'Method', accessor: 'method' },
              { header: 'Score', accessor: (row) => <FreshnessGauge value={row.score} /> },
              { header: 'Freshness', accessor: (row) => <StatusBadge status={row.freshness} /> },
              { header: 'Color', accessor: 'color' },
              { header: 'Texture', accessor: 'texture' },
              { header: 'Recommendation', accessor: 'recommendation' },
              { header: 'Assessed At', accessor: (row) => new Date(row.assessedAt).toLocaleDateString() },
            ]}
          />
        </div>
      )}

      {activeTab === 'zones' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {['Cold Storage', 'Dry Storage', 'Kitchen'].map((zone, i) => (
             <div key={i} className="card bg-white p-4 border rounded shadow-sm">
               <h3 className="font-semibold text-lg mb-2">{zone} Zone</h3>
               <div className="space-y-2">
                 <p className="text-sm"><span className="font-medium">Rec. Temp:</span> {zone === 'Cold Storage' ? '0-5°C' : zone === 'Dry Storage' ? '15-25°C' : '20-25°C'}</p>
                 <p className="text-sm"><span className="font-medium">Rec. Humidity:</span> {zone === 'Cold Storage' ? '85-95%' : '40-60%'}</p>
                 <div className="mt-4">
                   <StatusBadge status="operational" />
                 </div>
               </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QualityMonitor;

