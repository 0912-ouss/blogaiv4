-- ============================================
-- CREATE ARTICLE LIKES TABLE
-- Run this in Supabase SQL Editor
-- ============================================

-- Create article_likes table
CREATE TABLE IF NOT EXISTS article_likes (
  id SERIAL PRIMARY KEY,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_ip VARCHAR(45), -- Store IP for anonymous likes (optional)
  user_id INTEGER REFERENCES admin_users(id) ON DELETE SET NULL, -- For logged-in users (optional)
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(article_id, user_ip), -- Prevent duplicate likes from same IP
  UNIQUE(article_id, user_id) -- Prevent duplicate likes from same user
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_article_likes_article ON article_likes(article_id);
CREATE INDEX IF NOT EXISTS idx_article_likes_user ON article_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_article_likes_ip ON article_likes(user_ip);
CREATE INDEX IF NOT EXISTS idx_article_likes_created ON article_likes(created_at DESC);

-- Add comment
COMMENT ON TABLE article_likes IS 'Stores article likes/reactions. Supports both logged-in users and anonymous users (by IP).';

