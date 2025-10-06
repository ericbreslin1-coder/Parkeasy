-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parking_spot_id INTEGER NOT NULL REFERENCES parking_spots(id) ON DELETE CASCADE,
  reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  cancelled_at TIMESTAMP,
  CONSTRAINT unique_active_reservation UNIQUE (parking_spot_id, status)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_parking_spot_id ON reservations(parking_spot_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

-- Create partial unique index to prevent multiple active reservations for the same spot
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_reservation 
  ON reservations(parking_spot_id) 
  WHERE status = 'active';
