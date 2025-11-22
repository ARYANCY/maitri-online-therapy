const express = require('express');
const router = express.Router();
const { checkDatabaseHealth, getDatabaseStats } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Basic health check endpoint
 */
router.get('/', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Check database health
    const dbHealth = await checkDatabaseHealth();
    
    const responseTime = Date.now() - startTime;
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      responseTime: `${responseTime}ms`,
      database: dbHealth,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
      pid: process.pid,
    };

    // Determine overall health status
    if (!dbHealth.ready) {
      health.status = 'unhealthy';
      health.database.status = 'error';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

/**
 * Detailed health check endpoint
 */
router.get('/detailed', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Check database health
    const dbHealth = await checkDatabaseHealth();
    const dbStats = await getDatabaseStats();
    
    const responseTime = Date.now() - startTime;
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      responseTime: `${responseTime}ms`,
      database: {
        ...dbHealth,
        stats: dbStats,
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
      cpu: {
        usage: process.cpuUsage(),
        loadAverage: process.platform !== 'win32' ? require('os').loadavg() : null,
      },
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        pid: process.pid,
        uptime: process.uptime(),
      },
      services: {
        database: dbHealth.ready ? 'up' : 'down',
        api: 'up',
        scheduler: 'up', // Assuming reminder scheduler is running
      },
    };

    // Determine overall health status
    if (!dbHealth.ready) {
      health.status = 'unhealthy';
      health.services.database = 'down';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Detailed health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

/**
 * Readiness probe endpoint
 */
router.get('/ready', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    
    if (dbHealth.ready) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        reason: 'Database not connected',
      });
    }
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

/**
 * Liveness probe endpoint
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Metrics endpoint
 */
router.get('/metrics', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    const dbStats = await getDatabaseStats();
    
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        heapUsed: process.memoryUsage().heapUsed,
        heapTotal: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external,
        rss: process.memoryUsage().rss,
      },
      database: {
        connected: dbHealth.ready,
        collections: dbStats?.collections || 0,
        dataSize: dbStats?.dataSize || 0,
        storageSize: dbStats?.storageSize || 0,
        indexes: dbStats?.indexes || 0,
        objects: dbStats?.objects || 0,
      },
      process: {
        pid: process.pid,
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
      },
    };

    res.json(metrics);
  } catch (error) {
    logger.error('Metrics collection failed:', error);
    res.status(500).json({
      error: 'Failed to collect metrics',
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
