import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../context/StoreContext';
import { AlertTriangle, TrendingUp, Package, LogOut, Settings, X, Sun, Calendar, BarChart2, Users } from 'lucide-react';

const Dashboard = ({ onLogout }) => {
  const { items, bills, getLowStockItems, authConfig, updateAuth, customers } = useStore();
  const lowStockItems = getLowStockItems();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newUsername, setNewUsername] = useState(authConfig?.username || '');
  const [newPassword, setNewPassword] = useState(authConfig?.password || '');

  const now = new Date();

  // Helper: is same date?
  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  // Today
  const todayBills = bills.filter(b => isSameDay(new Date(b.date), now));
  const todaySales = todayBills.reduce((s, b) => s + b.total, 0);

  // This Week (last 7 days)
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);
  const weekBills = bills.filter(b => new Date(b.date) >= weekStart);
  const weekSales = weekBills.reduce((s, b) => s + b.total, 0);

  // This Month
  const monthBills = bills.filter(b => {
    const d = new Date(b.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthSales = monthBills.reduce((s, b) => s + b.total, 0);

  // 7-day chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const dayBills = bills.filter(b => isSameDay(new Date(b.date), d));
    const total = dayBills.reduce((s, b) => s + b.total, 0);
    const label = d.toLocaleDateString('en-IN', { weekday: 'short' });
    return { label, total, isToday: isSameDay(d, now) };
  });
  const maxVal = Math.max(...last7Days.map(d => d.total), 1);

  const totalSales = bills.reduce((s, b) => s + b.total, 0);

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="flex-row-between" style={{ marginBottom: '1.5rem', marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo.png" alt="A1 Electrical Logo" style={{ width: '48px', height: '48px', borderRadius: '12px', boxShadow: 'var(--shadow-glow)' }} />
          <div>
            <h2 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '1.25rem' }}>A1 Electrical</h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Welcome, {authConfig?.username}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-icon btn-secondary" onClick={() => setIsSettingsOpen(true)} title="Settings"><Settings size={20} /></button>
          <button className="btn-icon btn-secondary" onClick={onLogout} title="Logout"><LogOut size={20} /></button>
        </div>
      </div>

      {/* Sales Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {/* Today */}
        <div className="glass-panel" style={{ padding: '0.85rem', textAlign: 'center', borderTop: '3px solid #f59e0b' }}>
          <div style={{ color: '#f59e0b', marginBottom: '0.35rem', display: 'flex', justifyContent: 'center' }}><Sun size={22} /></div>
          <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>Today</p>
          <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.05rem', color: 'var(--text-main)' }}>₹{todaySales.toFixed(0)}</h3>
          <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)' }}>{todayBills.length} bills</p>
        </div>
        {/* This Week */}
        <div className="glass-panel" style={{ padding: '0.85rem', textAlign: 'center', borderTop: '3px solid #3b82f6' }}>
          <div style={{ color: '#3b82f6', marginBottom: '0.35rem', display: 'flex', justifyContent: 'center' }}><BarChart2 size={22} /></div>
          <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>This Week</p>
          <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.05rem', color: 'var(--text-main)' }}>₹{weekSales.toFixed(0)}</h3>
          <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)' }}>{weekBills.length} bills</p>
        </div>
        {/* This Month */}
        <div className="glass-panel" style={{ padding: '0.85rem', textAlign: 'center', borderTop: '3px solid #10b981' }}>
          <div style={{ color: '#10b981', marginBottom: '0.35rem', display: 'flex', justifyContent: 'center' }}><Calendar size={22} /></div>
          <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>This Month</p>
          <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.05rem', color: 'var(--text-main)' }}>₹{monthSales.toFixed(0)}</h3>
          <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)' }}>{monthBills.length} bills</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ color: 'var(--primary-color)', display: 'flex', justifyContent: 'center', marginBottom: '0.35rem' }}><TrendingUp size={26} /></div>
          <p style={{ margin: 0, fontSize: '0.8rem' }}>All-Time Sales</p>
          <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.2rem' }}>₹{totalSales.toFixed(0)}</h3>
        </div>
        <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ color: 'var(--accent-color)', display: 'flex', justifyContent: 'center', marginBottom: '0.35rem' }}><Users size={26} /></div>
          <p style={{ margin: 0, fontSize: '0.8rem' }}>Customers</p>
          <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.2rem' }}>{customers?.length || 0}</h3>
        </div>
      </div>

      {/* 7-Day Bar Chart */}
      <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <BarChart2 size={18} style={{ color: 'var(--primary-color)' }} />
          <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Last 7 Days Sales</h4>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.4rem', height: '90px' }}>
          {last7Days.map((day, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {day.total > 0 ? `₹${day.total >= 1000 ? (day.total / 1000).toFixed(1) + 'k' : day.total.toFixed(0)}` : ''}
              </div>
              <div style={{
                width: '100%',
                height: `${Math.max((day.total / maxVal) * 65, day.total > 0 ? 6 : 2)}px`,
                background: day.isToday
                  ? 'linear-gradient(180deg, #f59e0b, #d97706)'
                  : 'linear-gradient(180deg, #3b82f6, #1d4ed8)',
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.3s ease',
                minHeight: '2px'
              }} />
              <div style={{ fontSize: '0.6rem', color: day.isToday ? '#f59e0b' : 'var(--text-muted)', fontWeight: day.isToday ? 'bold' : 'normal' }}>
                {day.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--danger-color)' }}>
        <AlertTriangle size={24} />
        <h3 style={{ margin: 0 }}>Low Stock Alerts</h3>
        {lowStockItems.length > 0 && (
          <span className="badge badge-danger">{lowStockItems.length}</span>
        )}
      </div>

      {lowStockItems.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--success-color)' }}>
          <p style={{ color: 'inherit' }}>✅ All items are sufficiently stocked.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {lowStockItems.map(item => (
            <div key={item.id} className="glass-panel card flex-row-between" style={{ borderLeft: '4px solid var(--danger-color)' }}>
              <div>
                <h4 style={{ margin: 0, marginBottom: '0.25rem' }}>{item.name}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Threshold: {item.alertThreshold}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-danger" style={{ fontSize: '1rem', padding: '0.25rem 0.75rem' }}>
                  {item.stockQuantity} Left
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && createPortal(
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setIsSettingsOpen(false); }}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '1rem', boxSizing: 'border-box'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '400px', padding: '1.5rem', background: '#1e293b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
          >
            <div className="flex-row-between" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Update Login Info</h3>
              <button className="btn-icon btn-secondary" onClick={() => setIsSettingsOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              updateAuth(newUsername, newPassword);
              setIsSettingsOpen(false);
              alert('Login credentials updated successfully!');
            }}>
              <div className="input-group">
                <label>New Username</label>
                <input required className="input-field" type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} />
              </div>
              <div className="input-group">
                <label>New Password</label>
                <input required className="input-field" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                Save Changes
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Dashboard;
