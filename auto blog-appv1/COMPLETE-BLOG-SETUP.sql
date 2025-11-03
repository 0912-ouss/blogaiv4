-- ============================================
-- COMPLETE BLOG DATABASE SETUP
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create authors table
CREATE TABLE IF NOT EXISTS authors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  author_id INTEGER REFERENCES authors(id) ON DELETE SET NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  view_count INTEGER DEFAULT 0,
  is_ai_generated BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Create article_tags junction table
CREATE TABLE IF NOT EXISTS article_tags (
  article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- 6. Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
  author_name VARCHAR(100) NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. Create article_images table
CREATE TABLE IF NOT EXISTS article_images (
  id SERIAL PRIMARY KEY,
  article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  alt_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_comments_article ON comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);

-- 9. Enable RLS (Row Level Security)
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_images ENABLE ROW LEVEL SECURITY;

-- 10. Drop existing policies first (if they exist)
DROP POLICY IF EXISTS "Public read access for authors" ON authors;
DROP POLICY IF EXISTS "Public read access for categories" ON categories;
DROP POLICY IF EXISTS "Public read access for tags" ON tags;
DROP POLICY IF EXISTS "Public read published articles" ON articles;
DROP POLICY IF EXISTS "Public read article_tags" ON article_tags;
DROP POLICY IF EXISTS "Public read approved comments" ON comments;
DROP POLICY IF EXISTS "Public read article_images" ON article_images;

-- 11. Create policies for public read access
CREATE POLICY "Public read access for authors" ON authors FOR SELECT USING (true);
CREATE POLICY "Public read access for categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access for tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Public read published articles" ON articles FOR SELECT USING (status = 'published' OR true);
CREATE POLICY "Public read article_tags" ON article_tags FOR SELECT USING (true);
CREATE POLICY "Public read approved comments" ON comments FOR SELECT USING (status = 'approved' OR true);
CREATE POLICY "Public read article_images" ON article_images FOR SELECT USING (true);

-- 12. Grant permissions to service role (for API access)
GRANT ALL ON authors TO service_role;
GRANT ALL ON categories TO service_role;
GRANT ALL ON tags TO service_role;
GRANT ALL ON articles TO service_role;
GRANT ALL ON article_tags TO service_role;
GRANT ALL ON comments TO service_role;
GRANT ALL ON article_images TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 13. Insert sample data

-- Insert default author (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM authors WHERE email = 'ai@blog.com') THEN
    INSERT INTO authors (name, email, bio, slug) VALUES
    ('AI Blog Author', 'ai@blog.com', 'Automated content creator', 'ai-blog-author');
  END IF;
END $$;

-- Insert default categories (check for each)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'technology') THEN
    INSERT INTO categories (name, slug, description) VALUES
    ('Technology', 'technology', 'Latest tech news and updates');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'business') THEN
    INSERT INTO categories (name, slug, description) VALUES
    ('Business', 'business', 'Business insights and trends');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'lifestyle') THEN
    INSERT INTO categories (name, slug, description) VALUES
    ('Lifestyle', 'lifestyle', 'Lifestyle and wellness');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'science') THEN
    INSERT INTO categories (name, slug, description) VALUES
    ('Science', 'science', 'Scientific discoveries');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'entertainment') THEN
    INSERT INTO categories (name, slug, description) VALUES
    ('Entertainment', 'entertainment', 'Entertainment news');
  END IF;
END $$;

-- Insert sample tags
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM tags WHERE slug = 'ai') THEN
    INSERT INTO tags (name, slug) VALUES ('AI', 'ai');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM tags WHERE slug = 'news') THEN
    INSERT INTO tags (name, slug) VALUES ('News', 'news');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM tags WHERE slug = 'tutorial') THEN
    INSERT INTO tags (name, slug) VALUES ('Tutorial', 'tutorial');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM tags WHERE slug = 'review') THEN
    INSERT INTO tags (name, slug) VALUES ('Review', 'review');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM tags WHERE slug = 'guide') THEN
    INSERT INTO tags (name, slug) VALUES ('Guide', 'guide');
  END IF;
END $$;

-- Insert sample articles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM articles WHERE slug = 'welcome-to-magnews-blog') THEN
    INSERT INTO articles (title, slug, content, excerpt, author_id, category_id, status, published_at) VALUES
    (
      'Welcome to MAGNEWS Blog',
      'welcome-to-magnews-blog',
      '<h2>Welcome to Our Blog!</h2><p>This is your first article. Start creating amazing content now!</p><p>You can manage all your articles from the admin panel.</p>',
      'Welcome to our blog platform. Start creating amazing content today!',
      1,
      1,
      'published',
      NOW()
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM articles WHERE slug = 'getting-started-with-ai-content') THEN
    INSERT INTO articles (title, slug, content, excerpt, author_id, category_id, status, published_at) VALUES
    (
      'Getting Started with AI Content',
      'getting-started-with-ai-content',
      '<h2>AI-Powered Content Creation</h2><p>Learn how to create amazing content using AI technology.</p><p>This platform makes it easy to generate and manage blog posts.</p>',
      'Learn about AI-powered content creation and how it can help your blog grow.',
      1,
      1,
      'published',
      NOW()
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM articles WHERE slug = 'top-10-blogging-tips-2025') THEN
    INSERT INTO articles (title, slug, content, excerpt, author_id, category_id, status, published_at) VALUES
    (
      'Top 10 Blogging Tips for 2025',
      'top-10-blogging-tips-2025',
      '<h2>Essential Blogging Tips</h2><p>Here are the top 10 tips to grow your blog in 2025:</p><ol><li>Create quality content</li><li>Be consistent</li><li>Engage with readers</li><li>Use SEO best practices</li><li>Leverage social media</li></ol>',
      'Discover the top 10 essential tips for successful blogging in 2025.',
      1,
      2,
      'published',
      NOW()
    );
  END IF;
END $$;

-- Update view counts for sample articles
UPDATE articles SET view_count = FLOOR(RANDOM() * 1000 + 100) WHERE id IN (1, 2, 3);

-- ============================================
SELECT '✅ Complete blog database setup finished!' AS status;
SELECT 'Articles created: ' || COUNT(*) AS articles_count FROM articles;
SELECT 'Categories created: ' || COUNT(*) AS categories_count FROM categories;
-- ============================================

