import express from 'express';
import pool from '../db/index.js';

const router = express.Router();

// Lightweight health & readiness check
router.get('/', async (req, res) => {
  const start = Date.now();
  try {
    // simple DB ping
    await pool.query('SELECT 1');
    const latency = Date.now() - start;
    res.json({
      status: 'ok',
      db: 'ok',
      latencyMs: latency,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      db: 'error',
      message: 'Database not reachable',
      timestamp: new Date().toISOString()
    });
  }
});

// Debug endpoint to check database schema
router.get('/debug', async (req, res) => {
  try {
    // Check if tables exist and their structure
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const userColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);

    res.json({
      tables: tables.rows.map(r => r.table_name),
      userTableColumns: userColumns.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
