-- Add updated_at to users and trigger
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create generic function set_updated_at() if it does not already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at'
  ) THEN
    EXECUTE $$CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;$$;
  END IF;
END$$;

-- Create trigger (idempotent style: drop first if exists then recreate)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_set_updated_at') THEN
    EXECUTE 'DROP TRIGGER trg_users_set_updated_at ON users';
  END IF;
  EXECUTE 'CREATE TRIGGER trg_users_set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at()';
END$$;
