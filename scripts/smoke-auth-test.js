// Quick auth & admin smoke test
import fetch from 'node-fetch';

const API = process.env.API || 'http://localhost:3000/api';

async function request(path, options = {}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers||{}) },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { status: res.status, json };
}

async function run() {
  console.log('--- Register normal user (if not exists) ---');
  const email = 'user+'+Date.now()+"@example.com";
  const reg = await request('/auth/register', { method: 'POST', body: { name: 'Test User', email, password: 'secret123' } });
  console.log('Register status', reg.status);

  console.log('\n--- Login admin (must exist) ---');
  const adminLogin = await request('/auth/login', { method: 'POST', body: { email: 'admin@parkeasy.com', password: 'admin123' } });
  console.log('Admin login status', adminLogin.status);
  if (adminLogin.status !== 200) {
    console.error('Admin login failed. Ensure create-admin script ran and DB migrated');
    process.exit(1);
  }
  const adminToken = adminLogin.json.token;

  console.log('\n--- Fetch admin stats ---');
  const stats = await request('/admin/stats', { headers: { Authorization: 'Bearer ' + adminToken } });
  console.log('Stats status', stats.status, 'keys:', Object.keys(stats.json || {}));

  console.log('\n--- Done ---');
}

run().catch(e => { console.error(e); process.exit(1); });
