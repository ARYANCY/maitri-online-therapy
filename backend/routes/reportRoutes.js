const express = require('express');
const router = express.Router();
const {
  downloadReport,
  generateReportData,
  sendPDF,
  convertToCSV
} = require('../controllers/reportController');
const { requireLogin } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

// Unified report endpoint
router.get('/', requireLogin, async (req, res) => {
  const userId = req.user?._id || req.session?.userId;
  const userLanguage = req.getLanguage ? req.getLanguage() : 'en';
  const format = req.query.format || 'json';

  if (!userId) {
    logger.warn('Unauthorized report download attempt', { ip: req.ip });
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  logger.info('Report download requested', { userId, format, ip: req.ip });

  try {
    const reportData = await generateReportData(userId, userLanguage, req);

    switch (format.toLowerCase()) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="maitri-report-${Date.now()}.json"`);
        return res.json(reportData);

      case 'csv':
        const csvData = convertToCSV(reportData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="maitri-report-${Date.now()}.csv"`);
        return res.send(csvData);

      case 'pdf':
        return sendPDF(reportData, res);

      default:
        logger.warn('Invalid report format requested', { userId, format });
        return res.status(400).json({ success: false, error: 'Invalid format' });
    }
  } catch (err) {
    logger.error('Report download failed', { userId, format, error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, error: 'Failed to generate report' });
  }
});
router.get('/download', requireLogin, downloadReport);

module.exports = router;
