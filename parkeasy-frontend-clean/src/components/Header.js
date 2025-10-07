import React from 'react';
import { useAuth } from '../context/AuthContext';

function Header({ userView, setUserView }) {
  const { user, logout } = useAuth();

  return (
    <header style={{
      backgroundColor: '#007bff',
      color: 'white',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '24px' }}>🅿️ ParkEasy</h1>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Find parking spots near you</p>
      </div>
      
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setUserView('marketplace')}
              style={{
                padding: '8px 16px',
                backgroundColor: userView === 'marketplace' ? 'rgba(255,255,255,0.3)' : 'transparent',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Marketplace
            </button>
            <button
              onClick={() => setUserView('dashboard')}
              style={{
                padding: '8px 16px',
                backgroundColor: userView === 'dashboard' ? 'rgba(255,255,255,0.3)' : 'transparent',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              My Dashboard
            </button>
          </div>
          
          <span>Welcome, {user.name}!</span>
          <button
            onClick={logout}
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;