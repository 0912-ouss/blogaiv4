-- ============================================
-- REMOVE ARTICLE TRIGGERS
-- ============================================
-- This removes the triggers that were causing problems
-- with n8n Supabase inserts
-- ============================================

-- 1. Drop the triggers
DROP TRIGGER IF EXISTS trigger_ensure_daily_stats ON articles;
DROP TRIGGER IF EXISTS trigger_update_daily_stats ON articles;

-- 2. Drop the functions
DROP FUNCTION IF EXISTS ensure_daily_stats();
DROP FUNCTION IF EXISTS update_daily_stats();
DROP FUNCTION IF EXISTS update_daily_stats_on_article_insert();

-- 3. Verify triggers are removed
SELECT 
    '✅ All article triggers removed!' as status;

SELECT 
    'Remaining triggers:' as info,
    trigger_name,
    event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'articles';

SELECT '✅ Now you can use Supabase node directly in n8n!' as result;
