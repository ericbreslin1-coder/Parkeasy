import config from './config.js';
import express from 'express';

const app = express();
const PORT = config.port;

// Middleware
app.use(express.json());

// Test endpoint
app.get('/', (req, res) => {
  res.send('ParkEasy Backend is running!');
});

// Auth routes
import authRoutes from './routes/auth.js';
app.use('/api/auth', authRoutes);

// Parking routes
import parkingRoutes from './routes/parking.js';
app.use('/api/parking', parkingRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
