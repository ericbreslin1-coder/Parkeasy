import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from './services/api';

function AdminDashboard({ onLogout }) {
  const [users, setUsers] = useState([]);
  const [spots, setSpots] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [statsRes, usersRes, spotsRes, reviewsRes] = await Promise.all([
        adminAPI.stats(),
        adminAPI.users(),
        adminAPI.spots(),
        adminAPI.reviews()
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users || []);
      setSpots(spotsRes.data.parkingSpots || []);
      setReviews(reviewsRes.data.reviews || []);
    } catch (e) {
      console.error(e);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await adminAPI.deleteUser(id); load(); } catch { alert('Delete failed'); }
  };
  const handleDeleteSpot = async (id) => {
    if (!window.confirm('Delete this spot?')) return;
    try { await adminAPI.deleteSpot(id); load(); } catch { alert('Delete failed'); }
  };
  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try { await adminAPI.deleteReview(id); load(); } catch { alert('Delete failed'); }
  };

  if (loading) return <div style={{ padding: 40 }}>Loading admin data...</div>;
  if (error) return <div style={{ padding: 40, color: 'red' }}>{error}</div>;

  const statCard = (label, value, color='#1976d2') => (
    <div style={{ background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ fontSize: 12, letterSpacing: .5, textTransform: 'uppercase', color: '#555' }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 600, color }}>{value}</div>
    </div>
  );

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={load} style={btnStyle}>Refresh</button>
          <button onClick={onLogout} style={{ ...btnStyle, background: '#dc3545' }}>Logout</button>
        </div>
      </header>

      <nav style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['overview','users','spots','reviews'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            ...tabBtnStyle,
            background: activeTab === tab ? '#1976d2' : '#f1f3f5',
            color: activeTab === tab ? '#fff' : '#222'
          }}>{tab.charAt(0).toUpperCase()+tab.slice(1)}</button>
        ))}
      </nav>

      {activeTab === 'overview' && stats && (
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', marginBottom: 32 }}>
          {statCard('Users', stats.totals.users)}
            {statCard('Spots', stats.totals.parkingSpots, '#388e3c')}
            {statCard('Reviews', stats.totals.reviews, '#6d4c41')}
            {statCard('Available', stats.totals.availableSpots, '#0288d1')}
            {statCard('Avg Rating', stats.averageRating, '#f57c00')}
            {statCard('New Users 30d', stats.recent.newUsers, '#7b1fa2')}
            {statCard('New Spots 30d', stats.recent.newSpots, '#512da8')}
            {statCard('New Reviews 30d', stats.recent.newReviews, '#455a64')}
        </div>
      )}

      {activeTab === 'users' && (
        <DataTable
          title="Users"
          columns={['Name','Email','Spots','Reviews','Created','Actions']}
          rows={users.map(u => [u.name, u.email, u.parking_spots_count, u.reviews_count, new Date(u.created_at).toLocaleDateString(),
            <button style={smallDangerBtn} onClick={() => handleDeleteUser(u.id)}>Delete</button>])}
        />
      )}

      {activeTab === 'spots' && (
        <DataTable
          title="Parking Spots"
          columns={['Location','Available','Reviews','Avg Rating','Owner','Created','Actions']}
          rows={spots.map(s => [s.location, s.is_available ? 'Yes' : 'No', s.reviews_count, s.average_rating || '—', s.owner_email || s.owner_name || '—', new Date(s.created_at).toLocaleDateString(),
            <button style={smallDangerBtn} onClick={() => handleDeleteSpot(s.id)}>Delete</button>])}
        />
      )}

      {activeTab === 'reviews' && (
        <DataTable
          title="Reviews"
          columns={['Rating','Comment','Reviewer','Spot','Created','Updated','Actions']}
          rows={reviews.map(r => [r.rating, r.comment?.slice(0,60) || '', r.reviewer_email || r.reviewer_name, r.parking_spot_location, new Date(r.created_at).toLocaleDateString(), new Date(r.updated_at).toLocaleDateString(),
            <button style={smallDangerBtn} onClick={() => handleDeleteReview(r.id)}>Delete</button>])}
        />
      )}
    </div>
  );
}

const btnStyle = {
  background: '#1976d2',
  color: '#fff',
  padding: '8px 16px',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontWeight: 500
};

const tabBtnStyle = {
  border: 'none',
  padding: '8px 14px',
  borderRadius: 20,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
  transition: 'background .15s'
};

const smallDangerBtn = {
  background: '#dc3545',
  color: '#fff',
  border: 'none',
  padding: '4px 10px',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 12
};

function DataTable({ title, columns, rows }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ margin: '0 0 12px 0', fontSize: 20 }}>{title}</h2>
      <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 650 }}>
          <thead>
            <tr>
              {columns.map(c => <th key={c} style={thStyle}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={columns.length} style={{ padding: 24, textAlign: 'center', color: '#666' }}>No data</td></tr>
            )}
            {rows.map((r,i) => (
              <tr key={i} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
                {r.map((cell,j) => <td key={j} style={tdStyle}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const thStyle = { textAlign: 'left', padding: '10px 12px', fontSize: 12, textTransform: 'uppercase', letterSpacing: .5, borderBottom: '1px solid #eee', background: '#f8f9fa' };
const tdStyle = { padding: '10px 12px', fontSize: 14, borderBottom: '1px solid #f1f3f5', verticalAlign: 'top' };

export default AdminDashboard;