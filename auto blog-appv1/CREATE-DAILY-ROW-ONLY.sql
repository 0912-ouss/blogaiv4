-- ============================================
-- CREATE DAILY STATS ROW - AUTOMATIC EVERY DAY
-- ============================================
-- This creates a new row in daily_stats every day
-- NO connection to articles table
-- ============================================

-- 1. Create function to add today's row
CREATE OR REPLACE FUNCTION create_daily_stats_row()
RETURNS void AS $$
BEGIN
    -- Insert today's row if it doesn't exist
    INSERT INTO daily_stats (date, articles_created, daily_limit)
    SELECT 
        CURRENT_DATE,
        0,
        10 -- Change this to your daily limit
    WHERE NOT EXISTS (
        SELECT 1 FROM daily_stats WHERE date = CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql;

-- 2. Create a function that runs daily (via pg_cron if available)
-- Or you can call this manually/from n8n once per day
CREATE OR REPLACE FUNCTION init_daily_stats()
RETURNS void AS $$
BEGIN
    PERFORM create_daily_stats_row();
END;
$$ LANGUAGE plpgsql;

-- 3. Manually create today's row now
SELECT create_daily_stats_row();

-- 4. Show result
SELECT 
    '✅ Daily stats row created!' as status,
    date,
    articles_created,
    daily_limit
FROM daily_stats 
WHERE date = CURRENT_DATE;

-- 5. Instructions
SELECT '📋 To create tomorrow''s row, run: SELECT create_daily_stats_row();' as instructions;
SELECT '📋 Or create an n8n workflow to run this once per day' as instructions2;
