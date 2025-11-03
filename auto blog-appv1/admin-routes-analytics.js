const express = require('express');
const router = express.Router();

let verifyToken;

module.exports = (supabase, middleware) => {
    verifyToken = middleware.verifyToken;

    // ============================================
    // DASHBOARD OVERVIEW STATS
    // ============================================
    router.get('/dashboard', verifyToken, async (req, res) => {
        try {
            // Get all articles with their data
            const { data: articles } = await supabase
                .from('articles')
                .select('status, view_count, published_at, ai_generated, comment_count');

            // Get total comments
            const { count: totalComments } = await supabase
                .from('comments')
                .select('*', { count: 'exact', head: true });

            // Get pending comments
            const { count: pendingComments } = await supabase
                .from('comments')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            // Get total categories
            const { count: totalCategories } = await supabase
                .from('categories')
                .select('*', { count: 'exact', head: true });

            // Get total authors
            const { count: totalAuthors } = await supabase
                .from('authors')
                .select('*', { count: 'exact', head: true });

            // Get daily stats for today
            const { data: dailyStats } = await supabase
                .from('daily_stats')
                .select('*')
                .eq('date', new Date().toISOString().split('T')[0])
                .single();

            // Calculate article stats
            const totalArticles = articles.length;
            const publishedArticles = articles.filter(a => a.status === 'published').length;
            const draftArticles = articles.filter(a => a.status === 'draft').length;
            const totalViews = articles.reduce((sum, a) => sum + (a.view_count || 0), 0);
            const aiGeneratedCount = articles.filter(a => a.ai_generated).length;

            // Get articles from last 30 days for growth calculation
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const recentArticles = articles.filter(a => 
                new Date(a.published_at) >= thirtyDaysAgo && a.status === 'published'
            );

            // Get articles from previous 30 days for comparison
            const sixtyDaysAgo = new Date();
            sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
            const previousMonthArticles = articles.filter(a => {
                const date = new Date(a.published_at);
                return date >= sixtyDaysAgo && date < thirtyDaysAgo && a.status === 'published';
            });

            // Calculate growth percentage
            const articlesGrowth = previousMonthArticles.length > 0
                ? ((recentArticles.length - previousMonthArticles.length) / previousMonthArticles.length * 100).toFixed(1)
                : 100;

            const stats = {
                articles: {
                    total: totalArticles,
                    published: publishedArticles,
                    draft: draftArticles,
                    aiGenerated: aiGeneratedCount,
                    growth: parseFloat(articlesGrowth)
                },
                views: {
                    total: totalViews,
                    average: totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0
                },
                comments: {
                    total: totalComments || 0,
                    pending: pendingComments || 0,
                    approved: (totalComments || 0) - (pendingComments || 0)
                },
                categories: {
                    total: totalCategories || 0
                },
                authors: {
                    total: totalAuthors || 0
                },
                daily: {
                    articlesCreated: dailyStats?.articles_created || 0,
                    dailyLimit: dailyStats?.daily_limit || 10,
                    underLimit: dailyStats?.under_limit !== false
                }
            };

            res.json({ success: true, data: stats });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // ============================================
    // ARTICLES OVER TIME (For charts)
    // ============================================
    router.get('/articles-over-time', verifyToken, async (req, res) => {
        try {
            const { days = 30 } = req.query;

            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(days));

            const { data: articles } = await supabase
                .from('articles')
                .select('published_at, status')
                .gte('published_at', startDate.toISOString())
                .eq('status', 'published')
                .order('published_at', { ascending: true });

            // Group by date
            const articlesByDate = {};
            articles.forEach(article => {
                const date = article.published_at.split('T')[0];
                articlesByDate[date] = (articlesByDate[date] || 0) + 1;
            });

            // Convert to array format for charts
            const chartData = Object.keys(articlesByDate).map(date => ({
                date,
                count: articlesByDate[date]
            }));

            res.json({ success: true, data: chartData });
        } catch (error) {
            console.error('Error fetching articles over time:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // ============================================
    // TOP PERFORMING ARTICLES
    // ============================================
    router.get('/top-articles', verifyToken, async (req, res) => {
        try {
            const { limit = 10, sortBy = 'view_count' } = req.query;

            const { data, error } = await supabase
                .from('articles')
                .select('id, title, slug, view_count, comment_count, published_at, categories(name)')
                .eq('status', 'published')
                .order(sortBy, { ascending: false })
                .limit(parseInt(limit));

            if (error) throw error;

            res.json({ success: true, data });
        } catch (error) {
            console.error('Error fetching top articles:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // ============================================
    // CATEGORY DISTRIBUTION
    // ============================================
    router.get('/category-distribution', verifyToken, async (req, res) => {
        try {
            const { data: articles } = await supabase
                .from('articles')
                .select('category_id, categories(name)')
                .eq('status', 'published');

            // Count articles per category
            const distribution = {};
            articles.forEach(article => {
                const categoryName = article.categories?.name || 'Uncategorized';
                distribution[categoryName] = (distribution[categoryName] || 0) + 1;
            });

            // Convert to array format
            const chartData = Object.keys(distribution).map(name => ({
                name,
                value: distribution[name]
            }));

            res.json({ success: true, data: chartData });
        } catch (error) {
            console.error('Error fetching category distribution:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // ============================================
    // VIEWS OVER TIME
    // ============================================
    router.get('/views-over-time', verifyToken, async (req, res) => {
        try {
            const { days = 30 } = req.query;

            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(days));

            // Note: This is a simplified version
            // In production, you'd want a separate table to track daily views
            const { data: articles } = await supabase
                .from('articles')
                .select('published_at, view_count')
                .gte('published_at', startDate.toISOString())
                .eq('status', 'published')
                .order('published_at', { ascending: true });

            // Simulate daily view growth (simplified)
            const viewsByDate = {};
            articles.forEach(article => {
                const date = article.published_at.split('T')[0];
                viewsByDate[date] = (viewsByDate[date] || 0) + (article.view_count || 0);
            });

            const chartData = Object.keys(viewsByDate).map(date => ({
                date,
                views: viewsByDate[date]
            }));

            res.json({ success: true, data: chartData });
        } catch (error) {
            console.error('Error fetching views over time:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // ============================================
    // ACTIVITY LOGS (Recent Admin Actions)
    // ============================================
    router.get('/activity-logs', verifyToken, async (req, res) => {
        try {
            const { limit = 50, page = 1 } = req.query;
            const from = (page - 1) * limit;
            const to = from + parseInt(limit) - 1;

            const { data, error, count } = await supabase
                .from('activity_logs')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            res.json({
                success: true,
                data,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: count,
                    totalPages: Math.ceil(count / limit)
                }
            });
        } catch (error) {
            console.error('Error fetching activity logs:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    return router;
};

