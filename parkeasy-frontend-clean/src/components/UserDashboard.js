import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function UserDashboard() {
  const { user, token, logout } = useAuth();
  const [mySpots, setMySpots] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('spots');

  useEffect(() => {
    fetchMyData();
  }, []);

  const fetchMyData = async () => {
    try {
      // Fetch user's parking spots
      const spotsResponse = await fetch(`${API_BASE}/parking/my-spots`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (spotsResponse.ok) {
        const spotsData = await spotsResponse.json();
        setMySpots(spotsData);
      }

      // Mock bookings data (since we don't have a bookings API yet)
      setMyBookings([
        {
          id: 1,
          spot_address: "123 Main Street, Downtown",
          booking_date: new Date().toLocaleDateString(),
          status: "Active",
          price: 8.50
        }
      ]);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleDeleteSpot = async (spotId) => {
    if (window.confirm('Are you sure you want to delete this parking spot?')) {
      try {
        const response = await fetch(`${API_BASE}/parking/${spotId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          fetchMyData(); // Refresh the list
          alert('Parking spot deleted successfully!');
        } else {
          alert('Error deleting parking spot');
        }
      } catch (error) {
        alert('Error deleting parking spot');
      }
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ margin: 0, color: '#333' }}>Welcome back, {user?.name}!</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>Manage your parking spots and bookings</p>
        </div>
        <button
          onClick={logout}
          style={{
            padding: '10px 20px',
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

      {/* Tab Navigation */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('spots')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: activeTab === 'spots' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'spots' ? 'white' : '#333',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          My Parking Spots ({mySpots.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'bookings' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'bookings' ? 'white' : '#333',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          My Bookings ({myBookings.length})
        </button>
      </div>

      {/* My Parking Spots Tab */}
      {activeTab === 'spots' && (
        <div>
          <h2>My Parking Spots</h2>
          {mySpots.length === 0 ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <p style={{ color: '#666', marginBottom: '20px' }}>You haven't listed any parking spots yet.</p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Add Your First Spot
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {mySpots.map((spot) => (
                <div key={spot.id} style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>{spot.address}</h3>
                  <p style={{ color: '#666', marginBottom: '10px' }}>{spot.description}</p>
                  <div style={{ marginBottom: '15px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
                      ${spot.price}/hour
                    </span>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: spot.available ? '#e8f5e8' : '#ffebee',
                      color: spot.available ? '#388e3c' : '#d32f2f',
                      fontSize: '12px'
                    }}>
                      {spot.available ? 'Available' : 'Occupied'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      style={{
                        flex: 1,
                        padding: '8px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSpot(spot.id)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Bookings Tab */}
      {activeTab === 'bookings' && (
        <div>
          <h2>My Bookings</h2>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f5f5f5' }}>
                <tr>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Location</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Date</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Price</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {myBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>{booking.spot_address}</td>
                    <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>{booking.booking_date}</td>
                    <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: '#e8f5e8',
                        color: '#388e3c',
                        fontSize: '12px'
                      }}>
                        {booking.status}
                      </span>
                    </td>
                    <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>${booking.price}/hr</td>
                    <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                      <button style={{
                        padding: '6px 12px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}>
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;