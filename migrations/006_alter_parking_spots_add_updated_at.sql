-- Add updated_at to parking_spots and trigger
ALTER TABLE parking_spots
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Reuse set_updated_at() function from previous migration (assumed present)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_parking_spots_set_updated_at') THEN
    EXECUTE 'DROP TRIGGER trg_parking_spots_set_updated_at ON parking_spots';
  END IF;
  EXECUTE 'CREATE TRIGGER trg_parking_spots_set_updated_at BEFORE UPDATE ON parking_spots FOR EACH ROW EXECUTE FUNCTION set_updated_at()';
END$$;
