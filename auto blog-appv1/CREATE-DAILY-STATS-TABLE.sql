-- ============================================
-- OPTION 2: Create Daily Stats Table
-- For tracking daily article limits and history
-- ============================================

-- Create daily_stats table
CREATE TABLE IF NOT EXISTS daily_stats (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
  articles_created INTEGER DEFAULT 0,
  daily_limit INTEGER DEFAULT 10,
  under_limit BOOLEAN GENERATED ALWAYS AS (articles_created < daily_limit) STORED,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);

-- Enable RLS
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow public read access to daily_stats" 
ON daily_stats FOR SELECT 
USING (true);

-- Grant permissions
GRANT SELECT ON daily_stats TO anon, authenticated;
GRANT ALL ON daily_stats TO service_role;

-- Function to update daily stats
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update today's stats
  INSERT INTO daily_stats (date, articles_created)
  VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date) 
  DO UPDATE SET 
    articles_created = daily_stats.articles_created + 1,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update stats when article is created
DROP TRIGGER IF EXISTS trigger_update_daily_stats ON articles;
CREATE TRIGGER trigger_update_daily_stats
AFTER INSERT ON articles
FOR EACH ROW
EXECUTE FUNCTION update_daily_stats();

-- Initialize today's record
INSERT INTO daily_stats (date, articles_created, daily_limit)
VALUES (CURRENT_DATE, 0, 10)
ON CONFLICT (date) DO NOTHING;

-- ============================================
-- USAGE IN N8N
-- ============================================

-- Query to check today's stats:
-- SELECT * FROM daily_stats WHERE date = CURRENT_DATE;

-- Result will be like:
-- {
--   "id": 1,
--   "date": "2025-10-06",
--   "articles_created": 5,
--   "daily_limit": 10,
--   "under_limit": true
-- }

-- ============================================
-- Update daily limit (if you want to change it)
-- ============================================

-- UPDATE daily_stats SET daily_limit = 20 WHERE date = CURRENT_DATE;

SELECT '✅ Daily stats table created successfully!' AS status;

