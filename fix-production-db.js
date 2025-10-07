#!/usr/bin/env node
// Script to manually run migrations on production database
import pkg from 'pg';
const { Pool } = pkg;

// Connect directly to production database
const pool = new Pool({
  connectionString: 'postgresql://parkeasy_user:zb7wRZzFN5ZE9aX5x5K1EWPJ7K7vKyms@dpg-csftm5btq21c7396k86g-a.oregon-postgres.render.com/parkeasy',
  ssl: {
    rejectUnauthorized: false
  }
});

async function fixDatabase() {
  try {
    console.log('🔄 Connecting to production database...');
    
    // Check current schema
    console.log('\n📋 Checking current users table schema...');
    const schemaResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('Current columns:', schemaResult.rows);
    
    // Check if is_admin column exists
    const hasIsAdmin = schemaResult.rows.some(row => row.column_name === 'is_admin');
    
    if (!hasIsAdmin) {
      console.log('\n⚠️  Missing is_admin column. Adding it now...');
      
      // Add is_admin column
      await pool.query('ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE');
      console.log('✅ Added is_admin column');
      
      // Add updated_at column if missing
      const hasUpdatedAt = schemaResult.rows.some(row => row.column_name === 'updated_at');
      if (!hasUpdatedAt) {
        await pool.query('ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        console.log('✅ Added updated_at column');
        
        // Add trigger for updated_at
        await pool.query(`
          CREATE OR REPLACE FUNCTION update_updated_at_column()
          RETURNS TRIGGER AS $$
          BEGIN
              NEW.updated_at = CURRENT_TIMESTAMP;
              RETURN NEW;
          END;
          $$ language 'plpgsql';
        `);
        
        await pool.query(`
          CREATE TRIGGER update_users_updated_at 
          BEFORE UPDATE ON users 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);
        console.log('✅ Added updated_at trigger');
      }
      
      // Set our admin user as admin
      await pool.query(
        "UPDATE users SET is_admin = TRUE WHERE email = 'admin@parkeasy.com'"
      );
      console.log('✅ Set admin@parkeasy.com as admin user');
      
    } else {
      console.log('✅ is_admin column already exists');
    }
    
    // Final verification
    console.log('\n🔍 Final schema verification...');
    const finalSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('Final columns:', finalSchema.rows);
    
    // Test admin user
    const adminUser = await pool.query(
      "SELECT id, email, is_admin FROM users WHERE email = 'admin@parkeasy.com'"
    );
    console.log('\n👤 Admin user:', adminUser.rows[0]);
    
    console.log('\n🎉 Database fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing database:', error);
  } finally {
    await pool.end();
  }
}

fixDatabase();