-- ============================================
-- FIXED DAILY STATS SETUP - FOR GENERATED COLUMNS
-- ============================================
-- This version works with generated columns
-- ============================================

-- 1. Function to ensure today's row exists
CREATE OR REPLACE FUNCTION ensure_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Create today's row if it doesn't exist
    -- Note: under_limit is generated, so we don't insert it
    INSERT INTO daily_stats (date, articles_created, daily_limit)
    SELECT 
        CURRENT_DATE,
        0,
        10 -- CHANGE THIS: Set your daily limit here (10 = 10 articles per day)
    WHERE NOT EXISTS (
        SELECT 1 FROM daily_stats WHERE date = CURRENT_DATE
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Function to update stats when article is created
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure today's row exists
    PERFORM ensure_daily_stats();
    
    -- Update today's count
    -- Note: under_limit is generated, so it updates automatically
    UPDATE daily_stats 
    SET 
        articles_created = articles_created + 1
    WHERE date = CURRENT_DATE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create triggers
DROP TRIGGER IF EXISTS trigger_ensure_daily_stats ON articles;
CREATE TRIGGER trigger_ensure_daily_stats
    BEFORE INSERT ON articles
    FOR EACH ROW
    EXECUTE FUNCTION ensure_daily_stats();

DROP TRIGGER IF EXISTS trigger_update_daily_stats ON articles;
CREATE TRIGGER trigger_update_daily_stats
    AFTER INSERT ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_stats();

-- 4. Create today's row
-- Note: under_limit is generated, so we don't insert it
INSERT INTO daily_stats (date, articles_created, daily_limit)
SELECT 
    CURRENT_DATE,
    0,
    10 -- CHANGE THIS: Set your daily limit here (10 = 10 articles per day)
WHERE NOT EXISTS (
    SELECT 1 FROM daily_stats WHERE date = CURRENT_DATE
);

-- 5. Show result
SELECT 
    '✅ Daily stats auto-setup complete!' as status,
    date,
    articles_created,
    daily_limit,
    under_limit -- This will show the generated value
FROM daily_stats 
WHERE date = CURRENT_DATE;
