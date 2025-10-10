const express = require("express");
const router = express.Router();
const requireLogin = require("../middleware/authMiddleware");
const { createReminder, listReminders, cancelReminder } = require("../controllers/reminderController");

router.post("/", requireLogin, createReminder); // was likely router.post("/", reminderController)
router.get("/", requireLogin, listReminders);
router.delete("/:id", requireLogin, cancelReminder);

module.exports = router;
