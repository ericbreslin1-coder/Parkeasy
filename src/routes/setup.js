const express = require('express');
const db = require('../db/database');
const router = express.Router();

// Direct SQL execution endpoint for manual database setup
router.post('/execute-sql', async (req, res) => {
    try {
        console.log('Starting manual database setup...');
        
        // Create users table
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                is_admin BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        
        console.log('Creating users table...');
        await db.query(createUsersTable);
        console.log('Users table created successfully');
        
        // Create parking_spots table
        const createParkingSpotsTable = `
            CREATE TABLE IF NOT EXISTS parking_spots (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                address VARCHAR(500) NOT NULL,
                price_per_hour DECIMAL(10,2) NOT NULL,
                owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                latitude DECIMAL(10,8),
                longitude DECIMAL(11,8),
                is_available BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        
        console.log('Creating parking_spots table...');
        await db.query(createParkingSpotsTable);
        console.log('Parking spots table created successfully');
        
        // Create reviews table
        const createReviewsTable = `
            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                parking_spot_id INTEGER REFERENCES parking_spots(id) ON DELETE CASCADE,
                rating INTEGER CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        
        console.log('Creating reviews table...');
        await db.query(createReviewsTable);
        console.log('Reviews table created successfully');
        
        // Create indexes
        console.log('Creating indexes...');
        await db.query('CREATE INDEX IF NOT EXISTS idx_parking_spots_owner ON parking_spots(owner_id);');
        await db.query('CREATE INDEX IF NOT EXISTS idx_parking_spots_location ON parking_spots(latitude, longitude);');
        await db.query('CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);');
        await db.query('CREATE INDEX IF NOT EXISTS idx_reviews_spot ON reviews(parking_spot_id);');
        console.log('Indexes created successfully');
        
        // Create triggers for updated_at
        console.log('Creating triggers...');
        const createTriggerFunction = `
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `;
        
        await db.query(createTriggerFunction);
        
        await db.query(`
            DROP TRIGGER IF EXISTS update_users_updated_at ON users;
            CREATE TRIGGER update_users_updated_at 
                BEFORE UPDATE ON users 
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);
        
        await db.query(`
            DROP TRIGGER IF EXISTS update_parking_spots_updated_at ON parking_spots;
            CREATE TRIGGER update_parking_spots_updated_at 
                BEFORE UPDATE ON parking_spots 
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);
        
        await db.query(`
            DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
            CREATE TRIGGER update_reviews_updated_at 
                BEFORE UPDATE ON reviews 
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);
        
        console.log('Triggers created successfully');
        
        // Create admin user
        console.log('Creating admin user...');
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        const insertAdmin = `
            INSERT INTO users (email, password, name, phone, is_admin)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (email) 
            DO UPDATE SET 
                password = EXCLUDED.password,
                is_admin = EXCLUDED.is_admin,
                updated_at = CURRENT_TIMESTAMP
            RETURNING id, email, name, is_admin;
        `;
        
        const adminResult = await db.query(insertAdmin, [
            'admin@parkeasy.com',
            hashedPassword,
            'Admin User',
            '555-0000',
            true
        ]);
        
        console.log('Admin user created/updated:', adminResult.rows[0]);
        
        // Verify everything was created
        const tablesCheck = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        
        const userCount = await db.query('SELECT COUNT(*) FROM users;');
        const adminCheck = await db.query('SELECT id, email, name, is_admin FROM users WHERE is_admin = true;');
        
        res.json({
            success: true,
            message: 'Database setup completed successfully',
            tables: tablesCheck.rows.map(row => row.table_name),
            userCount: userCount.rows[0].count,
            adminUsers: adminCheck.rows,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Database setup error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;