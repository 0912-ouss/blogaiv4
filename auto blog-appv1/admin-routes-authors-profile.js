const express = require('express');
const router = express.Router();

module.exports = (supabase, middleware) => {
    // ============================================
    // GET AUTHOR PROFILE (Public endpoint)
    // ============================================
    router.get('/authors/:slug', async (req, res) => {
        try {
            const { slug } = req.params;

            // Get author by slug
            const { data: author, error: authorError } = await supabase
                .from('authors')
                .select('*')
                .eq('slug', slug)
                .single();

            if (authorError || !author) {
                return res.status(404).json({
                    success: false,
                    error: 'Author not found'
                });
            }

            // Get author's articles
            const { data: articles, error: articlesError } = await supabase
                .from('articles')
                .select('id, title, slug, excerpt, featured_image, published_at, view_count, categories(*)')
                .eq('author_id', author.id)
                .eq('status', 'published')
                .order('published_at', { ascending: false })
                .limit(20);

            if (articlesError) throw articlesError;

            // Get author statistics
            const { count: totalArticles } = await supabase
                .from('articles')
                .select('*', { count: 'exact', head: true })
                .eq('author_id', author.id)
                .eq('status', 'published');

            const { data: viewData } = await supabase
                .from('articles')
                .select('view_count')
                .eq('author_id', author.id)
                .eq('status', 'published');

            const totalViews = viewData?.reduce((sum, article) => sum + (article.view_count || 0), 0) || 0;

            return res.json({
                success: true,
                data: {
                    ...author,
                    articles: articles || [],
                    statistics: {
                        totalArticles: totalArticles || 0,
                        totalViews: totalViews,
                        averageViews: totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0
                    }
                }
            });
        } catch (error) {
            console.error('Error getting author profile:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get author profile'
            });
        }
    });

    // ============================================
    // GET AUTHOR'S ARTICLES
    // ============================================
    router.get('/authors/:slug/articles', async (req, res) => {
        try {
            const { slug } = req.params;
            const { page = 1, limit = 10 } = req.query;

            // Get author ID
            const { data: author, error: authorError } = await supabase
                .from('authors')
                .select('id')
                .eq('slug', slug)
                .single();

            if (authorError || !author) {
                return res.status(404).json({
                    success: false,
                    error: 'Author not found'
                });
            }

            const offset = (parseInt(page.toString()) - 1) * parseInt(limit.toString());

            // Get articles
            const { data: articles, error: articlesError, count } = await supabase
                .from('articles')
                .select('id, title, slug, excerpt, featured_image, published_at, view_count, categories(*)', { count: 'exact' })
                .eq('author_id', author.id)
                .eq('status', 'published')
                .order('published_at', { ascending: false })
                .range(offset, offset + parseInt(limit.toString()) - 1);

            if (articlesError) throw articlesError;

            return res.json({
                success: true,
                data: articles || [],
                pagination: {
                    page: parseInt(page.toString()),
                    limit: parseInt(limit.toString()),
                    total: count || 0,
                    totalPages: Math.ceil((count || 0) / parseInt(limit.toString()))
                }
            });
        } catch (error) {
            console.error('Error getting author articles:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get author articles'
            });
        }
    });

    return router;
};

