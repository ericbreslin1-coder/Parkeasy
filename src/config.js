import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const rawCors = process.env.CORS_ORIGIN || 'http://localhost:3001';
const corsOrigins = rawCors.split(',').map(o => o.trim()).filter(Boolean);

export default {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminEmails: process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : ['admin@parkeasy.com'],
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
  corsOrigins,
};
