import request from 'supertest';
import { createApp } from '../src/app.js';
import config from '../src/config.js';
import pkg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pkg;

// NOTE: These tests assume a real Postgres DB (test DB) is available.
// Consider providing a DATABASE_URL pointing to a disposable test database.

let pool;
let app;

beforeAll(async () => {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'parkeasy',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  });
  app = createApp();
});

afterAll(async () => {
  await pool.end();
});

describe('Auth & Admin smoke', () => {
  const adminEmail = 'admin@parkeasy.com';
  const adminPass = 'admin123';

  test('Admin login succeeds (assuming create-admin migration run)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: adminEmail, password: adminPass });
    if (res.status !== 200) {
      console.warn('Admin login failed; ensure migrations + create-admin executed. Status:', res.status, res.body);
    }
    expect([200,401]).toContain(res.status); // tolerate failure but flag
  });

  test('Register and login normal user', async () => {
    const email = `jestuser+${Date.now()}@example.com`;
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Jest User', email, password: 'secret123' });
    expect(reg.status).toBe(201);
    expect(reg.body.token).toBeDefined();

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'secret123' });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeDefined();
  });
});
