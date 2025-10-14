const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoURI) throw new Error('MongoDB URI is not defined in environment variables');

    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      retryWrites: true,
      retryReads: true,
      compressors: ['zlib'],
      zlibCompressionLevel: 6,
    };

    const conn = await mongoose.connect(mongoURI, options);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('connected', () => logger.info('Mongoose connected to MongoDB'));
    mongoose.connection.on('error', (err) => logger.error('Mongoose connection error:', err));
    mongoose.connection.on('disconnected', () => logger.warn('Mongoose disconnected from MongoDB'));

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('Mongoose connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

const checkDatabaseHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    return {
      status: states[state] || 'unknown',
      ready: state === 1,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return { status: 'error', ready: false, error: error.message };
  }
};

const getDatabaseStats = async () => {
  try {
    const stats = await mongoose.connection.db.stats();
    return {
      collections: stats.collections,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      indexSize: stats.indexSize,
      objects: stats.objects,
      avgObjSize: stats.avgObjSize,
    };
  } catch (error) {
    logger.error('Failed to get database stats:', error);
    return null;
  }
};

module.exports = { connectDB, checkDatabaseHealth, getDatabaseStats };
