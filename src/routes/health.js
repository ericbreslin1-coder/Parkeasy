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

export default router;
