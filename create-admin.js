import bcrypt from 'bcrypt';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'parkeasy',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      'INSERT INTO users (name, email, password, is_admin) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET password = $3, is_admin = $4', 
      ['Admin User', 'admin@parkeasy.com', hashedPassword, true]
    );
    console.log('Admin user created successfully!');
    console.log('Email: admin@parkeasy.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createAdmin();