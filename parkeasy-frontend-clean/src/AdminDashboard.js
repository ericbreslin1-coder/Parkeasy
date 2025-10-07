import React, { useState, useEffect } from 'react';

function AdminDashboard({ token, onLogout }) {
  const [users, setUsers] = useState([]);
  const [parkingSpots, setParkingSpots] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSpots: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch users
      const usersResponse = await fetch('http://localhost:3000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      // Fetch parking spots
      const spotsResponse = await fetch('http://localhost:3000/api/parking', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (spotsResponse.ok) {
        const spotsData = await spotsResponse.json();
        setParkingSpots(spotsData);
      }

      // Update stats
      setStats({
        totalUsers: users.length,
        totalSpots: parkingSpots.length,
        totalRevenue: parkingSpots.reduce((sum, spot) => sum + (spot.price || 0), 0)
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Admin Dashboard</h1>
        <button 
          onClick={onLogout}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '20px', 
          borderRadius: '8px', 
          textAlign: 'center' 
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>Total Users</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{stats.totalUsers}</p>
        </div>
        <div style={{ 
          backgroundColor: '#e8f5e8', 
          padding: '20px', 
          borderRadius: '8px', 
          textAlign: 'center' 
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#388e3c' }}>Parking Spots</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{stats.totalSpots}</p>
        </div>
        <div style={{ 
          backgroundColor: '#fff3e0', 
          padding: '20px', 
          borderRadius: '8px', 
          textAlign: 'center' 
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#f57c00' }}>Total Revenue</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>${stats.totalRevenue}</p>
        </div>
      </div>

      {/* Users Table */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Recent Users</h2>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f5f5f5' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Role</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 5).map((user, index) => (
                <tr key={index}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{user.name}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{user.email}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      backgroundColor: user.is_admin ? '#e3f2fd' : '#f5f5f5',
                      color: user.is_admin ? '#1976d2' : '#666'
                    }}>
                      {user.is_admin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              No users found
            </div>
          )}
        </div>
      </div>

      {/* Parking Spots Table */}
      <div>
        <h2>Parking Spots</h2>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f5f5f5' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Address</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Price</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Available</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Owner</th>
              </tr>
            </thead>
            <tbody>
              {parkingSpots.slice(0, 5).map((spot, index) => (
                <tr key={index}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{spot.address}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>${spot.price}/hr</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      backgroundColor: spot.available ? '#e8f5e8' : '#ffebee',
                      color: spot.available ? '#388e3c' : '#d32f2f'
                    }}>
                      {spot.available ? 'Available' : 'Occupied'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{spot.owner_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {parkingSpots.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              No parking spots found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;