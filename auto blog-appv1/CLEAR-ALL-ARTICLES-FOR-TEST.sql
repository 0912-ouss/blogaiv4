-- ============================================
-- CLEAR ALL ARTICLES FOR TESTING
-- ============================================
-- This will delete all articles and reset daily stats
-- Perfect for testing your n8n workflow from scratch
-- ============================================

-- Step 1: Delete all articles
DELETE FROM articles;

-- Step 2: Reset the articles ID sequence (start from 1 again)
ALTER SEQUENCE articles_id_seq RESTART WITH 1;

-- Step 3: Clear daily stats
DELETE FROM daily_stats;

-- Step 4: Reset daily stats ID sequence
ALTER SEQUENCE daily_stats_id_seq RESTART WITH 1;

-- Step 5: Initialize today's record with 0 articles
INSERT INTO daily_stats (date, articles_created, daily_limit)
VALUES (CURRENT_DATE, 0, 10);

-- ============================================
-- Verify Everything is Clean
-- ============================================

-- Check articles (should be empty)
SELECT COUNT(*) as total_articles FROM articles;
-- Should return: 0

-- Check daily stats (should have 1 row with 0 articles)
SELECT * FROM daily_stats WHERE date = CURRENT_DATE;
-- Should return:
-- id | date       | articles_created | daily_limit | under_limit
-- 1  | 2025-10-08 | 0                | 10          | true

-- ============================================
-- Summary
-- ============================================
SELECT 
    '✅ All articles deleted!' as articles_status,
    '✅ Daily stats reset to 0!' as stats_status,
    '✅ Ready to test n8n workflow!' as test_status;

-- ============================================
-- NOW YOU CAN:
-- ============================================
-- 1. Run your n8n workflow
-- 2. Watch articles_created increment from 0
-- 3. Test the daily limit (when it reaches 10)
-- ============================================

