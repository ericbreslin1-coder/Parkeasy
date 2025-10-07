-- Add is_admin column to users table if it does not exist
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Backfill any existing configured admin emails as admins in DB (optional)
-- NOTE: This uses a placeholder list; replace or generate dynamically if desired.
UPDATE users
SET is_admin = TRUE
WHERE email IN ('admin@parkeasy.com');
