import React, { useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ParkingList from './components/ParkingList';
import UserDashboard from './components/UserDashboard';
import AdminLogin from './AdminLogin';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('login');
  const [showAdmin, setShowAdmin] = useState(false);
  const [userView, setUserView] = useState('marketplace'); // 'marketplace' or 'dashboard'

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  if (showAdmin) {
    return <AdminLogin />;
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        {currentPage === 'login' ? (
          <LoginPage 
            onSwitchToRegister={() => setCurrentPage('register')}
            onAdminLogin={() => setShowAdmin(true)}
          />
        ) : (
          <RegisterPage 
            onSwitchToLogin={() => setCurrentPage('login')}
          />
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Header userView={userView} setUserView={setUserView} />
      {userView === 'marketplace' ? (
        <ParkingList />
      ) : (
        <UserDashboard />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
