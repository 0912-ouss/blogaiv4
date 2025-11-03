-- ============================================
-- CHECK GENERATED COLUMNS IN DAILY_STATS
-- ============================================
-- This will show you which columns are generated
-- ============================================

-- Check the table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_default LIKE '%GENERATED%' THEN 'YES - Generated Column'
        ELSE 'NO - Regular Column'
    END as is_generated
FROM information_schema.columns 
WHERE table_name = 'daily_stats' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show current daily_stats data
SELECT 
    'Current daily_stats data:' as info,
    *
FROM daily_stats 
ORDER BY date DESC;
