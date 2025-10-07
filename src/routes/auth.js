import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import pool from '../db/index.js';
import config from '../config.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Input validation middleware
const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be 2-50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be at least 6 characters'),
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array()[0].msg 
    });
  }
  next();
};

// Register endpoint
router.post('/register', validateRegister, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, is_admin, created_at',
      [name, email, hashedPassword]
    );

    const newUser = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        is_admin: newUser.is_admin === true
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    if (config.nodeEnv === 'development') {
      console.log('[auth] Login attempt for:', email, 'user id:', user.id);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (config.nodeEnv === 'development') {
      console.log('[auth] Password valid:', isPasswordValid);
    }
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_admin: user.is_admin === true
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile endpoint
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const result = await pool.query('SELECT id, name, email, is_admin, created_at FROM users WHERE id = $1', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      is_admin: user.is_admin,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// TEMPORARY: Create admin user endpoint (remove after testing)
router.post('/create-admin', async (req, res) => {
  try {
    const adminEmail = 'admin@parkeasy.com';
    const adminPassword = 'admin123';
    const adminName = 'Admin User';

    const results = [];
    
    console.log('🔄 Step 1: Creating users table...');
    // STEP 1: Create the users table with ALL required columns
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
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    results.push('✅ Users table created');

    console.log('🔄 Step 2: Creating parking_spots table...');
    // STEP 2: Create parking_spots table
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
    await pool.query('CREATE INDEX IF NOT EXISTS idx_parking_spots_user_id ON parking_spots(user_id)');
    results.push('✅ Parking spots table created');

    console.log('🔄 Step 3: Creating reviews table...');
    // STEP 3: Create reviews table
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
    await pool.query('CREATE INDEX IF NOT EXISTS idx_reviews_parking_spot_id ON reviews(parking_spot_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id)');
    results.push('✅ Reviews table created');

    console.log('🔄 Step 4: Creating update triggers...');
    // STEP 4: Create update trigger function
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // Create triggers
    await pool.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at 
      BEFORE UPDATE ON users 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_parking_spots_updated_at ON parking_spots;
      CREATE TRIGGER update_parking_spots_updated_at 
      BEFORE UPDATE ON parking_spots 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);
    results.push('✅ Update triggers created');

    console.log('🔄 Step 5: Creating/updating admin user...');
    // STEP 5: Check if admin already exists
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [adminEmail]);
    if (existing.rows.length > 0) {
      await pool.query('UPDATE users SET is_admin = true WHERE email = $1', [adminEmail]);
      results.push('✅ Admin user updated');
    } else {
      // Hash password and create admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const result = await pool.query(
        'INSERT INTO users (name, email, password, is_admin) VALUES ($1, $2, $3, $4) RETURNING id, name, email, is_admin',
        [adminName, adminEmail, hashedPassword, true]
      );
      results.push(`✅ Admin user created: ${result.rows[0].email}`);
    }

    console.log('🔄 Step 6: Verifying tables...');
    // STEP 6: Verify everything was created
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    
    console.log('✅ All steps completed successfully!');
    console.log('Tables created:', tables.rows.map(r => r.table_name));
    console.log('Total users:', userCount.rows[0].count);

    res.json({ 
      message: 'Database fully initialized and admin user ready', 
      email: adminEmail,
      password: adminPassword,
      results: results,
      verification: {
        tablesCreated: tables.rows.map(r => r.table_name),
        totalUsers: parseInt(userCount.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Error in database initialization:', error);
    res.status(500).json({ 
      error: error.message, 
      details: error.stack,
      code: error.code 
    });
  }
});

export default router;
