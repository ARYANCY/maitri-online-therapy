const Joi = require('joi');
const logger = require('../utils/logger');

const envSchema = Joi.object({

  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(10000),
  HOST: Joi.string().default('localhost'),

  MONGODB_URI: Joi.string().uri().required(),
  MONGO_URI: Joi.string().uri().optional(), 

  CLIENT_URL: Joi.string().uri().required(),
  SERVER_URL: Joi.string().uri().optional(), 

  SESSION_SECRET: Joi.string().min(32).required(),
  SESSION_NAME: Joi.string().default('maitri.sid'),
  SESSION_MAX_AGE: Joi.number().default(24 * 60 * 60 * 1000),

  ADMIN_PASSWORD: Joi.string().min(8).required(),
  
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),

  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRE: Joi.string().default('7d'),

  GEMINI_API_KEYS: Joi.string().required(),

  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'http', 'debug')
    .default('info'),
  LOG_FILE_MAX_SIZE: Joi.string().default('20m'),
  LOG_FILE_MAX_FILES: Joi.string().default('14d'),

  RATE_LIMIT_WINDOW_MS: Joi.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),

  CORS_ORIGIN: Joi.string().optional(),
  TRUST_PROXY: Joi.boolean().default(false),
  FORCE_SECURE_COOKIES: Joi.boolean().default(false),

  ENABLE_METRICS: Joi.boolean().default(true),
  METRICS_PORT: Joi.number().port().default(9090),

  CLOUD_NAME: Joi.string().optional(),
  CLOUD_API_KEY: Joi.string().optional(),
  CLOUD_API_SECRET: Joi.string().optional(),
}).unknown(true);

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

  Object.keys(value).forEach(key => {
    process.env[key] = value[key];
  });

  logger.info('Environment configuration validated successfully');
  return value;
};

const getConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  return {
    server: {
      port: parseInt(process.env.PORT),
      host: process.env.HOST,
      env: process.env.NODE_ENV,
      isDevelopment,
      isProduction,
      isTest,
    },

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

    session: {
      secret: process.env.SESSION_SECRET,
      name: process.env.SESSION_NAME,
      maxAge: parseInt(process.env.SESSION_MAX_AGE),
      secure: process.env.FORCE_SECURE_COOKIES === 'true' || isProduction,
      httpOnly: true,
      sameSite: (process.env.FORCE_SECURE_COOKIES === 'true' || isProduction) ? 'none' : 'lax',
    },

    cors: {
      origin: process.env.CORS_ORIGIN || process.env.CLIENT_URL,
      credentials: true,
    },

    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS),
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS),
    },

    logging: {
      level: process.env.LOG_LEVEL,
      maxSize: process.env.LOG_FILE_MAX_SIZE,
      maxFiles: process.env.LOG_FILE_MAX_FILES,
    },

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
