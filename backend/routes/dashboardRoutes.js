const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");
router.get("/", dashboardController.getDashboard);
router.get("/tasks", authMiddleware, dashboardController.getTasks);
router.put("/tasks", authMiddleware, dashboardController.updateTasks);
module.exports = router;
