// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Import required modules
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const flash = require('connect-flash');

// Import custom modules
const { validateEnv, getConfig } = require('./config/env');
const { connectDB } = require('./config/database');
const logger = require('./utils/logger');
const passport = require('./config/passport');
const { i18nMiddleware } = require('./utils/i18n');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { requestId, securityHeaders } = require('./middleware/security');
const { sanitizeInput } = require('./middleware/validation');
const { rateLimits } = require('./middleware/security');

// Import routes
const authRoutes = require('./routes/authRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const therapistRoutes = require('./routes/therapistRoutes');
const therapistAdminRoutes = require('./routes/therapistAdminRoutes');
const reportRoutes = require('./routes/reportRoutes');
const languageRoutes = require('./routes/languageRoutes');
const healthRoutes = require('./routes/healthRoutes');
const { requireLogin } = require('./middleware/authMiddleware');

// Validate environment configuration
try {
  validateEnv();
} catch (error) {
  logger.error('Environment validation failed:', error);
  process.exit(1);
}

// Get configuration
const config = getConfig();

// Create Express app
const app = express();

// Trust proxy (for production behind reverse proxy)
if (config.security.trustProxy) {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(helmet(config.security.enableHelmet ? {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
} : false));

// Compression middleware
app.use(compression());

// Request ID middleware
app.use(requestId);

// Security headers
app.use(securityHeaders);

// CORS configuration
if (config.security.enableCORS) {
  app.use(cors({
    origin: config.cors.origin,
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
    maxAge: 86400, // 24 hours
  }));
}

// Request logging
app.use(morgan('combined', { stream: logger.stream }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Rate limiting
app.use(rateLimits.general);

// Session configuration
app.use(
  session({
    secret: config.session.secret,
    name: config.session.name,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: config.database.uri,
      collectionName: 'sessions',
      ttl: config.session.maxAge / 1000, // Convert to seconds
      touchAfter: 24 * 3600, // Lazy session update
    }),
    cookie: {
      maxAge: config.session.maxAge,
      httpOnly: config.session.httpOnly,
      secure: config.session.secure,
      sameSite: config.session.sameSite,
      path: '/',
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash messages
app.use(flash());

// Internationalization middleware
app.use(i18nMiddleware);

// Health check routes (no rate limiting)
app.use('/health', healthRoutes);

// API routes with rate limiting
app.use('/auth', rateLimits.auth, authRoutes);
app.use('/api/chatbot', rateLimits.chat, requireLogin, chatbotRoutes);
app.use('/api/dashboard', requireLogin, dashboardRoutes);
app.use('/api/therapists', requireLogin, therapistRoutes);
app.use('/api/admin/therapists', rateLimits.admin, therapistAdminRoutes);
app.use('/api/reports', requireLogin, reportRoutes);
app.use('/api/language', requireLogin, languageRoutes);

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
  
  server.close(() => {
    logger.info('HTTP server closed.');
    
    // Close database connection
    require('mongoose').connection.close(false, () => {
      logger.info('MongoDB connection closed.');
      process.exit(0);
    });
  });
  
  // Force close after 10 seconds
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
    const server = app.listen(config.server.port, config.server.host, () => {
      logger.info(`🚀 Server running on ${config.server.host}:${config.server.port}`);
      logger.info(`📊 Environment: ${config.server.env}`);
      logger.info(`🔗 Health check: http://${config.server.host}:${config.server.port}/health`);
    });
    
    // Store server reference for graceful shutdown
    global.server = server;
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
