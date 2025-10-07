import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function ParkingList() {
  const [spots, setSpots] = useState([]);
  const [searchLocation, setSearchLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchParkingSpots();
  }, []);

  const fetchParkingSpots = async () => {
    try {
      const response = await fetch(`${API_BASE}/parking`);
      if (response.ok) {
        const data = await response.json();
        setSpots(data);
      }
    } catch (error) {
      console.error('Error fetching parking spots:', error);
    }
    setLoading(false);
  };

  const filteredSpots = spots.filter(spot => 
    spot.address.toLowerCase().includes(searchLocation.toLowerCase())
  );

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading parking spots...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1>Find Parking Spots</h1>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search by location..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            style={{ 
              flex: 1, 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid #ddd' 
            }}
          />
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {showAddForm ? 'Cancel' : 'List Your Spot'}
          </button>
        </div>
      </div>

      {showAddForm && <AddSpotForm onSpotAdded={fetchParkingSpots} onCancel={() => setShowAddForm(false)} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filteredSpots.map((spot) => (
          <ParkingSpotCard key={spot.id} spot={spot} />
        ))}
      </div>

      {filteredSpots.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
          {searchLocation ? 'No parking spots found in this location.' : 'No parking spots available yet.'}
        </div>
      )}
    </div>
  );
}

function ParkingSpotCard({ spot }) {
  const [isBooked, setIsBooked] = useState(false);

  const handleBook = async () => {
    // Simulate booking
    setIsBooked(true);
    alert(`Parking spot at ${spot.address} has been booked!`);
  };

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{spot.address}</h3>
      <p style={{ margin: '5px 0', color: '#666' }}>{spot.description}</p>
      <div style={{ margin: '15px 0' }}>
        <span style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#28a745' 
        }}>
          ${spot.price}/hour
        </span>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: spot.available && !isBooked ? '#e8f5e8' : '#ffebee',
          color: spot.available && !isBooked ? '#388e3c' : '#d32f2f',
          fontSize: '12px'
        }}>
          {isBooked ? 'Booked' : spot.available ? 'Available' : 'Occupied'}
        </span>
      </div>
      <button
        onClick={handleBook}
        disabled={!spot.available || isBooked}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: (!spot.available || isBooked) ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: (!spot.available || isBooked) ? 'not-allowed' : 'pointer'
        }}
      >
        {isBooked ? 'Booked' : spot.available ? 'Book Now' : 'Not Available'}
      </button>
    </div>
  );
}

function AddSpotForm({ onSpotAdded, onCancel }) {
  const [formData, setFormData] = useState({
    address: '',
    description: '',
    price: '',
  });
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/parking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          available: true
        }),
      });

      if (response.ok) {
        onSpotAdded();
        onCancel();
        alert('Parking spot added successfully!');
      } else {
        alert('Error adding parking spot');
      }
    } catch (error) {
      alert('Error adding parking spot');
    }
    setLoading(false);
  };

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '30px',
      backgroundColor: '#f8f9fa'
    }}>
      <h3>List Your Parking Spot</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Address:</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Description:</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            style={{ width: '100%', padding: '8px', marginTop: '5px', height: '80px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Price per hour ($):</label>
          <input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Adding...' : 'Add Spot'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default ParkingList;