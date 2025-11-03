-- ============================================
-- AUTO-UPDATE DAILY STATS WHEN ARTICLE ADDED
-- ============================================
-- This trigger will automatically increment the counter
-- whenever a new article is inserted into the articles table
-- ============================================

-- Step 1: Make sure daily_stats table exists with correct structure
CREATE TABLE IF NOT EXISTS daily_stats (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
  articles_created INTEGER DEFAULT 0,
  daily_limit INTEGER DEFAULT 10,
  under_limit BOOLEAN GENERATED ALWAYS AS (articles_created < daily_limit) STORED,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 2: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);

-- Step 3: Create the auto-update function
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update today's stats
  INSERT INTO daily_stats (date, articles_created, daily_limit)
  VALUES (CURRENT_DATE, 1, 10)
  ON CONFLICT (date) 
  DO UPDATE SET 
    articles_created = daily_stats.articles_created + 1,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_daily_stats ON articles;

-- Step 5: Create trigger that fires after INSERT
CREATE TRIGGER trigger_update_daily_stats
AFTER INSERT ON articles
FOR EACH ROW
EXECUTE FUNCTION update_daily_stats();

-- Step 6: Initialize today's record (if it doesn't exist)
INSERT INTO daily_stats (date, articles_created, daily_limit)
VALUES (CURRENT_DATE, 0, 10)
ON CONFLICT (date) DO NOTHING;

-- ============================================
-- TEST THE SETUP
-- ============================================

-- View current stats
SELECT 
  date,
  articles_created,
  daily_limit,
  under_limit,
  CASE 
    WHEN under_limit THEN '✅ Can create more articles'
    ELSE '⛔ Daily limit reached'
  END as status
FROM daily_stats 
WHERE date = CURRENT_DATE;

-- ============================================
-- HOW IT WORKS
-- ============================================
-- 1. When n8n creates an article via POST /api/articles
-- 2. Article is inserted into the articles table
-- 3. Trigger automatically fires
-- 4. daily_stats.articles_created is incremented by 1
-- 5. under_limit is automatically recalculated
-- 
-- NO MANUAL UPDATE NEEDED! 🎉
-- ============================================

SELECT '✅ Auto-update trigger configured!' AS status;
SELECT 'Every time an article is created, daily_stats will update automatically!' AS info;

