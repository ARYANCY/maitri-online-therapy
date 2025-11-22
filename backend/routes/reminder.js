// routes/reminderRoutes.js
const express = require("express");
const router = express.Router();
const Joi = require("joi");
const asyncHandler = require("express-async-handler");
const Reminder = require("../models/Reminder");

const reminderSchema = Joi.object({
  message: Joi.string().trim().min(3).max(500).required(),
  email: Joi.string().email().trim().lowercase().required(),
  dateTime: Joi.date().iso().required(),
  repeat: Joi.string().valid("none", "daily", "weekly", "monthly", "custom").default("none"),
  customInterval: Joi.number().integer().min(1).optional().allow(null),
  endDate: Joi.date().iso().optional().allow(null),
  category: Joi.string().trim().max(100).optional().default("General"),
});

// Add a reminder
router.post("/add", asyncHandler(async (req, res) => {
  const { error, value } = reminderSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({ success: false, error: "Invalid reminder data", details: error.details });
  }

  // Ensure endDate is after dateTime when provided
  if (value.endDate && new Date(value.endDate) < new Date(value.dateTime)) {
    return res.status(400).json({ success: false, error: "endDate must be after dateTime" });
  }

  const reminder = await Reminder.create({
    message: value.message,
    email: value.email,
    dateTime: value.dateTime,
    repeat: value.repeat,
    customInterval: value.customInterval || null,
    endDate: value.endDate || null,
    category: value.category || "General",
    status: "pending",
  });

  return res.status(200).json({ success: true, reminder });
}));

// Get all reminders
router.get("/", asyncHandler(async (req, res) => {
  const reminders = await Reminder.find().sort({ nextRunAt: 1, dateTime: 1 }).lean();
  return res.status(200).json({ success: true, reminders });
}));

// Delete a reminder
router.delete("/:id", asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deleted = await Reminder.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ success: false, error: "Reminder not found" });
  return res.status(200).json({ success: true, message: "Reminder deleted" });
}));

// Update a reminder
router.put("/:id", asyncHandler(async (req, res) => {
  const { error, value } = reminderSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({ success: false, error: "Invalid reminder data", details: error.details });
  }

  const updated = await Reminder.findByIdAndUpdate(
    req.params.id,
    {
      message: value.message,
      email: value.email,
      dateTime: value.dateTime,
      repeat: value.repeat,
      customInterval: value.customInterval || null,
      endDate: value.endDate || null,
      category: value.category || "General",
      status: "pending",
    },
    { new: true }
  );

  if (!updated) return res.status(404).json({ success: false, error: "Reminder not found" });

  return res.status(200).json({ success: true, reminder: updated });
}));

module.exports = router;
