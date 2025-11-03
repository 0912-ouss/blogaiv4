-- ============================================
-- QUICK FIX: Add Missing Columns to Existing Database
-- Run this in Supabase SQL Editor
-- This will NOT delete your existing data
-- ============================================

-- Fix 1: Change featured_image from VARCHAR(500) to TEXT (for base64 images)
ALTER TABLE articles ALTER COLUMN featured_image TYPE TEXT;

-- Fix 2: Add missing columns to articles table (if they don't exist)
ALTER TABLE articles ADD COLUMN IF NOT EXISTS subtitle VARCHAR(255);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_copyright VARCHAR(255);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_id INTEGER;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS meta_keywords TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT false;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT true;

-- Fix 3: Update existing author column to author_name
ALTER TABLE articles RENAME COLUMN author TO author_name;

-- Fix 4: Add new indexes
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_articles_trending ON articles(is_trending) WHERE is_trending = true;
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id);

-- Fix 5: Update categories to add icon and color
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon VARCHAR(50);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS color VARCHAR(20);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Fix 6: Update categories with icons
UPDATE categories SET 
  icon = 'fa-atom', 
  color = '#3498db' 
WHERE slug = 'technology';

UPDATE categories SET 
  icon = 'fa-user-chart', 
  color = '#e74c3c' 
WHERE slug = 'business';

UPDATE categories SET 
  icon = 'fa-coffee', 
  color = '#9b59b6' 
WHERE slug = 'lifestyle';

UPDATE categories SET 
  icon = 'fa-tennis-ball', 
  color = '#27ae60' 
WHERE slug = 'sports';

UPDATE categories SET 
  icon = 'fa-flask', 
  color = '#f39c12' 
WHERE slug = 'health';

UPDATE categories SET 
  icon = 'fa-plane', 
  color = '#16a085' 
WHERE slug = 'travel';

-- Fix 7: Create AUTHORS table (if not exists)
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

-- Fix 8: Create TAGS table (if not exists)
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Fix 9: Create ARTICLE_TAGS junction table (if not exists)
CREATE TABLE IF NOT EXISTS article_tags (
  article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Fix 10: Insert default author
INSERT INTO authors (name, slug, bio, avatar_url, facebook_url, twitter_url, instagram_url, vk_url) VALUES
('AI Content Generator', 'ai-content-generator', 'Expert in creating engaging content using advanced AI technology. Passionate about delivering value through well-researched articles.', '/images/avatar/1.jpg', '#', '#', '#', '#')
ON CONFLICT (slug) DO NOTHING;

-- Fix 11: Insert common tags
INSERT INTO tags (name, slug) VALUES
('Technology', 'technology'),
('Business', 'business'),
('Lifestyle', 'lifestyle'),
('Science', 'science'),
('Innovation', 'innovation'),
('AI', 'ai'),
('Health', 'health'),
('Sports', 'sports')
ON CONFLICT (slug) DO NOTHING;

-- Fix 12: Enable RLS on new tables
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;

-- Fix 13: Create policies for new tables
DROP POLICY IF EXISTS "Allow public read access to authors" ON authors;
CREATE POLICY "Allow public read access to authors" 
ON authors FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow public read access to tags" ON tags;
CREATE POLICY "Allow public read access to tags" 
ON tags FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow public read access to article_tags" ON article_tags;
CREATE POLICY "Allow public read access to article_tags" 
ON article_tags FOR SELECT 
USING (true);

-- Fix 14: Grant permissions
GRANT SELECT ON authors TO anon, authenticated;
GRANT SELECT ON tags TO anon, authenticated;
GRANT SELECT ON article_tags TO anon, authenticated;
GRANT ALL ON authors TO service_role;
GRANT ALL ON tags TO service_role;
GRANT ALL ON article_tags TO service_role;
GRANT ALL ON SEQUENCE authors_id_seq TO service_role;
GRANT ALL ON SEQUENCE tags_id_seq TO service_role;

-- Fix 15: Update existing articles to mark as AI generated
UPDATE articles SET ai_generated = true WHERE ai_generated IS NULL;

-- Fix 16: Set default author_id for existing articles
UPDATE articles 
SET author_id = (SELECT id FROM authors WHERE slug = 'ai-content-generator' LIMIT 1)
WHERE author_id IS NULL;

-- ============================================
-- Verify the changes
-- ============================================
SELECT 
  'Articles columns: ' || array_to_string(ARRAY(
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'articles' 
    ORDER BY ordinal_position
  ), ', ') AS verification;

SELECT 'Database migration completed successfully! ✅' AS status;

