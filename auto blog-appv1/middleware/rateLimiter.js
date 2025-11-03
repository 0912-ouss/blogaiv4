const rateLimit = require('express-rate-limit');

// ============================================
// RATE LIMITER MIDDLEWARES
// ============================================

// Login rate limiter - 5 attempts per 15 minutes
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
        success: false,
        error: 'Too many login attempts from this IP, please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests: false, // Count successful requests too
    skipFailedRequests: false, // Count failed requests
});

// API rate limiter - 100 requests per minute
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// AI Generation rate limiter - 10 articles per hour
const aiGenerationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 articles per hour
    message: {
        success: false,
        error: 'AI generation limit reached. Please try again in an hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
});

// Strict API limiter - 20 requests per minute (for sensitive operations)
const strictApiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 requests per minute
    message: {
        success: false,
        error: 'Too many requests. Please slow down'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Public API limiter - 200 requests per 15 minutes
const publicApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests per 15 minutes
    message: {
        success: false,
        error: 'Too many requests. Please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    loginLimiter,
    apiLimiter,
    aiGenerationLimiter,
    strictApiLimiter,
    publicApiLimiter
};

