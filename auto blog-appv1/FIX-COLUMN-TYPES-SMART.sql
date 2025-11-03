-- ============================================
-- SMART FIX: Handle both string and array types
-- ============================================

-- First, check what we're dealing with
SELECT 
    column_name, 
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND column_name IN ('meta_keywords', 'secondary_keywords', 'tags');

-- ============================================
-- Fix meta_keywords ONLY if it's a string type
-- ============================================
DO $$
DECLARE
    col_type text;
BEGIN
    -- Get the current data type
    SELECT data_type INTO col_type
    FROM information_schema.columns 
    WHERE table_name = 'articles' 
    AND column_name = 'meta_keywords';
    
    -- Only fix if it's a string type (character varying or text)
    IF col_type IN ('character varying', 'text') THEN
        RAISE NOTICE 'Converting meta_keywords from % to text array...', col_type;
        
        ALTER TABLE articles ADD COLUMN meta_keywords_new text[] DEFAULT '{}';
        
        UPDATE articles 
        SET meta_keywords_new = CASE 
            WHEN meta_keywords IS NULL OR meta_keywords = '' THEN '{}'::text[]
            ELSE string_to_array(meta_keywords, ', ')
        END;
        
        ALTER TABLE articles DROP COLUMN meta_keywords;
        ALTER TABLE articles RENAME COLUMN meta_keywords_new TO meta_keywords;
        ALTER TABLE articles ALTER COLUMN meta_keywords SET NOT NULL;
        ALTER TABLE articles ALTER COLUMN meta_keywords SET DEFAULT '{}'::text[];
        
        COMMENT ON COLUMN articles.meta_keywords IS 'Array of meta keywords for SEO (text[])';
        
        RAISE NOTICE '✓ meta_keywords converted to text array';
    ELSE
        RAISE NOTICE '✓ meta_keywords is already type: % (no change needed)', col_type;
    END IF;
END $$;

-- ============================================
-- Fix secondary_keywords ONLY if it's a string type
-- ============================================
DO $$
DECLARE
    col_type text;
BEGIN
    -- Check if column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' 
        AND column_name = 'secondary_keywords'
    ) THEN
        SELECT data_type INTO col_type
        FROM information_schema.columns 
        WHERE table_name = 'articles' 
        AND column_name = 'secondary_keywords';
        
        IF col_type IN ('character varying', 'text') THEN
            RAISE NOTICE 'Converting secondary_keywords from % to text array...', col_type;
            
            ALTER TABLE articles ADD COLUMN secondary_keywords_new text[] DEFAULT '{}';
            
            UPDATE articles 
            SET secondary_keywords_new = CASE 
                WHEN secondary_keywords IS NULL OR secondary_keywords = '' THEN '{}'::text[]
                ELSE string_to_array(secondary_keywords, ', ')
            END;
            
            ALTER TABLE articles DROP COLUMN secondary_keywords;
            ALTER TABLE articles RENAME COLUMN secondary_keywords_new TO secondary_keywords;
            ALTER TABLE articles ALTER COLUMN secondary_keywords SET NOT NULL;
            ALTER TABLE articles ALTER COLUMN secondary_keywords SET DEFAULT '{}'::text[];
            
            COMMENT ON COLUMN articles.secondary_keywords IS 'Array of secondary keywords for SEO (text[])';
            
            RAISE NOTICE '✓ secondary_keywords converted to text array';
        ELSE
            RAISE NOTICE '✓ secondary_keywords is already type: % (no change needed)', col_type;
        END IF;
    ELSE
        RAISE NOTICE '✓ secondary_keywords column does not exist (skipped)';
    END IF;
END $$;

-- ============================================
-- Fix tags ONLY if it's a string type
-- ============================================
DO $$
DECLARE
    col_type text;
BEGIN
    -- Check if column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' 
        AND column_name = 'tags'
    ) THEN
        SELECT data_type INTO col_type
        FROM information_schema.columns 
        WHERE table_name = 'articles' 
        AND column_name = 'tags';
        
        IF col_type IN ('character varying', 'text') THEN
            RAISE NOTICE 'Converting tags from % to text array...', col_type;
            
            ALTER TABLE articles ADD COLUMN tags_new text[] DEFAULT '{}';
            
            UPDATE articles 
            SET tags_new = CASE 
                WHEN tags IS NULL OR tags = '' THEN '{}'::text[]
                ELSE string_to_array(tags, ', ')
            END;
            
            ALTER TABLE articles DROP COLUMN tags;
            ALTER TABLE articles RENAME COLUMN tags_new TO tags;
            ALTER TABLE articles ALTER COLUMN tags SET NOT NULL;
            ALTER TABLE articles ALTER COLUMN tags SET DEFAULT '{}'::text[];
            
            COMMENT ON COLUMN articles.tags IS 'Array of tags for categorization (text[])';
            
            RAISE NOTICE '✓ tags converted to text array';
        ELSE
            RAISE NOTICE '✓ tags is already type: % (no change needed)', col_type;
        END IF;
    ELSE
        RAISE NOTICE '✓ tags column does not exist (skipped)';
    END IF;
END $$;

-- Final verification
SELECT 
    column_name, 
    data_type,
    udt_name,
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND column_name IN ('meta_keywords', 'secondary_keywords', 'tags')
ORDER BY column_name;

-- Show sample data
SELECT 
    id,
    title,
    meta_keywords,
    tags
FROM articles 
LIMIT 3;
