import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { AlertTriangle, TrendingUp, Package, LogOut, Settings, X } from 'lucide-react';

const Dashboard = ({ onLogout }) => {
  const { items, bills, getLowStockItems, authConfig, updateAuth } = useStore();
  const lowStockItems = getLowStockItems();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newUsername, setNewUsername] = useState(authConfig?.username || '');
  const [newPassword, setNewPassword] = useState(authConfig?.password || '');

  const totalSales = bills.reduce((sum, bill) => sum + bill.total, 0);
  const totalItems = items.length;

  return (
    <div className="animate-slide-up">
      <div className="flex-row-between" style={{ marginBottom: '1.5rem', marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo.png" alt="A1 Electrical Logo" style={{ width: '48px', height: '48px', borderRadius: '12px', boxShadow: 'var(--shadow-glow)' }} />
          <div>
            <h2 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '1.25rem' }}>A1 Electrical</h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Welcome, Owner {authConfig?.username}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-icon btn-secondary" onClick={() => setIsSettingsOpen(true)} title="Settings">
            <Settings size={20} />
          </button>
          <button className="btn-icon btn-secondary" onClick={onLogout} title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>
            <TrendingUp size={32} />
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>Total Sales</p>
          <h3 style={{ margin: 0, fontSize: '1.5rem' }}>₹{totalSales.toFixed(2)}</h3>
        </div>
        <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem', color: 'var(--accent-color)' }}>
            <Package size={32} />
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>Total Items</p>
          <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{totalItems}</h3>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--danger-color)' }}>
        <AlertTriangle size={24} />
        <h3 style={{ margin: 0 }}>Low Stock Alerts</h3>
      </div>

      {lowStockItems.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--success-color)' }}>
          <p style={{ color: 'inherit' }}>All items are sufficiently stocked.</p>
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

      {isSettingsOpen && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '1.5rem' }}>
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
        </div>
      )}
    </div>
  );
};

export default Dashboard;
