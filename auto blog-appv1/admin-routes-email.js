const express = require('express');
const router = express.Router();
const { sendEmail, emailTemplates } = require('./utils/emailService');

module.exports = (supabase, middleware) => {
    const verifyToken = middleware.verifyToken;

    // ============================================
    // GET EMAIL SETTINGS
    // ============================================
    router.get('/settings', verifyToken, async (req, res) => {
        try {
            // Get email-related settings
            const { data: settings, error } = await supabase
                .from('site_settings')
                .select('setting_key, setting_value')
                .in('setting_key', [
                    'email_host',
                    'email_port',
                    'email_user',
                    'email_from',
                    'email_service',
                    'email_enabled',
                    'notify_new_comments',
                    'notify_comment_approval',
                    'notify_article_published'
                ]);

            if (error) throw error;

            const emailSettings = {};
            settings?.forEach(setting => {
                emailSettings[setting.setting_key] = setting.setting_value;
            });

            return res.json({
                success: true,
                data: {
                    email_host: emailSettings.email_host || process.env.EMAIL_HOST || '',
                    email_port: emailSettings.email_port || process.env.EMAIL_PORT || '587',
                    email_user: emailSettings.email_user || process.env.EMAIL_USER || '',
                    email_from: emailSettings.email_from || process.env.EMAIL_FROM || '',
                    email_service: emailSettings.email_service || process.env.EMAIL_SERVICE || 'smtp',
                    email_enabled: emailSettings.email_enabled !== 'false',
                    notify_new_comments: emailSettings.notify_new_comments !== 'false',
                    notify_comment_approval: emailSettings.notify_comment_approval !== 'false',
                    notify_article_published: emailSettings.notify_article_published !== 'false',
                }
            });
        } catch (error) {
            console.error('Error getting email settings:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get email settings'
            });
        }
    });

    // ============================================
    // UPDATE EMAIL SETTINGS
    // ============================================
    router.post('/settings', verifyToken, async (req, res) => {
        try {
            const {
                email_host,
                email_port,
                email_user,
                email_password,
                email_from,
                email_service,
                email_enabled,
                notify_new_comments,
                notify_comment_approval,
                notify_article_published
            } = req.body;

            // Update settings in database
            const settingsToUpdate = [
                { setting_key: 'email_host', setting_value: email_host || '' },
                { setting_key: 'email_port', setting_value: email_port || '587' },
                { setting_key: 'email_user', setting_value: email_user || '' },
                { setting_key: 'email_from', setting_value: email_from || email_user || '' },
                { setting_key: 'email_service', setting_value: email_service || 'smtp' },
                { setting_key: 'email_enabled', setting_value: email_enabled ? 'true' : 'false' },
                { setting_key: 'notify_new_comments', setting_value: notify_new_comments ? 'true' : 'false' },
                { setting_key: 'notify_comment_approval', setting_value: notify_comment_approval ? 'true' : 'false' },
                { setting_key: 'notify_article_published', setting_value: notify_article_published ? 'true' : 'false' },
            ];

            // Update or insert each setting
            for (const setting of settingsToUpdate) {
                await supabase
                    .from('site_settings')
                    .upsert({
                        setting_key: setting.setting_key,
                        setting_value: setting.setting_value,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'setting_key'
                    });
            }

            // Note: Password should be stored in environment variable, not database
            // For now, we'll just validate the settings

            return res.json({
                success: true,
                message: 'Email settings updated successfully'
            });
        } catch (error) {
            console.error('Error updating email settings:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to update email settings'
            });
        }
    });

    // ============================================
    // TEST EMAIL
    // ============================================
    router.post('/test', verifyToken, async (req, res) => {
        try {
            const { to, subject, body } = req.body;

            if (!to) {
                return res.status(400).json({
                    success: false,
                    error: 'Recipient email is required'
                });
            }

            const result = await sendEmail({
                to: to,
                subject: subject || 'Test Email from Auto Blog',
                html: body || `
                    <h2>Test Email</h2>
                    <p>This is a test email from your Auto Blog system.</p>
                    <p>If you received this email, your email configuration is working correctly!</p>
                    <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
                `,
                text: body?.replace(/<[^>]*>/g, '') || 'This is a test email from your Auto Blog system.'
            });

            if (result.success) {
                return res.json({
                    success: true,
                    message: 'Test email sent successfully',
                    messageId: result.messageId
                });
            } else {
                return res.status(500).json({
                    success: false,
                    error: result.error || 'Failed to send test email'
                });
            }
        } catch (error) {
            console.error('Error sending test email:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to send test email: ' + error.message
            });
        }
    });

    // ============================================
    // PREVIEW EMAIL TEMPLATE
    // ============================================
    router.get('/template/:type', verifyToken, async (req, res) => {
        try {
            const { type } = req.params;
            const { article_id, comment_id } = req.query;

            // Mock data for preview
            const mockArticle = {
                title: 'Sample Article Title',
                slug: 'sample-article',
                excerpt: 'This is a sample article excerpt for email preview.',
                content: '<p>This is sample article content.</p>'
            };

            const mockComment = {
                author_name: 'John Doe',
                content: 'This is a sample comment for email preview.',
                email: 'commenter@example.com'
            };

            let template;

            switch (type) {
                case 'new-comment':
                    template = emailTemplates.newComment(mockComment, mockArticle);
                    break;
                case 'article-published':
                    template = emailTemplates.articlePublished(mockArticle, []);
                    break;
                case 'comment-approved':
                    template = emailTemplates.commentApproved(mockComment, mockArticle);
                    break;
                case 'comment-rejected':
                    template = emailTemplates.commentRejected(mockComment, mockArticle);
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid template type'
                    });
            }

            return res.json({
                success: true,
                data: {
                    subject: template.subject,
                    html: template.html,
                    text: template.text
                }
            });
        } catch (error) {
            console.error('Error getting email template:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get email template'
            });
        }
    });

    return router;
};

