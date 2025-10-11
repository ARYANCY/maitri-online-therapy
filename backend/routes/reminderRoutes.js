const express = require("express");
const router = express.Router();
const {requireLogin} = require("../middleware/authMiddleware");
const { createReminder, listReminders, cancelReminder, getReminderStats } = require("../controllers/reminderController");

router.post("/", requireLogin, createReminder);
router.get("/", requireLogin, listReminders);
router.get("/stats", requireLogin, getReminderStats);
router.delete("/:id", requireLogin, cancelReminder);

module.exports = router;
