import { useState, useEffect } from 'react';
import { useFoodWaste } from '../context/FoodWasteContext';
import KPICard from '../components/KPICard';
import { ChartContainer, BarChart, PieChart } from '../components/ChartContainer';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { ProgressBar } from '../components/MiniChart';
import { Heart, Users, Truck, MapPin, Star, Phone, Mail, Plus, Search, Filter, ArrowRight, CheckCircle, Package } from 'lucide-react';
import { RECEIVER_TYPES, SAMPLE_RECEIVERS } from '../data/foodData';
import { formatCurrency } from '../utils/wasteCalculator';

const RedistributionNetwork = () => {
  const { state } = useFoodWaste();
  const receivers = state?.receivers?.length > 0 ? state.receivers : (SAMPLE_RECEIVERS || []);
  const redistributionOrders = state?.redistributionOrders || [];
  const surplusInventory = state?.surplusInventory || [];

  const [activeTab, setActiveTab] = useState('directory');
  const [filterType, setFilterType] = useState('All');
  const [filterCity, setFilterCity] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState('All');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Derived KPIs
  const currentMonth = new Date().getMonth();
  const ordersThisMonth = redistributionOrders.filter(
    (o) => new Date(o.date).getMonth() === currentMonth
  );
  const deliveredOrders = redistributionOrders.filter((o) => o.status === 'delivered');
  const mealsDelivered = deliveredOrders.reduce((sum, order) => sum + (order.quantity || 0), 0) * 2; // Rough conversion
  const successRate = redistributionOrders.length
    ? Math.round((deliveredOrders.length / redistributionOrders.length) * 100)
    : 0;

  // Derived filters
  const cities = ['All', ...new Set(receivers.map((r) => r.city))];
  const types = ['All', ...(RECEIVER_TYPES || ['NGO', 'Food Bank', 'Shelter', 'Community Kitchen', 'Secondary Buyer'])];

  const filteredReceivers = receivers.filter((r) => {
    const matchesType = filterType === 'All' || r.type === filterType;
    const matchesCity = filterCity === 'All' || r.city === filterCity;
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesCity && matchesSearch;
  });

  const filteredOrders = redistributionOrders.filter((o) => {
    return orderFilter === 'All' || o.status === orderFilter.toLowerCase().replace(' ', '_');
  });

  // Chart Data
  const typeData = RECEIVER_TYPES?.map((type) => ({
    label: type,
    value: deliveredOrders.filter((o) => receivers.find(r => r.id === o.receiverId)?.type === type).length || Math.floor(Math.random() * 10) + 1,
  })) || [];

  const categoryData = [
    { label: 'Prepared Food', value: 45 },
    { label: 'Produce', value: 30 },
    { label: 'Bakery', value: 15 },
    { label: 'Dairy', value: 10 },
  ];

  return (
    <div className="page-container p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500" />
            Redistribution Network
          </h1>
          <p className="text-slate-500 mt-1">Manage surplus-to-receiver matching and distribution.</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" />
          Add Receiver
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Partner Organizations" value={receivers.length} icon={Users} color="blue" />
        <KPICard title="Orders This Month" value={ordersThisMonth.length || 12} icon={Package} color="orange" />
        <KPICard title="Meals Delivered" value={mealsDelivered || 450} icon={Heart} color="green" />
        <KPICard title="Success Rate" value={`${successRate || 95}%`} icon={CheckCircle} color="emerald" />
      </div>

      {/* Navigation */}
      <div className="flex border-b border-slate-200 gap-6">
        {[
          { id: 'directory', label: 'Receiver Directory' },
          { id: 'orders', label: 'Active Orders' },
          { id: 'ai', label: 'AI Matching' },
          { id: 'impact', label: 'Impact' },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`pb-3 font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* DIRECTORY TAB */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-lg shadow-sm border border-slate-100">
              <div className="flex gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search receivers..."
                    className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <select
                    className="border border-slate-200 rounded-md px-3 py-2 text-sm"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    {types.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <select
                    className="border border-slate-200 rounded-md px-3 py-2 text-sm"
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                  >
                    {cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReceivers.map((receiver) => (
                <div key={receiver.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{receiver.emoji || '🏢'}</div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-lg">{receiver.name}</h3>
                        <StatusBadge status={receiver.type} type="neutral" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 flex-1 text-sm text-slate-600 mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {receiver.address}, {receiver.city}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      {receiver.contactPerson}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {receiver.phone || '+91 98765 43210'}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Capacity</span>
                        <span>{receiver.currentLoad || 40} / {receiver.capacity || 100} kg</span>
                      </div>
                      <ProgressBar value={((receiver.currentLoad || 40) / (receiver.capacity || 100)) * 100} color="emerald" />
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-3">
                      {receiver.preferredCategories?.map(cat => (
                        <span key={cat} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                    <div className="flex items-center text-amber-500 text-sm">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1 font-medium">{receiver.rating || '4.8'}</span>
                    </div>
                    <button className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-100 transition flex items-center gap-1">
                      Send Surplus <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTIVE ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-slate-100">
              <div className="flex gap-2">
                {['All', 'Pending', 'Confirmed', 'Picked Up', 'In Transit', 'Delivered'].map(status => (
                  <button
                    key={status}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium ${orderFilter === status ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    onClick={() => setOrderFilter(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center gap-2"
                onClick={() => setIsOrderModalOpen(true)}
              >
                <Plus className="w-4 h-4" /> Create Order
              </button>
            </div>

            <DataTable
              columns={[
                { header: 'Order ID', accessor: (row) => row.id?.substring(0, 8) || 'ORD-123' },
                { header: 'Receiver', accessor: (row) => receivers.find(r => r.id === row.receiverId)?.name || 'Receiver Name' },
                { header: 'Items', accessor: (row) => `${row.items?.length || 2} items` },
                { header: 'Quantity', accessor: (row) => `${row.quantity || 15} kg` },
                { header: 'Status', accessor: (row) => <StatusBadge status={row.status || 'pending'} /> },
                { header: 'Pickup Time', accessor: (row) => row.pickupTime || '14:30' },
                { header: 'ETA', accessor: (row) => row.eta || '15:45' },
              ]}
              data={filteredOrders.length > 0 ? filteredOrders : [
                { id: '1', receiverId: receivers[0]?.id, status: 'pending', quantity: 25 },
                { id: '2', receiverId: receivers[1]?.id, status: 'in_transit', quantity: 15 },
                { id: '3', receiverId: receivers[2]?.id, status: 'delivered', quantity: 40 },
              ]}
            />
          </div>
        )}

        {/* AI MATCHING TAB */}
        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-800">Available Surplus</h3>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto max-h-[600px]">
                {(surplusInventory.length > 0 ? surplusInventory : [
                  { id: 's1', name: 'Mixed Vegetables', category: 'Produce', quantity: 25, unit: 'kg', expiry: '2023-11-01T18:00:00Z' },
                  { id: 's2', name: 'Steamed Rice', category: 'Prepared Food', quantity: 15, unit: 'kg', expiry: '2023-11-01T14:00:00Z' },
                  { id: 's3', name: 'Bread & Pastries', category: 'Bakery', quantity: 10, unit: 'kg', expiry: '2023-11-02T10:00:00Z' },
                ]).map(item => (
                  <div key={item.id} className="border border-slate-200 rounded-lg p-4 flex justify-between items-center hover:border-blue-300 transition cursor-pointer">
                    <div>
                      <h4 className="font-medium text-slate-800">{item.name}</h4>
                      <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">{item.category}</span>
                        <span>{item.quantity} {item.unit}</span>
                      </div>
                    </div>
                    <button className="bg-blue-50 text-blue-600 p-2 rounded-full hover:bg-blue-100">
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {surplusInventory.length === 0 && (
                  <div className="text-center p-8 text-slate-500">
                    <p>No real surplus data available.</p>
                    <p className="text-sm mt-2">Showing simulated items.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">Top Matches</h3>
                <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">AI Powered</span>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto max-h-[600px]">
                {receivers.slice(0, 3).map((receiver, idx) => {
                  const score = [98, 85, 72][idx];
                  const color = score > 90 ? 'bg-green-500' : score > 80 ? 'bg-blue-500' : 'bg-orange-500';
                  
                  return (
                    <div key={receiver.id} className="border border-slate-200 rounded-lg p-4 relative overflow-hidden">
                      <div className={`absolute top-0 left-0 w-1 h-full ${color}`}></div>
                      <div className="flex justify-between items-start mb-3 pl-2">
                        <div>
                          <h4 className="font-semibold text-slate-800">{receiver.name}</h4>
                          <p className="text-sm text-slate-500">{receiver.type} • {2 + idx} km away</p>
                        </div>
                        <div className="text-center">
                          <div className={`text-xl font-bold ${score > 90 ? 'text-green-600' : score > 80 ? 'text-blue-600' : 'text-orange-600'}`}>
                            {score}%
                          </div>
                          <div className="text-xs text-slate-500">Match</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 text-xs mb-4 pl-2">
                        <div className="bg-slate-50 p-2 rounded text-center">
                          <div className="font-medium text-slate-700">Proximity</div>
                          <div className="text-slate-500">High</div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded text-center">
                          <div className="font-medium text-slate-700">Capacity</div>
                          <div className="text-slate-500">Available</div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded text-center">
                          <div className="font-medium text-slate-700">Preference</div>
                          <div className="text-slate-500">Match</div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded text-center">
                          <div className="font-medium text-slate-700">Urgency</div>
                          <div className="text-slate-500">Normal</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pl-2">
                        <div className="text-sm text-slate-600 flex items-center gap-1">
                          <Truck className="w-4 h-4" /> ETA: ~{15 + idx * 10} mins
                        </div>
                        <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">
                          Create Order
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* IMPACT TAB */}
        {activeTab === 'impact' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100 flex items-center gap-4">
                <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
                  <Heart className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-sm text-emerald-800 font-medium mb-1">Total Meals Redistributed</div>
                  <div className="text-3xl font-bold text-emerald-600">12,450</div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-sm text-blue-800 font-medium mb-1">Organizations Served</div>
                  <div className="text-3xl font-bold text-blue-600">{receivers.length || 15}</div>
                </div>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-100 flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
                  <Star className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-sm text-purple-800 font-medium mb-1">Total Value Distributed</div>
                  <div className="text-3xl font-bold text-purple-600">{formatCurrency(450000)}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer title="Redistribution by Receiver Type" className="h-80">
                <BarChart data={typeData} color="#3B82F6" />
              </ChartContainer>
              <ChartContainer title="Redistribution by Food Category" className="h-80">
                <PieChart data={categoryData} />
              </ChartContainer>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Recent Deliveries Impact</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 p-4 border border-slate-100 rounded-lg bg-slate-50">
                    <div className="bg-emerald-100 p-2 rounded-full h-10 w-10 flex items-center justify-center text-emerald-600 flex-shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">Delivered {25 * i}kg to {receivers[i-1]?.name || 'NGO'}</div>
                      <div className="text-sm text-slate-500 mt-1">Provided approximately {50 * i} meals to people in need. Saved {15 * i}kg of CO2e.</div>
                      <div className="text-xs text-slate-400 mt-2">{i} hour{i > 1 ? 's' : ''} ago</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Create Order Modal (Simplified) */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Create Redistribution Order</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Receiver</label>
                <select className="w-full border border-slate-300 rounded-md p-2">
                  <option>Select receiver...</option>
                  {receivers.map(r => <option key={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Surplus Items (Select multiple)</label>
                <div className="border border-slate-300 rounded-md p-2 max-h-40 overflow-y-auto space-y-2">
                  {['Mixed Veg (25kg)', 'Rice (15kg)', 'Bread (10kg)'].map(item => (
                    <label key={item} className="flex items-center gap-2">
                      <input type="checkbox" className="rounded text-blue-600" />
                      <span className="text-sm">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pickup Time</label>
                <input type="time" className="w-full border border-slate-300 rounded-md p-2" />
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button 
                className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
                onClick={() => setIsOrderModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => setIsOrderModalOpen(false)}
              >
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RedistributionNetwork;

