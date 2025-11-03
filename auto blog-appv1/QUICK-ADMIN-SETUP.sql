-- ============================================
-- QUICK ADMIN SETUP - Run this in Supabase SQL Editor
-- ============================================

-- 1. Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
  user_email VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  entity_title VARCHAR(255),
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(20) DEFAULT 'text',
  category VARCHAR(50) DEFAULT 'general',
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL
);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);

-- 5. Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 6. Create policies
CREATE POLICY IF NOT EXISTS "Service role full access to admin_users" 
ON admin_users FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Service role full access to activity_logs" 
ON activity_logs FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Service role full access to site_settings" 
ON site_settings FOR ALL USING (true) WITH CHECK (true);

-- 7. Grant permissions
GRANT ALL ON admin_users TO service_role;
GRANT ALL ON activity_logs TO service_role;
GRANT ALL ON site_settings TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 8. Create log activity function
CREATE OR REPLACE FUNCTION log_admin_activity(
  p_user_id INTEGER,
  p_user_email VARCHAR,
  p_action VARCHAR,
  p_entity_type VARCHAR,
  p_entity_id INTEGER,
  p_entity_title VARCHAR,
  p_details JSONB,
  p_ip_address VARCHAR,
  p_user_agent TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO activity_logs (
    user_id, user_email, action, entity_type, entity_id, 
    entity_title, details, ip_address, user_agent
  ) VALUES (
    p_user_id, p_user_email, p_action, p_entity_type, p_entity_id, 
    p_entity_title, p_details, p_ip_address, p_user_agent
  );
END;
$$ language 'plpgsql';

-- ============================================
SELECT '✅ Admin database setup completed!' AS status;
-- ============================================

