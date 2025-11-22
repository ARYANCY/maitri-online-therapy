const express = require('express');
const router = express.Router();
const User = require('../models/User');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireLogin } = require('../middleware/authMiddleware');

/**
 * Update user's language preference
 */
router.post('/update', requireLogin, asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.session?.userId;
  const { language } = req.body;
  
  if (!language) {
    return res.status(400).json({
      success: false,
      error: req.t("general.validationError"),
      message: "Language is required"
    });
  }

  const supportedLanguages = ['en', 'hi', 'as'];
  if (!supportedLanguages.includes(language)) {
    return res.status(400).json({
      success: false,
      error: req.t("general.validationError"),
      message: "Unsupported language. Supported languages: en, hi, as"
    });
  }

  try {
    // Update user's language preference in database
    await User.findByIdAndUpdate(userId, { 
      preferredLanguage: language,
      updatedAt: new Date()
    });

    // Update session language
    req.session.preferredLanguage = language;

    logger.info('User language preference updated', {
      userId,
      language,
      ip: req.ip,
      requestId: req.id,
    });

    res.json({
      success: true,
      message: req.t("general.success"),
      language,
      supportedLanguages
    });
  } catch (err) {
    logger.error('Language update failed', {
      userId,
      error: err.message,
      language,
      ip: req.ip,
      requestId: req.id,
    });
    
    res.status(500).json({
      success: false,
      error: req.t("general.serverError")
    });
  }
}));

/**
 * Get current language preference
 */
router.get('/current', requireLogin, asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.session?.userId;
  const userLanguage = req.getLanguage();

  try {
    const user = await User.findById(userId).select('preferredLanguage');
    
    res.json({
      success: true,
      language: userLanguage,
      preferredLanguage: user?.preferredLanguage || 'en',
      supportedLanguages: ['en', 'hi', 'as']
    });
  } catch (err) {
    logger.error('Language retrieval failed', {
      userId,
      error: err.message,
      ip: req.ip,
      requestId: req.id,
    });
    
    res.status(500).json({
      success: false,
      error: req.t("general.serverError")
    });
  }
}));

/**
 * Get available translations for a specific key
 */
router.get('/translations/:key', requireLogin, asyncHandler(async (req, res) => {
  const { key } = req.params;
  const userLanguage = req.getLanguage();

  try {
    const translations = {
      en: req.t(key, {}, 'en'),
      hi: req.t(key, {}, 'hi'),
      as: req.t(key, {}, 'as')
    };

    res.json({
      success: true,
      key,
      translations,
      currentLanguage: userLanguage
    });
  } catch (err) {
    logger.error('Translation retrieval failed', {
      key,
      error: err.message,
      language: userLanguage,
      ip: req.ip,
      requestId: req.id,
    });
    
    res.status(500).json({
      success: false,
      error: req.t("general.serverError")
    });
  }
}));

module.exports = router;
