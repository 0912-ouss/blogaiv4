const express = require('express');
const axios = require('axios');
const router = express.Router();

// Import sanitization utilities
const { sanitizeArticleContent, sanitizeText } = require('./utils/sanitize');
const { calculateReadingTime, saveArticleVersion, getRelatedArticles } = require('./utils/articleHelpers');

// Import middleware (will be passed from main file)
let verifyToken, logActivity;

module.exports = (supabase, middleware) => {
    verifyToken = middleware.verifyToken;
    logActivity = middleware.logActivity;

    // ============================================
    // GET ALL ARTICLES (Admin - includes drafts)
    // ============================================
    router.get('/', verifyToken, async (req, res) => {
        try {
            const { 
                status, 
                category, 
                search, 
                page = 1, 
                limit = 10,
                sortBy = 'published_at',
                sortOrder = 'desc'
            } = req.query;

            // First, get articles
            let query = supabase
                .from('articles')
                .select('*', { count: 'exact' });

            // Filters
            if (status) {
                query = query.eq('status', status);
            }
            if (category) {
                query = query.eq('category_id', category);
            }
            if (search) {
                query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
            }

            // Sorting
            query = query.order(sortBy, { ascending: sortOrder === 'asc' });

            // Pagination
            const from = (page - 1) * limit;
            const to = from + parseInt(limit) - 1;
            query = query.range(from, to);

            const { data: articles, error, count } = await query;

            if (error) throw error;

            // Manually fetch categories and authors
            const { data: categories } = await supabase.from('categories').select('*');
            const { data: authors } = await supabase.from('authors').select('*');

            // Create lookup maps
            const categoryMap = {};
            const authorMap = {};
            
            categories?.forEach(cat => { categoryMap[cat.id] = cat; });
            authors?.forEach(auth => { authorMap[auth.id] = auth; });

            // Manually join data
            const enrichedArticles = articles.map(article => ({
                ...article,
                categories: article.category_id ? categoryMap[article.category_id] : null,
                authors: article.author_id ? authorMap[article.author_id] : null
            }));

            res.json({
                success: true,
                data: enrichedArticles,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: count,
                    totalPages: Math.ceil(count / limit)
                }
            });
        } catch (error) {
            console.error('Error fetching articles:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // ============================================
    // GET SINGLE ARTICLE BY ID (Admin)
    // ============================================
    router.get('/:id', verifyToken, async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('articles')
                .select(`
                    *,
                    categories(id, name, slug),
                    authors(id, name, slug)
                `)
                .eq('id', req.params.id)
                .single();

            if (error) throw error;

            res.json({ success: true, data });
        } catch (error) {
            console.error('Error fetching article:', error);
            res.status(404).json({ success: false, error: 'Article not found' });
        }
    });

    // ============================================
    // UPDATE ARTICLE
    // ============================================
    router.put('/:id', verifyToken, async (req, res) => {
        try {
            const articleId = req.params.id;
            const updateData = { ...req.body, updated_at: new Date().toISOString() };
            
            // Sanitize content fields
            if (updateData.content) {
                updateData.content = sanitizeArticleContent(updateData.content);
            }
            if (updateData.excerpt) {
                updateData.excerpt = sanitizeText(updateData.excerpt);
            }
            if (updateData.title) {
                updateData.title = sanitizeText(updateData.title);
            }
            if (updateData.meta_title) {
                updateData.meta_title = sanitizeText(updateData.meta_title);
            }
            if (updateData.meta_description) {
                updateData.meta_description = sanitizeText(updateData.meta_description);
            }
            
            // Handle meta_keywords - ensure it's an array (database expects text[])
            if (updateData.meta_keywords !== undefined) {
                if (!updateData.meta_keywords) {
                    updateData.meta_keywords = [];
                } else if (typeof updateData.meta_keywords === 'string') {
                    // Convert comma-separated string to array
                    updateData.meta_keywords = updateData.meta_keywords.split(',').map(k => k.trim()).filter(k => k);
                } else if (!Array.isArray(updateData.meta_keywords)) {
                    // Convert other types to array
                    updateData.meta_keywords = [String(updateData.meta_keywords)];
                }
                // If it's already an array, keep it as is
            }

            // Handle tags - ensure it's an array (database expects text[])
            if (updateData.tags !== undefined) {
                if (!updateData.tags) {
                    updateData.tags = [];
                } else if (typeof updateData.tags === 'string') {
                    // Convert comma-separated string to array
                    updateData.tags = updateData.tags.split(',').map(t => t.trim()).filter(t => t);
                } else if (!Array.isArray(updateData.tags)) {
                    // Convert other types to array
                    updateData.tags = [String(updateData.tags)];
                }
                // If it's already an array, keep it as is
            }
            
            // Remove read-only fields
            delete updateData.id;
            delete updateData.created_at;
            delete updateData.view_count;

            // Calculate reading time if content is being updated
            if (updateData.content) {
                updateData.reading_time = calculateReadingTime(updateData.content);
            }

            // Get current article data for versioning
            const { data: currentArticle } = await supabase
                .from('articles')
                .select('*')
                .eq('id', articleId)
                .single();

            // Save version before updating (if content or title changed)
            if (currentArticle && (updateData.content || updateData.title)) {
                await saveArticleVersion(
                    supabase,
                    articleId,
                    currentArticle,
                    req.adminUser.id,
                    req.body.version_notes || null
                );
            }

            // Remove undefined/null values (keep empty strings for optional fields)
            Object.keys(updateData).forEach(key => {
                if (updateData[key] === undefined || updateData[key] === null) {
                    delete updateData[key];
                }
            });

            const { data, error } = await supabase
                .from('articles')
                .update(updateData)
                .eq('id', articleId)
                .select()
                .single();

            if (error) {
                console.error('Supabase error details:', error);
                // Provide more detailed error messages
                let errorMessage = 'Failed to update article';
                if (error.message) {
                    errorMessage = error.message;
                } else if (error.details) {
                    errorMessage = error.details;
                } else if (error.code) {
                    errorMessage = `Database error (${error.code})`;
                }
                
                // Check for common issues
                if (errorMessage.includes('value too long') || errorMessage.includes('too long')) {
                    errorMessage = 'Content or image is too large. Please reduce the image size or content length.';
                } else if (errorMessage.includes('violates') || errorMessage.includes('constraint')) {
                    errorMessage = 'Invalid data format. Please check all fields and try again.';
                }
                
                return res.status(500).json({ success: false, error: errorMessage });
            }

            // Log activity
            await logActivity(
                supabase,
                req.adminUser.id,
                req.adminUser.email,
                'update',
                'article',
                articleId,
                data.title
            );

            res.json({ success: true, data, message: 'Article updated successfully' });
        } catch (error) {
            console.error('Error updating article:', error);
            let errorMessage = 'Failed to update article';
            
            // Handle specific error types
            if (error.message) {
                errorMessage = error.message;
            } else if (error.details) {
                errorMessage = error.details;
            }
            
            // Check for payload size errors
            if (errorMessage.includes('413') || errorMessage.includes('too large') || errorMessage.includes('Payload')) {
                errorMessage = 'Article content or image is too large. Please reduce the image size or split the content into smaller sections.';
            }
            
            res.status(500).json({ success: false, error: errorMessage });
        }
    });

    // ============================================
    // DELETE ARTICLE
    // ============================================
    router.delete('/:id', verifyToken, async (req, res) => {
        try {
            const articleId = req.params.id;

            // Get article title before deleting
            const { data: article } = await supabase
                .from('articles')
                .select('title')
                .eq('id', articleId)
                .single();

            const { error } = await supabase
                .from('articles')
                .delete()
                .eq('id', articleId);

            if (error) throw error;

            // Log activity
            await logActivity(
                supabase,
                req.adminUser.id,
                req.adminUser.email,
                'delete',
                'article',
                articleId,
                article?.title || 'Unknown'
            );

            res.json({ success: true, message: 'Article deleted successfully' });
        } catch (error) {
            console.error('Error deleting article:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // ============================================
    // BULK DELETE ARTICLES
    // ============================================
    router.post('/bulk-delete', verifyToken, async (req, res) => {
        try {
            const { articleIds } = req.body;

            if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
                return res.status(400).json({ success: false, error: 'Article IDs array is required' });
            }

            const { error } = await supabase
                .from('articles')
                .delete()
                .in('id', articleIds);

            if (error) throw error;

            // Log activity
            await logActivity(
                supabase,
                req.adminUser.id,
                req.adminUser.email,
                'bulk_delete',
                'article',
                null,
                `${articleIds.length} articles`,
                { articleIds }
            );

            res.json({ success: true, message: `Deleted ${articleIds.length} article(s)` });
        } catch (error) {
            console.error('Error bulk deleting articles:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // BULK UPDATE ARTICLES
    // ============================================
    router.post('/bulk-update', verifyToken, async (req, res) => {
        try {
            const { articleIds, updates } = req.body;

            if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
                return res.status(400).json({ success: false, error: 'Article IDs array is required' });
            }

            if (!updates || typeof updates !== 'object') {
                return res.status(400).json({ success: false, error: 'Updates object is required' });
            }

            // Sanitize updates if needed
            const sanitizedUpdates = { ...updates };
            if (sanitizedUpdates.status) {
                // Validate status
                const validStatuses = ['draft', 'published', 'archived'];
                if (!validStatuses.includes(sanitizedUpdates.status)) {
                    return res.status(400).json({ success: false, error: 'Invalid status' });
                }
            }

            // Update articles
            const { error } = await supabase
                .from('articles')
                .update({
                    ...sanitizedUpdates,
                    updated_at: new Date().toISOString()
                })
                .in('id', articleIds);

            if (error) throw error;

            // Log activity
            await logActivity(
                supabase,
                req.adminUser.id,
                req.adminUser.email,
                'bulk_update',
                'article',
                null,
                `${articleIds.length} articles`,
                { articleIds, updates: sanitizedUpdates }
            );

            res.json({ success: true, message: `Updated ${articleIds.length} article(s)` });
        } catch (error) {
            console.error('Error bulk updating articles:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // BULK ACTIONS (Legacy - kept for backward compatibility)
    // ============================================
    router.post('/bulk-action', verifyToken, async (req, res) => {
        try {
            const { action, articleIds } = req.body;

            if (!action || !articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Invalid action or article IDs' 
                });
            }

            let result;
            switch (action) {
                case 'delete':
                    result = await supabase
                        .from('articles')
                        .delete()
                        .in('id', articleIds);
                    break;

                case 'publish':
                    result = await supabase
                        .from('articles')
                        .update({ status: 'published', published_at: new Date().toISOString() })
                        .in('id', articleIds);
                    break;

                case 'draft':
                    result = await supabase
                        .from('articles')
                        .update({ status: 'draft' })
                        .in('id', articleIds);
                    break;

                case 'archive':
                    result = await supabase
                        .from('articles')
                        .update({ status: 'archived' })
                        .in('id', articleIds);
                    break;

                case 'feature':
                    result = await supabase
                        .from('articles')
                        .update({ is_featured: true })
                        .in('id', articleIds);
                    break;

                case 'unfeature':
                    result = await supabase
                        .from('articles')
                        .update({ is_featured: false })
                        .in('id', articleIds);
                    break;

                default:
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Invalid action' 
                    });
            }

            if (result.error) throw result.error;

            // Log activity
            await logActivity(
                supabase,
                req.adminUser.id,
                req.adminUser.email,
                `bulk_${action}`,
                'article',
                null,
                `${articleIds.length} articles`,
                { articleIds }
            );

            res.json({ 
                success: true, 
                message: `Bulk ${action} completed for ${articleIds.length} articles` 
            });
        } catch (error) {
            console.error('Error in bulk action:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // ============================================
    // CREATE ARTICLE
    // ============================================
    router.post('/', verifyToken, async (req, res) => {
        try {
            const articleData = {
                ...req.body,
                ai_generated: req.body.ai_generated || false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            // Handle meta_keywords - ensure it's an array (database expects text[])
            if (!articleData.meta_keywords) {
                articleData.meta_keywords = [];
            } else if (typeof articleData.meta_keywords === 'string') {
                // Convert comma-separated string to array
                articleData.meta_keywords = articleData.meta_keywords.split(',').map(k => k.trim()).filter(k => k);
            } else if (!Array.isArray(articleData.meta_keywords)) {
                // Convert other types to array
                articleData.meta_keywords = [String(articleData.meta_keywords)];
            }
            // If it's already an array, keep it as is

            // Auto-assign author based on category if not provided
            if (!articleData.author_id && !articleData.author_name && articleData.category_id) {
                // Map categories to authors (same mapping as in create-real-authors.js)
                const categoryAuthorMap = {
                    1: 4, // Technology -> Sarah Müller
                    2: 5, // Business -> Michael Schneider
                    3: 6, // Science -> Dr. Lisa Weber
                    4: 6, // Health -> Dr. Lisa Weber
                    5: 8, // Politics -> Anna Hoffmann
                    6: 9, // Lifestyle -> David Klein
                    7: 10, // Entertainment -> Emma Wagner
                };
                
                const authorId = categoryAuthorMap[articleData.category_id];
                if (authorId) {
                    // Get author name
                    const { data: authorData } = await supabase
                        .from('authors')
                        .select('name')
                        .eq('id', authorId)
                        .single();
                    
                    if (authorData) {
                        articleData.author_id = authorId;
                        articleData.author_name = authorData.name;
                    }
                }
            }
            
            // If still no author, assign a random real author (not automated author)
            if (!articleData.author_id && !articleData.author_name) {
                const { data: authors } = await supabase
                    .from('authors')
                    .select('id, name')
                    .gte('id', 4) // Skip AI authors (IDs 1-3)
                    .limit(10);
                
                if (authors && authors.length > 0) {
                    const randomAuthor = authors[Math.floor(Math.random() * authors.length)];
                    articleData.author_id = randomAuthor.id;
                    articleData.author_name = randomAuthor.name;
                }
            }

            // Populate category column from category_id if not set
            if (!articleData.category && articleData.category_id) {
                const { data: categoryData } = await supabase
                    .from('categories')
                    .select('name')
                    .eq('id', articleData.category_id)
                    .single();
                
                if (categoryData) {
                    articleData.category = categoryData.name;
                }
            }

            // Handle tags - ensure it's an array (database expects text[])
            if (!articleData.tags) {
                articleData.tags = [];
            } else if (typeof articleData.tags === 'string') {
                // Convert comma-separated string to array
                articleData.tags = articleData.tags.split(',').map(t => t.trim()).filter(t => t);
            } else if (!Array.isArray(articleData.tags)) {
                // Convert other types to array
                articleData.tags = [String(articleData.tags)];
            }
            
            // If tags is empty but category_id exists, generate tags from category and keywords
            if ((!articleData.tags || articleData.tags.length === 0) && articleData.category_id) {
                // Get category name
                const { data: categoryData } = await supabase
                    .from('categories')
                    .select('name')
                    .eq('id', articleData.category_id)
                    .single();
                
                if (categoryData) {
                    // Generate tags from category name and title keywords
                    const categoryName = categoryData.name.toLowerCase();
                    const titleWords = (articleData.title || '').toLowerCase()
                        .split(/\s+/)
                        .filter(w => w.length > 3)
                        .slice(0, 3);
                    articleData.tags = [categoryName, ...titleWords].filter(Boolean);
                }
            }

            // Validate required fields
            if (!articleData.title) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Title is required' 
                });
            }

            if (!articleData.content) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Content is required' 
                });
            }

            // Generate slug if not provided
            if (!articleData.slug && articleData.title) {
                const baseSlug = articleData.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '')
                    .substring(0, 60);
                const now = new Date();
                const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
                const timeStr = now.toISOString().slice(11, 19).replace(/:/g, '');
                articleData.slug = `${baseSlug}-${dateStr}-${timeStr}-${Math.floor(Math.random() * 10000)}`;
            }

            // Set published_at if status is published
            if (articleData.status === 'published' && !articleData.published_at) {
                articleData.published_at = new Date().toISOString();
            }

            // Calculate reading time
            if (articleData.content) {
                articleData.reading_time = calculateReadingTime(articleData.content);
            }

            // Remove undefined/null values to avoid database errors (keep empty strings for optional fields)
            Object.keys(articleData).forEach(key => {
                if (articleData[key] === undefined || articleData[key] === null) {
                    delete articleData[key];
                }
            });

            const { data, error } = await supabase
                .from('articles')
                .insert([articleData])
                .select()
                .single();

            if (error) {
                console.error('Supabase error details:', error);
                // Provide more detailed error messages
                let errorMessage = 'Failed to create article';
                if (error.message) {
                    errorMessage = error.message;
                } else if (error.details) {
                    errorMessage = error.details;
                } else if (error.code) {
                    errorMessage = `Database error (${error.code})`;
                }
                
                // Check for common issues
                if (errorMessage.includes('value too long') || errorMessage.includes('too long')) {
                    errorMessage = 'Content or image is too large. Please reduce the image size or content length.';
                } else if (errorMessage.includes('violates') || errorMessage.includes('constraint')) {
                    errorMessage = 'Invalid data format. Please check all fields and try again.';
                }
                
                return res.status(500).json({ success: false, error: errorMessage });
            }

            // Log activity
            await logActivity(
                supabase,
                req.adminUser.id,
                req.adminUser.email,
                'create',
                'article',
                data.id,
                data.title
            );

            // Send email notification if article is published
            // Check if article is newly published (status is 'published' and has published_at)
            const isNewlyPublished = data.status === 'published' && data.published_at;
            if (isNewlyPublished && data.author_id) {
                try {
                    const { sendNotification } = require('../utils/emailService');
                    const { data: author } = await supabase
                        .from('authors')
                        .select('email')
                        .eq('id', data.author_id)
                        .single();
                    
                    if (author?.email) {
                        await sendNotification.articlePublished(
                            { title: data.title, slug: data.slug, excerpt: data.excerpt },
                            [author.email]
                        );
                    }
                } catch (emailError) {
                    console.error('Error sending article published email:', emailError);
                    // Don't fail the request if email fails
                }
            }

            res.json({ success: true, data, message: 'Article created successfully' });
        } catch (error) {
            console.error('Error creating article:', error);
            let errorMessage = 'Failed to create article';
            
            // Handle specific error types
            if (error.message) {
                errorMessage = error.message;
            } else if (error.details) {
                errorMessage = error.details;
            }
            
            // Check for payload size errors
            if (errorMessage.includes('413') || errorMessage.includes('too large') || errorMessage.includes('Payload')) {
                errorMessage = 'Article content or image is too large. Please reduce the image size or split the content into smaller sections.';
            }
            
            res.status(500).json({ success: false, error: errorMessage });
        }
    });

    // ============================================
    // GENERATE ARTICLE WITH AI
    // ============================================
    const { aiGenerationLimiter } = require('./middleware/rateLimiter');
    router.post('/generate-ai', verifyToken, aiGenerationLimiter, async (req, res) => {
        try {
            const { mainKeyword, secondKeywords, category_id, category_name, titleInstructions, contentInstructions } = req.body;

            if (!mainKeyword) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Main keyword is required' 
                });
            }

            const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
            if (!OPENAI_API_KEY) {
                console.error('OPENAI_API_KEY not found in environment variables');
                return res.status(500).json({ 
                    success: false, 
                    error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file.' 
                });
            }

            // Build keywords array
            const keywords = [mainKeyword];
            if (secondKeywords && secondKeywords.trim()) {
                const additionalKeywords = secondKeywords.split(',').map(k => k.trim()).filter(k => k);
                keywords.push(...additionalKeywords);
            }

            // Build the prompt with main and second keywords
            let prompt = `Write a comprehensive, SEO-optimized blog article.`;
            prompt += `\n\nPrimary Focus: "${mainKeyword}" - This should be the main focus and appear naturally throughout the article.`;
            
            if (secondKeywords && secondKeywords.trim()) {
                const additionalKeywords = secondKeywords.split(',').map(k => k.trim()).filter(k => k);
                prompt += `\n\nSecondary Keywords: ${additionalKeywords.join(', ')} - Include these keywords naturally throughout the article as well.`;
            }
            
            if (category_name) {
                prompt += `\n\nCategory: ${category_name}`;
            }

            // Add custom title instructions if provided
            if (titleInstructions && titleInstructions.trim()) {
                prompt += `\n\nTitle Requirements: ${titleInstructions}`;
            }

            // Add custom content instructions if provided
            if (contentInstructions && contentInstructions.trim()) {
                prompt += `\n\nContent Requirements: ${contentInstructions}`;
            }

            prompt += `\n\nGeneral Requirements:
- 1000-1200 words
- Engaging introduction paragraph with drop cap (first paragraph should have class="has-drop-cap")
- 4-5 main sections with subheadings (use <h2> or <h4 class="mb_head"> for main sections and <h3> for subsections)
- Proper HTML structure: Use <p> tags for paragraphs, <ul> and <li> for lists, <strong> for emphasis
- SEO-friendly content with natural keyword usage
- Include a conclusion paragraph
- DO NOT wrap content in any div - return clean HTML directly
- Use proper semantic HTML: <h2>, <h3>, <h4>, <p>, <ul>, <li>, <strong>, <em>

IMPORTANT - IMAGE PLACEMENT (OPTION 2 STYLE):
- Use DIFFERENT image placeholders for different images: [IMAGE_1], [IMAGE_2], [IMAGE_3], [IMAGE_4]
- DO NOT use [FEATURED_IMAGE_URL] - use the numbered placeholders instead
- Embed images within the content using the template's structure
- Use this format for images WITH text (side-by-side layout):
  <div class="single-post-content_text_media fl-wrap">
    <div class="row">
      <div class="col-md-6"><img src="[IMAGE_1]" alt="[DESCRIPTION]" class="respimg article-content-image"></div>
      <div class="col-md-6">
        <p>Text content here...</p>
        <p>More text...</p>
      </div>
    </div>
  </div>
- Or reverse layout (text left, image right):
  <div class="single-post-content_text_media fl-wrap">
    <div class="row">
      <div class="col-md-6">
        <p>Text content here...</p>
        <p>More text...</p>
      </div>
      <div class="col-md-6"><img src="[IMAGE_2]" alt="[DESCRIPTION]" class="respimg article-content-image"></div>
    </div>
  </div>
- Use blockquote for important quotes:
  <blockquote class="article-quote">
    <p>Quote text here...</p>
  </blockquote>
- Use info boxes:
  <div class="modern-info-box info"><h4>💡 Title</h4><p>Content...</p></div>
- Use lists with class="article-list":
  <ul class="article-list">
    <li>Item 1</li>
    <li>Item 2</li>
  </ul>
- Place images strategically: after the first paragraph, between sections, or after a heading
- Include 3-4 image placements throughout the article using DIFFERENT placeholders ([IMAGE_1], [IMAGE_2], [IMAGE_3], [IMAGE_4])
- Use various layouts (image left, image right, full-width)
- Add 2-3 blockquotes and 2-3 info boxes for visual variety

- Return ONLY HTML content, no markdown, no wrapper divs, no explanations`;

            console.log('Generating article with prompt:', prompt.substring(0, 200) + '...');

            // Call OpenAI API
            let openaiResponse;
            try {
                openaiResponse = await axios.post(
                    'https://api.openai.com/v1/chat/completions',
                    {
                        model: 'gpt-4o-mini',
                        messages: [
                            {
                                role: 'system',
                                content: 'You are a professional blog writer. Write engaging, well-structured articles in HTML format.'
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        max_tokens: 3000,
                        temperature: 0.7
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${OPENAI_API_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 60000 // 60 second timeout
                    }
                );
            } catch (apiError) {
                console.error('OpenAI API Error:', apiError.response?.data || apiError.message);
                if (apiError.response?.status === 401) {
                    return res.status(500).json({ 
                        success: false, 
                        error: 'Invalid OpenAI API key. Please check your API key in .env file.' 
                    });
                }
                if (apiError.response?.status === 429) {
                    return res.status(500).json({ 
                        success: false, 
                        error: 'OpenAI API rate limit exceeded. Please try again later.' 
                    });
                }
                if (apiError.code === 'ECONNREFUSED' || apiError.code === 'ETIMEDOUT') {
                    return res.status(500).json({ 
                        success: false, 
                        error: 'Cannot connect to OpenAI API. Please check your internet connection.' 
                    });
                }
                throw apiError;
            }

            if (!openaiResponse.data || !openaiResponse.data.choices || !openaiResponse.data.choices[0]) {
                return res.status(500).json({ 
                    success: false, 
                    error: 'Invalid response from OpenAI API' 
                });
            }

            let generatedContent = openaiResponse.data.choices[0].message.content;
            
            if (!generatedContent) {
                return res.status(500).json({ 
                    success: false, 
                    error: 'Empty response from OpenAI API' 
                });
            }

            // Clean up the content - remove wrapper divs if present
            generatedContent = generatedContent.trim();
            
            // Remove wrapper div class="post-content" if present (more precise removal)
            const postContentRegex = /<div\s+class\s*=\s*["']post-content["'][^>]*>/gi;
            if (postContentRegex.test(generatedContent)) {
                // Remove opening wrapper div
                generatedContent = generatedContent.replace(postContentRegex, '');
                // Remove closing wrapper div only if it's at the end
                generatedContent = generatedContent.replace(/<\/div>\s*$/gi, '');
            }
            
            // Remove any outer wrapper divs at start/end only
            generatedContent = generatedContent.replace(/^<div[^>]*>\s*/gi, '').replace(/\s*<\/div>$/gi, '').trim();

            // Replace placeholder image URLs with actual featured image URL
            // Note: We'll use a placeholder that will be replaced when the image is stored
            // For now, use a placeholder that will be replaced when image is available
            const placeholderImageUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23ddd" width="800" height="600"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage Loading...%3C/text%3E%3C/svg%3E';
            
            // Replace [FEATURED_IMAGE_URL] placeholder with actual image URL when available
            // For now, we'll store the placeholder and replace it later when image is generated
            generatedContent = generatedContent.replace(/\[FEATURED_IMAGE_URL\]/g, placeholderImageUrl);

            // Generate title with focus on main keyword and secondary keywords
            let title;
            try {
                let titlePrompt = `Generate a compelling, SEO-optimized blog article title.`;
                titlePrompt += `\n\nMain Keyword: "${mainKeyword}" - must be included in the title.`;
                if (secondKeywords && secondKeywords.trim()) {
                    const additionalKeywords = secondKeywords.split(',').map(k => k.trim()).filter(k => k);
                    titlePrompt += `\n\nSecondary Keywords: ${additionalKeywords.join(', ')} - include if possible.`;
                }
                if (category_name) {
                    titlePrompt += `\n\nCategory: ${category_name}`;
                }
                if (titleInstructions && titleInstructions.trim()) {
                    titlePrompt += `\n\nAdditional Requirements: ${titleInstructions}`;
                }
                titlePrompt += `\n\nReturn ONLY the title, no explanations, quotes, or markdown. Make it engaging and SEO-friendly.`;

                const titleResponse = await axios.post(
                    'https://api.openai.com/v1/chat/completions',
                    {
                        model: 'gpt-4o-mini',
                        messages: [
                            {
                                role: 'system',
                                content: 'You are a professional blog writer. Generate engaging, SEO-optimized article titles.'
                            },
                            {
                                role: 'user',
                                content: titlePrompt
                            }
                        ],
                        max_tokens: 100,
                        temperature: 0.7
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${OPENAI_API_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 30000
                    }
                );
                title = titleResponse.data.choices[0].message.content.trim().replace(/^["']|["']$/g, '');
            } catch (titleError) {
                console.error('Error generating title:', titleError);
                // Fallback to extraction method
                const titleMatch = generatedContent.match(/<h1[^>]*>(.*?)<\/h1>/i) || 
                                 generatedContent.match(/<h2[^>]*>(.*?)<\/h2>/i);
                if (titleMatch) {
                    title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
                } else {
                    title = mainKeyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                }
            }

            // Generate excerpt from content
            const textContent = generatedContent.replace(/<[^>]*>/g, '').trim();
            const excerpt = textContent.substring(0, 200) + (textContent.length > 200 ? '...' : '');

            // Generate JSON request for Fal.ai image generation
            let imagePromptParts = [];
            
            // Main subject based on keyword
            imagePromptParts.push(`A professional, high-quality featured image representing "${mainKeyword}"`);
            
            // Add category context if available
            if (category_name) {
                imagePromptParts.push(`in the context of ${category_name}`);
            }
            
            // Add secondary keywords if available
            if (secondKeywords && secondKeywords.trim()) {
                const additionalKeywords = secondKeywords.split(',').map(k => k.trim()).filter(k => k);
                imagePromptParts.push(`incorporating elements related to ${additionalKeywords.join(' and ')}`);
            }
            
            // Style and quality requirements
            imagePromptParts.push('Modern, visually appealing, suitable for a professional blog article');
            imagePromptParts.push('High resolution, sharp details, vibrant colors');
            imagePromptParts.push('No text, no watermark, no overlays');
            
            // Combine into final prompt
            const imagePrompt = imagePromptParts.join('. ') + '.';
            
            // Build the JSON request format
            const falAiRequest = {
                prompt: imagePrompt,
                image_size: 'square_hd',
                style: 'realistic_image',
                colors: []
            };
            
            // Log the JSON request format clearly
            console.log('\n' + '='.repeat(80));
            console.log('📝 FAL.AI REQUEST JSON:');
            console.log('='.repeat(80));
            console.log(JSON.stringify(falAiRequest, null, 2));
            console.log('='.repeat(80));
            console.log('📋 Copy the JSON above and use it in Fal.ai');
            console.log('📋 After generation, use endpoint to store image');
            console.log('='.repeat(80) + '\n');

            // Generate slug
            const baseSlug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
                .substring(0, 60);
            const now = new Date();
            const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
            const timeStr = now.toISOString().slice(11, 19).replace(/:/g, '');
            const slug = `${baseSlug}-${dateStr}-${timeStr}-${Math.floor(Math.random() * 10000)}`;

            res.json({
                success: true,
                data: {
                    title,
                    slug,
                    content: generatedContent,
                    excerpt,
                    featured_image: null, // No image yet - will be added via separate endpoint
                    category_id: category_id || null,
                    ai_generated: true,
                    meta_title: title,
                    meta_description: excerpt,
                    meta_keywords: keywords,
                    fal_ai_request: falAiRequest // Include JSON request in response
                }
            });
        } catch (error) {
            console.error('Error generating article with AI:', error);
            const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to generate article';
            console.error('Full error:', error);
            res.status(500).json({ 
                success: false, 
                error: errorMessage 
            });
        }
    });

    // ============================================
    // STORE IMAGE FROM FAL.AI JSON RESPONSE
    // ============================================
    router.post('/store-image-from-fal', verifyToken, async (req, res) => {
        try {
            const { article_id, fal_ai_response } = req.body;

            if (!article_id) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Article ID is required' 
                });
            }

            if (!fal_ai_response) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Fal.ai JSON response is required' 
                });
            }

            console.log('📥 Received Fal.ai JSON response for article:', article_id);
            console.log('📋 Response:', JSON.stringify(fal_ai_response, null, 2));

            // Extract image URL from response (handle different possible formats)
            let imageUrl = null;
            
            if (fal_ai_response.images && fal_ai_response.images[0]) {
                imageUrl = fal_ai_response.images[0].url || fal_ai_response.images[0];
            } else if (fal_ai_response.image_url) {
                imageUrl = fal_ai_response.image_url;
            } else if (fal_ai_response.output?.images && fal_ai_response.output.images[0]) {
                imageUrl = fal_ai_response.output.images[0].url || fal_ai_response.output.images[0];
            } else if (fal_ai_response.output?.image_url) {
                imageUrl = fal_ai_response.output.image_url;
            }

            if (!imageUrl) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Could not find image URL in JSON response' 
                });
            }

            console.log('🖼️  Image URL:', imageUrl);

            // Download image and convert to base64
            console.log('⬇️  Downloading image...');
            const imageResponse = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                timeout: 30000
            });

            // Convert to base64
            const imageBuffer = Buffer.from(imageResponse.data);
            const base64Image = imageBuffer.toString('base64');
            
            // Determine MIME type from response headers or URL
            const contentType = imageResponse.headers['content-type'] || 'image/png';
            const base64DataUri = `data:${contentType};base64,${base64Image}`;

            console.log('✅ Image converted to base64, size:', Math.round(base64Image.length / 1024), 'KB');

            // Get current article to update content with actual image
            const { data: articleData, error: fetchError } = await supabase
                .from('articles')
                .select('content')
                .eq('id', article_id)
                .single();

            let updatedContent = articleData?.content || '';
            
            // Replace placeholder image URLs in content with actual base64 image
            const placeholderRegex = /data:image\/svg\+xml[^"']+/gi;
            if (placeholderRegex.test(updatedContent)) {
                updatedContent = updatedContent.replace(placeholderRegex, base64DataUri);
            }
            
            // Also replace any [FEATURED_IMAGE_URL] placeholders
            updatedContent = updatedContent.replace(/\[FEATURED_IMAGE_URL\]/g, base64DataUri);

            // Update article with base64 image and updated content
            const { data, error } = await supabase
                .from('articles')
                .update({ 
                    featured_image: base64DataUri,
                    content: updatedContent,
                    updated_at: new Date().toISOString()
                })
                .eq('id', article_id)
                .select();

            if (error) {
                console.error('❌ Database error:', error);
                return res.status(500).json({ 
                    success: false, 
                    error: 'Failed to update article with image' 
                });
            }

            console.log('✅ Image stored successfully in article:', article_id);

            res.json({
                success: true,
                data: {
                    article_id,
                    image_stored: true,
                    image_size_kb: Math.round(base64Image.length / 1024)
                }
            });
        } catch (error) {
            console.error('Error storing image from Fal.ai:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to store image';
            res.status(500).json({ 
                success: false, 
                error: errorMessage 
            });
        }
    });

    // ============================================
    // GENERATE ARTICLE TITLE ONLY
    // ============================================
    router.post('/generate-title', verifyToken, async (req, res) => {
        try {
            const { keyword, keywordFocused, category_name, titleInstructions } = req.body;

            if (!keyword) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Keyword is required' 
                });
            }

            const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
            if (!OPENAI_API_KEY) {
                return res.status(500).json({ 
                    success: false, 
                    error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file.' 
                });
            }

            // Build title prompt
            let titlePrompt = `Generate a compelling blog article title about "${keyword}".`;
            
            if (keywordFocused) {
                titlePrompt += ` The title should include or focus on the keyword "${keyword}".`;
            }
            
            if (category_name) {
                titlePrompt += ` Category: ${category_name}.`;
            }

            if (titleInstructions && titleInstructions.trim()) {
                titlePrompt += ` ${titleInstructions}`;
            }

            titlePrompt += ` Return ONLY the title, no explanations, quotes, or markdown.`;

            try {
                const titleResponse = await axios.post(
                    'https://api.openai.com/v1/chat/completions',
                    {
                        model: 'gpt-4o-mini',
                        messages: [
                            {
                                role: 'system',
                                content: 'You are a professional blog writer. Generate engaging article titles.'
                            },
                            {
                                role: 'user',
                                content: titlePrompt
                            }
                        ],
                        max_tokens: 100,
                        temperature: 0.7
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${OPENAI_API_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 30000
                    }
                );

                let title = titleResponse.data.choices[0].message.content.trim().replace(/^["']|["']$/g, '');
                
                // Generate slug
                const baseSlug = title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '')
                    .substring(0, 60);
                const now = new Date();
                const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
                const timeStr = now.toISOString().slice(11, 19).replace(/:/g, '');
                const slug = `${baseSlug}-${dateStr}-${timeStr}-${Math.floor(Math.random() * 10000)}`;

                res.json({
                    success: true,
                    data: {
                        title,
                        slug,
                        meta_title: title,
                    }
                });
            } catch (apiError) {
                console.error('OpenAI API Error:', apiError.response?.data || apiError.message);
                if (apiError.response?.status === 401) {
                    return res.status(500).json({ 
                        success: false, 
                        error: 'Invalid OpenAI API key. Please check your API key in .env file.' 
                    });
                }
                if (apiError.response?.status === 429) {
                    return res.status(500).json({ 
                        success: false, 
                        error: 'OpenAI API rate limit exceeded. Please try again later.' 
                    });
                }
                throw apiError;
            }
        } catch (error) {
            console.error('Error generating title:', error);
            const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to generate title';
            res.status(500).json({ 
                success: false, 
                error: errorMessage 
            });
        }
    });

    // ============================================
    // GENERATE ARTICLE CONTENT ONLY
    // ============================================
    router.post('/generate-content', verifyToken, async (req, res) => {
        try {
            const { keyword, keywordFocused, category_id, category_name, contentInstructions } = req.body;

            if (!keyword) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Keyword is required' 
                });
            }

            const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
            if (!OPENAI_API_KEY) {
                return res.status(500).json({ 
                    success: false, 
                    error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file.' 
                });
            }

            // Build content prompt
            let prompt = `Write a comprehensive, SEO-optimized blog article about "${keyword}".`;
            
            if (keywordFocused) {
                prompt += ` Focus heavily on the keyword "${keyword}" and use it naturally throughout the article.`;
            }
            
            if (category_name) {
                prompt += ` Category: ${category_name}.`;
            }

            if (contentInstructions && contentInstructions.trim()) {
                prompt += `\n\nContent Requirements: ${contentInstructions}`;
            }

            prompt += `\n\nGeneral Requirements:
- 1000-1200 words
- Engaging introduction paragraph with drop cap (first paragraph should have class="has-drop-cap")
- 4-5 main sections with subheadings (use <h2> or <h4 class="mb_head"> for main sections and <h3> for subsections)
- Proper HTML structure: Use <p> tags for paragraphs, <ul> and <li> for lists, <strong> for emphasis
- SEO-friendly content with natural keyword usage
- Include a conclusion paragraph
- DO NOT wrap content in any div - return clean HTML directly
- Use proper semantic HTML: <h2>, <h3>, <h4>, <p>, <ul>, <li>, <strong>, <em>

IMPORTANT - IMAGE PLACEMENT (OPTION 2 STYLE):
- Use DIFFERENT image placeholders for different images: [IMAGE_1], [IMAGE_2], [IMAGE_3], [IMAGE_4]
- DO NOT use [FEATURED_IMAGE_URL] - use the numbered placeholders instead
- Embed images within the content using the template's structure
- Use this format for images WITH text (side-by-side layout):
  <div class="single-post-content_text_media fl-wrap">
    <div class="row">
      <div class="col-md-6"><img src="[IMAGE_1]" alt="[DESCRIPTION]" class="respimg article-content-image"></div>
      <div class="col-md-6">
        <p>Text content here...</p>
        <p>More text...</p>
      </div>
    </div>
  </div>
- Or reverse layout (text left, image right):
  <div class="single-post-content_text_media fl-wrap">
    <div class="row">
      <div class="col-md-6">
        <p>Text content here...</p>
        <p>More text...</p>
      </div>
      <div class="col-md-6"><img src="[IMAGE_2]" alt="[DESCRIPTION]" class="respimg article-content-image"></div>
    </div>
  </div>
- Use blockquote for important quotes:
  <blockquote class="article-quote">
    <p>Quote text here...</p>
  </blockquote>
- Use info boxes:
  <div class="modern-info-box info"><h4>💡 Title</h4><p>Content...</p></div>
- Use lists with class="article-list":
  <ul class="article-list">
    <li>Item 1</li>
    <li>Item 2</li>
  </ul>
- Place images strategically: after the first paragraph, between sections, or after a heading
- Include 3-4 image placements throughout the article using DIFFERENT placeholders ([IMAGE_1], [IMAGE_2], [IMAGE_3], [IMAGE_4])
- Use various layouts (image left, image right, full-width)
- Add 2-3 blockquotes and 2-3 info boxes for visual variety

- Return ONLY HTML content, no markdown, no wrapper divs, no explanations`;

            try {
                const openaiResponse = await axios.post(
                    'https://api.openai.com/v1/chat/completions',
                    {
                        model: 'gpt-4o-mini',
                        messages: [
                            {
                                role: 'system',
                                content: 'You are a professional blog writer. Write engaging, well-structured articles in HTML format.'
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        max_tokens: 3000,
                        temperature: 0.7
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${OPENAI_API_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 60000
                    }
                );

                let generatedContent = openaiResponse.data.choices[0].message.content;
                
                // Clean up the content - remove wrapper divs if present
                generatedContent = generatedContent.trim();
                
                // Remove wrapper div class="post-content" if present (more precise removal)
                const postContentRegex = /<div\s+class\s*=\s*["']post-content["'][^>]*>/gi;
                if (postContentRegex.test(generatedContent)) {
                    // Remove opening wrapper div
                    generatedContent = generatedContent.replace(postContentRegex, '');
                    // Remove closing wrapper div only if it's at the end
                    generatedContent = generatedContent.replace(/<\/div>\s*$/gi, '');
                }
                
                // Remove any outer wrapper divs at start/end only
                generatedContent = generatedContent.replace(/^<div[^>]*>\s*/gi, '').replace(/\s*<\/div>$/gi, '').trim();
                
                if (!generatedContent) {
                    return res.status(500).json({ 
                        success: false, 
                        error: 'Empty response from OpenAI API' 
                    });
                }

                // Generate excerpt from content
                const textContent = generatedContent.replace(/<[^>]*>/g, '').trim();
                const excerpt = textContent.substring(0, 200) + (textContent.length > 200 ? '...' : '');

                res.json({
                    success: true,
                    data: {
                        content: generatedContent,
                        excerpt,
                        meta_description: excerpt,
                    }
                });
            } catch (apiError) {
                console.error('OpenAI API Error:', apiError.response?.data || apiError.message);
                if (apiError.response?.status === 401) {
                    return res.status(500).json({ 
                        success: false, 
                        error: 'Invalid OpenAI API key. Please check your API key in .env file.' 
                    });
                }
                if (apiError.response?.status === 429) {
                    return res.status(500).json({ 
                        success: false, 
                        error: 'OpenAI API rate limit exceeded. Please try again later.' 
                    });
                }
                if (apiError.code === 'ECONNREFUSED' || apiError.code === 'ETIMEDOUT') {
                    return res.status(500).json({ 
                        success: false, 
                        error: 'Cannot connect to OpenAI API. Please check your internet connection.' 
                    });
                }
                throw apiError;
            }
        } catch (error) {
            console.error('Error generating content:', error);
            const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to generate content';
            res.status(500).json({ 
                success: false, 
                error: errorMessage 
            });
        }
    });

    // ============================================
    // GET ARTICLE VERSIONS
    // ============================================
    router.get('/:id/versions', verifyToken, async (req, res) => {
        try {
            const { id } = req.params;

            const { data, error } = await supabase
                .from('article_versions')
                .select('*, admin_users(email, name)')
                .eq('article_id', id)
                .order('version_number', { ascending: false });

            if (error) throw error;

            res.json({
                success: true,
                data: data || []
            });
        } catch (error) {
            console.error('Error fetching article versions:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // ============================================
    // GET SINGLE ARTICLE VERSION
    // ============================================
    router.get('/:id/versions/:versionId', verifyToken, async (req, res) => {
        try {
            const { id, versionId } = req.params;

            const { data, error } = await supabase
                .from('article_versions')
                .select('*')
                .eq('article_id', id)
                .eq('id', versionId)
                .single();

            if (error) throw error;

            res.json({
                success: true,
                data
            });
        } catch (error) {
            console.error('Error fetching article version:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // ============================================
    // RESTORE ARTICLE FROM VERSION
    // ============================================
    router.post('/:id/versions/:versionId/restore', verifyToken, async (req, res) => {
        try {
            const { id, versionId } = req.params;

            // Get version
            const { data: version, error: versionError } = await supabase
                .from('article_versions')
                .select('*')
                .eq('article_id', id)
                .eq('id', versionId)
                .single();

            if (versionError || !version) {
                return res.status(404).json({ success: false, error: 'Version not found' });
            }

            // Get current article
            const { data: currentArticle } = await supabase
                .from('articles')
                .select('*')
                .eq('id', id)
                .single();

            // Save current version before restoring
            if (currentArticle) {
                await saveArticleVersion(
                    supabase,
                    id,
                    currentArticle,
                    req.adminUser.id,
                    'Saved before restoring version ' + version.version_number
                );
            }

            // Restore article from version
            const restoreData = {
                title: version.title,
                slug: version.slug,
                content: version.content,
                excerpt: version.excerpt,
                featured_image: version.featured_image,
                meta_title: version.meta_title,
                meta_description: version.meta_description,
                meta_keywords: version.meta_keywords,
                reading_time: calculateReadingTime(version.content),
                updated_at: new Date().toISOString()
            };

            const { data: restoredArticle, error: restoreError } = await supabase
                .from('articles')
                .update(restoreData)
                .eq('id', id)
                .select()
                .single();

            if (restoreError) throw restoreError;

            // Log activity
            await logActivity(
                supabase,
                req.adminUser.id,
                req.adminUser.email,
                'restore_version',
                'article',
                id,
                restoredArticle.title,
                { version_number: version.version_number }
            );

            res.json({
                success: true,
                data: restoredArticle,
                message: `Article restored from version ${version.version_number}`
            });
        } catch (error) {
            console.error('Error restoring article version:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // ============================================
    // GET RELATED ARTICLES
    // ============================================
    router.get('/:id/related', async (req, res) => {
        try {
            const { id } = req.params;
            const { limit = 5 } = req.query;

            // Get article
            const { data: article, error: articleError } = await supabase
                .from('articles')
                .select('*')
                .eq('id', id)
                .single();

            if (articleError || !article) {
                return res.status(404).json({ success: false, error: 'Article not found' });
            }

            // Get related articles
            const relatedArticles = await getRelatedArticles(supabase, id, article, parseInt(limit));

            res.json({
                success: true,
                data: relatedArticles
            });
        } catch (error) {
            console.error('Error fetching related articles:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // ============================================
    // GET ARTICLE STATS
    // ============================================
    router.get('/stats/summary', verifyToken, async (req, res) => {
        try {
            // Get counts by status
            const { data: allArticles } = await supabase
                .from('articles')
                .select('status, view_count, ai_generated');

            const stats = {
                total: allArticles.length,
                published: allArticles.filter(a => a.status === 'published').length,
                draft: allArticles.filter(a => a.status === 'draft').length,
                archived: allArticles.filter(a => a.status === 'archived').length,
                totalViews: allArticles.reduce((sum, a) => sum + (a.view_count || 0), 0),
                aiGenerated: allArticles.filter(a => a.ai_generated).length,
                manual: allArticles.filter(a => !a.ai_generated).length
            };

            res.json({ success: true, data: stats });
        } catch (error) {
            console.error('Error fetching article stats:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    return router;
};

