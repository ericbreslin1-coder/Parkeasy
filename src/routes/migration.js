import express from 'express';
import { pool } from '../db/connection.js';

const router = express.Router();

// Migration endpoint - run migrations programmatically
router.post('/run-migrations', async (req, res) => {
  try {
    console.log('🔄 Starting database migrations...');
    
    // Check current schema
    const schemaResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    const hasIsAdmin = schemaResult.rows.some(row => row.column_name === 'is_admin');
    const hasUpdatedAt = schemaResult.rows.some(row => row.column_name === 'updated_at');
    
    const results = [];
    
    if (!hasIsAdmin) {
      // Add is_admin column
      await pool.query('ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE');
      results.push('✅ Added is_admin column');
      
      // Set existing admin user as admin
      await pool.query(
        "UPDATE users SET is_admin = TRUE WHERE email = 'admin@parkeasy.com'"
      );
      results.push('✅ Set admin@parkeasy.com as admin user');
    } else {
      results.push('✅ is_admin column already exists');
    }
    
    if (!hasUpdatedAt) {
      // Add updated_at column
      await pool.query('ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      results.push('✅ Added updated_at column');
      
      // Add trigger function
      await pool.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';
      `);
      
      // Add trigger
      await pool.query(`
        DROP TRIGGER IF EXISTS update_users_updated_at ON users;
        CREATE TRIGGER update_users_updated_at 
        BEFORE UPDATE ON users 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `);
      results.push('✅ Added updated_at trigger');
    } else {
      results.push('✅ updated_at column already exists');
    }
    
    // Final verification
    const finalSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    res.json({
      success: true,
      message: 'Database migrations completed successfully',
      results: results,
      finalSchema: finalSchema.rows
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;