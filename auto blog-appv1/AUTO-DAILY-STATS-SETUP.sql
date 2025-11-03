-- ============================================
-- AUTO DAILY STATS SETUP
-- ============================================
-- This creates a function and trigger to automatically
-- add a new row to daily_stats table every day
-- ============================================

-- 1. Create function to check and insert daily stats
CREATE OR REPLACE FUNCTION ensure_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if today's row exists
    IF NOT EXISTS (
        SELECT 1 FROM daily_stats 
        WHERE date = CURRENT_DATE
    ) THEN
        -- Insert today's row
        INSERT INTO daily_stats (date, articles_created, daily_limit, under_limit)
        VALUES (
            CURRENT_DATE,
            0,  -- Start with 0 articles created today
            10, -- Set your daily limit here (change 10 to your desired limit)
            true -- Under limit initially
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create trigger on articles table
-- This will run every time a new article is inserted
DROP TRIGGER IF EXISTS trigger_ensure_daily_stats ON articles;
CREATE TRIGGER trigger_ensure_daily_stats
    BEFORE INSERT ON articles
    FOR EACH ROW
    EXECUTE FUNCTION ensure_daily_stats();

-- 3. Create function to update daily stats when article is created
CREATE OR REPLACE FUNCTION update_daily_stats_on_article_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure today's row exists
    PERFORM ensure_daily_stats();
    
    -- Update today's stats
    UPDATE daily_stats 
    SET 
        articles_created = articles_created + 1,
        under_limit = (articles_created + 1) < daily_limit
    WHERE date = CURRENT_DATE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger to update stats when article is inserted
DROP TRIGGER IF EXISTS trigger_update_daily_stats ON articles;
CREATE TRIGGER trigger_update_daily_stats
    AFTER INSERT ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_stats_on_article_insert();

-- 5. Create function to manually create today's row (if needed)
CREATE OR REPLACE FUNCTION create_today_stats()
RETURNS void AS $$
BEGIN
    -- Insert today's row if it doesn't exist
    INSERT INTO daily_stats (date, articles_created, daily_limit, under_limit)
    SELECT 
        CURRENT_DATE,
        0,
        10, -- Change this to your desired daily limit
        true
    WHERE NOT EXISTS (
        SELECT 1 FROM daily_stats WHERE date = CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to create stats for a specific date
CREATE OR REPLACE FUNCTION create_stats_for_date(target_date date)
RETURNS void AS $$
BEGIN
    -- Insert row for specific date if it doesn't exist
    INSERT INTO daily_stats (date, articles_created, daily_limit, under_limit)
    SELECT 
        target_date,
        0,
        10, -- Change this to your desired daily limit
        true
    WHERE NOT EXISTS (
        SELECT 1 FROM daily_stats WHERE date = target_date
    );
END;
$$ LANGUAGE plpgsql;

-- 7. Create function to get today's stats
CREATE OR REPLACE FUNCTION get_today_stats()
RETURNS TABLE (
    date date,
    articles_created integer,
    daily_limit integer,
    under_limit boolean,
    remaining_articles integer
) AS $$
BEGIN
    -- Ensure today's row exists
    PERFORM ensure_daily_stats();
    
    -- Return today's stats
    RETURN QUERY
    SELECT 
        ds.date,
        ds.articles_created,
        ds.daily_limit,
        ds.under_limit,
        (ds.daily_limit - ds.articles_created) as remaining_articles
    FROM daily_stats ds
    WHERE ds.date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- 8. Test the setup
SELECT 'Testing daily stats setup...' as status;

-- Create today's row if it doesn't exist
SELECT create_today_stats();

-- Show today's stats
SELECT * FROM get_today_stats();

-- Show all daily stats
SELECT 
    date,
    articles_created,
    daily_limit,
    under_limit,
    (daily_limit - articles_created) as remaining
FROM daily_stats 
ORDER BY date DESC;

SELECT '✅ Daily stats auto-setup complete!' as result;
