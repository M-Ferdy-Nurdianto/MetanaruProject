const rateLimit = require('express-rate-limit');

/**
 * Limit requests to 100 per 15 minutes for most APIs
 */
const standardLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased limit for development and heavy usage
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        error: 'Too many requests from this IP, please try again after 15 minutes'
    }
});

/**
 * Stricter limit for order creation to prevent spam
 */
const orderLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 requests per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Order limit reached. Please wait an hour before placing more orders.'
    }
});

module.exports = {
    standardLimiter,
    orderLimiter
};
