-- ============================================
-- DIAGNOSTIC: Check current column types
-- ============================================

-- Check all relevant columns and their types
SELECT 
    column_name, 
    data_type,
    udt_name,
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND column_name IN ('meta_keywords', 'secondary_keywords', 'tags', 'meta_description', 'focus_keyword')
ORDER BY column_name;

-- Check sample data from a few articles
SELECT 
    id,
    title,
    pg_typeof(meta_keywords) as meta_keywords_type,
    meta_keywords,
    pg_typeof(tags) as tags_type,
    tags
FROM articles 
LIMIT 3;
