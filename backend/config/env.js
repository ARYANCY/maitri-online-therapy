const Joi = require('joi');
const logger = require('../utils/logger');

/**
 * Environment configuration schema
 */
const envSchema = Joi.object({
  // Server configuration
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(5000),
  HOST: Joi.string().default('localhost'),

  // Database configuration
  MONGODB_URI: Joi.string().uri().required(),
  MONGO_URI: Joi.string().uri().optional(), // Alternative name

  // Client configuration
  CLIENT_URL: Joi.string().uri().required(),

  // Session configuration
  SESSION_SECRET: Joi.string().min(32).required(),
  SESSION_NAME: Joi.string().default('maitri.sid'),
  SESSION_MAX_AGE: Joi.number().default(24 * 60 * 60 * 1000), // 24 hours

  // Admin configuration
  ADMIN_PASSWORD: Joi.string().min(8).required(),
  ADMIN_EMAILS: Joi.string().optional(),

  // Google OAuth configuration
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),

  // JWT configuration
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRE: Joi.string().default('7d'),

  // Email configuration
  SMTP_HOST: Joi.string().optional(),
  SMTP_PORT: Joi.number().port().optional(),
  SMTP_USER: Joi.string().email().optional(),
  SMTP_PASS: Joi.string().optional(),
  SMTP_SECURE: Joi.boolean().default(false),
  FROM_EMAIL: Joi.string().email().optional(),

  // AI configuration
  GEMINI_API_KEYS: Joi.string().required(),

  // Logging configuration
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'http', 'debug')
    .default('info'),
  LOG_FILE_MAX_SIZE: Joi.string().default('20m'),
  LOG_FILE_MAX_FILES: Joi.string().default('14d'),

  // Rate limiting configuration
  RATE_LIMIT_WINDOW_MS: Joi.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),

  // Security configuration
  CORS_ORIGIN: Joi.string().optional(),
  TRUST_PROXY: Joi.boolean().default(false),

  // Monitoring configuration
  ENABLE_METRICS: Joi.boolean().default(true),
  METRICS_PORT: Joi.number().port().default(9090),
}).unknown(true); // Allow unknown environment variables

/**
 * Validate environment configuration
 */
const validateEnv = () => {
  const { error, value } = envSchema.validate(process.env, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessage = error.details
      .map(detail => `${detail.path.join('.')}: ${detail.message}`)
      .join('\n');
    
    logger.error('Environment validation failed:');
    logger.error(errorMessage);
    
    throw new Error(`Environment validation failed:\n${errorMessage}`);
  }

  // Set validated environment variables
  Object.keys(value).forEach(key => {
    process.env[key] = value[key];
  });

  logger.info('Environment configuration validated successfully');
  return value;
};

/**
 * Get environment-specific configuration
 */
const getConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  return {
    // Server
    server: {
      port: parseInt(process.env.PORT),
      host: process.env.HOST,
      env: process.env.NODE_ENV,
      isDevelopment,
      isProduction,
      isTest,
    },

    // Database
    database: {
      uri: process.env.MONGODB_URI || process.env.MONGO_URI,
      options: {
        maxPoolSize: isProduction ? 20 : 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferMaxEntries: 0,
        bufferCommands: false,
        retryWrites: true,
        retryReads: true,
      },
    },

    // Session
    session: {
      secret: process.env.SESSION_SECRET,
      name: process.env.SESSION_NAME,
      maxAge: parseInt(process.env.SESSION_MAX_AGE),
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'lax',
    },

    // CORS
    cors: {
      origin: process.env.CORS_ORIGIN || process.env.CLIENT_URL,
      credentials: true,
    },

    // Rate limiting
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS),
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS),
    },

    // Logging
    logging: {
      level: process.env.LOG_LEVEL,
      maxSize: process.env.LOG_FILE_MAX_SIZE,
      maxFiles: process.env.LOG_FILE_MAX_FILES,
    },

    // Security
    security: {
      trustProxy: process.env.TRUST_PROXY === 'true',
      enableHelmet: true,
      enableCORS: true,
    },
  };
};

module.exports = {
  validateEnv,
  getConfig,
};
