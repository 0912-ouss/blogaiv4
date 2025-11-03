/**
 * Enhanced Analytics Service
 * Provides Google Analytics integration, referral tracking, and geographic analytics
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Track page view with enhanced analytics
const trackPageView = async (req, articleId = null) => {
    try {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';
        const referer = req.headers.referer || req.headers.referrer || 'direct';
        const url = req.originalUrl || req.url;
        
        // Extract referral source
        const referralSource = extractReferralSource(referer);
        
        // Get geographic data (requires IP geolocation service)
        const geoData = await getGeoLocation(ip);
        
        // Store analytics data
        const analyticsData = {
            article_id: articleId,
            ip_address: ip,
            user_agent: userAgent,
            referer: referer,
            referral_source: referralSource.source,
            referral_medium: referralSource.medium,
            url: url,
            country: geoData.country,
            city: geoData.city,
            region: geoData.region,
            timestamp: new Date().toISOString()
        };

        // Insert into analytics table (create if doesn't exist)
        const { error } = await supabase
            .from('analytics_views')
            .insert([analyticsData]);

        if (error && error.code !== '42P01') { // Ignore table doesn't exist error
            console.error('Analytics tracking error:', error);
        }

        return analyticsData;
    } catch (error) {
        console.error('Error tracking page view:', error);
        return null;
    }
};

// Extract referral source from referer URL
const extractReferralSource = (referer) => {
    if (!referer || referer === 'direct') {
        return { source: 'direct', medium: 'none' };
    }

    try {
        const url = new URL(referer);
        const hostname = url.hostname.toLowerCase();

        // Social media sources
        if (hostname.includes('facebook.com')) {
            return { source: 'facebook', medium: 'social' };
        }
        if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
            return { source: 'twitter', medium: 'social' };
        }
        if (hostname.includes('linkedin.com')) {
            return { source: 'linkedin', medium: 'social' };
        }
        if (hostname.includes('instagram.com')) {
            return { source: 'instagram', medium: 'social' };
        }
        if (hostname.includes('pinterest.com')) {
            return { source: 'pinterest', medium: 'social' };
        }
        if (hostname.includes('reddit.com')) {
            return { source: 'reddit', medium: 'social' };
        }

        // Search engines
        if (hostname.includes('google.com')) {
            return { source: 'google', medium: 'organic' };
        }
        if (hostname.includes('bing.com')) {
            return { source: 'bing', medium: 'organic' };
        }
        if (hostname.includes('yahoo.com')) {
            return { source: 'yahoo', medium: 'organic' };
        }
        if (hostname.includes('duckduckgo.com')) {
            return { source: 'duckduckgo', medium: 'organic' };
        }

        // Check for UTM parameters
        const utmSource = url.searchParams.get('utm_source');
        const utmMedium = url.searchParams.get('utm_medium');
        if (utmSource) {
            return { source: utmSource, medium: utmMedium || 'unknown' };
        }

        // External referrer
        return { source: hostname, medium: 'referral' };
    } catch (error) {
        return { source: 'unknown', medium: 'unknown' };
    }
};

// Get geographic location from IP (requires external service)
const getGeoLocation = async (ip) => {
    // For production, use a service like MaxMind GeoIP2, ipapi.co, or ip-api.com
    // This is a simplified version - you should integrate with a real geolocation service
    
    if (ip === 'unknown' || ip === '::1' || ip === '127.0.0.1') {
        return { country: 'Unknown', city: 'Unknown', region: 'Unknown' };
    }

    try {
        // Example: Using ip-api.com (free tier: 45 requests/minute)
        // Replace with your preferred geolocation service
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,regionName`);
        const data = await response.json();
        
        if (data.status === 'success') {
            return {
                country: data.country || 'Unknown',
                city: data.city || 'Unknown',
                region: data.regionName || 'Unknown'
            };
        }
    } catch (error) {
        console.error('Geolocation error:', error);
    }

    return { country: 'Unknown', city: 'Unknown', region: 'Unknown' };
};

// Get analytics summary
const getAnalyticsSummary = async (startDate, endDate) => {
    try {
        let query = supabase
            .from('analytics_views')
            .select('*', { count: 'exact' });

        if (startDate) {
            query = query.gte('timestamp', startDate);
        }
        if (endDate) {
            query = query.lte('timestamp', endDate);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Group by referral source
        const referralSources = {};
        const countries = {};
        const articles = {};

        data?.forEach(view => {
            // Referral sources
            const source = view.referral_source || 'direct';
            referralSources[source] = (referralSources[source] || 0) + 1;

            // Countries
            const country = view.country || 'Unknown';
            countries[country] = (countries[country] || 0) + 1;

            // Articles
            if (view.article_id) {
                articles[view.article_id] = (articles[view.article_id] || 0) + 1;
            }
        });

        return {
            totalViews: data?.length || 0,
            referralSources,
            countries,
            topArticles: Object.entries(articles)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([id, count]) => ({ articleId: parseInt(id), views: count }))
        };
    } catch (error) {
        console.error('Error getting analytics summary:', error);
        return null;
    }
};

// Google Analytics integration helper
const trackGoogleAnalytics = (event, data) => {
    // This would typically send data to Google Analytics via Measurement Protocol
    // or Google Analytics 4 API
    // For now, this is a placeholder that logs the event
    
    if (process.env.GOOGLE_ANALYTICS_ID) {
        console.log('Google Analytics Event:', {
            event,
            data,
            gaId: process.env.GOOGLE_ANALYTICS_ID
        });
        
        // In production, implement actual GA4 Measurement Protocol
        // Example: POST to https://www.google-analytics.com/mp/collect
    }
};

module.exports = {
    trackPageView,
    extractReferralSource,
    getGeoLocation,
    getAnalyticsSummary,
    trackGoogleAnalytics
};

