if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

const { validateEnv, getConfig } = require('./config/env');
const { connectDB } = require('./config/database');
const logger = require('./utils/logger');
const passport = require('./config/passport');
const { i18nMiddleware } = require('./utils/i18n');

const { errorHandler, notFound } = require('./middleware/errorHandler');
const { requestId, securityHeaders } = require('./middleware/security');
const { sanitizeInput } = require('./middleware/validation');
const { rateLimits } = require('./middleware/security');

const authRoutes = require('./routes/authRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const therapistRoutes = require('./routes/therapistRoutes');
const therapistAdminRoutes = require('./routes/therapistAdminRoutes');
const healthcareProfessionalRoutes = require('./routes/healthcareProfessionalRoutes');
const healthcareProfessionalAdminRoutes = require('./routes/healthcareProfessionalAdminRoutes');
const reportRoutes = require('./routes/reportRoutes');
const languageRoutes = require('./routes/languageRoutes');
const healthRoutes = require('./routes/healthRoutes');
const dementiaRoutes = require('./routes/dementiaRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { requireLogin } = require('./middleware/authMiddleware');

try {
  validateEnv();
} catch (error) {
  logger.error('Environment validation failed:', error);
  process.exit(1);
}

const config = getConfig();

const app = express();

app.set("trust proxy", 1);

const buildConnectSrc = () => {
  const sources = [
    "'self'",
    "https://maitri-online-therapy-1.onrender.com",
    "https://maitri-online-therapy.onrender.com",
    "https://app.maitri.cloud",
    "https://api.maitri.cloud",
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

app.use(helmet(config.security.enableHelmet ? {
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
} : false));

app.use(compression());

app.use(requestId);

app.use(securityHeaders);

app.use((req, res, next) => {
  const connectSrc = buildConnectSrc().join(' ');
  const cspHeader = 
    `default-src 'self'; ` +
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; ` +
    `font-src 'self' https://fonts.gstatic.com; ` +
    `img-src 'self' data: https:; ` +
    `script-src 'self' https://www.gstatic.com https://accounts.google.com https://apis.google.com; ` +
    `connect-src ${connectSrc} https://www.googleapis.com https://accounts.google.com https://www.gstatic.com; ` +
    `frame-src 'self' https://accounts.google.com https://www.google.com; ` +
    `object-src 'none'; ` +
    `base-uri 'self'; ` +
    `form-action 'self' https://accounts.google.com; ` +
    `frame-ancestors 'self'; ` +
    `script-src-attr 'none'; ` +
    `upgrade-insecure-requests`;
  
  res.setHeader('Content-Security-Policy', cspHeader);
  next();
});

const cookieDebug = require('./middleware/cookieDebug');
app.use(cookieDebug);

if (config.security.enableCORS) {
  const normalizeOrigin = (url) => {
    if (!url || typeof url !== 'string') return null;
    
    try {
      url = url.trim();
      if (!url) return null;
      
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      
      const u = new URL(url);
      return `${u.protocol}//${u.host.toLowerCase()}`;
    } catch (error) {
      logger.warn('[CORS] Invalid URL format:', { url, error: error.message });
      return null;
    }
  };

  const parseOriginsFromEnv = (envValue) => {
    if (!envValue || typeof envValue !== 'string') return [];
    
    return envValue
      .split(',')
      .map(origin => origin.trim())
      .filter(Boolean)
      .map(normalizeOrigin)
      .filter(Boolean);
  };

  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://app.maitri.cloud',
    'https://api.maitri.cloud',
    'https://maitri-online-therapy-1.onrender.com',
  ];

  const envOrigins = [
    ...parseOriginsFromEnv(process.env.CLIENT_URL),
    ...parseOriginsFromEnv(process.env.CORS_ORIGIN),
    ...parseOriginsFromEnv(process.env.CORS_ORIGINS),
  ];

  const allOrigins = [...defaultOrigins, ...envOrigins];
  const normalizedOriginsSet = new Set();
  
  allOrigins.forEach(origin => {
    const normalized = normalizeOrigin(origin);
    if (normalized) {
      normalizedOriginsSet.add(normalized);
    }
  });

  const normalizedOrigins = Array.from(normalizedOriginsSet).sort();

  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin) {
        if (config.server.isDevelopment) {
          logger.debug('[CORS] Request with no origin - allowing (development mode)');
        }
        return callback(null, true);
      }

      const normalized = normalizeOrigin(origin);
      
      if (!normalized) {
        logger.warn('[CORS] Invalid origin format:', { original: origin });
        return callback(new Error(`CORS: Invalid origin format: ${origin}`));
      }

      const isAllowed = normalizedOrigins.includes(normalized);
      
      if (isAllowed) {
        if (config.server.isDevelopment) {
          logger.debug('[CORS] Origin allowed:', { origin: normalized });
        }
        return callback(null, true);
      }

      logger.warn('[CORS] Origin blocked:', {
        origin: normalized,
        originalOrigin: origin,
        allowedCount: normalizedOrigins.length,
        environment: config.server.env,
      });

      const errorMessage = config.server.isDevelopment
        ? `CORS: Origin ${normalized} is not allowed. Allowed origins: ${normalizedOrigins.join(', ')}`
        : `CORS: Origin ${normalized} is not allowed by CORS policy`;

      return callback(new Error(errorMessage));
    },
    
    credentials: true,
    
    methods: [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'PATCH',
      'OPTIONS',
      'HEAD',
    ],
    
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Accept-Language',
      'X-Requested-With',
      'Origin',
      'X-CSRF-Token',
      'Cache-Control',
      'Pragma',
    ],
    
    exposedHeaders: [
      'X-Total-Count',
      'X-Page-Count',
      'Set-Cookie',
      'Content-Range',
      'X-Request-ID',
    ],
    
    maxAge: 86400,
    
    preflightContinue: false,
    
    optionsSuccessStatus: 204,
  };

  app.use(cors(corsOptions));

  logger.info('[CORS] CORS configuration initialized', {
    enabled: true,
    allowedOriginsCount: normalizedOrigins.length,
    credentials: true,
    environment: config.server.env,
    methods: corsOptions.methods.length,
    maxAge: corsOptions.maxAge,
  });

  if (config.server.isDevelopment || process.env.LOG_LEVEL === 'debug') {
    normalizedOrigins.forEach((origin, index) => {
      logger.info(`[CORS] Allowed origin ${index + 1}/${normalizedOrigins.length}: ${origin}`);
    });
  } else {
    if (normalizedOrigins.length > 0) {
      logger.info('[CORS] Allowed origins:', {
        count: normalizedOrigins.length,
        first: normalizedOrigins[0],
        last: normalizedOrigins[normalizedOrigins.length - 1],
      });
    }
  }
} else {
  logger.warn('[CORS] CORS is disabled in configuration');
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cookieParser());

app.use(sanitizeInput);

app.use(rateLimits.general);

const cookieConfig = {
  httpOnly: true,
  secure: config.session.secure,
  sameSite: config.session.sameSite,
  maxAge: config.session.maxAge,
  path: '/',
};

if (cookieConfig.sameSite === 'none' && !cookieConfig.secure) {
  logger.warn('[Session] SameSite=None requires Secure=true. Forcing secure cookies.');
  cookieConfig.secure = true;
}

logger.info('[Session] Cookie configuration', {
  secure: cookieConfig.secure,
  sameSite: cookieConfig.sameSite,
  httpOnly: cookieConfig.httpOnly,
  maxAge: cookieConfig.maxAge,
  environment: config.server.env,
});

app.use(
  session({
    secret: config.session.secret,
    name: config.session.name,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: config.database.uri,
      collectionName: 'sessions',
      ttl: config.session.maxAge / 1000,
      touchAfter: 24 * 3600,
    }),
    cookie: cookieConfig,
    rolling: false,
  })
);

logger.info('[Session] Session middleware configured', {
  sessionName: config.session.name,
  cookieConfig: {
    secure: cookieConfig.secure,
    sameSite: cookieConfig.sameSite,
    httpOnly: cookieConfig.httpOnly,
    maxAge: cookieConfig.maxAge,
    path: cookieConfig.path,
    domain: cookieConfig.domain || 'not set (correct for cross-site)'
  }
});

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(i18nMiddleware);

app.use((req, res, next) => {
  const isHealthCheck = req.path.startsWith('/health') || 
                       (req.path === '/' && (req.get('User-Agent')?.includes('Go-http-client') || 
                                            req.get('User-Agent')?.includes('curl') ||
                                            req.get('User-Agent')?.includes('Wget')));
  
  if (isHealthCheck) {
    return next();
  }
  
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    if (req.session && req.sessionID) {
      req.session.touch();
      req.session.save((err) => {
        if (err) {
          logger.error('[Session] Error saving session:', err);
        }
        originalEnd.call(this, chunk, encoding);
      });
    } else {
      originalEnd.call(this, chunk, encoding);
    }
  };
  
  next();
});

app.use('/health', healthRoutes);

app.use('/auth', rateLimits.auth, authRoutes);
app.use('/api/chatbot', rateLimits.chat, requireLogin, chatbotRoutes);
app.use('/api/dashboard', requireLogin, dashboardRoutes);
app.use('/api/doct', requireLogin, therapistRoutes);
app.use('/api/admin/doct', rateLimits.admin, therapistAdminRoutes);
app.use('/api/doch', rateLimits.general, healthcareProfessionalRoutes);
app.use('/api/admin/doch', rateLimits.admin, healthcareProfessionalAdminRoutes);
app.use('/api/reports', requireLogin, reportRoutes);
app.use('/api/language', requireLogin, languageRoutes);
app.use('/api/dementia', rateLimits.chat, requireLogin, dementiaRoutes);
app.use('/api/upload', requireLogin, uploadRoutes);
app.use('/api/notifications', requireLogin, notificationRoutes);

app.get('/', (req, res) => {
  const isHealthCheck = req.get('User-Agent')?.includes('Go-http-client') || 
                        req.get('User-Agent')?.includes('curl') ||
                        req.get('User-Agent')?.includes('Wget');
  
  if (isHealthCheck && req.session) {
    req.session.destroy(() => {});
  }
  
  res.json({
    message: 'Maitri API Server',
    version: process.env.npm_package_version || '1.0.0',
    environment: config.server.env,
    timestamp: new Date().toISOString(),
    status: 'running',
  });
});

app.use(notFound);

app.use(errorHandler);

const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  global.server.close(() => {
    logger.info('HTTP server closed.');
    
    require('mongoose').connection.close(false, () => {
      logger.info('MongoDB connection closed.');
      process.exit(0);
    });
  });

  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const startServer = async () => {
  try {
    await connectDB();
    
    const port = config.server.port || 10000;
    const host = config.server.isProduction ? '0.0.0.0' : (config.server.host || 'localhost');
    const server = app.listen(port, host, () => {
      logger.info(`🚀 Server running on ${host}:${port}`);
      logger.info(`📊 Environment: ${config.server.env}`);
      logger.info(`🔗 Health check: http://${host}:${port}/health`);
    });
    
    global.server = server;

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
