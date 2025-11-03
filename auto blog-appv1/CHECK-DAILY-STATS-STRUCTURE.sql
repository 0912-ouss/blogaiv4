-- ============================================
-- CHECK DAILY_STATS TABLE STRUCTURE
-- ============================================

-- 1. Show column details
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'daily_stats' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Show table structure in a readable format
SELECT 
    '
    TABLE: daily_stats
    ==================
    
    Columns:
    ' as structure;

-- 3. Show current data
SELECT 
    'Current Data:' as info,
    *
FROM daily_stats 
ORDER BY date DESC
LIMIT 10;

-- 4. Show constraints
SELECT
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'daily_stats';

-- 5. Show indexes
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'daily_stats';
