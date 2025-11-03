-- ============================================
-- FIX: Change meta_keywords column to text array
-- ============================================
-- This script changes the meta_keywords column from string to text[] (array of strings)
-- to fix the n8n workflow error: "malformed array literal"

-- First, let's check the current structure of the articles table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND column_name IN ('meta_keywords', 'secondary_keywords', 'tags');

-- Step 1: Backup existing data (convert string to array format)
-- Create a temporary column to store the converted data
ALTER TABLE articles ADD COLUMN meta_keywords_temp text[];

-- Step 2: Convert existing string data to array format
-- This handles comma-separated strings like "Brüssel, Technologie, Roundtable, Event"
UPDATE articles 
SET meta_keywords_temp = CASE 
    WHEN meta_keywords IS NULL OR meta_keywords = '' THEN ARRAY[]::text[]
    ELSE string_to_array(meta_keywords, ', ')
END;

-- Step 3: Drop the old column
ALTER TABLE articles DROP COLUMN meta_keywords;

-- Step 4: Rename the temporary column to the original name
ALTER TABLE articles RENAME COLUMN meta_keywords_temp TO meta_keywords;

-- Step 5: Set the column to NOT NULL with default empty array
ALTER TABLE articles ALTER COLUMN meta_keywords SET NOT NULL;
ALTER TABLE articles ALTER COLUMN meta_keywords SET DEFAULT ARRAY[]::text[];

-- Step 6: Add a comment to document the change
COMMENT ON COLUMN articles.meta_keywords IS 'Array of meta keywords for SEO (text[])';

-- Verify the change
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND column_name = 'meta_keywords';

-- Show a sample of the converted data
SELECT id, title, meta_keywords 
FROM articles 
WHERE meta_keywords IS NOT NULL 
LIMIT 5;

-- ============================================
-- OPTIONAL: Also fix secondary_keywords and tags if they exist as strings
-- ============================================
-- Check if secondary_keywords exists and needs the same fix
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' 
        AND column_name = 'secondary_keywords'
        AND data_type = 'character varying'
    ) THEN
        -- Apply the same fix to secondary_keywords
        ALTER TABLE articles ADD COLUMN secondary_keywords_temp text[];
        
        UPDATE articles 
        SET secondary_keywords_temp = CASE 
            WHEN secondary_keywords IS NULL OR secondary_keywords = '' THEN ARRAY[]::text[]
            ELSE string_to_array(secondary_keywords, ', ')
        END;
        
        ALTER TABLE articles DROP COLUMN secondary_keywords;
        ALTER TABLE articles RENAME COLUMN secondary_keywords_temp TO secondary_keywords;
        ALTER TABLE articles ALTER COLUMN secondary_keywords SET NOT NULL;
        ALTER TABLE articles ALTER COLUMN secondary_keywords SET DEFAULT ARRAY[]::text[];
        
        COMMENT ON COLUMN articles.secondary_keywords IS 'Array of secondary keywords for SEO (text[])';
        
        RAISE NOTICE 'secondary_keywords column also converted to text array';
    END IF;
END $$;

-- Check if tags exists and needs the same fix
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' 
        AND column_name = 'tags'
        AND data_type = 'character varying'
    ) THEN
        -- Apply the same fix to tags
        ALTER TABLE articles ADD COLUMN tags_temp text[];
        
        UPDATE articles 
        SET tags_temp = CASE 
            WHEN tags IS NULL OR tags = '' THEN ARRAY[]::text[]
            ELSE string_to_array(tags, ', ')
        END;
        
        ALTER TABLE articles DROP COLUMN tags;
        ALTER TABLE articles RENAME COLUMN tags_temp TO tags;
        ALTER TABLE articles ALTER COLUMN tags SET NOT NULL;
        ALTER TABLE articles ALTER COLUMN tags SET DEFAULT ARRAY[]::text[];
        
        COMMENT ON COLUMN articles.tags IS 'Array of tags for categorization (text[])';
        
        RAISE NOTICE 'tags column also converted to text array';
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

-- ✅ SUCCESS: All keyword and tag columns changed to text[] array type
-- Now your n8n workflow can pass arrays like:
-- meta_keywords: ["Brüssel", "Technologie", "Roundtable", "Event"]
-- secondary_keywords: ["SEO", "Marketing", "Digital"]
-- tags: ["technology", "event", "brussels"]
