import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { FoodWasteProvider } from './context/FoodWasteContext';
import Sidebar from './components/Sidebar';
import RenewableEnergy from './pages/RenewableEnergy';
import Dashboard from './pages/Dashboard';
import DemandForecast from './pages/DemandForecast';
import FoodInventory from './pages/FoodInventory';
import QualityMonitor from './pages/QualityMonitor';
import SurplusManagement from './pages/SurplusManagement';
import RedistributionNetwork from './pages/RedistributionNetwork';
import RouteOptimizer from './pages/RouteOptimizer';
import ProcessingUnits from './pages/ProcessingUnits';
import SustainabilityAnalytics from './pages/SustainabilityAnalytics';
import PlatformSettings from './pages/PlatformSettings';
import PackagingAdvisor from './pages/PackagingAdvisor';
import './App.css';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <FoodWasteProvider>
      <div className="app-layout">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className={`main-area ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <Routes>
            {/* Primary default route: Location-Based India Map & Renewable Energy Assessment */}
            <Route path="/" element={<RenewableEnergy />} />
            <Route path="/renewable" element={<RenewableEnergy />} />
            <Route path="/food-waste" element={<Dashboard />} />
            <Route path="/forecast" element={<DemandForecast />} />
            <Route path="/inventory" element={<FoodInventory />} />
            <Route path="/packaging" element={<PackagingAdvisor />} />
            <Route path="/quality" element={<QualityMonitor />} />
            <Route path="/surplus" element={<SurplusManagement />} />
            <Route path="/redistribution" element={<RedistributionNetwork />} />
            <Route path="/logistics" element={<RouteOptimizer />} />
            <Route path="/processing" element={<ProcessingUnits />} />
            <Route path="/analytics" element={<SustainabilityAnalytics />} />
            <Route path="/settings" element={<PlatformSettings />} />
          </Routes>
        </main>
      </div>
    </FoodWasteProvider>
  );
}

export default App;
