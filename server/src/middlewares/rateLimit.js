import rateLimit from 'express-rate-limit';

export const getLimiter = rateLimit({

  windowMs: 15 * 60 * 1000,

  max: 100,

  message: {
    message: 'Too many requests. Please try again later.'
  },

  standardHeaders: true,

  legacyHeaders: false

});

export const writeLimiter = rateLimit({

  windowMs: 15 * 60 * 1000,

  max: 25,

  message: {
    message: 'Too many write operations. Please try again later.'
  },

  standardHeaders: true,

  legacyHeaders: false

});

export const authLimiter = rateLimit({

  windowMs: 15 * 60 * 1000,

  max: 10,

  message: {
    message: 'Too many login attempts. Please try again later.'
  },

  standardHeaders: true,

  legacyHeaders: false

});