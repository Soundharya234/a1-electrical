import { useState, useEffect } from 'react';
import { useFoodWaste } from '../context/FoodWasteContext';
import KPICard from '../components/KPICard';
import { ChartContainer, BarChart } from '../components/ChartContainer';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { ProgressBar } from '../components/MiniChart';
import { Truck, MapPin, Clock, Route, Navigation, Fuel, Package, Users, ArrowRight, Play, RotateCcw } from 'lucide-react';
import { formatCurrency } from '../utils/wasteCalculator';

const RouteOptimizer = () => {
  const { state } = useFoodWaste();
  const redistributionOrders = state?.redistributionOrders || [];
  const receivers = state?.receivers || [];
  
  const [origin, setOrigin] = useState('Central Kitchen');
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [routeResults, setRouteResults] = useState(null);

  // Derived KPIs
  const activeRoutesCount = redistributionOrders.filter(o => o.status === 'in_transit').length;
  
  // Sample data for fleet
  const fleetData = [
    { id: 'V-101', type: 'Van', status: 'Available', capacity: '1000 kg', temp: 'Refrigerated' },
    { id: 'V-102', type: 'Truck', status: 'In Use', capacity: '2500 kg', temp: 'Ambient' },
    { id: 'B-201', type: 'Bike', status: 'Maintenance', capacity: '50 kg', temp: 'Insulated Bag' },
    { id: 'V-103', type: 'Van', status: 'Available', capacity: '1000 kg', temp: 'Refrigerated' },
  ];

  // Sample data for active deliveries
  const activeDeliveries = [
    { id: 'RT-8492', driver: 'Rahul S.', vehicle: 'V-102', stops: 4, status: 'in_transit', distance: '12.4 km', time: '45 min', progress: 50 },
    { id: 'RT-8493', driver: 'Amit K.', vehicle: 'V-101', stops: 2, status: 'pending', distance: '5.2 km', time: '20 min', progress: 0 },
  ];

  // Sample data for route history
  const routeHistory = [
    { date: 'Today', id: 'RT-8490', stops: 3, distance: '8.7 km', time: '35 min', efficiency: '92%', status: 'completed' },
    { date: 'Today', id: 'RT-8491', stops: 5, distance: '15.2 km', time: '55 min', efficiency: '88%', status: 'completed' },
    { date: 'Yesterday', id: 'RT-8488', stops: 2, distance: '4.1 km', time: '18 min', efficiency: '95%', status: 'completed' },
  ];

  const handleOptimize = () => {
    if (selectedDestinations.length === 0) return;
    
    setIsOptimizing(true);
    setRouteResults(null);
    
    // Simulate API call for optimization
    setTimeout(() => {
      const stops = selectedDestinations.map((dest, i) => ({
        id: dest,
        name: receivers.find(r => r.id === dest)?.name || `Receiver ${i+1}`,
        distance: (Math.random() * 5 + 1).toFixed(1),
        time: Math.floor(Math.random() * 15 + 5),
      }));
      
      const totalDist = stops.reduce((acc, s) => acc + parseFloat(s.distance), 0).toFixed(1);
      const totalTime = stops.reduce((acc, s) => acc + s.time, 0);
      
      setRouteResults({
        stops,
        totalDistance: totalDist,
        totalTime,
        efficiencyScore: 94
      });
      setIsOptimizing(false);
    }, 1500);
  };

  const toggleDestination = (id) => {
    setSelectedDestinations(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  return (
    <div className="page-container p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Truck className="w-8 h-8 text-blue-600" />
            Route Optimizer
          </h1>
          <p className="text-slate-500 mt-1">AI-powered delivery route planning and fleet management.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-50 transition flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Active Routes" value={activeRoutesCount || 2} icon={Route} color="blue" />
        <KPICard title="Avg Delivery Time" value="24 min" icon={Clock} color="emerald" />
        <KPICard title="Total Distance" value="42.5 km" icon={Navigation} color="purple" />
        <KPICard title="Fleet Utilization" value="78%" icon={Fuel} color="orange" />
      </div>

      {/* Main Planning Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Route Planning Panel */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col h-full">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-500" /> Plan New Route
          </h2>
          
          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Origin</label>
              <input 
                type="text" 
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 bg-slate-50 text-slate-600"
                readOnly
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700">Destinations (Pending Orders)</label>
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{selectedDestinations.length} selected</span>
              </div>
              <div className="border border-slate-200 rounded-md max-h-60 overflow-y-auto bg-slate-50">
                {(receivers.length > 0 ? receivers.slice(0, 5) : [
                  {id: '1', name: 'City Food Bank', address: '123 Main St'},
                  {id: '2', name: 'Hope Shelter', address: '456 Oak Ave'}
                ]).map((receiver) => (
                  <label key={receiver.id} className="flex items-start gap-3 p-3 border-b border-slate-100 hover:bg-white cursor-pointer transition">
                    <input 
                      type="checkbox" 
                      className="mt-1 rounded text-blue-600 w-4 h-4"
                      checked={selectedDestinations.includes(receiver.id)}
                      onChange={() => toggleDestination(receiver.id)}
                    />
                    <div>
                      <div className="font-medium text-sm text-slate-800">{receiver.name}</div>
                      <div className="text-xs text-slate-500">{receiver.address}</div>
                    </div>
                  </label>
                ))}
                {receivers.length === 0 && <div className="p-4 text-center text-sm text-slate-500">No pending orders.</div>}
              </div>
            </div>
          </div>
          
          <button 
            className={`w-full mt-6 py-3 rounded-md text-white font-medium flex justify-center items-center gap-2 transition ${
              selectedDestinations.length === 0 || isOptimizing ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            onClick={handleOptimize}
            disabled={selectedDestinations.length === 0 || isOptimizing}
          >
            {isOptimizing ? (
              <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> Optimizing...</>
            ) : (
              <><Play className="w-4 h-4" /> Optimize Route</>
            )}
          </button>
        </div>

        {/* Visual Route Display */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-5 min-h-[400px] flex flex-col">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex justify-between items-center">
            <span>Route Visualization</span>
            {routeResults && (
              <span className="text-sm font-normal text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1">
                94% Efficiency Match
              </span>
            )}
          </h2>
          
          {!routeResults && !isOptimizing ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <Route className="w-16 h-16 mb-4 text-slate-300" />
              <p className="text-lg font-medium text-slate-600 mb-2">No Route Planned</p>
              <p className="max-w-md">Select destinations from the left panel and click "Optimize Route" to generate an AI-optimized delivery path.</p>
            </div>
          ) : isOptimizing ? (
            <div className="flex-1 flex flex-col items-center justify-center text-blue-500">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-b-blue-600 mb-4"></div>
              <p className="animate-pulse font-medium">Calculating optimal path...</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex gap-6 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex-1 text-center border-r border-slate-200">
                  <div className="text-sm text-slate-500 mb-1">Total Distance</div>
                  <div className="text-2xl font-bold text-slate-800">{routeResults.totalDistance} km</div>
                </div>
                <div className="flex-1 text-center border-r border-slate-200">
                  <div className="text-sm text-slate-500 mb-1">Est. Time</div>
                  <div className="text-2xl font-bold text-slate-800">{routeResults.totalTime} min</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-sm text-slate-500 mb-1">Stops</div>
                  <div className="text-2xl font-bold text-slate-800">{routeResults.stops.length}</div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 relative">
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-blue-200"></div>
                
                <div className="relative z-10 flex gap-4 mb-6">
                  <div className="w-12 h-12 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold shadow-sm">
                    A
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex-1">
                    <h3 className="font-semibold text-slate-800">{origin}</h3>
                    <p className="text-sm text-slate-500">Departure • 0 km</p>
                  </div>
                </div>

                {routeResults.stops.map((stop, idx) => (
                  <div key={stop.id} className="relative z-10 flex gap-4 mb-6">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold shadow-md ring-4 ring-white">
                      {String.fromCharCode(66 + idx)}
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-4 flex-1 shadow-sm hover:border-blue-300 transition">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-slate-800">{stop.name}</h3>
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> +{stop.distance} km
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 flex items-center gap-4">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-slate-400" /> ~{stop.time} min</span>
                        <span className="flex items-center gap-1"><Package className="w-4 h-4 text-slate-400" /> Delivery</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-end mt-4">
                  <button className="bg-emerald-600 text-white px-6 py-2 rounded-md hover:bg-emerald-700 transition font-medium">
                    Dispatch Route
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Deliveries Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">Active Deliveries</h2>
          <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
        </div>
        <DataTable
          columns={[
            { header: 'Route ID', accessor: 'id' },
            { header: 'Driver', accessor: 'driver' },
            { header: 'Vehicle', accessor: 'vehicle' },
            { header: 'Status', accessor: (row) => <StatusBadge status={row.status} /> },
            { header: 'Progress', accessor: (row) => (
              <div className="w-32">
                <div className="flex justify-between text-xs mb-1 text-slate-500">
                  <span>{row.progress}%</span>
                </div>
                <ProgressBar value={row.progress} color={row.progress === 100 ? 'emerald' : 'blue'} />
              </div>
            )},
            { header: 'Distance / Time', accessor: (row) => `${row.distance} / ${row.time}` },
          ]}
          data={activeDeliveries}
        />
      </div>

      {/* Fleet Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Fleet Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {fleetData.map(vehicle => (
            <div key={vehicle.id} className="border border-slate-200 rounded-lg p-4 flex flex-col hover:border-slate-300 transition">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 p-2 rounded-md">
                    <Truck className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{vehicle.id}</div>
                    <div className="text-xs text-slate-500">{vehicle.type}</div>
                  </div>
                </div>
                <StatusBadge 
                  status={vehicle.status.toLowerCase().replace(' ', '_')} 
                  type={vehicle.status === 'Available' ? 'success' : vehicle.status === 'In Use' ? 'warning' : 'error'} 
                />
              </div>
              <div className="space-y-2 text-sm text-slate-600 mt-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Capacity:</span>
                  <span className="font-medium">{vehicle.capacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Storage:</span>
                  <span className="font-medium">{vehicle.temp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RouteOptimizer;

