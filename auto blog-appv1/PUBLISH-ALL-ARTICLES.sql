-- ============================================
-- PUBLISH ALL DRAFT ARTICLES
-- ============================================
-- This will change all articles to "published" status
-- so they appear on your homepage
-- ============================================

-- Update all articles to published
UPDATE articles 
SET 
  status = 'published',
  published_at = COALESCE(published_at, NOW())
WHERE status IS NULL 
   OR status = 'draft' 
   OR status != 'published';

-- Verify the update
SELECT 
  id,
  title,
  status,
  published_at
FROM articles
ORDER BY id;

-- Summary
SELECT 
  status,
  COUNT(*) as count
FROM articles
GROUP BY status;

SELECT '✅ All articles are now published!' AS result;

