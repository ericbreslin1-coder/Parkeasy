import React, { useState } from 'react';
import AdminDashboard from './AdminDashboard';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setIsLoggedIn(true);
        setMessage('Login successful! Welcome admin.');
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (error) {
      setMessage('Error connecting to server: ' + error.message);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    setMessage('');
  };

  if (isLoggedIn) {
    return <AdminDashboard token={token} onLogout={handleLogout} />;
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin}>
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
            borderRadius: '4px' 
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {message && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: message.includes('successful') ? '#d4edda' : '#f8d7da',
          color: message.includes('successful') ? '#155724' : '#721c24',
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}

export default AdminLogin;