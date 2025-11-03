-- ============================================
-- COMPLETE FIX: Articles Table Column Sizes
-- ============================================
-- Run this in Supabase SQL Editor to fix all column size issues
-- ============================================

-- Step 1: Fix all VARCHAR columns that are too small
ALTER TABLE articles ALTER COLUMN title TYPE VARCHAR(500);
ALTER TABLE articles ALTER COLUMN slug TYPE VARCHAR(500);
ALTER TABLE articles ALTER COLUMN subtitle TYPE VARCHAR(500);
ALTER TABLE articles ALTER COLUMN author_name TYPE VARCHAR(255);
ALTER TABLE articles ALTER COLUMN meta_title TYPE VARCHAR(500);

-- Step 2: Change all text-heavy columns to TEXT (unlimited)
ALTER TABLE articles ALTER COLUMN content TYPE TEXT;
ALTER TABLE articles ALTER COLUMN excerpt TYPE TEXT;
ALTER TABLE articles ALTER COLUMN meta_description TYPE TEXT;
ALTER TABLE articles ALTER COLUMN meta_keywords TYPE TEXT;
ALTER TABLE articles ALTER COLUMN featured_image TYPE TEXT;
ALTER TABLE articles ALTER COLUMN featured_image_url TYPE TEXT;
ALTER TABLE articles ALTER COLUMN image_copyright TYPE VARCHAR(500);

-- Step 3: Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Check and add source_url if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='articles' AND column_name='source_url') THEN
        ALTER TABLE articles ADD COLUMN source_url TEXT;
    END IF;
    
    -- Check and add focus_keyword if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='articles' AND column_name='focus_keyword') THEN
        ALTER TABLE articles ADD COLUMN focus_keyword TEXT;
    END IF;
END $$;

-- Step 4: Ensure TEXT columns are actually TEXT
ALTER TABLE articles ALTER COLUMN source_url TYPE TEXT;
ALTER TABLE articles ALTER COLUMN focus_keyword TYPE TEXT;

-- ============================================
-- Verify All Changes
-- ============================================
SELECT 
    column_name, 
    data_type, 
    CASE 
        WHEN character_maximum_length IS NULL THEN 'UNLIMITED (TEXT)'
        ELSE character_maximum_length::TEXT 
    END as max_length
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND column_name IN (
    'title', 'slug', 'subtitle', 'content', 'excerpt', 
    'meta_title', 'meta_description', 'meta_keywords',
    'featured_image', 'featured_image_url', 'source_url', 
    'focus_keyword', 'author_name', 'image_copyright'
)
ORDER BY column_name;

-- ============================================
-- Expected Results:
-- ============================================
-- author_name          | character varying | 255
-- content              | text              | UNLIMITED (TEXT)
-- excerpt              | text              | UNLIMITED (TEXT)
-- featured_image       | text              | UNLIMITED (TEXT)
-- featured_image_url   | text              | UNLIMITED (TEXT)
-- focus_keyword        | text              | UNLIMITED (TEXT)
-- image_copyright      | character varying | 500
-- meta_description     | text              | UNLIMITED (TEXT)
-- meta_keywords        | text              | UNLIMITED (TEXT)
-- meta_title           | character varying | 500
-- slug                 | character varying | 500
-- source_url           | text              | UNLIMITED (TEXT)
-- subtitle             | character varying | 500
-- title                | character varying | 500
-- ============================================

SELECT '✅ All column sizes fixed! No more "value too long" errors!' AS status;

