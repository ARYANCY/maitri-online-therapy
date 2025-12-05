/**
 * Standardized response helper for consistent API responses
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Optional success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, data = null, message = null, statusCode = 200) => {
  const response = {
    success: true,
    ...(data !== null && { data }),
    ...(message && { message }),
    timestamp: new Date().toISOString(),
  };

  // Add request ID if available
  if (res.req?.id) {
    response.requestId = res.req.id;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} error - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {*} details - Optional error details
 */
const sendError = (res, error, statusCode = 400, details = null) => {
  const response = {
    success: false,
    error: error || "An error occurred",
    ...(details && { details }),
    timestamp: new Date().toISOString(),
  };

  // Add request ID if available
  if (res.req?.id) {
    response.requestId = res.req.id;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && details?.stack) {
    response.stack = details.stack;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of data items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 */
const sendPaginated = (res, data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  
  return sendSuccess(res, {
    items: data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
};

/**
 * Validate and sanitize response data
 * @param {*} data - Data to validate
 * @param {Object} schema - Validation schema (optional)
 * @returns {*} - Validated data
 */
const validateResponse = (data, schema = null) => {
  if (schema) {
    // If schema provided, validate (can use Joi or similar)
    // For now, just return data
    return data;
  }
  return data;
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated,
  validateResponse,
};

