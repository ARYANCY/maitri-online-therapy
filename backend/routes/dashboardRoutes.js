const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

router.get("/", dashboardController.getDashboard);
router.get("/tasks", dashboardController.getTasks);
router.put("/tasks", dashboardController.updateTasks);
module.exports = router;
