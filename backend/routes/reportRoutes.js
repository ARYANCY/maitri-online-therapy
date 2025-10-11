const express = require('express');
const router = express.Router();
const { downloadReport, generateReportData, sendPDF, convertToCSV } = require('../controllers/reportController');
const { requireLogin } = require('../middleware/authMiddleware');

router.get('/', requireLogin, async (req, res) => {
  try {
    const userId = req.user?._id || req.session?.userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const userLanguage = req.getLanguage();
    const { format = 'json' } = req.query;

    const reportData = await generateReportData(userId, userLanguage, req);

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.json(reportData);
    } else if (format === 'csv') {
      const csvData = convertToCSV(reportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="maitri-report-${Date.now()}.csv"`);
      res.send(csvData);
    } else if (format === 'pdf') {
      sendPDF(reportData, res);
    } else {
      res.status(400).json({ success: false, error: 'Invalid format' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/download', requireLogin, downloadReport);

module.exports = router;
