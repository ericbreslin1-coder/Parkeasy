import express from 'express';
import pool from '../db/index.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Database initialization endpoint
router.post('/init-db', async (req, res) => {
  try {
    console.log('🔄 Initializing database...');
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Create parking_spots table
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Parking spots table created');

    // Create reviews table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        parking_spot_id INTEGER REFERENCES parking_spots(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Reviews table created');

    // Create indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_parking_spots_user_id ON parking_spots(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_reviews_parking_spot_id ON reviews(parking_spot_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id)');
    console.log('✅ Indexes created');

    // Create admin user
    const adminEmail = 'admin@parkeasy.com';
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [adminEmail]);
    
    if (existing.rows.length === 0) {
      await pool.query(
        'INSERT INTO users (name, email, password, is_admin) VALUES ($1, $2, $3, $4)',
        ['Admin User', adminEmail, hashedPassword, true]
      );
      console.log('✅ Admin user created');
    } else {
      await pool.query('UPDATE users SET is_admin = true WHERE email = $1', [adminEmail]);
      console.log('✅ Admin user updated');
    }

    // Verify everything was created
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

    res.json({
      success: true,
      message: 'Database initialized successfully',
      tablesCreated: tables.rows.map(r => r.table_name),
      userColumns: userColumns.rows,
      adminCredentials: {
        email: adminEmail,
        password: adminPassword
      }
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

export default router;