import express from 'express';
import pool from '../db/index.js';

const router = express.Router();

// Database connectivity test
router.get('/test-db', async (req, res) => {
  try {
    // Test 1: Basic connection
    const timeResult = await pool.query('SELECT NOW() as current_time');
    
    // Test 2: Check what database we're connected to
    const dbInfo = await pool.query(`
      SELECT 
        current_database() as database_name,
        current_user as username,
        version() as postgres_version
    `);
    
    // Test 3: Check if we can create/drop a test table
    let canCreateTables = false;
    try {
      await pool.query('CREATE TABLE test_permissions (id SERIAL PRIMARY KEY)');
      await pool.query('DROP TABLE test_permissions');
      canCreateTables = true;
    } catch (permError) {
      canCreateTables = false;
    }
    
    // Test 4: List all existing tables
    const existingTables = await pool.query(`
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    // Test 5: Check DATABASE_URL (without exposing the full URL)
    const dbUrl = process.env.DATABASE_URL;
    const dbUrlInfo = dbUrl ? {
      hasUrl: true,
      protocol: dbUrl.split('://')[0],
      host: dbUrl.includes('@') ? dbUrl.split('@')[1].split('/')[0] : 'unknown'
    } : { hasUrl: false };

    res.json({
      success: true,
      tests: {
        basicConnection: timeResult.rows[0],
        databaseInfo: dbInfo.rows[0],
        canCreateTables: canCreateTables,
        existingTables: existingTables.rows,
        databaseUrl: dbUrlInfo
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      detail: error.detail
    });
  }
});

export default router;