-- ============================================
-- COMPLETE SOLUTION - DAILY STATS + AUTO COUNT
-- ============================================
-- Part 1: Daily row creation (manual/scheduled)
-- Part 2: Auto-update count when article is added
-- ============================================

-- STEP 1: Remove old problematic triggers
DROP TRIGGER IF EXISTS trigger_ensure_daily_stats ON articles;
DROP TRIGGER IF EXISTS trigger_update_daily_stats ON articles;
DROP FUNCTION IF EXISTS ensure_daily_stats();
DROP FUNCTION IF EXISTS update_daily_stats();
DROP FUNCTION IF EXISTS update_daily_stats_on_article_insert();

SELECT '✅ Old triggers removed' as step1;

-- STEP 2: Create function to add daily row (no trigger)
CREATE OR REPLACE FUNCTION create_daily_stats_row()
RETURNS void AS $$
BEGIN
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

SELECT '✅ Daily row function created' as step2;

-- STEP 3: Create function to update count when article is added
CREATE OR REPLACE FUNCTION update_articles_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update count if today's row exists
    UPDATE daily_stats 
    SET articles_created = articles_created + 1
    WHERE date = CURRENT_DATE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

SELECT '✅ Count update function created' as step3;

-- STEP 4: Create trigger to auto-update count
DROP TRIGGER IF EXISTS trigger_update_articles_count ON articles;
CREATE TRIGGER trigger_update_articles_count
    AFTER INSERT ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_articles_count();

SELECT '✅ Count update trigger created' as step4;

-- STEP 5: Create today's row
SELECT create_daily_stats_row();

SELECT '✅ Today''s row created' as step5;

-- STEP 6: Show result
SELECT 
    '✅ SETUP COMPLETE!' as status,
    date,
    articles_created,
    daily_limit,
    under_limit
FROM daily_stats 
WHERE date = CURRENT_DATE;

-- INSTRUCTIONS
SELECT '
==========================================
✅ SETUP COMPLETE!
==========================================

HOW IT WORKS:
1. Daily row: Run "SELECT create_daily_stats_row();" once per day (via n8n)
2. Article count: Updates AUTOMATICALLY when you insert articles via n8n

WHAT HAPPENS:
- Every day at midnight: n8n creates new daily_stats row
- Every time you add article: articles_created increments by 1

TEST IT:
- Add an article via n8n Supabase node
- Check: SELECT * FROM daily_stats WHERE date = CURRENT_DATE;
- articles_created should increment!

' as instructions;
