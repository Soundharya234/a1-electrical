import { useState } from 'react';
import { Lock, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const Login = ({ onLogin }) => {
  const { authConfig } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.toLowerCase() === authConfig.username.toLowerCase() && password === authConfig.password) {
      onLogin(true);
    } else {
      setError(true);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '1rem',
      background: 'var(--bg-color)',
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <img src="/logo.png" alt="A1 Electrical" style={{ width: '120px', height: '120px', borderRadius: '20px', marginBottom: '1.5rem', boxShadow: 'var(--shadow-glow)' }} />
        <h2 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>A1 Electrical</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Sign in to your dashboard</p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            Invalid username or password.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div className="input-group">
            <label>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="input-field" 
                style={{ width: '100%', paddingLeft: '40px' }} 
                placeholder="Enter your username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(false); }}
                required
              />
            </div>
          </div>
          
          <div className="input-group" style={{ marginBottom: '2rem' }}>
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="input-field" 
                style={{ width: '100%', paddingLeft: '40px' }} 
                placeholder="Enter password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
