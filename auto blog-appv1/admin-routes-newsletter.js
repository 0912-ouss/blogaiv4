const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { sendEmail } = require('./utils/emailService');

let verifyToken;

module.exports = (supabase, middleware) => {
    verifyToken = middleware.verifyToken;

    // ============================================
    // PUBLIC: Subscribe to newsletter
    // ============================================
    router.post('/subscribe', async (req, res) => {
        try {
            const { email, name } = req.body;

            if (!email || !email.includes('@')) {
                return res.status(400).json({
                    success: false,
                    error: 'Valid email address is required'
                });
            }

            // Check if email already exists
            const { data: existing } = await supabase
                .from('newsletter_subscribers')
                .select('id, status')
                .eq('email', email.toLowerCase().trim())
                .single();

            if (existing) {
                if (existing.status === 'unsubscribed') {
                    // Re-subscribe
                    const unsubscribeToken = crypto.randomBytes(32).toString('hex');
                    const { error: updateError } = await supabase
                        .from('newsletter_subscribers')
                        .update({
                            status: 'active',
                            name: name || null,
                            subscribed_at: new Date().toISOString(),
                            unsubscribe_token: unsubscribeToken,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', existing.id);

                    if (updateError) throw updateError;

                    return res.json({
                        success: true,
                        message: 'Successfully re-subscribed to newsletter!',
                        data: { email: email.toLowerCase().trim() }
                    });
                } else {
                    return res.json({
                        success: true,
                        message: 'You are already subscribed!',
                        data: { email: email.toLowerCase().trim() }
                    });
                }
            }

            // Create new subscriber
            const unsubscribeToken = crypto.randomBytes(32).toString('hex');
            const { data, error } = await supabase
                .from('newsletter_subscribers')
                .insert([{
                    email: email.toLowerCase().trim(),
                    name: name || null,
                    status: 'active',
                    unsubscribe_token: unsubscribeToken,
                    source: 'website',
                    subscribed_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) {
                if (error.code === '23505') { // Unique constraint violation
                    return res.json({
                        success: true,
                        message: 'You are already subscribed!',
                        data: { email: email.toLowerCase().trim() }
                    });
                }
                throw error;
            }

            // Send welcome email (optional)
            try {
                const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
                await sendEmail({
                    to: email,
                    subject: 'Welcome to our Newsletter!',
                    html: `
                        <h2>Welcome!</h2>
                        <p>Thank you for subscribing to our newsletter. You'll receive the latest updates and articles.</p>
                        <p>If you no longer wish to receive emails, you can <a href="${siteUrl}/unsubscribe?token=${unsubscribeToken}">unsubscribe here</a>.</p>
                    `
                });
            } catch (emailError) {
                console.warn('Could not send welcome email:', emailError);
                // Don't fail the subscription if email fails
            }

            res.json({
                success: true,
                message: 'Successfully subscribed to newsletter!',
                data
            });

        } catch (error) {
            console.error('Newsletter subscription error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to subscribe to newsletter'
            });
        }
    });

    // ============================================
    // PUBLIC: Unsubscribe from newsletter
    // ============================================
    router.get('/unsubscribe', async (req, res) => {
        try {
            const { token, email } = req.query;

            if (!token && !email) {
                return res.status(400).json({
                    success: false,
                    error: 'Unsubscribe token or email is required'
                });
            }

            let query = supabase
                .from('newsletter_subscribers')
                .select('id, email, status');

            if (token) {
                query = query.eq('unsubscribe_token', token);
            } else {
                query = query.eq('email', email.toLowerCase().trim());
            }

            const { data: subscriber, error } = await query.single();

            if (error || !subscriber) {
                return res.status(404).json({
                    success: false,
                    error: 'Subscriber not found'
                });
            }

            if (subscriber.status === 'unsubscribed') {
                return res.json({
                    success: true,
                    message: 'You are already unsubscribed',
                    alreadyUnsubscribed: true
                });
            }

            // Unsubscribe
            const { error: updateError } = await supabase
                .from('newsletter_subscribers')
                .update({
                    status: 'unsubscribed',
                    unsubscribed_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', subscriber.id);

            if (updateError) throw updateError;

            res.json({
                success: true,
                message: 'Successfully unsubscribed from newsletter'
            });

        } catch (error) {
            console.error('Newsletter unsubscribe error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to unsubscribe'
            });
        }
    });

    // ============================================
    // ADMIN: Get all subscribers
    // ============================================
    router.get('/subscribers', verifyToken, async (req, res) => {
        try {
            const { page = 1, limit = 50, status, search } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            let query = supabase
                .from('newsletter_subscribers')
                .select('*', { count: 'exact' })
                .order('subscribed_at', { ascending: false });

            if (status) {
                query = query.eq('status', status);
            }

            if (search) {
                query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
            }

            const { data, error, count } = await query
                .range(offset, offset + parseInt(limit) - 1);

            if (error) throw error;

            res.json({
                success: true,
                data,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: count || 0,
                    totalPages: Math.ceil((count || 0) / parseInt(limit))
                }
            });

        } catch (error) {
            console.error('Error fetching subscribers:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch subscribers'
            });
        }
    });

    // ============================================
    // ADMIN: Delete subscriber
    // ============================================
    router.delete('/subscribers/:id', verifyToken, async (req, res) => {
        try {
            const { id } = req.params;

            const { error } = await supabase
                .from('newsletter_subscribers')
                .delete()
                .eq('id', id);

            if (error) throw error;

            res.json({
                success: true,
                message: 'Subscriber deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting subscriber:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete subscriber'
            });
        }
    });

    // ============================================
    // ADMIN: Create newsletter campaign
    // ============================================
    router.post('/campaigns', verifyToken, async (req, res) => {
        try {
            const { title, subject, content, scheduled_at, status = 'draft' } = req.body;

            if (!title || !subject || !content) {
                return res.status(400).json({
                    success: false,
                    error: 'Title, subject, and content are required'
                });
            }

            const { data, error } = await supabase
                .from('newsletter_campaigns')
                .insert([{
                    title,
                    subject,
                    content,
                    status,
                    scheduled_at: scheduled_at || null,
                    created_by: req.adminUser.id,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;

            res.json({
                success: true,
                data,
                message: 'Newsletter campaign created successfully'
            });

        } catch (error) {
            console.error('Error creating campaign:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create campaign'
            });
        }
    });

    // ============================================
    // ADMIN: Get all campaigns
    // ============================================
    router.get('/campaigns', verifyToken, async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('newsletter_campaigns')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            res.json({
                success: true,
                data
            });

        } catch (error) {
            console.error('Error fetching campaigns:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch campaigns'
            });
        }
    });

    // ============================================
    // ADMIN: Send campaign
    // ============================================
    router.post('/campaigns/:id/send', verifyToken, async (req, res) => {
        try {
            const { id } = req.params;

            // Get campaign
            const { data: campaign, error: campaignError } = await supabase
                .from('newsletter_campaigns')
                .select('*')
                .eq('id', id)
                .single();

            if (campaignError || !campaign) {
                return res.status(404).json({
                    success: false,
                    error: 'Campaign not found'
                });
            }

            // Get active subscribers
            const { data: subscribers, error: subscribersError } = await supabase
                .from('newsletter_subscribers')
                .select('id, email, name, unsubscribe_token')
                .eq('status', 'active');

            if (subscribersError) throw subscribersError;

            if (!subscribers || subscribers.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No active subscribers found'
                });
            }

            // Update campaign status
            await supabase
                .from('newsletter_campaigns')
                .update({
                    status: 'sending',
                    total_recipients: subscribers.length,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            // Send emails (in background)
            const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
            let sentCount = 0;
            let errorCount = 0;

            for (const subscriber of subscribers) {
                try {
                    const unsubscribeLink = `${siteUrl}/unsubscribe?token=${subscriber.unsubscribe_token}`;
                    const emailContent = campaign.content.replace(
                        /\[UNSUBSCRIBE_LINK\]/g,
                        unsubscribeLink
                    );

                    await sendEmail({
                        to: subscriber.email,
                        subject: campaign.subject,
                        html: emailContent
                    });

                    // Record send
                    await supabase
                        .from('newsletter_sends')
                        .insert([{
                            campaign_id: id,
                            subscriber_id: subscriber.id,
                            email: subscriber.email,
                            sent_at: new Date().toISOString()
                        }]);

                    sentCount++;
                } catch (emailError) {
                    console.error(`Error sending to ${subscriber.email}:`, emailError);
                    errorCount++;
                }
            }

            // Update campaign status
            await supabase
                .from('newsletter_campaigns')
                .update({
                    status: 'sent',
                    sent_at: new Date().toISOString(),
                    sent_count: sentCount,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            res.json({
                success: true,
                message: `Campaign sent to ${sentCount} subscribers`,
                data: {
                    sent: sentCount,
                    errors: errorCount,
                    total: subscribers.length
                }
            });

        } catch (error) {
            console.error('Error sending campaign:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to send campaign'
            });
        }
    });

    // ============================================
    // ADMIN: Get campaign statistics
    // ============================================
    router.get('/campaigns/:id/stats', verifyToken, async (req, res) => {
        try {
            const { id } = req.params;

            const { data: campaign } = await supabase
                .from('newsletter_campaigns')
                .select('*')
                .eq('id', id)
                .single();

            const { data: sends } = await supabase
                .from('newsletter_sends')
                .select('*')
                .eq('campaign_id', id);

            const opened = sends?.filter(s => s.opened_at).length || 0;
            const clicked = sends?.filter(s => s.clicked_at).length || 0;

            res.json({
                success: true,
                data: {
                    ...campaign,
                    stats: {
                        total: campaign?.total_recipients || 0,
                        sent: campaign?.sent_count || 0,
                        opened,
                        clicked,
                        openRate: campaign?.sent_count > 0 ? ((opened / campaign.sent_count) * 100).toFixed(2) : 0,
                        clickRate: campaign?.sent_count > 0 ? ((clicked / campaign.sent_count) * 100).toFixed(2) : 0
                    }
                }
            });

        } catch (error) {
            console.error('Error fetching campaign stats:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch campaign statistics'
            });
        }
    });

    return router;
};

