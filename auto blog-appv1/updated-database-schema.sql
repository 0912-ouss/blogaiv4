-- ============================================
-- Updated Database Schema for Gmag Blog
-- Based on post-single.html structure analysis
-- ============================================

-- Drop existing tables if you want a fresh start (CAUTION!)
-- DROP TABLE IF EXISTS comments CASCADE;
-- DROP TABLE IF EXISTS article_images CASCADE;
-- DROP TABLE IF EXISTS article_tags CASCADE;
-- DROP TABLE IF EXISTS tags CASCADE;
-- DROP TABLE IF EXISTS articles CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;
-- DROP TABLE IF EXISTS authors CASCADE;

-- ============================================
-- 1. AUTHORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS authors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  email VARCHAR(255),
  facebook_url VARCHAR(255),
  twitter_url VARCHAR(255),
  instagram_url VARCHAR(255),
  vk_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. CATEGORIES TABLE (Enhanced)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50), -- Font Awesome icon class (e.g., 'fa-flask')
  color VARCHAR(20), -- Category color for styling
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 3. TAGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 4. ARTICLES TABLE (Comprehensive)
-- ============================================
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  subtitle VARCHAR(255), -- For the h4 subtitle under title
  content TEXT NOT NULL,
  excerpt TEXT,
  
  -- Media
  featured_image TEXT, -- Main featured image (can be URL or base64)
  image_copyright VARCHAR(255), -- "© Image Copyrights Title"
  
  -- Relationships
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  author_id INTEGER REFERENCES authors(id) ON DELETE SET NULL,
  author_name VARCHAR(100) DEFAULT 'Admin', -- Fallback if no author_id
  
  -- Status & Publishing
  status VARCHAR(20) DEFAULT 'published', -- 'draft', 'published', 'archived'
  published_at TIMESTAMP DEFAULT NOW(),
  
  -- Engagement Metrics
  view_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  
  -- SEO & Meta
  meta_description TEXT,
  meta_keywords TEXT,
  
  -- Additional flags
  is_featured BOOLEAN DEFAULT false, -- For hero slider
  is_trending BOOLEAN DEFAULT false, -- For trending section
  ai_generated BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 5. ARTICLE_IMAGES TABLE (For multiple images per article)
-- ============================================
CREATE TABLE IF NOT EXISTS article_images (
  id SERIAL PRIMARY KEY,
  article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 6. ARTICLE_TAGS TABLE (Many-to-Many relationship)
-- ============================================
CREATE TABLE IF NOT EXISTS article_tags (
  article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- ============================================
-- 7. COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
  parent_comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE, -- For nested replies
  author_name VARCHAR(100) NOT NULL,
  author_email VARCHAR(255),
  author_avatar TEXT,
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'spam'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_articles_trending ON articles(is_trending) WHERE is_trending = true;
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_authors_slug ON authors(slug);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_comments_article ON comments(article_id);
CREATE INDEX IF NOT EXISTS idx_article_images_article ON article_images(article_id);

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Insert default author
INSERT INTO authors (name, slug, bio, avatar_url, facebook_url, twitter_url, instagram_url) VALUES
('Mark Rose', 'mark-rose', 'At one extremity the rope was unstranded, and the separate spread yarns were all braided and woven round the socket of the harpoon; the pole was then driven hard up into the socket.', '/images/avatar/1.jpg', '#', '#', '#'),
('Tech Writer', 'tech-writer', 'Passionate about technology and innovation. Writing about the latest trends in AI and tech.', '/images/avatar/1.jpg', '#', '#', '#'),
('Business Expert', 'business-expert', 'Helping businesses grow through strategic insights and proven methodologies.', '/images/avatar/1.jpg', '#', '#', '#')
ON CONFLICT (slug) DO NOTHING;

-- Insert categories with icons
INSERT INTO categories (name, slug, description, icon, color) VALUES
('Technology', 'technology', 'Latest tech news and innovations', 'fa-atom', '#3498db'),
('Business', 'business', 'Business insights and strategies', 'fa-user-chart', '#e74c3c'),
('Lifestyle', 'lifestyle', 'Lifestyle tips and trends', 'fa-coffee', '#9b59b6'),
('Sports', 'sports', 'Sports news and updates', 'fa-tennis-ball', '#27ae60'),
('Science', 'science', 'Scientific discoveries and research', 'fa-flask', '#f39c12'),
('Politics', 'politics', 'Political news and analysis', 'fa-podium', '#e67e22')
ON CONFLICT (slug) DO NOTHING;

-- Insert common tags
INSERT INTO tags (name, slug) VALUES
('Science', 'science'),
('Technology', 'technology'),
('Business', 'business'),
('Lifestyle', 'lifestyle'),
('Innovation', 'innovation'),
('AI', 'ai'),
('Startup', 'startup'),
('Health', 'health')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY IF NOT EXISTS "Allow public read access to published articles" 
ON articles FOR SELECT 
USING (status = 'published');

CREATE POLICY IF NOT EXISTS "Allow public read access to categories" 
ON categories FOR SELECT 
USING (true);

CREATE POLICY IF NOT EXISTS "Allow public read access to authors" 
ON authors FOR SELECT 
USING (true);

CREATE POLICY IF NOT EXISTS "Allow public read access to tags" 
ON tags FOR SELECT 
USING (true);

CREATE POLICY IF NOT EXISTS "Allow public read access to approved comments" 
ON comments FOR SELECT 
USING (status = 'approved');

CREATE POLICY IF NOT EXISTS "Allow public read access to article_images" 
ON article_images FOR SELECT 
USING (true);

CREATE POLICY IF NOT EXISTS "Allow public read access to article_tags" 
ON article_tags FOR SELECT 
USING (true);

-- Service role full access
CREATE POLICY IF NOT EXISTS "Service role full access to articles" 
ON articles FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Service role full access to categories" 
ON categories FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Service role full access to authors" 
ON authors FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Service role full access to tags" 
ON tags FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Service role full access to comments" 
ON comments FOR ALL 
USING (true)
WITH CHECK (true);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT SELECT ON articles TO anon, authenticated;
GRANT SELECT ON categories TO anon, authenticated;
GRANT SELECT ON authors TO anon, authenticated;
GRANT SELECT ON tags TO anon, authenticated;
GRANT SELECT ON comments TO anon, authenticated;
GRANT SELECT ON article_images TO anon, authenticated;
GRANT SELECT ON article_tags TO anon, authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================
-- TRIGGERS for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON authors 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'Database schema updated successfully! 🎉' AS status;

