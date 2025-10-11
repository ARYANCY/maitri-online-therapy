const Joi = require('joi');
const { validationResult } = require('express-validator');

/**
 * Generic validation middleware using Joi
 * @param {Object} schema - Joi schema object
 * @param {string} property - Property to validate (body, query, params)
 * @returns {Function} - Express middleware function
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: errorMessage,
        details: error.details,
      });
    }

    // Replace the original property with the validated and sanitized value
    req[property] = value;
    next();
  };
};

/**
 * Express-validator result handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Invalid input data',
      details: errors.array(),
    });
  }
  
  next();
};

// Common validation schemas
const schemas = {
  // User registration/login
  userRegistration: Joi.object({
    name: Joi.string().min(2).max(50).trim().required(),
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().min(6).max(128).required(),
  }),

  userLogin: Joi.object({
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().required(),
  }),

  // Admin login
  adminLogin: Joi.object({
    password: Joi.string().min(1).max(128).required(),
  }),

  // Reminder validation
  reminder: Joi.object({
    message: Joi.string().min(1).max(500).trim().required(),
    sendAt: Joi.date().greater('now').max('+1y').required(),
  }),

  // Therapist application
  therapistApplication: Joi.object({
    name: Joi.string().min(2).max(100).trim().required(),
    email: Joi.string().email().lowercase().trim().required(),
    phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).required(),
    specialization: Joi.string().min(2).max(100).trim().required(),
    experience: Joi.number().integer().min(0).max(50).required(),
    qualifications: Joi.string().min(10).max(1000).trim().required(),
    availability: Joi.string().min(5).max(200).trim().required(),
    languages: Joi.array().items(Joi.string().min(2).max(20)).min(1).max(10).required(),
    bio: Joi.string().min(20).max(2000).trim().required(),
  }),

  // Chat message
  chatMessage: Joi.object({
    message: Joi.string().min(1).max(2000).trim().required(),
  }),

  // Language preference
  languageUpdate: Joi.object({
    language: Joi.string().valid('en', 'hi', 'as').required(),
  }),

  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid('asc', 'desc').default('desc'),
    sortBy: Joi.string().max(50).default('createdAt'),
  }),

  // Search
  search: Joi.object({
    q: Joi.string().min(1).max(100).trim(),
    status: Joi.string().valid('pending', 'accepted', 'rejected'),
    dateFrom: Joi.date(),
    dateTo: Joi.date(),
  }),
};

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS attempts
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  };

  // Recursively sanitize object
  const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') return sanitizeString(obj);
    if (Array.isArray(obj)) return obj.map(sanitizeObject);
    if (typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };

  // Sanitize request body, query, and params
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);

  next();
};

module.exports = {
  validate,
  handleValidationErrors,
  sanitizeInput,
  schemas,
};
