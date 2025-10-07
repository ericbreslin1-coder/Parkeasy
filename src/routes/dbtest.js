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
    
    // Test 4: List all existing tables with more detail
    const existingTables = await pool.query(`
      SELECT 
        table_name, 
        table_type,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    // Test 4.5: Get ALL schemas and tables (not just public)
    const allTables = await pool.query(`
      SELECT table_schema, table_name, table_type
      FROM information_schema.tables 
      WHERE table_type = 'BASE TABLE'
      ORDER BY table_schema, table_name
    `);
    
    // Test 4.6: Check if users table exists anywhere
    const usersTableCheck = await pool.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables 
      WHERE table_name = 'users'
    `);
    
    // Test 4.7: Try to count users directly (will fail if table doesn't exist)
    let userCount = null;
    try {
      const countResult = await pool.query('SELECT COUNT(*) as count FROM users');
      userCount = countResult.rows[0].count;
    } catch (error) {
      userCount = `Error: ${error.message}`;
    }
    
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
        allTables: allTables.rows,
        usersTableCheck: usersTableCheck.rows,
        userCount: userCount,
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

// Test user creation directly
router.post('/test-user-creation', async (req, res) => {
  try {
    // Test direct user insertion
    const testEmail = `test-${Date.now()}@example.com`;
    const testName = 'Test User';
    const testPassword = 'hashedpassword123'; // Not actually hashed for testing
    
    console.log('Attempting to insert test user...');
    const insertResult = await pool.query(
      'INSERT INTO users (name, email, password, is_admin) VALUES ($1, $2, $3, $4) RETURNING *',
      [testName, testEmail, testPassword, false]
    );
    
    console.log('Insert successful:', insertResult.rows[0]);
    
    // Test user selection
    const selectResult = await pool.query('SELECT * FROM users WHERE email = $1', [testEmail]);
    console.log('Select successful:', selectResult.rows[0]);
    
    // Count all users
    const countResult = await pool.query('SELECT COUNT(*) as total FROM users');
    console.log('User count:', countResult.rows[0]);
    
    res.json({
      success: true,
      insertedUser: insertResult.rows[0],
      selectedUser: selectResult.rows[0],
      totalUsers: countResult.rows[0].total
    });
    
  } catch (error) {
    console.error('Test user creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      detail: error.detail
    });
  }
});