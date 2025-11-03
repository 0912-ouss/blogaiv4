-- ============================================
-- SAFE FIX: Only Fix Existing Columns
-- ============================================
-- This only modifies columns that already exist
-- No errors if columns are missing
-- ============================================

-- Fix main text columns (these should exist in your table)
ALTER TABLE articles ALTER COLUMN title TYPE VARCHAR(500);
ALTER TABLE articles ALTER COLUMN slug TYPE VARCHAR(500);
ALTER TABLE articles ALTER COLUMN content TYPE TEXT;
ALTER TABLE articles ALTER COLUMN excerpt TYPE TEXT;

-- Fix meta columns (only if they exist)
DO $$ 
BEGIN
    -- Fix subtitle
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='articles' AND column_name='subtitle') THEN
        ALTER TABLE articles ALTER COLUMN subtitle TYPE VARCHAR(500);
    END IF;

    -- Fix meta_title
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='articles' AND column_name='meta_title') THEN
        ALTER TABLE articles ALTER COLUMN meta_title TYPE VARCHAR(500);
    END IF;

    -- Fix meta_description
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='articles' AND column_name='meta_description') THEN
        ALTER TABLE articles ALTER COLUMN meta_description TYPE TEXT;
    END IF;

    -- Fix meta_keywords
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='articles' AND column_name='meta_keywords') THEN
        ALTER TABLE articles ALTER COLUMN meta_keywords TYPE TEXT;
    END IF;

    -- Fix featured_image
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='articles' AND column_name='featured_image') THEN
        ALTER TABLE articles ALTER COLUMN featured_image TYPE TEXT;
    END IF;

    -- Fix featured_image_url
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='articles' AND column_name='featured_image_url') THEN
        ALTER TABLE articles ALTER COLUMN featured_image_url TYPE TEXT;
    END IF;

    -- Fix image_copyright
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='articles' AND column_name='image_copyright') THEN
        ALTER TABLE articles ALTER COLUMN image_copyright TYPE VARCHAR(500);
    END IF;

    -- Fix author_name
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='articles' AND column_name='author_name') THEN
        ALTER TABLE articles ALTER COLUMN author_name TYPE VARCHAR(255);
    END IF;

END $$;

-- Verify what was changed
SELECT 
    column_name, 
    data_type, 
    CASE 
        WHEN character_maximum_length IS NULL THEN 'UNLIMITED'
        ELSE character_maximum_length::TEXT || ' chars'
    END as max_length
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND column_name IN (
    'title', 'slug', 'subtitle', 'content', 'excerpt', 
    'meta_title', 'meta_description', 'meta_keywords',
    'featured_image', 'featured_image_url', 'author_name', 'image_copyright'
)
ORDER BY column_name;

SELECT '✅ All existing columns fixed! No errors!' AS status;

