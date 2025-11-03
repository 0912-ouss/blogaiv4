const express = require('express');
const router = express.Router();
const { sendNotification } = require('./utils/emailService');

let verifyToken, logActivity;

module.exports = (supabase, middleware) => {
    verifyToken = middleware.verifyToken;
    logActivity = middleware.logActivity;

    // Get all comments with filters
    router.get('/', verifyToken, async (req, res) => {
        try {
            const { status, article_id, page = 1, limit = 20 } = req.query;

            let query = supabase
                .from('comments')
                .select(`
                    *,
                    articles(id, title, slug)
                `, { count: 'exact' });

            if (status) {
                query = query.eq('status', status);
            }
            if (article_id) {
                query = query.eq('article_id', article_id);
            }

            const from = (page - 1) * limit;
            const to = from + parseInt(limit) - 1;

            const { data, error, count } = await query
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
            console.error('Error fetching comments:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Approve comment
    router.patch('/:id/approve', verifyToken, async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('comments')
                .update({ status: 'approved' })
                .eq('id', req.params.id)
                .select(`
                    *,
                    articles(id, title, slug, author_id, authors(email))
                `)
                .single();

            if (error) throw error;

            await logActivity(supabase, req.adminUser.id, req.adminUser.email, 'approve', 'comment', data.id, data.author_name || data.name);

            // Send email notification to commenter if email exists
            if (data.author_email || data.email) {
                try {
                    await sendNotification.commentApproved(
                        { author_name: data.author_name || data.name, content: data.content },
                        { title: data.articles?.title || '', slug: data.articles?.slug || '' },
                        data.author_email || data.email
                    );
                } catch (emailError) {
                    console.error('Error sending approval email:', emailError);
                }
            }

            // Send email notification to article author if different from commenter
            if (data.articles?.authors?.email && data.articles.authors.email !== (data.author_email || data.email)) {
                try {
                    await sendNotification.newComment(
                        { author_name: data.author_name || data.name, content: data.content },
                        { title: data.articles.title, slug: data.articles.slug },
                        data.articles.authors.email
                    );
                } catch (emailError) {
                    console.error('Error sending new comment email:', emailError);
                }
            }

            res.json({ success: true, data, message: 'Comment approved successfully' });
        } catch (error) {
            console.error('Error approving comment:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Mark as spam
    router.patch('/:id/spam', verifyToken, async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('comments')
                .update({ status: 'spam' })
                .eq('id', req.params.id)
                .select(`
                    *,
                    articles(id, title, slug)
                `)
                .single();

            if (error) throw error;

            await logActivity(supabase, req.adminUser.id, req.adminUser.email, 'mark_spam', 'comment', data.id, data.author_name || data.name);

            // Send email notification to commenter if email exists
            if (data.author_email || data.email) {
                try {
                    await sendNotification.commentRejected(
                        { author_name: data.author_name || data.name, content: data.content },
                        { title: data.articles?.title || '', slug: data.articles?.slug || '' },
                        data.author_email || data.email
                    );
                } catch (emailError) {
                    console.error('Error sending rejection email:', emailError);
                }
            }

            res.json({ success: true, data, message: 'Comment marked as spam' });
        } catch (error) {
            console.error('Error marking comment as spam:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Delete comment
    router.delete('/:id', verifyToken, async (req, res) => {
        try {
            const { data } = await supabase
                .from('comments')
                .select('author_name')
                .eq('id', req.params.id)
                .single();

            const { error } = await supabase
                .from('comments')
                .delete()
                .eq('id', req.params.id);

            if (error) throw error;

            await logActivity(supabase, req.adminUser.id, req.adminUser.email, 'delete', 'comment', req.params.id, data?.author_name);

            res.json({ success: true, message: 'Comment deleted successfully' });
        } catch (error) {
            console.error('Error deleting comment:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Bulk actions
    router.post('/bulk-action', verifyToken, async (req, res) => {
        try {
            const { action, commentIds } = req.body;

            if (!action || !commentIds || !Array.isArray(commentIds)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Invalid action or comment IDs' 
                });
            }

            let result;
            switch (action) {
                case 'approve':
                    result = await supabase
                        .from('comments')
                        .update({ status: 'approved' })
                        .in('id', commentIds);
                    break;
                case 'spam':
                    result = await supabase
                        .from('comments')
                        .update({ status: 'spam' })
                        .in('id', commentIds);
                    break;
                case 'delete':
                    result = await supabase
                        .from('comments')
                        .delete()
                        .in('id', commentIds);
                    break;
                default:
                    return res.status(400).json({ success: false, error: 'Invalid action' });
            }

            if (result.error) throw result.error;

            await logActivity(supabase, req.adminUser.id, req.adminUser.email, `bulk_${action}`, 'comment', null, `${commentIds.length} comments`);

            res.json({ success: true, message: `Bulk ${action} completed` });
        } catch (error) {
            console.error('Error in bulk action:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    return router;
};

