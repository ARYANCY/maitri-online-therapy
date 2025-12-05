const rateLimit = require('express-rate-limit');
const cors = require('cors');
const helmet = require('helmet');
const crypto = require('crypto');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const rateLimits = {
  general: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
    },
  }),
  auth: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later.',
    },
  }),
  admin: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      code: 'ADMIN_RATE_LIMIT_EXCEEDED',
      message: 'Too many admin actions, please try again later.',
    },
  }),
  chat: rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      code: 'CHAT_RATE_LIMIT_EXCEEDED',
      message: 'Too many chatbot requests, please slow down.',
    },
  }),
  reminder: rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      code: 'REMINDER_RATE_LIMIT_EXCEEDED',
      message: 'Too many reminder requests, please slow down.',
    },
  }),
};

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://app.maitri.cloud',
  'https://api.maitri.cloud',
  'https://maitri-online-therapy-1.onrender.com',
  process.env.CLIENT_URL,
  process.env.CORS_ORIGIN,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
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

const buildConnectSrc = () => {
  const sources = [
    "'self'",
    "https://maitri-online-therapy-1.onrender.com",
    "https://maitri-online-therapy.onrender.com",
  ];
  
  if (process.env.CLIENT_URL && 
      typeof process.env.CLIENT_URL === 'string' && 
      process.env.CLIENT_URL.startsWith('http') &&
      process.env.CLIENT_URL !== 'NaN') {
    sources.push(process.env.CLIENT_URL);
  }
  
  if (process.env.CORS_ORIGIN && 
      typeof process.env.CORS_ORIGIN === 'string' && 
      process.env.CORS_ORIGIN.startsWith('http') &&
      process.env.CORS_ORIGIN !== 'NaN' &&
      !sources.includes(process.env.CORS_ORIGIN)) {
    sources.push(process.env.CORS_ORIGIN);
  }
  
  return sources;
};

const securityHeaders = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
});

const requestId = (req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
};

module.exports = {
  rateLimits,
  corsOptions,
  securityHeaders,
  requestId,
};
