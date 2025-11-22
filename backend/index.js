if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const flash = require('connect-flash');

const { validateEnv, getConfig } = require('./config/env');
const { connectDB } = require('./config/database');
const logger = require('./utils/logger');
const passport = require('./config/passport');
const { i18nMiddleware } = require('./utils/i18n');
const { initReminderScheduler } = require('./controllers/reminderController');

const { errorHandler, notFound } = require('./middleware/errorHandler');
const { requestId, securityHeaders } = require('./middleware/security');
const { sanitizeInput } = require('./middleware/validation');
const { rateLimits } = require('./middleware/security');

const authRoutes = require('./routes/authRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const therapistRoutes = require('./routes/therapistRoutes');
const therapistAdminRoutes = require('./routes/therapistAdminRoutes');
const reportRoutes = require('./routes/reportRoutes');
const languageRoutes = require('./routes/languageRoutes');
const reminderRoutes = require('./routes/reminder');
const healthRoutes = require('./routes/healthRoutes');
const dementiaRoutes = require('./routes/dementiaRoutes');
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


app.use(helmet(config.security.enableHelmet ? {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: [
        "'self'",
        config.cors.origin,
        process.env.CLIENT_URL,
        "https://maitri-online-therapy.vercel.app",
        "https://maitri-online-therapy.onrender.com",
      ].filter(Boolean),


      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
} : false));

app.use(compression());

app.use(requestId);

app.use(securityHeaders);

  if (config.security.enableCORS) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://maitri-online-therapy.vercel.app',
      'https://maitri-online-therapy.vercel.app/',
      'https://maitri-online-therapy.onrender.com',
      'https://maitri-online-therapy.onrender.com/',
      process.env.CLIENT_URL,
    ].filter(Boolean);

  app.use(cors({
    origin: function (origin, callback) {
      const normalize = (url) => {
        try { const u = new URL(url); return `${u.protocol}//${u.host}`; } catch { return url?.replace(/\/+$/, ''); }
      };
      const allowed = new Set(allowedOrigins.map(normalize));
      if (!origin) return callback(null, true);
      const normalized = normalize(origin);
      if (allowed.has(normalized)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
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
  }));
}


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(sanitizeInput);

app.use(rateLimits.general);

app.use(
  session({
    secret: config.session.secret,
    name: config.session.name,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: config.database.uri,
      collectionName: 'sessions',
      ttl: config.session.maxAge / 1000,
      touchAfter: 24 * 3600,
    }),
    cookie: {
      maxAge: config.session.maxAge,
      httpOnly: config.session.httpOnly,
      secure: config.server.env === 'production',
      sameSite: config.server.env === 'production' ? 'none' : 'lax',
      path: '/',
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(i18nMiddleware);

app.use('/health', healthRoutes);

// API routes with rate limiting
app.use('/auth', rateLimits.auth, authRoutes);
app.use('/api/chatbot', rateLimits.chat, requireLogin, chatbotRoutes);
app.use('/api/dashboard', requireLogin, dashboardRoutes);
app.use('/api/therapists', requireLogin, therapistRoutes);
app.use('/api/admin/therapists', rateLimits.admin, therapistAdminRoutes);
app.use('/api/reports', requireLogin, reportRoutes);
app.use('/api/language', requireLogin, languageRoutes);
app.use('/api/reminders', requireLogin, reminderRoutes);
app.use('/api/dementia', rateLimits.chat, requireLogin, dementiaRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Maitri API Server',
    version: process.env.npm_package_version || '1.0.0',
    environment: config.server.env,
    timestamp: new Date().toISOString(),
    status: 'running',
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Graceful shutdown handling
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


// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start HTTP server
    const port = config.server.port || 10000;
    const host = config.server.isProduction ? '0.0.0.0' : (config.server.host || 'localhost');
    const server = app.listen(port, host, () => {
      logger.info(`🚀 Server running on ${host}:${port}`);
      logger.info(`📊 Environment: ${config.server.env}`);
      logger.info(`🔗 Health check: http://${host}:${port}/health`);
    });
    
    // Store server reference for graceful shutdown
    global.server = server;

    // Initialize reminder scheduler
    initReminderScheduler();
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
