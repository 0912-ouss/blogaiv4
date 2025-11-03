const express = require('express');
const router = express.Router();
const { handleSocialLogin } = require('./utils/socialAuth');

module.exports = (supabase, middleware) => {
    // ============================================
    // PUBLIC: Social Login Endpoints
    // ============================================

    // Google OAuth login
    router.post('/google', async (req, res) => {
        try {
            const { idToken } = req.body;

            if (!idToken) {
                return res.status(400).json({
                    success: false,
                    error: 'Google ID token is required'
                });
            }

            const result = await handleSocialLogin('google', idToken);

            res.json({
                success: true,
                token: result.token,
                user: result.user,
                message: 'Successfully authenticated with Google'
            });
        } catch (error) {
            console.error('Google login error:', error);
            res.status(401).json({
                success: false,
                error: error.message || 'Google authentication failed'
            });
        }
    });

    // Facebook OAuth login
    router.post('/facebook', async (req, res) => {
        try {
            const { accessToken } = req.body;

            if (!accessToken) {
                return res.status(400).json({
                    success: false,
                    error: 'Facebook access token is required'
                });
            }

            const result = await handleSocialLogin('facebook', accessToken);

            res.json({
                success: true,
                token: result.token,
                user: result.user,
                message: 'Successfully authenticated with Facebook'
            });
        } catch (error) {
            console.error('Facebook login error:', error);
            res.status(401).json({
                success: false,
                error: error.message || 'Facebook authentication failed'
            });
        }
    });

    // Twitter OAuth login
    router.post('/twitter', async (req, res) => {
        try {
            const { accessToken } = req.body;

            if (!accessToken) {
                return res.status(400).json({
                    success: false,
                    error: 'Twitter access token is required'
                });
            }

            const result = await handleSocialLogin('twitter', accessToken);

            res.json({
                success: true,
                token: result.token,
                user: result.user,
                message: 'Successfully authenticated with Twitter'
            });
        } catch (error) {
            console.error('Twitter login error:', error);
            res.status(401).json({
                success: false,
                error: error.message || 'Twitter authentication failed'
            });
        }
    });

    return router;
};

