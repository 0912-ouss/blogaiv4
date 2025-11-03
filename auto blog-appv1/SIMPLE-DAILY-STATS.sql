-- ============================================
-- SIMPLE DAILY STATS AUTO-SETUP
-- ============================================
-- Minimal version - just the essentials
-- ============================================

-- 1. Function to ensure today's row exists
CREATE OR REPLACE FUNCTION ensure_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Create today's row if it doesn't exist
    INSERT INTO daily_stats (date, articles_created, daily_limit, under_limit)
    SELECT 
        CURRENT_DATE,
        0,
        10, -- Change this to your daily limit
        true
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
    UPDATE daily_stats 
    SET 
        articles_created = articles_created + 1,
        under_limit = (articles_created + 1) < daily_limit
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
INSERT INTO daily_stats (date, articles_created, daily_limit, under_limit)
SELECT 
    CURRENT_DATE,
    0,
    10, -- Change this to your daily limit
    true
WHERE NOT EXISTS (
    SELECT 1 FROM daily_stats WHERE date = CURRENT_DATE
);

-- 5. Show result
SELECT 
    '✅ Daily stats auto-setup complete!' as status,
    date,
    articles_created,
    daily_limit,
    under_limit
FROM daily_stats 
WHERE date = CURRENT_DATE;
