-- Create parking_spots table
CREATE TABLE IF NOT EXISTS parking_spots (
  id SERIAL PRIMARY KEY,
  location VARCHAR(500) NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_parking_spots_user_id ON parking_spots(user_id);
