import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function LoginPage({ onSwitchToRegister, onAdminLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await login(email, password);
    if (!result.success) {
      setMessage(result.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>Login to ParkEasy</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '10px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            marginBottom: '10px'
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <button 
          onClick={onSwitchToRegister}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#007bff', 
            textDecoration: 'underline', 
            cursor: 'pointer' 
          }}
        >
          Don't have an account? Register here
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <button 
          onClick={onAdminLogin}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#28a745', 
            textDecoration: 'underline', 
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Admin Login
        </button>
      </div>

      {message && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}

export default LoginPage;