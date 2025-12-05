const mongoose = require('mongoose');

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ObjectId to validate
 * @returns {boolean} - True if valid ObjectId
 */
exports.isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Validate and normalize ObjectId
 * @param {string} id - ObjectId to validate
 * @returns {string|null} - Normalized ObjectId or null if invalid
 */
exports.normalizeObjectId = (id) => {
  if (!id || typeof id !== 'string') return null;
  const trimmed = id.trim();
  return mongoose.Types.ObjectId.isValid(trimmed) ? trimmed : null;
};

