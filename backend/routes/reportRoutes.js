const express = require('express');
const router = express.Router();
const { generateReport, downloadReport } = require('../controllers/reportController');
const { requireLogin } = require('../middleware/authMiddleware');

// Generate mental health report
router.get('/', requireLogin, generateReport);

// Download report as file
router.get('/download', requireLogin, downloadReport);

module.exports = router;
