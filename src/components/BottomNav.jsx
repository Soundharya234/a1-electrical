import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Receipt, Clock, Users } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const BottomNav = () => {
  const { getLowStockItems } = useStore();
  const alertCount = getLowStockItems().length;

  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
        <div style={{ position: 'relative' }}>
          <LayoutDashboard size={24} />
          {alertCount > 0 && (
            <span style={{
              position: 'absolute',
              top: -4,
              right: -8,
              background: '#ef4444',
              color: 'white',
              fontSize: '0.6rem',
              fontWeight: 'bold',
              borderRadius: '999px',
              padding: '2px 6px',
            }}>
              {alertCount}
            </span>
          )}
        </div>
        <span>Dashboard</span>
      </NavLink>
      <NavLink to="/inventory" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Package size={24} />
        <span>Inventory</span>
      </NavLink>
      <NavLink to="/billing" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Receipt size={24} />
        <span>Billing</span>
      </NavLink>
      <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Clock size={24} />
        <span>History</span>
      </NavLink>
      <NavLink to="/customers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Users size={24} />
        <span>Customers</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
