const express = require("express");
const router = express.Router();
const { downloadReport, generateReportData, sendPDF, convertToCSV } = require('../controllers/reportController');
const { requireLogin } = require("../middleware/authMiddleware");

// Endpoint to fetch report in any format
router.get("/", requireLogin, async (req, res) => {
  const userId = req.user?._id || req.session?.userId;
  if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

  const userLanguage = req.getLanguage?.() || "en";
  const { format = "json" } = req.query;

  try {
    const reportData = await generateReportData(userId, userLanguage, req);

    switch (format.toLowerCase()) {
      case "json":
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", `attachment; filename="maitri-report-${Date.now()}.json"`);
        return res.json(reportData);

      case "csv":
        const csvData = convertToCSV(reportData);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="maitri-report-${Date.now()}.csv"`);
        return res.send(csvData);

      case "pdf":
        return sendPDF(reportData, res);

      default:
        return res.status(400).json({ success: false, error: "Invalid format" });
    }
  } catch (err) {
    console.error("Error generating report:", err);
    return res.status(500).json({ success: false, error: "Failed to generate report" });
  }
});

// Endpoint to download report (delegates to controller)
router.get("/download", requireLogin, downloadReport);

module.exports = router;
