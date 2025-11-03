const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { sanitizeCommentContent, sanitizeText } = require('./utils/sanitize');
const { initializeEmailService, sendNotification } = require('./utils/emailService');
require('dotenv').config();

// Import rate limiters
const { 
    loginLimiter, 
    apiLimiter, 
    aiGenerationLimiter, 
    publicApiLimiter 
} = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration - Environment based
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com']
        : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(__dirname));

// Trust proxy for accurate IP addresses
app.set('trust proxy', true);

// Apply rate limiting to public APIs
app.use('/api/articles', publicApiLimiter);
app.use('/api/categories', publicApiLimiter);

// Supabase client
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase environment variables!');
    console.error('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Missing');
    console.error('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');
}

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// ============================================
// ADMIN ROUTES - Import and Setup
// ============================================
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Middleware: Verify JWT Token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.adminUser = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
};

// Helper: Log Activity
const logActivity = async (supabase, userId, userEmail, action, entityType, entityId, entityTitle, details = {}) => {
    try {
        await supabase.rpc('log_admin_activity', {
            p_user_id: userId,
            p_user_email: userEmail,
            p_action: action,
            p_entity_type: entityType,
            p_entity_id: entityId,
            p_entity_title: entityTitle,
            p_details: details,
            p_ip_address: null,
            p_user_agent: null
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

// Admin route middleware wrapper
const adminMiddleware = { verifyToken, logActivity };

// Initialize email service
initializeEmailService();

// Import and register admin routes
const adminAuthRoutes = require('./admin-routes')(supabase);
const adminArticlesRoutes = require('./admin-routes-articles')(supabase, adminMiddleware);
const adminAnalyticsRoutes = require('./admin-routes-analytics')(supabase, adminMiddleware);
const adminUsersRoutes = require('./admin-routes-users')(supabase, adminMiddleware);
const adminCategoriesRoutes = require('./admin-routes-categories')(supabase, adminMiddleware);
const adminCommentsRoutes = require('./admin-routes-comments')(supabase, adminMiddleware);
const adminSettingsRoutes = require('./admin-routes-settings')(supabase, adminMiddleware);
const adminMediaRoutes = require('./admin-routes-media')(supabase, adminMiddleware);
const adminSearchRoutes = require('./admin-routes-search')(supabase, adminMiddleware);
const adminActivityRoutes = require('./admin-routes-activity')(supabase, adminMiddleware);
const likesRoutes = require('./admin-routes-likes')(supabase, adminMiddleware);
const adminAnalyticsEnhancedRoutes = require('./admin-routes-analytics-enhanced')(supabase, adminMiddleware);
const authorsProfileRoutes = require('./admin-routes-authors-profile')(supabase, adminMiddleware);
const exportImportRoutes = require('./admin-routes-export-import')(supabase, adminMiddleware);
const adminEmailRoutes = require('./admin-routes-email')(supabase, adminMiddleware);
const adminChatRoutes = require('./admin-routes-chat')(supabase, adminMiddleware);
const adminNewsletterRoutes = require('./admin-routes-newsletter')(supabase, adminMiddleware);
const socialAuthRoutes = require('./admin-routes-social-auth')(supabase, adminMiddleware);

// Register admin routes
app.use('/api/admin', adminAuthRoutes);
app.use('/api/admin/articles', adminArticlesRoutes);
app.use('/api/admin/analytics', adminAnalyticsRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin/categories', adminCategoriesRoutes);
app.use('/api/admin/comments', adminCommentsRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/admin/media', adminMediaRoutes);
app.use('/api/admin/search', adminSearchRoutes);
app.use('/api/admin/activity', adminActivityRoutes);
app.use('/api', likesRoutes); // Public likes API
app.use('/api/admin/analytics', adminAnalyticsEnhancedRoutes);
app.use('/api', authorsProfileRoutes); // Public author profiles
app.use('/api/admin/articles', exportImportRoutes); // Export/Import routes
app.use('/api/admin/email', adminEmailRoutes);
app.use('/api/admin', adminChatRoutes);
app.use('/api/newsletter', adminNewsletterRoutes); // Public newsletter routes
app.use('/api/admin/newsletter', adminNewsletterRoutes); // Admin newsletter routes
app.use('/api/auth/social', socialAuthRoutes); // Social authentication routes
app.use('/api/analytics', adminAnalyticsEnhancedRoutes); // Public analytics tracking

// ============================================
// API: Get all articles (with category filter)
// ============================================
app.get('/api/articles', async (req, res) => {
    try {
        const { category } = req.query; // Accept category slug as query parameter
        
        let query = supabase
            .from('articles')
            .select('*, categories(*)')
            .eq('status', 'published')
            .order('published_at', { ascending: false });
        
        // Filter by category if provided
        if (category && category !== 'all') {
            // First, get the category by slug
            const { data: categoryData, error: categoryError } = await supabase
                .from('categories')
                .select('id')
                .eq('slug', category)
                .single();
            
            if (!categoryError && categoryData) {
                query = query.eq('category_id', categoryData.id);
            } else {
                // If category not found, return empty array
                return res.json({ success: true, data: [] });
            }
        }

        const { data, error } = await query;

        if (error) throw error;
        
        // Ensure categories are properly populated (fallback if join fails)
        const enrichedData = await Promise.all(data.map(async (article) => {
            // If categories is null but category_id exists, fetch category manually
            if (!article.categories && article.category_id) {
                const { data: categoryData } = await supabase
                    .from('categories')
                    .select('*')
                    .eq('id', article.category_id)
                    .single();
                if (categoryData) {
                    article.categories = categoryData;
                }
            }
            return article;
        }));
        
        res.json({ success: true, data: enrichedData });
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// API: Get single article by slug (with preview support)
// ============================================
app.get('/api/articles/:slug', async (req, res) => {
    try {
        const { preview } = req.query; // Allow preview mode for drafts
        
        let query = supabase
            .from('articles')
            .select('*, categories(*), authors(*)')
            .eq('slug', req.params.slug);
        
        // Only filter by published status if not in preview mode
        if (!preview) {
            query = query.eq('status', 'published');
        }
        
        const { data, error } = await query.single();

        if (error) throw error;
        
        // Ensure categories are properly populated (fallback if join fails)
        if (!data.categories && data.category_id) {
            const { data: categoryData } = await supabase
                .from('categories')
                .select('*')
                .eq('id', data.category_id)
                .single();
            if (categoryData) {
                data.categories = categoryData;
            }
        }

        // Update view count only for published articles
        if (data.status === 'published') {
            await supabase
                .from('articles')
                .update({ view_count: (data.view_count || 0) + 1 })
                .eq('id', data.id);
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching article:', error);
        res.status(404).json({ success: false, error: 'Article not found' });
    }
});

// ============================================
// API: Get related articles
// ============================================
app.get('/api/articles/:slug/related', async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        
        // Get current article
        const { data: currentArticle, error: articleError } = await supabase
            .from('articles')
            .select('category_id, meta_keywords, id')
            .eq('slug', req.params.slug)
            .eq('status', 'published')
            .single();

        if (articleError || !currentArticle) {
            return res.status(404).json({ success: false, error: 'Article not found' });
        }

        // Find related articles by category and keywords
        let query = supabase
            .from('articles')
            .select('id, title, slug, excerpt, featured_image, published_at, view_count, categories(*)')
            .eq('status', 'published')
            .neq('id', currentArticle.id)
            .limit(parseInt(limit));

        // Prioritize same category
        if (currentArticle.category_id) {
            query = query.eq('category_id', currentArticle.category_id);
        }

        const { data: relatedArticles, error } = await query;

        if (error) throw error;

        // If not enough articles from same category, get more
        if (!relatedArticles || relatedArticles.length < limit) {
            const remaining = parseInt(limit) - (relatedArticles?.length || 0);
            const excludeIds = [currentArticle.id, ...(relatedArticles?.map(a => a.id) || [])];
            
            const { data: additionalArticles } = await supabase
                .from('articles')
                .select('id, title, slug, excerpt, featured_image, published_at, view_count, categories(*)')
                .eq('status', 'published')
                .not('id', 'in', `(${excludeIds.join(',')})`)
                .order('published_at', { ascending: false })
                .limit(remaining);

            const allArticles = [...(relatedArticles || []), ...(additionalArticles || [])];
            return res.json({ success: true, data: allArticles.slice(0, parseInt(limit)) });
        }

        res.json({ success: true, data: relatedArticles });
    } catch (error) {
        console.error('Error fetching related articles:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// API: Get prev/next articles for navigation
// ============================================
app.get('/api/articles/:slug/navigation', async (req, res) => {
    try {
        const { data: currentArticle, error: currentError } = await supabase
            .from('articles')
            .select('id, published_at')
            .eq('slug', req.params.slug)
            .eq('status', 'published')
            .single();

        if (currentError || !currentArticle) {
            return res.status(404).json({ success: false, error: 'Article not found' });
        }

        // Get previous article (published before current)
        const { data: prevArticle } = await supabase
            .from('articles')
            .select('id, title, slug, featured_image, published_at')
            .eq('status', 'published')
            .lt('published_at', currentArticle.published_at)
            .order('published_at', { ascending: false })
            .limit(1)
            .single();

        // Get next article (published after current)
        const { data: nextArticle } = await supabase
            .from('articles')
            .select('id, title, slug, featured_image, published_at')
            .eq('status', 'published')
            .gt('published_at', currentArticle.published_at)
            .order('published_at', { ascending: true })
            .limit(1)
            .single();

        res.json({
            success: true,
            data: {
                prev: prevArticle || null,
                next: nextArticle || null
            }
        });
    } catch (error) {
        console.error('Error fetching navigation:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// API: Get comments for an article
// ============================================
app.get('/api/articles/:slug/comments', async (req, res) => {
    try {
        // First get the article ID
        const { data: article, error: articleError } = await supabase
            .from('articles')
            .select('id')
            .eq('slug', req.params.slug)
            .single();

        if (articleError || !article) {
            return res.status(404).json({ success: false, error: 'Article not found' });
        }

        // Get approved comments (parent comments only)
        const { data: comments, error: commentsError } = await supabase
            .from('comments')
            .select('*')
            .eq('article_id', article.id)
            .eq('status', 'approved')
            .is('parent_id', null)
            .order('created_at', { ascending: false });

        if (commentsError) throw commentsError;

        // Get replies for each comment
        const commentsWithReplies = await Promise.all(
            (comments || []).map(async (comment) => {
                const { data: replies } = await supabase
                    .from('comments')
                    .select('*')
                    .eq('parent_id', comment.id)
                    .eq('status', 'approved')
                    .order('created_at', { ascending: true });
                
                return {
                    ...comment,
                    replies: replies || []
                };
            })
        );

        res.json({ success: true, data: commentsWithReplies });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// API: Submit a comment
// ============================================
app.post('/api/articles/:slug/comments', async (req, res) => {
    try {
        const { name, email, content, parent_id } = req.body;

        if (!name || !email || !content) {
            return res.status(400).json({ 
                success: false, 
                error: 'Name, email, and content are required' 
            });
        }

        // Get article ID
        const { data: article, error: articleError } = await supabase
            .from('articles')
            .select('id')
            .eq('slug', req.params.slug)
            .single();

        if (articleError || !article) {
            return res.status(404).json({ success: false, error: 'Article not found' });
        }

        // Sanitize comment content
        const sanitizedName = sanitizeText(name.trim());
        const sanitizedEmail = sanitizeText(email.trim());
        const sanitizedContent = sanitizeCommentContent(content.trim());
        
        // Insert comment (pending moderation by default)
        const { data: comment, error: commentError } = await supabase
            .from('comments')
            .insert([{
                article_id: article.id,
                name: sanitizedName,
                email: sanitizedEmail,
                content: sanitizedContent,
                parent_id: parent_id || null,
                status: 'pending', // Requires admin approval
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (commentError) throw commentError;

        res.json({ 
            success: true, 
            data: comment,
            message: 'Comment submitted successfully. It will be visible after moderation.'
        });
    } catch (error) {
        console.error('Error submitting comment:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// API: Create new article (for n8n)
// ============================================
app.post('/api/articles', async (req, res) => {
    try {
        const { title, content, excerpt, category, featured_image, tags, slug: providedSlug } = req.body;

        // Validate required fields
        if (!title || !content) {
            return res.status(400).json({ 
                success: false, 
                error: 'Title and content are required' 
            });
        }

        // Generate unique slug from title (with date, time, milliseconds, and random number)
        const baseSlug = (providedSlug || title)
            .toLowerCase()
            .normalize('NFD')
            .replace(/ä/g, 'ae')
            .replace(/ö/g, 'oe')
            .replace(/ü/g, 'ue')
            .replace(/ß/g, 'ss')
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
            .substring(0, 60);

        // Create super unique slug: date-time-milliseconds-random
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // 20251008
        const timeStr = now.toISOString().slice(11, 19).replace(/:/g, ''); // 120530
        const msStr = now.getMilliseconds(); // 123
        const randomStr = Math.floor(Math.random() * 10000); // 5847
        
        const slug = `${baseSlug}-${dateStr}-${timeStr}-${msStr}-${randomStr}`;

        const articleData = {
            title,
            slug,
            content,
            excerpt: excerpt || content.substring(0, 200),
            category: category || 'general',
            featured_image: featured_image || null,
            tags: tags || [],
            status: 'published',
            published_at: new Date().toISOString(),
            ai_generated: true,
            view_count: 0
        };

        const { data, error } = await supabase
            .from('articles')
            .insert([articleData])
            .select()
            .single();

        if (error) throw error;

        res.json({ 
            success: true, 
            data,
            message: 'Article created successfully' 
        });
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// API: Get all categories
// ============================================
app.get('/api/categories', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');

        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// API: Public Search
// ============================================
app.use('/api/search', adminSearchRoutes);

// ============================================
// RSS FEED
// ============================================
const { generateRSSFeed, validateRSSFeed } = require('./utils/rssGenerator');
const { generateSitemap } = require('./utils/sitemapGenerator');

app.get('/api/rss', async (req, res) => {
    try {
        const { category_id, limit = 20, validate = false } = req.query;
        
        let query = supabase
            .from('articles')
            .select('*, categories(*), authors(*)')
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(parseInt(limit));

        if (category_id) {
            query = query.eq('category_id', category_id);
        }

        const { data: articles, error } = await query;

        if (error) throw error;

        // Get site settings for RSS config
        const { data: settings } = await supabase
            .from('site_settings')
            .select('setting_key, setting_value')
            .in('setting_key', ['site_title', 'site_description', 'site_url', 'site_email']);

        const siteConfig = {};
        if (settings) {
            settings.forEach(setting => {
                const key = setting.setting_key.replace('site_', '');
                siteConfig[key === 'title' ? 'title' : key === 'description' ? 'description' : key === 'url' ? 'link' : key === 'email' ? 'managingEditor' : key] = setting.setting_value;
            });
        }

        const rssXML = generateRSSFeed(articles || [], siteConfig);

        // Validate if requested
        if (validate === 'true') {
            const validation = validateRSSFeed(rssXML);
            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    error: 'RSS feed validation failed',
                    validation
                });
            }
        }

        res.set('Content-Type', 'application/rss+xml; charset=utf-8');
        res.send(rssXML);
    } catch (error) {
        console.error('Error generating RSS feed:', error);
        res.status(500).send('Error generating RSS feed');
    }
});

// RSS Feed validation endpoint
app.get('/api/rss/validate', async (req, res) => {
    try {
        const { category_id, limit = 20 } = req.query;
        
        let query = supabase
            .from('articles')
            .select('*, categories(*), authors(*)')
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(parseInt(limit));

        if (category_id) {
            query = query.eq('category_id', category_id);
        }

        const { data: articles, error } = await query;

        if (error) throw error;

        // Get site settings for RSS config
        const { data: settings } = await supabase
            .from('site_settings')
            .select('setting_key, setting_value')
            .in('setting_key', ['site_title', 'site_description', 'site_url', 'site_email']);

        const siteConfig = {};
        if (settings) {
            settings.forEach(setting => {
                const key = setting.setting_key.replace('site_', '');
                siteConfig[key === 'title' ? 'title' : key === 'description' ? 'description' : key === 'url' ? 'link' : key === 'email' ? 'managingEditor' : key] = setting.setting_value;
            });
        }

        const rssXML = generateRSSFeed(articles || [], siteConfig);
        const validation = validateRSSFeed(rssXML);

        return res.json({
            success: true,
            valid: validation.valid,
            errors: validation.errors,
            warnings: validation.warnings,
            feedUrl: `${req.protocol}://${req.get('host')}/api/rss`
        });
    } catch (error) {
        console.error('Error validating RSS feed:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to validate RSS feed'
        });
    }
});

app.get('/feed.xml', async (req, res) => {
    // Redirect to /api/rss for better compatibility
    res.redirect('/api/rss');
});

// ============================================
// XML SITEMAP
// ============================================
app.get('/sitemap.xml', async (req, res) => {
    try {
        // Get all published articles
        const { data: articles, error } = await supabase
            .from('articles')
            .select('slug, updated_at, published_at, created_at, is_featured, view_count')
            .eq('status', 'published')
            .order('published_at', { ascending: false });

        if (error) throw error;

        // Get site settings
        const { data: settings } = await supabase
            .from('site_settings')
            .select('setting_key, setting_value')
            .in('setting_key', ['site_url']);

        const siteUrl = settings?.find(s => s.setting_key === 'site_url')?.setting_value || 
                       process.env.SITE_URL || 
                       'http://localhost:3000';

        const sitemapXML = generateSitemap(articles || [], {
            siteUrl: siteUrl,
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: '0.8'
        });

        res.set('Content-Type', 'application/xml');
        res.send(sitemapXML);

    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.status(500).json({ success: false, error: 'Failed to generate sitemap' });
    }
});

// ============================================
// API: Get sitemap (JSON format)
// ============================================
app.get('/api/sitemap', async (req, res) => {
    try {
        const { data: articles, error } = await supabase
            .from('articles')
            .select('slug, updated_at, published_at, created_at, is_featured, view_count')
            .eq('status', 'published')
            .order('published_at', { ascending: false });

        if (error) throw error;

        const { data: settings } = await supabase
            .from('site_settings')
            .select('setting_key, setting_value')
            .in('setting_key', ['site_url']);

        const siteUrl = settings?.find(s => s.setting_key === 'site_url')?.setting_value || 
                       process.env.SITE_URL || 
                       'http://localhost:3000';

        const urls = articles.map(article => ({
            url: `${siteUrl}/article.html?slug=${article.slug}`,
            lastmod: article.updated_at || article.published_at || article.created_at,
            changefreq: 'weekly',
            priority: article.is_featured ? 1.0 : article.view_count > 1000 ? 0.9 : 0.8
        }));

        res.json({
            success: true,
            data: {
                siteUrl,
                urls: [
                    {
                        url: `${siteUrl}/index.html`,
                        lastmod: new Date().toISOString(),
                        changefreq: 'daily',
                        priority: 1.0
                    },
                    ...urls
                ]
            }
        });

    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.status(500).json({ success: false, error: 'Failed to generate sitemap' });
    }
});

// ============================================
// Health check endpoint
// ============================================
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Simple Blog API is running',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// ARTICLE SCHEDULER
// ============================================
const { startScheduler } = require('./jobs/articleScheduler');
// Only start scheduler if not on Vercel (serverless)
if (!process.env.VERCEL) {
    startScheduler();
}

// ============================================
// WebSocket Server Setup (skip on Vercel)
// ============================================
// WebSocket is not supported on Vercel serverless functions
if (!process.env.VERCEL) {
    const http = require('http');
    const { initializeWebSocket } = require('./utils/websocketServer');

    const httpServer = http.createServer(app);
    const io = initializeWebSocket(httpServer);

    // Make io available globally for use in routes
    app.set('io', io);

    // ============================================
    // Start server (only if not on Vercel)
    // ============================================
    httpServer.listen(PORT, () => {
        console.log('========================================');
        console.log('🚀 Simple Blog Server Running');
        console.log('========================================');
        console.log(`📖 Frontend: http://localhost:${PORT}/index.html`);
        console.log(`🔗 API Base: http://localhost:${PORT}/api`);
        console.log(`🔐 Admin Panel: http://localhost:3001 (React app)`);
        console.log(`⚡ WebSocket: ws://localhost:${PORT}`);
        console.log('');
        console.log('📡 Public APIs:');
        console.log('   • GET  /api/articles              - Get all articles');
        console.log('   • GET  /api/articles/:slug        - Get single article');
        console.log('   • GET  /api/articles/:slug/related - Get related articles');
        console.log('   • POST /api/articles               - Create new article');
        console.log('   • GET  /api/categories             - Get all categories');
        console.log('   • GET  /api/rss                    - RSS Feed');
        console.log('   • GET  /api/rss/validate           - RSS Feed Validation');
        console.log('   • GET  /feed.xml                   - RSS Feed (redirect)');
        console.log('   • GET  /api/health                 - Health check');
        console.log('');
        console.log('🔒 Admin APIs:');
        console.log('   • POST /api/admin/auth/login      - Admin login');
        console.log('   • GET  /api/admin/auth/verify     - Verify token');
        console.log('   • GET  /api/admin/analytics       - Dashboard stats');
        console.log('   • GET  /api/admin/articles        - Manage articles');
        console.log('   • GET  /api/admin/users           - Manage users');
        console.log('   • GET  /api/admin/categories      - Manage categories');
        console.log('   • GET  /api/admin/comments        - Moderate comments');
        console.log('   • GET  /api/admin/settings        - Site settings');
        console.log('   • GET  /api/admin/email/settings - Email settings');
        console.log('   • POST /api/admin/email/test     - Test email');
        console.log('========================================');
    });
} else {
    // On Vercel, set a dummy io object to prevent errors
    app.set('io', {
        emit: () => {},
        to: () => ({ emit: () => {} })
    });
    console.log('🚀 Running on Vercel - Serverless mode');
}

module.exports = app;

