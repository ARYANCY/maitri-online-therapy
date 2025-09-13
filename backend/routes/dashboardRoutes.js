const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const isAuth = require("../middleware/authMiddleware"); // your auth middleware

// All dashboard routes require login
router.use(isAuth);

router.get("/", dashboardController.getDashboard);
router.get("/tasks", dashboardController.getTasks);
router.put("/tasks", dashboardController.updateTasks);

module.exports = router;
