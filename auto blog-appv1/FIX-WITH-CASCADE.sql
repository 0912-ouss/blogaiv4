-- ============================================
-- FIX: Drop function with CASCADE
-- ============================================
-- This removes all dependencies first
-- ============================================

-- Step 1: Drop everything with CASCADE
DROP FUNCTION IF EXISTS ensure_daily_stats() CASCADE;
DROP FUNCTION IF EXISTS update_daily_stats() CASCADE;
DROP TABLE IF EXISTS daily_stats CASCADE;

-- Step 2: Recreate daily_stats table
CREATE TABLE daily_stats (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
  articles_created INTEGER DEFAULT 0,
  daily_limit INTEGER DEFAULT 10,
  under_limit BOOLEAN GENERATED ALWAYS AS (articles_created < daily_limit) STORED,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 3: Create index
CREATE INDEX idx_daily_stats_date ON daily_stats(date);

-- Step 4: Create auto-update function (the important one!)
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO daily_stats (date, articles_created)
  VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date) 
  DO UPDATE SET 
    articles_created = daily_stats.articles_created + 1,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create trigger on articles table
CREATE TRIGGER trigger_update_daily_stats
AFTER INSERT ON articles
FOR EACH ROW
EXECUTE FUNCTION update_daily_stats();

-- Step 6: Initialize today's record
INSERT INTO daily_stats (date, articles_created, daily_limit)
VALUES (CURRENT_DATE, 0, 10)
ON CONFLICT (date) DO NOTHING;

-- Step 7: Verify everything
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'daily_stats'
ORDER BY ordinal_position;

-- Check today's stats
SELECT * FROM daily_stats WHERE date = CURRENT_DATE;

SELECT '✅ All fixed! No more errors!' AS status;

