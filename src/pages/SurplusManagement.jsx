import React, { useState } from 'react';
import { useFoodWaste } from '../context/FoodWasteContext';
import KPICard from '../components/KPICard';
import { ChartContainer, BarChart, PieChart } from '../components/ChartContainer';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import FreshnessGauge from '../components/FreshnessGauge';
import { AlertTriangle, Package, TrendingDown, IndianRupee, Search, Heart, Truck, Leaf, Trash2, RefreshCw, Plus } from 'lucide-react';
import { SURPLUS_STATUSES, WASTE_REASONS } from '../data/foodData';
import { formatCurrency, formatWeight, formatCO2 } from '../utils/wasteCalculator';

const SurplusManagement = () => {
  const { surplusEntries } = useFoodWaste();
  const [activeTab, setActiveTab] = useState('All');
  const [isDetecting, setIsDetecting] = useState(false);

  const defaultSurplus = [
    { id: '1', foodItem: 'Baguette', category: 'Bakery', quantity: 15, unit: 'kg', reason: 'overproduction', qualityScore: 90, freshness: 'good', bestBefore: '2026-09-08', value: 1500, status: 'available', carbonFootprint: 10 },
    { id: '2', foodItem: 'Mixed Salad', category: 'Produce', quantity: 5, unit: 'kg', reason: 'forecast_error', qualityScore: 70, freshness: 'fair', bestBefore: '2026-09-07', value: 500, status: 'claimed', carbonFootprint: 2 },
    { id: '3', foodItem: 'Pasta Salad', category: 'Prepared', quantity: 20, unit: 'kg', reason: 'cancellation', qualityScore: 95, freshness: 'fresh', bestBefore: '2026-09-09', value: 4000, status: 'in_transit', carbonFootprint: 15 },
    { id: '4', foodItem: 'Apples', category: 'Produce', quantity: 30, unit: 'kg', reason: 'excess_inventory', qualityScore: 85, freshness: 'good', bestBefore: '2026-09-15', value: 3000, status: 'delivered', carbonFootprint: 5 },
    { id: '5', foodItem: 'Milk', category: 'Dairy', quantity: 10, unit: 'L', reason: 'near_expiry', qualityScore: 30, freshness: 'poor', bestBefore: '2026-09-06', value: 800, status: 'expired', carbonFootprint: 8 },
  ];

  const entries = surplusEntries && surplusEntries.length > 0 ? surplusEntries : defaultSurplus;
  
  const availableEntries = entries.filter(e => e.status === 'available');
  const totalValueAtRisk = availableEntries.reduce((sum, e) => sum + e.value, 0);
  const totalCarbonImpact = availableEntries.reduce((sum, e) => sum + (e.carbonFootprint || 0), 0);

  const getStatusCount = (status) => entries.filter(e => e.status === status).length;

  const filteredEntries = activeTab === 'All' ? entries : entries.filter(e => e.status.toLowerCase().replace('_', ' ') === activeTab.toLowerCase());

  const handleDetect = () => {
    setIsDetecting(true);
    setTimeout(() => setIsDetecting(false), 1500);
  };

  const reasonData = [
    { label: 'Overproduction', value: 40 },
    { label: 'Forecast Error', value: 25 },
    { label: 'Cancellation', value: 15 },
    { label: 'Excess Inventory', value: 20 }
  ];

  const trendData = [
    { label: 'Sep 1', value: 15 }, { label: 'Sep 2', value: 12 }, { label: 'Sep 3', value: 25 },
    { label: 'Sep 4', value: 10 }, { label: 'Sep 5', value: 8 }, { label: 'Sep 6', value: 30 }
  ];

  const columns = [
    { header: 'Food Item', accessor: 'foodItem' },
    { header: 'Category', accessor: 'category' },
    { header: 'Quantity', accessor: (row) => `${row.quantity} ${row.unit}` },
    { header: 'Quality', accessor: (row) => <FreshnessGauge value={row.qualityScore} /> },
    { header: 'Value', accessor: (row) => `₹${row.value}` },
    { header: 'Status', accessor: (row) => <StatusBadge status={row.status} /> },
    { header: 'Actions', accessor: (row) => (
      <div className="flex gap-2">
        {row.status === 'available' && <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Find Receiver</button>}
        {row.status === 'claimed' && <button className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Track</button>}
        {row.status === 'delivered' && <button className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Details</button>}
      </div>
    )}
  ];

  return (
    <div className="page-container p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><AlertTriangle className="text-orange-500" /> Surplus Management</h1>
        <div className="flex gap-3">
          <button onClick={handleDetect} className="btn bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2">
            <Search className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} /> Detect Surplus
          </button>
          <button className="btn bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Surplus
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Surplus" value={entries.length} icon={Package} color="text-orange-500" />
        <KPICard title="Available Now" value={availableEntries.length} icon={Heart} color="text-green-500" />
        <KPICard title="Value at Risk" value={`₹${totalValueAtRisk.toLocaleString('en-IN')}`} icon={IndianRupee} color="text-red-500" />
        <KPICard title="Carbon Impact" value={`${totalCarbonImpact} kg CO2`} icon={Leaf} color="text-green-600" />
      </div>

      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm mb-6 border">
        {['Available', 'Claimed', 'In Transit', 'Delivered'].map((step, idx) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center text-center p-2">
              <span className="text-xl font-bold">{getStatusCount(step.toLowerCase().replace(' ', '_'))}</span>
              <span className="text-sm text-gray-500">{step}</span>
            </div>
            {idx < 3 && <div className="text-gray-300 font-bold">→</div>}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <h2 className="text-lg font-semibold mb-4">AI Surplus Detection</h2>
        <div className="p-4 bg-blue-50 text-blue-800 rounded-md flex justify-between items-center">
          <div>
            <p className="font-medium">Detected 20kg surplus of Rice (Forecast Error)</p>
            <p className="text-sm">Action suggested: Redistribute immediately</p>
          </div>
          <button className="bg-blue-600 text-white px-3 py-1 text-sm rounded">Create Entry</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card bg-white p-4 border rounded shadow-sm">
          <h3 className="font-semibold mb-4">Surplus by Reason</h3>
          <ChartContainer height={250}>
            <PieChart data={reasonData} />
          </ChartContainer>
        </div>
        <div className="card bg-white p-4 border rounded shadow-sm">
          <h3 className="font-semibold mb-4">Surplus Trend (30 Days)</h3>
          <ChartContainer height={250}>
            <BarChart data={trendData} xKey="label" yKey="value" color="#F59E0B" />
          </ChartContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="flex border-b bg-gray-50 px-4 pt-2">
          {['All', 'Available', 'Claimed', 'In Transit', 'Delivered', 'Expired'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium ${activeTab === tab ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="p-4">
          <DataTable data={filteredEntries} columns={columns} />
        </div>
      </div>
    </div>
  );
};

export default SurplusManagement;

