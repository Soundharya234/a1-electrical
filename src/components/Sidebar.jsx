import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  MapPin, Zap, LayoutDashboard, TrendingUp, Package, ShieldCheck,
  AlertTriangle, Heart, Truck, Factory, BarChart3, Settings,
  ChevronLeft, ChevronRight, Box
} from 'lucide-react';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const navItems = [
    { icon: Zap, label: 'Renewable Energy Map', route: '/' },
    { icon: LayoutDashboard, label: 'Food Waste Dashboard', route: '/food-waste' },
    { icon: TrendingUp, label: 'Demand Forecast', route: '/forecast' },
    { icon: Package, label: 'Food Inventory', route: '/inventory' },
    { icon: Box, label: 'Packaging AI', route: '/packaging' },
    { icon: ShieldCheck, label: 'Quality Monitor', route: '/quality' },
    { icon: AlertTriangle, label: 'Surplus Management', route: '/surplus' },
    { icon: Heart, label: 'Redistribution', route: '/redistribution' },
    { icon: Truck, label: 'Route Optimizer', route: '/logistics' },
    { icon: Factory, label: 'Processing Units', route: '/processing' },
    { icon: BarChart3, label: 'Sustainability', route: '/analytics' },
    { icon: Settings, label: 'Settings', route: '/settings' },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span className="sidebar-logo" style={{ fontSize: '24px' }}>⚡</span>
        {!collapsed && (
          <div className="sidebar-brand">
            <h2 style={{ margin: 0, fontSize: '16px', color: '#F8FAFC', fontWeight: 800 }}>RenewableAI India</h2>
            <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8' }}>Location Intelligence Platform</p>
          </div>
        )}
      </div>

      <nav className="sidebar-nav" style={{ flex: 1, padding: '10px 0' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.route || (item.route === '/' && location.pathname === '/renewable');
          const Icon = item.icon;
          return (
            <Link
              key={item.route}
              to={item.route}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : ''}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 20px',
                color: isActive ? '#22C55E' : '#CBD5E1',
                textDecoration: 'none',
                background: isActive ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                borderLeft: isActive ? '3px solid #22C55E' : '3px solid transparent',
                transition: 'all 0.2s',
                fontWeight: isActive ? 700 : 500,
              }}
            >
              <Icon className="nav-icon" size={20} style={{ minWidth: '20px' }} />
              {!collapsed && <span className="nav-label" style={{ marginLeft: '12px', fontSize: '13px' }}>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer" style={{ padding: '20px', borderTop: '1px solid #1E293B', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: collapsed ? 'center' : 'flex-start' }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-toggle"
          aria-label="Toggle Sidebar"
          style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        {!collapsed && <div className="sidebar-version" style={{ fontSize: '11px', color: '#64748B' }}>v2.0 • MNRE & CEA Data</div>}
      </div>
    </aside>
  );
}
