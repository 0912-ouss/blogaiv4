// Vercel Serverless Function Wrapper for Express App
// This file adapts the Express server to work with Vercel's serverless functions

const app = require('../auto blog-appv1/server');

// Vercel serverless function handler
module.exports = (req, res) => {
    // Set Vercel environment flag
    process.env.VERCEL = '1';
    
    // Handle the request with Express app
    return app(req, res);
};

