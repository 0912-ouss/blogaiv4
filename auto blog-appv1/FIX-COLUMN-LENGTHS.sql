-- ============================================
-- FIX: Column Length Issues in Articles Table
-- ============================================
-- Error: "value too long for type character varying(255)"
-- This happens when title, slug, or content exceed 255 characters
-- ============================================

-- 1. Fix TITLE column (allow longer titles)
ALTER TABLE articles 
ALTER COLUMN title TYPE VARCHAR(500);

-- 2. Fix SLUG column (allow longer slugs)
ALTER TABLE articles 
ALTER COLUMN slug TYPE VARCHAR(500);

-- 3. Fix CONTENT column (should be TEXT, not VARCHAR)
ALTER TABLE articles 
ALTER COLUMN content TYPE TEXT;

-- 4. Fix EXCERPT column (allow longer excerpts)
ALTER TABLE articles 
ALTER COLUMN excerpt TYPE TEXT;

-- 5. Fix SUBTITLE column (if exists)
ALTER TABLE articles 
ALTER COLUMN subtitle TYPE VARCHAR(500);

-- 6. Fix META fields
ALTER TABLE articles 
ALTER COLUMN meta_title TYPE VARCHAR(500);

ALTER TABLE articles 
ALTER COLUMN meta_description TYPE TEXT;

ALTER TABLE articles 
ALTER COLUMN meta_keywords TYPE TEXT;

-- 7. Fix FEATURED_IMAGE column (for long URLs)
ALTER TABLE articles 
ALTER COLUMN featured_image TYPE TEXT;

-- 8. Fix SOURCE_URL column (if exists)
ALTER TABLE articles 
ALTER COLUMN source_url TYPE TEXT;

-- ============================================
-- Verify Changes
-- ============================================
SELECT 
    column_name, 
    data_type, 
    character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND column_name IN ('title', 'slug', 'content', 'excerpt', 'subtitle', 'meta_title', 'meta_description', 'featured_image')
ORDER BY column_name;

-- ============================================
-- Expected Result:
-- ============================================
-- title             | character varying | 500
-- slug              | character varying | 500
-- subtitle          | character varying | 500
-- content           | text              | NULL (unlimited)
-- excerpt           | text              | NULL (unlimited)
-- meta_title        | character varying | 500
-- meta_description  | text              | NULL (unlimited)
-- featured_image    | text              | NULL (unlimited)
-- ============================================

SELECT '✅ Column lengths fixed successfully!' AS status;

