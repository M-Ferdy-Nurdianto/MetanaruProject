-- METANARU WEBCHEKI DATABASE SCHEMA (REVISED)
-- Members are hardcoded in the frontend constants.js

-- 1. Pricing & Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id BIGINT PRIMARY KEY DEFAULT 1,
  prices JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial Pricing Data (Match code expectation)
INSERT INTO settings (id, prices)
VALUES (1, '{"regular_cheki_solo": 25000, "regular_cheki_group": 30000}')
ON CONFLICT (id) DO UPDATE SET prices = EXCLUDED.prices;

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
  nickname TEXT NOT NULL,
  contact TEXT,
  event_id BIGINT REFERENCES events(id),
  member_id TEXT NOT NULL, 
  cheki_type TEXT, 
  qty INTEGER DEFAULT 1,
  total_price BIGINT,
  status TEXT DEFAULT 'pending',
  mode TEXT DEFAULT 'ots',
  payment_method TEXT DEFAULT 'cash',
  payment_proof_url TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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
