-- ============================================
-- FIX: daily_stats function error
-- ============================================
-- Error: column "articles_limit" does not exist
-- The function is using wrong column name
-- ============================================

-- Step 1: Drop the broken function
DROP FUNCTION IF EXISTS ensure_daily_stats();

-- Step 2: Drop and recreate the daily_stats table with correct columns
DROP TABLE IF EXISTS daily_stats CASCADE;

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

-- Step 4: Create the correct function
CREATE OR REPLACE FUNCTION ensure_daily_stats()
RETURNS void AS $$
BEGIN
  INSERT INTO daily_stats (date, articles_created, daily_limit)
  VALUES (CURRENT_DATE, 0, 10)
  ON CONFLICT (date) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create update function for auto-increment
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

-- Step 6: Create trigger on articles table
DROP TRIGGER IF EXISTS trigger_update_daily_stats ON articles;
CREATE TRIGGER trigger_update_daily_stats
AFTER INSERT ON articles
FOR EACH ROW
EXECUTE FUNCTION update_daily_stats();

-- Step 7: Initialize today's record
INSERT INTO daily_stats (date, articles_created, daily_limit)
VALUES (CURRENT_DATE, 0, 10)
ON CONFLICT (date) DO NOTHING;

-- Step 8: Verify
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'daily_stats'
ORDER BY ordinal_position;

-- Should show:
-- id, date, articles_created, daily_limit, under_limit, created_at, updated_at

SELECT '✅ daily_stats table and functions fixed!' AS status;

