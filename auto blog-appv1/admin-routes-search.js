const express = require('express');
const router = express.Router();

// Import middleware (will be passed from main file)
let verifyToken, logActivity;

module.exports = (supabase, middleware) => {
    verifyToken = middleware.verifyToken;
    logActivity = middleware.logActivity;

    // ============================================
    // ADVANCED SEARCH - Get articles with filters
    // ============================================
    router.get('/search', verifyToken, async (req, res) => {
        try {
            const {
                query,
                category_id,
                author_id,
                status,
                tags,
                date_from,
                date_to,
                sort_by = 'published_at',
                sort_order = 'desc',
                page = 1,
                limit = 20
            } = req.query;

            let searchQuery = supabase
                .from('articles')
                .select('*, categories(*), authors(*), tags', { count: 'exact' });

            // Text search in title and content
            if (query) {
                searchQuery = searchQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`);
            }

            // Category filter
            if (category_id) {
                searchQuery = searchQuery.eq('category_id', category_id);
            }

            // Author filter
            if (author_id) {
                searchQuery = searchQuery.eq('author_id', author_id);
            }

            // Status filter
            if (status) {
                searchQuery = searchQuery.eq('status', status);
            }

            // Tags filter (array contains)
            if (tags) {
                const tagArray = Array.isArray(tags) ? tags : tags.split(',');
                searchQuery = searchQuery.contains('tags', tagArray);
            }

            // Date range filter
            if (date_from) {
                searchQuery = searchQuery.gte('published_at', date_from);
            }
            if (date_to) {
                searchQuery = searchQuery.lte('published_at', date_to);
            }

            // Sorting
            searchQuery = searchQuery.order(sort_by, { ascending: sort_order === 'asc' });

            // Pagination
            const from = (page - 1) * limit;
            const to = from + parseInt(limit) - 1;
            searchQuery = searchQuery.range(from, to);

            const { data, error, count } = await searchQuery;

            if (error) throw error;

            res.json({
                success: true,
                data: data || [],
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: count || 0,
                    totalPages: Math.ceil((count || 0) / limit)
                }
            });
        } catch (error) {
            console.error('Error in advanced search:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // ============================================
    // GET SEARCH SUGGESTIONS (Autocomplete)
    // ============================================
    router.get('/suggestions', async (req, res) => {
        try {
            const { q, limit = 10 } = req.query;

            if (!q || q.length < 2) {
                return res.json({ success: true, data: [] });
            }

            // Search titles and slugs
            const { data: articles, error } = await supabase
                .from('articles')
                .select('id, title, slug, excerpt, featured_image')
                .eq('status', 'published')
                .or(`title.ilike.%${q}%,slug.ilike.%${q}%`)
                .limit(parseInt(limit));

            if (error) throw error;

            // Also search categories
            const { data: categories } = await supabase
                .from('categories')
                .select('id, name, slug')
                .ilike('name', `%${q}%`)
                .limit(5);

            // Search tags
            const { data: tags } = await supabase
                .from('tags')
                .select('id, name, slug')
                .ilike('name', `%${q}%`)
                .limit(5);

            res.json({
                success: true,
                data: {
                    articles: articles || [],
                    categories: categories || [],
                    tags: tags || []
                }
            });
        } catch (error) {
            console.error('Error getting search suggestions:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    return router;
};
