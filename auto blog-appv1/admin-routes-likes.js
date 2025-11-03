const express = require('express');
const router = express.Router();

module.exports = (supabase, middleware) => {
    // ============================================
    // LIKE/UNLIKE ARTICLE (Public endpoint)
    // ============================================
    router.post('/articles/:articleId/like', async (req, res) => {
        try {
            const articleId = parseInt(req.params.articleId);
            const userIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const userId = req.body.userId || null; // Optional: for logged-in users

            if (!articleId) {
                return res.status(400).json({
                    success: false,
                    error: 'Article ID is required'
                });
            }

            // Check if article exists
            const { data: article, error: articleError } = await supabase
                .from('articles')
                .select('id, title')
                .eq('id', articleId)
                .single();

            if (articleError || !article) {
                return res.status(404).json({
                    success: false,
                    error: 'Article not found'
                });
            }

            // Check if already liked
            let checkQuery = supabase
                .from('article_likes')
                .select('id')
                .eq('article_id', articleId);

            if (userId) {
                checkQuery = checkQuery.eq('user_id', userId);
            } else {
                checkQuery = checkQuery.eq('user_ip', userIp);
            }

            const { data: existingLike, error: checkError } = await checkQuery.single();

            if (existingLike) {
                // Unlike: Remove the like
                const { error: deleteError } = await supabase
                    .from('article_likes')
                    .delete()
                    .eq('id', existingLike.id);

                if (deleteError) throw deleteError;

                // Get updated like count
                const { count } = await supabase
                    .from('article_likes')
                    .select('*', { count: 'exact', head: true })
                    .eq('article_id', articleId);

                return res.json({
                    success: true,
                    liked: false,
                    likeCount: count || 0,
                    message: 'Article unliked'
                });
            } else {
                // Like: Add the like
                const likeData = {
                    article_id: articleId,
                    user_ip: userId ? null : userIp,
                    user_id: userId || null
                };

                const { error: insertError } = await supabase
                    .from('article_likes')
                    .insert([likeData]);

                if (insertError) {
                    // Handle unique constraint violation
                    if (insertError.code === '23505') {
                        return res.status(400).json({
                            success: false,
                            error: 'Article already liked'
                        });
                    }
                    throw insertError;
                }

                // Get updated like count
                const { count } = await supabase
                    .from('article_likes')
                    .select('*', { count: 'exact', head: true })
                    .eq('article_id', articleId);

                return res.json({
                    success: true,
                    liked: true,
                    likeCount: count || 0,
                    message: 'Article liked'
                });
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to toggle like'
            });
        }
    });

    // ============================================
    // GET LIKE STATUS FOR ARTICLE
    // ============================================
    router.get('/articles/:articleId/like-status', async (req, res) => {
        try {
            const articleId = parseInt(req.params.articleId);
            const userIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const userId = req.query.userId || null;

            if (!articleId) {
                return res.status(400).json({
                    success: false,
                    error: 'Article ID is required'
                });
            }

            // Get like count
            const { count, error: countError } = await supabase
                .from('article_likes')
                .select('*', { count: 'exact', head: true })
                .eq('article_id', articleId);

            if (countError) throw countError;

            // Check if current user/IP has liked
            let checkQuery = supabase
                .from('article_likes')
                .select('id')
                .eq('article_id', articleId);

            if (userId) {
                checkQuery = checkQuery.eq('user_id', userId);
            } else {
                checkQuery = checkQuery.eq('user_ip', userIp);
            }

            const { data: userLike } = await checkQuery.single();

            return res.json({
                success: true,
                liked: !!userLike,
                likeCount: count || 0
            });
        } catch (error) {
            console.error('Error getting like status:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get like status'
            });
        }
    });

    // ============================================
    // GET MOST LIKED ARTICLES
    // ============================================
    router.get('/articles/most-liked', async (req, res) => {
        try {
            const { limit = 10 } = req.query;

            // Get articles with like counts
            const { data: articles, error } = await supabase
                .from('articles')
                .select(`
                    id,
                    title,
                    slug,
                    excerpt,
                    featured_image,
                    published_at,
                    view_count,
                    categories(name, slug)
                `)
                .eq('status', 'published')
                .order('published_at', { ascending: false })
                .limit(parseInt(limit) * 2); // Get more to filter

            if (error) throw error;

            // Get like counts for all articles
            const { data: likes, error: likesError } = await supabase
                .from('article_likes')
                .select('article_id');

            if (likesError) throw likesError;

            // Count likes per article
            const likeCounts = {};
            likes?.forEach(like => {
                likeCounts[like.article_id] = (likeCounts[like.article_id] || 0) + 1;
            });

            // Add like counts to articles and sort
            const articlesWithLikes = articles?.map(article => ({
                ...article,
                likeCount: likeCounts[article.id] || 0
            })).sort((a, b) => b.likeCount - a.likeCount).slice(0, parseInt(limit)) || [];

            return res.json({
                success: true,
                data: articlesWithLikes
            });
        } catch (error) {
            console.error('Error getting most liked articles:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get most liked articles'
            });
        }
    });

    // ============================================
    // GET LIKE COUNT FOR ARTICLE
    // ============================================
    router.get('/articles/:articleId/likes', async (req, res) => {
        try {
            const articleId = parseInt(req.params.articleId);

            const { count, error } = await supabase
                .from('article_likes')
                .select('*', { count: 'exact', head: true })
                .eq('article_id', articleId);

            if (error) throw error;

            return res.json({
                success: true,
                likeCount: count || 0
            });
        } catch (error) {
            console.error('Error getting like count:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get like count'
            });
        }
    });

    return router;
};

