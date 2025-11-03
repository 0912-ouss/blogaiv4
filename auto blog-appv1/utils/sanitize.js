const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Create a window object for DOMPurify
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// ============================================
// HTML SANITIZATION UTILITIES
// ============================================

/**
 * Sanitize HTML content - allows safe HTML tags for blog articles
 * @param {string} dirty - Unsanitized HTML string
 * @param {object} options - Sanitization options
 * @returns {string} - Sanitized HTML string
 */
function sanitizeHTML(dirty, options = {}) {
    if (!dirty || typeof dirty !== 'string') {
        return '';
    }

    const defaultOptions = {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img', 'div', 'span',
            'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'section', 'article'
        ],
        ALLOWED_ATTR: [
            'href', 'title', 'alt', 'src', 'class', 'id', 'style', 'data-*',
            'width', 'height', 'target', 'rel'
        ],
        ALLOW_DATA_ATTR: true,
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
        KEEP_CONTENT: true,
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false,
        RETURN_TRUSTED_TYPE: false,
        SAFE_FOR_TEMPLATES: false,
        SANITIZE_DOM: true,
        IN_PLACE: false
    };

    const sanitizeOptions = { ...defaultOptions, ...options };

    return DOMPurify.sanitize(dirty, sanitizeOptions);
}

/**
 * Sanitize article content - allows more HTML tags for rich content
 * @param {string} dirty - Unsanitized HTML string
 * @returns {string} - Sanitized HTML string
 */
function sanitizeArticleContent(dirty) {
    return sanitizeHTML(dirty, {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img', 'div', 'span',
            'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'section', 'article',
            'figure', 'figcaption', 'iframe', 'video', 'audio', 'source'
        ],
        ALLOWED_ATTR: [
            'href', 'title', 'alt', 'src', 'class', 'id', 'style', 'data-*',
            'width', 'height', 'target', 'rel', 'frameborder', 'allowfullscreen',
            'controls', 'autoplay', 'loop', 'muted', 'poster'
        ]
    });
}

/**
 * Sanitize comment content - stricter rules for user comments
 * @param {string} dirty - Unsanitized HTML string
 * @returns {string} - Sanitized HTML string
 */
function sanitizeCommentContent(dirty) {
    return sanitizeHTML(dirty, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'code', 'pre'],
        ALLOWED_ATTR: ['href', 'title', 'rel']
    });
}

/**
 * Sanitize plain text - removes all HTML
 * @param {string} dirty - String that may contain HTML
 * @returns {string} - Plain text string
 */
function sanitizeText(dirty) {
    if (!dirty || typeof dirty !== 'string') {
        return '';
    }
    return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
}

/**
 * Sanitize URL - validates and sanitizes URLs
 * @param {string} url - URL string
 * @returns {string|null} - Sanitized URL or null if invalid
 */
function sanitizeURL(url) {
    if (!url || typeof url !== 'string') {
        return null;
    }
    
    try {
        // Remove any HTML tags
        const cleanURL = DOMPurify.sanitize(url, { ALLOWED_TAGS: [] });
        
        // Basic URL validation
        if (cleanURL.startsWith('http://') || 
            cleanURL.startsWith('https://') || 
            cleanURL.startsWith('mailto:') ||
            cleanURL.startsWith('/')) {
            return cleanURL;
        }
        
        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Sanitize object recursively - sanitizes all string values in an object
 * @param {object} obj - Object to sanitize
 * @param {function} sanitizer - Sanitization function to use
 * @returns {object} - Sanitized object
 */
function sanitizeObject(obj, sanitizer = sanitizeText) {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item, sanitizer));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizer(value);
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeObject(value, sanitizer);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
}

module.exports = {
    sanitizeHTML,
    sanitizeArticleContent,
    sanitizeCommentContent,
    sanitizeText,
    sanitizeURL,
    sanitizeObject,
    DOMPurify
};

