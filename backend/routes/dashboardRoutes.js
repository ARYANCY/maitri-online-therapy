const express = require("express");
const router = express.Router();
const { getDashboard, getTasks, updateTasks } = require("../controllers/dashboardController");
const { requireLogin } = require("../middleware/authMiddleware");

router.get("/", requireLogin, getDashboard);
router.get("/tasks", requireLogin, getTasks);
router.put("/tasks", requireLogin, updateTasks);

module.exports = router;
