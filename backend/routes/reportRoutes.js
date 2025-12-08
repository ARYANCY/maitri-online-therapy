const express = require("express");
const router = express.Router();
const { downloadReport } = require('../controllers/reportController');
const { requireLogin } = require("../middleware/authMiddleware");

// Endpoint to fetch report in any format (delegates to controller for unified logic)
router.get("/", requireLogin, downloadReport);

// Endpoint to download report (delegates to controller)
router.get("/download", requireLogin, downloadReport);

module.exports = router;
