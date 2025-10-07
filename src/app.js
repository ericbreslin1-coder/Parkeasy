import config from './config.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import parkingRoutes from './routes/parking.js';
import reviewsRoutes from './routes/reviews.js';
import adminRoutes from './routes/admin.js';
import healthRoutes from './routes/health.js';

export function createApp() {
  const app = express();

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  }));

  const limiter = rateLimit({ windowMs: 15*60*1000, max: 100 });
  const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 5 });
  app.use(limiter);

  // Multi-origin CORS support
  app.use(cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // allow non-browser or same-origin
      if (config.corsOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('CORS blocked for origin: ' + origin));
    },
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.get('/', (req,res)=> res.send('ParkEasy Backend is running!'));

  // Routes already imported top-level
  app.use('/api/health', healthRoutes); // unauthenticated health check
  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/parking', parkingRoutes);
  app.use('/api/reviews', reviewsRoutes);
  app.use('/api/admin', adminRoutes);

  return app;
}
