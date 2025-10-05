import pkg from 'pg';
import config from '../config.js';

const { Pool } = pkg;

const pool = new Pool({
  connectionString: config.databaseUrl,
  // ssl: { rejectUnauthorized: false }, // Uncomment for Render/prod
});

export default pool;
