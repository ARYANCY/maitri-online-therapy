const Joi = require('joi');
const { validationResult } = require('express-validator');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: error.details.map(d => d.message).join(', '),
        details: error.details,
      });
    }

    req[property] = value;
    next();
  };
};

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

const schemas = {
  userRegistration: Joi.object({
    name: Joi.string().min(2).max(50).trim().required(),
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().min(6).max(128).required(),
  }),

  userLogin: Joi.object({
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().required(),
  }),

  adminLogin: Joi.object({
    password: Joi.string().min(8).max(128).required(),
  }),

  reminder: Joi.object({
    message: Joi.string().min(1).max(500).trim().required(),
    sendAt: Joi.date()
      .greater('now')
      .max(new Date(new Date().setFullYear(new Date().getFullYear() + 1)))
      .required(),
  }),

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

  chatMessage: Joi.object({
    message: Joi.string().min(1).max(2000).trim().required(),
  }),

  languageUpdate: Joi.object({
    language: Joi.string().valid('en', 'hi', 'as').required(),
  }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid('asc', 'desc').default('desc'),
    sortBy: Joi.string().max(50).default('createdAt'),
  }),

  search: Joi.object({
    q: Joi.string().min(1).max(100).trim().allow(''),
    status: Joi.string().valid('pending', 'accepted', 'rejected').allow(''),
    dateFrom: Joi.date().allow(null),
    dateTo: Joi.date().allow(null),
  }),
};

const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/<[^>]*>/g, '')
              .trim();
  };

  const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') return sanitizeString(obj);
    if (Array.isArray(obj)) return obj.map(sanitizeObject);
    if (obj.constructor === Object) {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

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
