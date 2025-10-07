import express from 'express';
import pool from '../db/index.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Manual migration endpoint - runs all SQL migrations in order
router.post('/run-manual-migrations', async (req, res) => {
  try {
    console.log('🔄 Starting manual migrations...');
    const results = [];

    // MIGRATION 001: Create users table
    console.log('Running migration 001: Create users table');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    results.push('✅ Migration 001: Users table created');

    // MIGRATION 002: Create parking_spots table (but fix schema to match our app)
    console.log('Running migration 002: Create parking_spots table');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS parking_spots (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        address VARCHAR(500) NOT NULL,
        price_per_hour DECIMAL(10,2) NOT NULL,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_parking_spots_user_id ON parking_spots(user_id)`);
    results.push('✅ Migration 002: Parking spots table created');

    // MIGRATION 003: Create reviews table
    console.log('Running migration 003: Create reviews table');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        parking_spot_id INTEGER REFERENCES parking_spots(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_reviews_parking_spot_id ON reviews(parking_spot_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id)`);
    await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_unique_user_spot ON reviews(parking_spot_id, user_id)`);
    results.push('✅ Migration 003: Reviews table created');

    // MIGRATION 004: Add is_admin column
    console.log('Running migration 004: Add is_admin column');
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE`);
    results.push('✅ Migration 004: is_admin column added');

    // MIGRATION 005: Add updated_at column and trigger
    console.log('Running migration 005: Add updated_at column');
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    
    // Create trigger function
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);
    
    // Create trigger
    await pool.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at 
      BEFORE UPDATE ON users 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);
    results.push('✅ Migration 005: updated_at column and trigger added');

    // MIGRATION 006: Add updated_at to parking_spots
    console.log('Running migration 006: Add updated_at to parking_spots');
    await pool.query(`ALTER TABLE parking_spots ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    await pool.query(`
      DROP TRIGGER IF EXISTS update_parking_spots_updated_at ON parking_spots;
      CREATE TRIGGER update_parking_spots_updated_at 
      BEFORE UPDATE ON parking_spots 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);
    results.push('✅ Migration 006: updated_at added to parking_spots');

    // CREATE ADMIN USER
    console.log('Creating admin user...');
    const adminEmail = 'admin@parkeasy.com';
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Check if admin exists
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [adminEmail]);
    
    if (existing.rows.length === 0) {
      const adminResult = await pool.query(
        'INSERT INTO users (name, email, password, is_admin) VALUES ($1, $2, $3, $4) RETURNING id, name, email, is_admin',
        ['Admin User', adminEmail, hashedPassword, true]
      );
      results.push(`✅ Admin user created: ${adminResult.rows[0].email}`);
    } else {
      await pool.query('UPDATE users SET is_admin = true WHERE email = $1', [adminEmail]);
      results.push('✅ Admin user updated');
    }

    // VERIFY EVERYTHING
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    const userColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);

    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');

    console.log('✅ All migrations completed successfully!');

    res.json({
      success: true,
      message: 'All migrations completed successfully!',
      migrations: results,
      verification: {
        tablesCreated: tables.rows.map(r => r.table_name),
        userColumns: userColumns.rows,
        totalUsers: parseInt(userCount.rows[0].count),
        adminCredentials: {
          email: adminEmail,
          password: adminPassword
        }
      }
    });

  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      detail: error.detail,
      stack: error.stack
    });
  }
});

export default router;