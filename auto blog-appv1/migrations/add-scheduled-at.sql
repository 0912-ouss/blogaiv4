-- ============================================
-- ADD SCHEDULED_AT FIELD TO ARTICLES TABLE
-- Run this in Supabase SQL Editor
-- ============================================

-- Add scheduled_at column if it doesn't exist
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP;

-- Create index for scheduled articles queries
CREATE INDEX IF NOT EXISTS idx_articles_scheduled_at 
ON articles(scheduled_at) 
WHERE scheduled_at IS NOT NULL;

-- Add comment
COMMENT ON COLUMN articles.scheduled_at IS 'Scheduled publication date and time. Article will be auto-published when this time is reached.';

