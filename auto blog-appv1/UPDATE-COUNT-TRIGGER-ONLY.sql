-- ============================================
-- UPDATE ARTICLES COUNT TRIGGER ONLY
-- ============================================
-- This trigger ONLY updates the count
-- It does NOT create the daily row
-- ============================================

-- 1. Create function to update count only
CREATE OR REPLACE FUNCTION update_articles_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update the count if today's row exists
    -- Don't try to create the row
    UPDATE daily_stats 
    SET articles_created = articles_created + 1
    WHERE date = CURRENT_DATE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create trigger on articles table
DROP TRIGGER IF EXISTS trigger_update_articles_count ON articles;
CREATE TRIGGER trigger_update_articles_count
    AFTER INSERT ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_articles_count();

-- 3. Verify trigger is created
SELECT 
    '✅ Count update trigger created!' as status,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_articles_count';

SELECT '✅ Now articles_created will auto-increment when you add articles!' as result;
