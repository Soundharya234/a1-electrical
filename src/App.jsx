import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import History from './pages/History';
import Login from './pages/Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('a1_auth') === 'true';
  });

  const handleLogin = (status) => {
    setIsLoggedIn(status);
    if (status) {
      localStorage.setItem('a1_auth', 'true');
    } else {
      localStorage.removeItem('a1_auth');
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <div style={{ paddingBottom: '2rem' }}>
        <Routes>
          <Route path="/" element={<Dashboard onLogout={() => handleLogin(false)} />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}

export default App;
