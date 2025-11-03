-- ============================================
-- SIMPLE FIX: Change meta_keywords column to text array
-- ============================================
-- This script safely changes columns from string to text[] (array of strings)

-- Step 1: Check current structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND column_name IN ('meta_keywords', 'secondary_keywords', 'tags');

-- Step 2: Create new columns with array type
ALTER TABLE articles ADD COLUMN meta_keywords_new text[] DEFAULT '{}';

-- Step 3: Convert existing data to arrays
UPDATE articles 
SET meta_keywords_new = string_to_array(COALESCE(meta_keywords, ''), ', ')
WHERE meta_keywords IS NOT NULL AND meta_keywords != '';

-- Step 4: Drop old column and rename new one
ALTER TABLE articles DROP COLUMN meta_keywords;
ALTER TABLE articles RENAME COLUMN meta_keywords_new TO meta_keywords;

-- Step 5: Set constraints
ALTER TABLE articles ALTER COLUMN meta_keywords SET NOT NULL;

-- Step 6: Add comment
COMMENT ON COLUMN articles.meta_keywords IS 'Array of meta keywords for SEO (text[])';

-- Verify the change
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND column_name = 'meta_keywords';

-- Show sample data
SELECT id, title, meta_keywords 
FROM articles 
WHERE array_length(meta_keywords, 1) > 0 
LIMIT 5;

-- ============================================
-- Fix secondary_keywords if it exists
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' 
        AND column_name = 'secondary_keywords'
        AND data_type = 'character varying'
    ) THEN
        
        ALTER TABLE articles ADD COLUMN secondary_keywords_new text[] DEFAULT '{}';
        
        UPDATE articles 
        SET secondary_keywords_new = string_to_array(COALESCE(secondary_keywords, ''), ', ')
        WHERE secondary_keywords IS NOT NULL AND secondary_keywords != '';
        
        ALTER TABLE articles DROP COLUMN secondary_keywords;
        ALTER TABLE articles RENAME COLUMN secondary_keywords_new TO secondary_keywords;
        ALTER TABLE articles ALTER COLUMN secondary_keywords SET NOT NULL;
        
        COMMENT ON COLUMN articles.secondary_keywords IS 'Array of secondary keywords for SEO (text[])';
        
        RAISE NOTICE 'secondary_keywords column converted to text array';
    END IF;
END $$;

-- ============================================
-- Fix tags if it exists
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' 
        AND column_name = 'tags'
        AND data_type = 'character varying'
    ) THEN
        
        ALTER TABLE articles ADD COLUMN tags_new text[] DEFAULT '{}';
        
        UPDATE articles 
        SET tags_new = string_to_array(COALESCE(tags, ''), ', ')
        WHERE tags IS NOT NULL AND tags != '';
        
        ALTER TABLE articles DROP COLUMN tags;
        ALTER TABLE articles RENAME COLUMN tags_new TO tags;
        ALTER TABLE articles ALTER COLUMN tags SET NOT NULL;
        
        COMMENT ON COLUMN articles.tags IS 'Array of tags for categorization (text[])';
        
        RAISE NOTICE 'tags column converted to text array';
    END IF;
END $$;

-- Final verification
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND column_name IN ('meta_keywords', 'secondary_keywords', 'tags')
ORDER BY column_name;

-- Success message
SELECT 'SUCCESS: All keyword and tag columns converted to text[] arrays' as result;
