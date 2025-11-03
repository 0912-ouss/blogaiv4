const express = require('express');
const router = express.Router();
const { trackPageView, getAnalyticsSummary, trackGoogleAnalytics } = require('./utils/analyticsService');

module.exports = (supabase, middleware) => {
    const verifyToken = middleware.verifyToken;

    // ============================================
    // PUBLIC: Track page view
    // ============================================
    router.post('/track', async (req, res) => {
        try {
            const { articleId } = req.body;
            const analyticsData = await trackPageView(req, articleId);

            // Track in Google Analytics if configured
            if (process.env.GOOGLE_ANALYTICS_ID) {
                trackGoogleAnalytics('page_view', {
                    article_id: articleId,
                    url: req.originalUrl,
                    referer: req.headers.referer
                });
            }

            res.json({
                success: true,
                data: analyticsData
            });
        } catch (error) {
            console.error('Analytics tracking error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to track page view'
            });
        }
    });

    // ============================================
    // ADMIN: Get analytics summary
    // ============================================
    router.get('/summary', verifyToken, async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            const summary = await getAnalyticsSummary(startDate, endDate);

            res.json({
                success: true,
                data: summary
            });
        } catch (error) {
            console.error('Error getting analytics summary:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get analytics summary'
            });
        }
    });

    // ============================================
    // ADMIN: Get referral sources
    // ============================================
    router.get('/referrals', verifyToken, async (req, res) => {
        try {
            const { startDate, endDate } = req.query;

            let query = supabase
                .from('analytics_views')
                .select('referral_source, referral_medium')
                .order('timestamp', { ascending: false });

            if (startDate) {
                query = query.gte('timestamp', startDate);
            }
            if (endDate) {
                query = query.lte('timestamp', endDate);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Group by referral source
            const referrals = {};
            data?.forEach(view => {
                const key = `${view.referral_source || 'direct'}:${view.referral_medium || 'none'}`;
                referrals[key] = (referrals[key] || 0) + 1;
            });

            res.json({
                success: true,
                data: Object.entries(referrals)
                    .map(([key, count]) => {
                        const [source, medium] = key.split(':');
                        return { source, medium, count };
                    })
                    .sort((a, b) => b.count - a.count)
            });
        } catch (error) {
            console.error('Error getting referrals:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get referral sources'
            });
        }
    });

    // ============================================
    // ADMIN: Get geographic analytics
    // ============================================
    router.get('/geographic', verifyToken, async (req, res) => {
        try {
            const { startDate, endDate } = req.query;

            let query = supabase
                .from('analytics_views')
                .select('country, city, region')
                .order('timestamp', { ascending: false });

            if (startDate) {
                query = query.gte('timestamp', startDate);
            }
            if (endDate) {
                query = query.lte('timestamp', endDate);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Group by country
            const countries = {};
            const cities = {};

            data?.forEach(view => {
                const country = view.country || 'Unknown';
                countries[country] = (countries[country] || 0) + 1;

                if (view.city && view.city !== 'Unknown') {
                    const cityKey = `${view.city}, ${view.country}`;
                    cities[cityKey] = (cities[cityKey] || 0) + 1;
                }
            });

            res.json({
                success: true,
                data: {
                    countries: Object.entries(countries)
                        .map(([country, count]) => ({ country, count }))
                        .sort((a, b) => b.count - a.count),
                    topCities: Object.entries(cities)
                        .map(([city, count]) => ({ city, count }))
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 20)
                }
            });
        } catch (error) {
            console.error('Error getting geographic analytics:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get geographic analytics'
            });
        }
    });

    return router;
};
