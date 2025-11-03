// Vercel Serverless Function Wrapper for Express App
// This file adapts the Express server to work with Vercel's serverless functions

// Set Vercel environment flag before requiring server
process.env.VERCEL = '1';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

let app;

try {
    // Load the Express app
    app = require('../auto blog-appv1/server');
} catch (error) {
    console.error('Error loading server:', error);
    // Return error handler if server fails to load
    module.exports = (req, res) => {
        console.error('Server failed to load:', error.message);
        res.status(500).json({
            success: false,
            error: 'Server initialization failed',
            message: error.message
        });
    };
    return;
}

// Vercel serverless function handler
module.exports = async (req, res) => {
    try {
        // Handle the request with Express app
        return app(req, res);
    } catch (error) {
        console.error('Function error:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }
};

