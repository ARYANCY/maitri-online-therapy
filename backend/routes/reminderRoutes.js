const express = require("express");
const router = express.Router();
const reminderController = require("../controllers/reminderController");
const requireLogin = require("../middleware/authMiddleware");
router.post("/", requireLogin, reminderController.createReminder);
router.get("/", requireLogin, reminderController.listReminders);
router.delete("/:id", requireLogin, reminderController.cancelReminder);

module.exports = router;
