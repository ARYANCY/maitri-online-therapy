const rateLimit = require('express-rate-limit');
const cors = require('cors');
const helmet = require('helmet');
const crypto = require('crypto');

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Rate limiters for different parts of the application
const rateLimits = {
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Allow 200 requests per 15 minutes for general usage
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
    },
  }),
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Allow fewer requests for auth
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later.',
    },
  }),
  admin: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Admin endpoints allow more frequent interactions
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      code: 'ADMIN_RATE_LIMIT_EXCEEDED',
      message: 'Too many admin actions, please try again later.',
    },
  }),
  chat: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // Allow a reasonable number of requests for chatbot
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      code: 'CHAT_RATE_LIMIT_EXCEEDED',
      message: 'Too many chatbot requests, please slow down.',
    },
  }),
  reminder: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // Allow up to 20 requests per minute for reminder operations
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      code: 'REMINDER_RATE_LIMIT_EXCEEDED',
      message: 'Too many reminder requests, please slow down.',
    },
  }),
};

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://maitri.vercel.app',
  'https://maitri-frontend.vercel.app',
+ 'https://maitri-online-therapy.vercel.app',
  process.env.CLIENT_URL, // dynamically allow client URL from env if provided
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow REST tools or same-origin (no origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400,
};

// Security Headers Middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: [
        "'self'",
        'https://maitri.vercel.app',
        'https://maitri-frontend.vercel.app',
+       'https://maitri-online-therapy.vercel.app',
        'https://maitri-online-therapy.onrender.com',
        'https://maitri-online-therapy.onrender.com/',
      ],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Middleware to add a unique request ID
const requestId = (req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
};

// Exporting the modules
module.exports = {
  rateLimits,
  corsOptions,
  securityHeaders,
  requestId,
};
