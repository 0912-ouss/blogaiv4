-- ============================================
-- SUPER SIMPLE FIX - Just the essentials!
-- ============================================
-- Only fixes the 4 most important columns
-- These columns MUST exist in your articles table
-- ============================================

-- Fix title (required column)
ALTER TABLE articles ALTER COLUMN title TYPE VARCHAR(500);

-- Fix slug (required column)
ALTER TABLE articles ALTER COLUMN slug TYPE VARCHAR(500);

-- Fix content (required column)
ALTER TABLE articles ALTER COLUMN content TYPE TEXT;

-- Fix excerpt (required column)
ALTER TABLE articles ALTER COLUMN excerpt TYPE TEXT;

-- Done! Verify:
SELECT 
    column_name, 
    data_type, 
    character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND column_name IN ('title', 'slug', 'content', 'excerpt')
ORDER BY column_name;

-- You should see:
-- content  | text              | NULL (unlimited)
-- excerpt  | text              | NULL (unlimited)
-- slug     | character varying | 500
-- title    | character varying | 500

SELECT '✅ Essential columns fixed!' AS status;

