import React, { useState } from 'react';
import { useFoodWaste } from '../context/FoodWasteContext';
import { Settings, Bell, Shield, Database, Save, Server, Users } from 'lucide-react';

const PlatformSettings = () => {
  const { runSetup } = useFoodWaste();
  
  const [formData, setFormData] = useState({
    orgName: 'Green Foods Inc.',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    expiryWarningDays: 3,
    coldStorageTempMax: 4,
    processingTolerance: 5,
    wma7Day: 0.5,
    wma14Day: 0.3,
    wma30Day: 0.2,
    surplusThreshold: 10
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully!');
    }, 800);
  };

  const handleRunSetup = () => {
    if (window.confirm('Are you sure you want to run the database setup? This will reseed initial data.')) {
      if (runSetup) {
        runSetup();
        alert('Database setup initiated.');
      } else {
        alert('Setup function not available in context.');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-3 border-b pb-4">
        <Settings className="text-slate-700 w-8 h-8" />
        <h1 className="text-2xl font-bold text-slate-800">Platform Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* General Configuration */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <Server className="text-blue-500 w-5 h-5" />
            <h2 className="text-lg font-semibold text-slate-800">General Configuration</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Organization Name</label>
              <input 
                type="text" 
                name="orgName"
                value={formData.orgName}
                onChange={handleChange}
                className="w-full p-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Default Timezone</label>
              <select 
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className="w-full p-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="UTC">UTC</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
              <select 
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full p-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="GBP">£ GBP</option>
              </select>
            </div>
          </div>
        </div>

        {/* Alert Thresholds */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <Bell className="text-orange-500 w-5 h-5" />
            <h2 className="text-lg font-semibold text-slate-800">Alert Thresholds</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Warning (Days)</label>
              <input 
                type="number" 
                name="expiryWarningDays"
                value={formData.expiryWarningDays}
                onChange={handleChange}
                className="w-full p-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <p className="text-xs text-slate-500 mt-1">Alert when items expire within this many days.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cold Storage Temp Max (°C)</label>
              <input 
                type="number" 
                name="coldStorageTempMax"
                value={formData.coldStorageTempMax}
                onChange={handleChange}
                className="w-full p-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Processing Wastage Tolerance (%)</label>
              <input 
                type="number" 
                name="processingTolerance"
                value={formData.processingTolerance}
                onChange={handleChange}
                className="w-full p-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* AI Forecast Parameters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <Shield className="text-purple-500 w-5 h-5" />
            <h2 className="text-lg font-semibold text-slate-800">AI Forecast Parameters</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">WMA Weights (Must sum to 1.0)</label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-xs text-slate-500">7-Day</span>
                  <input 
                    type="number" 
                    step="0.1"
                    name="wma7Day"
                    value={formData.wma7Day}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <span className="text-xs text-slate-500">14-Day</span>
                  <input 
                    type="number" 
                    step="0.1"
                    name="wma14Day"
                    value={formData.wma14Day}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <span className="text-xs text-slate-500">30-Day</span>
                  <input 
                    type="number" 
                    step="0.1"
                    name="wma30Day"
                    value={formData.wma30Day}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Surplus Detection Threshold (%)</label>
              <input 
                type="number" 
                name="surplusThreshold"
                value={formData.surplusThreshold}
                onChange={handleChange}
                className="w-full p-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <p className="text-xs text-slate-500 mt-1">Mark inventory as surplus if it exceeds forecast by this percentage.</p>
            </div>
          </div>
        </div>

        {/* System Setup */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <Database className="text-emerald-500 w-5 h-5" />
            <h2 className="text-lg font-semibold text-slate-800">System Setup</h2>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Run the initial database setup to seed default values, mock data for testing, and initialize required collections.
            </p>
            <button 
              onClick={handleRunSetup}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2 rounded-md font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Database size={18} />
              Run Database Setup / Seed Data
            </button>
            <div className="p-3 bg-blue-50 rounded text-sm text-blue-800 border border-blue-100 flex items-start gap-2">
              <Users className="shrink-0 mt-0.5" size={16} />
              <p>Current active users and processing units will not be deleted during seed.</p>
            </div>
          </div>
        </div>

      </div>

      <div className="flex justify-end pt-6 border-t">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md font-medium flex items-center gap-2 transition-colors"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
};

export default PlatformSettings;

