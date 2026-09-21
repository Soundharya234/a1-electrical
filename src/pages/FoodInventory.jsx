import { useState, useEffect, useMemo } from 'react';
import { useFoodWaste } from '../context/FoodWasteContext';
import KPICard from '../components/KPICard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import FreshnessGauge from '../components/FreshnessGauge';
import { ProgressBar } from '../components/MiniChart';
import { Package, AlertTriangle, Clock, IndianRupee, Plus, Search, Filter, Trash2, Edit, X } from 'lucide-react';
import { FOOD_CATEGORIES } from '../data/foodData';
import { formatCurrency, getExpiryStatus } from '../utils/wasteCalculator';

const SAMPLE_ITEMS = [
  { id: '1', name: 'Tomatoes', category: 'Vegetables', quantity: 50, unit: 'kg', costPerUnit: 40, expiryDate: new Date(Date.now() + 86400000 * 2).toISOString(), storage: 'Cold Room', batchId: 'B-101' },
  { id: '2', name: 'Rice', category: 'Grains', quantity: 200, unit: 'kg', costPerUnit: 60, expiryDate: new Date(Date.now() + 86400000 * 180).toISOString(), storage: 'Dry Pantry', batchId: 'B-102' },
  { id: '3', name: 'Milk', category: 'Dairy', quantity: 30, unit: 'L', costPerUnit: 55, expiryDate: new Date(Date.now() + 86400000 * 1).toISOString(), storage: 'Fridge', batchId: 'B-103' },
  { id: '4', name: 'Chicken', category: 'Meat', quantity: 40, unit: 'kg', costPerUnit: 250, expiryDate: new Date(Date.now() + 86400000 * 3).toISOString(), storage: 'Freezer', batchId: 'B-104' },
  { id: '5', name: 'Onions', category: 'Vegetables', quantity: 10, unit: 'kg', costPerUnit: 35, expiryDate: new Date(Date.now() + 86400000 * 15).toISOString(), storage: 'Dry Pantry', batchId: 'B-105' }
];

export default function FoodInventory() {
  const { foodItems = SAMPLE_ITEMS, addFoodItem, updateFoodItem, deleteFoodItem } = useFoodWaste();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOption, setSortOption] = useState('Expiry Date');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', category: 'Vegetables', quantity: 0, unit: 'kg', costPerUnit: 0, expiryDate: '', storage: '', batchId: '', location: ''
  });

  const getCategoryEmoji = (category) => {
    const map = {
      'Vegetables': '🥕', 'Fruits': '🍎', 'Dairy': '🥛', 'Meat': '🥩', 'Grains': '🌾', 'Spices': '🧂', 'Beverages': '🧃'
    };
    return map[category] || '📦';
  };

  const calculateTotalValue = () => foodItems.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0);
  
  const getExpiringSoonCount = () => foodItems.filter(item => {
    const days = (new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
    return days > 0 && days <= 3;
  }).length;
  
  const getLowStockCount = () => foodItems.filter(item => item.quantity < 15).length; // simple threshold for demo

  const filteredItems = useMemo(() => {
    let result = foodItems.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter === 'All' || item.category === categoryFilter;
      
      let matchStatus = true;
      if(statusFilter !== 'All') {
        const days = (new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
        if(statusFilter === 'Expired') matchStatus = days <= 0;
        else if(statusFilter === 'Expiring') matchStatus = days > 0 && days <= 3;
        else if(statusFilter === 'Low Stock') matchStatus = item.quantity < 15;
        else if(statusFilter === 'Available') matchStatus = days > 3 && item.quantity >= 15;
      }
      return matchSearch && matchCat && matchStatus;
    });

    result.sort((a, b) => {
      if(sortOption === 'Name') return a.name.localeCompare(b.name);
      if(sortOption === 'Expiry Date') return new Date(a.expiryDate) - new Date(b.expiryDate);
      if(sortOption === 'Quantity') return a.quantity - b.quantity;
      if(sortOption === 'Value') return (b.quantity * b.costPerUnit) - (a.quantity * a.costPerUnit);
      return 0;
    });

    return result;
  }, [foodItems, searchTerm, categoryFilter, statusFilter, sortOption]);

  const handleOpenModal = (item = null) => {
    if(item) {
      setEditingItem(item);
      setFormData({ ...item, expiryDate: item.expiryDate.split('T')[0] });
    } else {
      setEditingItem(null);
      setFormData({ name: '', category: 'Vegetables', quantity: 0, unit: 'kg', costPerUnit: 0, expiryDate: '', storage: '', batchId: '', location: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const itemToSave = { ...formData, id: editingItem ? editingItem.id : Math.random().toString(), expiryDate: new Date(formData.expiryDate).toISOString() };
    if(editingItem && updateFoodItem) updateFoodItem(itemToSave);
    else if(!editingItem && addFoodItem) addFoodItem(itemToSave);
    setIsModalOpen(false);
  };

  const columns = [
    { key: 'name', label: 'Name', render: (val, row) => <div className="flex items-center gap-2"><span className="text-xl">{getCategoryEmoji(row.category)}</span> <span className="font-medium text-gray-900">{val}</span></div> },
    { key: 'category', label: 'Category' },
    { key: 'quantity', label: 'Quantity', render: (val, row) => <span className="font-semibold">{val} {row.unit}</span> },
    { key: 'costPerUnit', label: 'Cost/Unit', render: (val) => formatCurrency ? formatCurrency(val) : `₹${val}` },
    { key: 'expiryDate', label: 'Expiry Date', render: (val) => {
        const days = (new Date(val) - new Date()) / (1000 * 60 * 60 * 24);
        let color = 'bg-green-100 text-green-800';
        if(days <= 0) color = 'bg-red-100 text-red-800';
        else if(days <= 3) color = 'bg-orange-100 text-orange-800';
        return <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>{new Date(val).toLocaleDateString()}</span>;
    }},
    { key: 'freshness', label: 'Freshness', render: (val, row) => {
       const totalShelfLife = 30; // assume 30 days total shelf life for demo
       const daysLeft = Math.max(0, (new Date(row.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
       const pct = Math.min(100, (daysLeft / totalShelfLife) * 100);
       return <div className="w-24"><FreshnessGauge value={pct} size="sm" /></div>;
    }},
    { key: 'storage', label: 'Storage' },
    { key: 'actions', label: 'Actions', render: (_, row) => (
      <div className="flex items-center gap-2">
        <button onClick={() => handleOpenModal(row)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16} /></button>
        <button onClick={() => deleteFoodItem && deleteFoodItem(row.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
      </div>
    )}
  ];

  const renderTimeline = () => {
    const today = new Date();
    const timelineGroups = [
      { label: 'Today/Tomorrow', days: 2, color: 'border-red-400 bg-red-50 text-red-800' },
      { label: '2-3 Days', days: 3, color: 'border-orange-400 bg-orange-50 text-orange-800' },
      { label: 'This Week', days: 7, color: 'border-yellow-400 bg-yellow-50 text-yellow-800' },
      { label: 'Later', days: 999, color: 'border-green-400 bg-green-50 text-green-800' }
    ];

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Clock /> Expiry Timeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {timelineGroups.map((group, idx) => {
            const minDays = idx === 0 ? -999 : timelineGroups[idx-1].days;
            const items = foodItems.filter(item => {
              const days = (new Date(item.expiryDate) - today) / (1000 * 60 * 60 * 24);
              return days > minDays && days <= group.days;
            });
            
            return (
              <div key={group.label} className={`border-l-4 ${group.color} p-4 rounded-r-lg`}>
                <div className="font-semibold mb-2">{group.label} ({items.length})</div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {items.map(item => (
                    <div key={item.id} className="text-sm bg-white p-2 rounded shadow-sm flex justify-between">
                      <span className="truncate pr-2">{getCategoryEmoji(item.category)} {item.name}</span>
                      <span className="font-medium whitespace-nowrap">{item.quantity}{item.unit}</span>
                    </div>
                  ))}
                  {items.length === 0 && <div className="text-sm opacity-60 italic">No items</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="food-inventory-page space-y-6 p-6 bg-slate-50 min-h-screen">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="text-blue-600" /> Food Inventory
          </h1>
          <p className="text-gray-500 mt-1">Manage food stock and track expiry dates</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 font-medium transition-colors">
          <Plus size={18} /> Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Items" value={foodItems.length} icon={Package} color="bg-blue-500" />
        <KPICard title="Expiring Soon" value={getExpiringSoonCount()} icon={Clock} color="bg-orange-500" />
        <KPICard title="Low Stock" value={getLowStockCount()} icon={AlertTriangle} color="bg-red-500" />
        <KPICard title="Total Value" value={formatCurrency ? formatCurrency(calculateTotalValue()) : `₹${calculateTotalValue()}`} icon={IndianRupee} color="bg-emerald-500" />
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search items..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4">
            <div className="relative flex items-center">
               <Filter className="absolute left-3 text-gray-400" size={16} />
               <select className="pl-9 pr-8 py-2 border border-gray-300 rounded-md appearance-none bg-white" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                 <option value="All">All Categories</option>
                 {(FOOD_CATEGORIES || ['Vegetables', 'Fruits', 'Dairy', 'Meat', 'Grains']).map(c => <option key={c} value={c}>{c}</option>)}
               </select>
            </div>
            
            <select className="px-4 py-2 border border-gray-300 rounded-md bg-white" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Expiring">Expiring Soon</option>
              <option value="Expired">Expired</option>
              <option value="Low Stock">Low Stock</option>
            </select>
            
            <select className="px-4 py-2 border border-gray-300 rounded-md bg-white" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="Expiry Date">Sort by Expiry</option>
              <option value="Name">Sort by Name</option>
              <option value="Quantity">Sort by Quantity</option>
              <option value="Value">Sort by Value</option>
            </select>
          </div>
        </div>

        <DataTable columns={columns} data={filteredItems} />
      </div>

      {renderTimeline()}

      {isModalOpen && (
        <div className="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="modal bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-1 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="itemForm" onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Item Name</label>
                  <input required type="text" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select className="w-full border border-gray-300 rounded-md p-2" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {(FOOD_CATEGORIES || ['Vegetables', 'Fruits', 'Dairy', 'Meat', 'Grains']).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                  <input required type="date" className="w-full border border-gray-300 rounded-md p-2" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
                </div>
                
                <div className="space-y-1 flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input required type="number" min="0" step="0.1" className="w-full border border-gray-300 rounded-md p-2" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} />
                  </div>
                  <div className="w-1/3">
                    <label className="block text-sm font-medium text-gray-700">Unit</label>
                    <select className="w-full border border-gray-300 rounded-md p-2" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                      <option value="kg">kg</option><option value="L">L</option><option value="pcs">pcs</option><option value="packs">packs</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Cost Per Unit (₹)</label>
                  <input required type="number" min="0" step="0.1" className="w-full border border-gray-300 rounded-md p-2" value={formData.costPerUnit} onChange={e => setFormData({...formData, costPerUnit: Number(e.target.value)})} />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Storage Condition</label>
                  <select className="w-full border border-gray-300 rounded-md p-2" value={formData.storage} onChange={e => setFormData({...formData, storage: e.target.value})}>
                    <option value="">Select...</option>
                    <option value="Dry Pantry">Dry Pantry</option>
                    <option value="Fridge">Fridge</option>
                    <option value="Freezer">Freezer</option>
                    <option value="Cold Room">Cold Room</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Batch ID (Optional)</label>
                  <input type="text" className="w-full border border-gray-300 rounded-md p-2" value={formData.batchId} onChange={e => setFormData({...formData, batchId: e.target.value})} />
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 mt-auto">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 font-medium transition-colors">Cancel</button>
              <button type="submit" form="itemForm" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors">
                {editingItem ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

