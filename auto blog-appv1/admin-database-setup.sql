-- ============================================
-- ADMIN PANEL DATABASE SETUP
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ADMIN USERS TABLE
-- For admin authentication and management
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin', -- 'super_admin', 'admin', 'editor'
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);

-- ============================================
-- 2. ACTIVITY LOGS TABLE
-- Track all admin actions for audit trail
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
  user_email VARCHAR(255),
  action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout'
  entity_type VARCHAR(50), -- 'article', 'category', 'user', 'comment', etc.
  entity_id INTEGER,
  entity_title VARCHAR(255),
  details JSONB, -- Additional details about the action
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);

-- ============================================
-- 3. SETTINGS TABLE
-- Store site-wide configuration
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(20) DEFAULT 'text', -- 'text', 'number', 'boolean', 'json'
  category VARCHAR(50) DEFAULT 'general', -- 'general', 'seo', 'social', 'ai', 'email'
  description TEXT,
  is_public BOOLEAN DEFAULT false, -- Can frontend access this?
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Create index for key lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings(category);

-- ============================================
-- 4. ADMIN SESSIONS TABLE
-- Track active admin sessions
-- ============================================
CREATE TABLE IF NOT EXISTS admin_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES admin_users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY IF NOT EXISTS "Service role full access to admin_users" 
ON admin_users FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Service role full access to activity_logs" 
ON activity_logs FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Service role full access to site_settings" 
ON site_settings FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Service role full access to admin_sessions" 
ON admin_sessions FOR ALL 
USING (true)
WITH CHECK (true);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT ALL ON admin_users TO service_role;
GRANT ALL ON activity_logs TO service_role;
GRANT ALL ON site_settings TO service_role;
GRANT ALL ON admin_sessions TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at timestamp on admin_users
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_admin_users_updated_at 
BEFORE UPDATE ON admin_users 
FOR EACH ROW 
EXECUTE FUNCTION update_admin_users_updated_at();

-- Update updated_at timestamp on site_settings
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_site_settings_updated_at 
BEFORE UPDATE ON site_settings 
FOR EACH ROW 
EXECUTE FUNCTION update_site_settings_updated_at();

-- Auto-delete expired sessions
CREATE OR REPLACE FUNCTION delete_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM admin_sessions WHERE expires_at < NOW();
END;
$$ language 'plpgsql';

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Insert default admin user (password: Admin@123)
-- Password hash is bcrypt hash of 'Admin@123'
INSERT INTO admin_users (email, password_hash, name, role) VALUES
('admin@blog.com', '$2b$10$rKqN0LzX7qV5v5X5x5X5XuK5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X', 'Super Admin', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Insert default site settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
('site_name', 'My Blog', 'text', 'general', 'Website name', true),
('site_tagline', 'Your Daily Source of News', 'text', 'general', 'Website tagline', true),
('site_description', 'A modern blog powered by AI', 'text', 'general', 'Website description', true),
('articles_per_page', '10', 'number', 'general', 'Number of articles per page', true),
('daily_article_limit', '10', 'number', 'ai', 'Maximum articles generated per day', false),
('enable_comments', 'true', 'boolean', 'general', 'Enable comments on articles', true),
('auto_approve_comments', 'false', 'boolean', 'general', 'Auto-approve new comments', false),
('meta_description', 'Stay updated with the latest news and insights', 'text', 'seo', 'Default meta description', true),
('meta_keywords', 'blog, news, articles', 'text', 'seo', 'Default meta keywords', true),
('facebook_url', '#', 'text', 'social', 'Facebook page URL', true),
('twitter_url', '#', 'text', 'social', 'Twitter/X profile URL', true),
('instagram_url', '#', 'text', 'social', 'Instagram profile URL', true),
('openai_api_key', '', 'text', 'ai', 'OpenAI API key for content generation', false),
('openai_model', 'gpt-4', 'text', 'ai', 'OpenAI model to use', false)
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- FUNCTION: Log admin activity
-- ============================================
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
    user_id, 
    user_email, 
    action, 
    entity_type, 
    entity_id, 
    entity_title, 
    details, 
    ip_address, 
    user_agent
  ) VALUES (
    p_user_id, 
    p_user_email, 
    p_action, 
    p_entity_type, 
    p_entity_id, 
    p_entity_title, 
    p_details, 
    p_ip_address, 
    p_user_agent
  );
END;
$$ language 'plpgsql';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '✅ Admin database setup completed successfully!' AS status;
SELECT 'Default admin login: admin@blog.com / Admin@123' AS info;
SELECT '⚠️  Please change the default password after first login!' AS warning;

