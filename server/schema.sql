-- METANARU WEBCHEKI DATABASE SCHEMA (REVISED)
-- Members are hardcoded in the frontend constants.js

-- 1. Pricing & Settings Table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial Pricing Data
INSERT INTO settings (key, value)
VALUES ('pricing', '{"solo": 25000, "group": 30000}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. Events Table
CREATE TABLE IF NOT EXISTS events (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  type TEXT,
  date TEXT,
  time TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Otsu Posts Table
CREATE TABLE IF NOT EXISTS posts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  category TEXT,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Orders (Cheki) Table
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  order_number TEXT UNIQUE,
  fan_name TEXT NOT NULL,
  member_name TEXT NOT NULL, -- Storing name directly since member data is hardcoded
  cheki_type TEXT, -- 'solo', 'group'
  quantity INTEGER DEFAULT 1,
  total_price BIGINT,
  status TEXT DEFAULT 'pending',
  whatsapp_number TEXT,
  event_name TEXT, -- Storing event name at the time of order
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'MNR-' || upper(substring(md5(random()::text) from 1 for 6));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_order_number
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION generate_order_number();

-- 5. Admin Auth Table
CREATE TABLE IF NOT EXISTS admins (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Verification Function (RPC)
CREATE OR REPLACE FUNCTION verify_admin(p_username TEXT, p_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  is_valid BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM admins 
    WHERE username = p_username AND password = p_password
  ) INTO is_valid;
  RETURN is_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Default Admin Account
INSERT INTO admins (username, password)
VALUES ('StaffMNR', 'MNRbanger')
ON CONFLICT (username) DO NOTHING;

