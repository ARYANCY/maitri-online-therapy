const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const DOCT = require("../models/DOCT");
const { requireAdmin } = require("../middleware/authMiddleware");
const Joi = require("joi");

const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid doct ID" });
  }
  next();
};

router.use(requireAdmin);

const statusSchema = Joi.object({
  status: Joi.string().valid("pending", "accepted", "rejected").required(),
});

const bulkStatusSchema = Joi.object({
  ids: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1).required(),
  status: Joi.string().valid("pending", "accepted", "rejected").required(),
});

const updateDOCTSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).optional(),
  email: Joi.string().email().trim().lowercase().optional(),
  specialization: Joi.string().trim().max(100).optional(),
  experience: Joi.number().min(0).max(70).optional(),
  priority: Joi.number().min(1).max(10).optional(),
  availability: Joi.array().items(
    Joi.object({
      date: Joi.date().required(),
      time_slots: Joi.array().items(
        Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      ).min(1).required()
    })
  ).optional(),
  isActive: Joi.boolean().optional()
});

router.patch("/bulk/status", async (req, res) => {
  try {
    const { error, value } = bulkStatusSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: "Invalid input", errors: error.details });
    }

    const { ids, status } = value;
    const result = await DOCT.updateMany(
      { _id: { $in: ids } }, 
      { 
        status, 
        lastStatusUpdate: new Date() 
      }
    );

    res.status(200).json({
      success: true,
      message: "DOCT statuses updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating statuses", error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const docts = await DOCT.find().sort({ priority: 1, createdAt: -1 }).lean();
    res.status(200).json({ success: true, docts });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching docts", error: err.message });
  }
});

router.put("/:id", validateObjectId, async (req, res) => {
  try {
    const { error, value } = updateDOCTSchema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid therapist data",
        errors: error.details.map(e => e.message),
      });
    }

    if (value.email) {
      const existing = await DOCT.findOne({ 
        email: value.email,
        _id: { $ne: req.params.id }
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Email already exists"
        });
      }
    }

    const updated = await DOCT.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: "Therapist not found" });
    }

    res.status(200).json({ 
      success: true, 
      message: "Therapist updated successfully",
      doct: updated 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating therapist", error: err.message });
  }
});

router.patch("/:id/status", validateObjectId, async (req, res) => {
  try {
    const { error, value } = statusSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: "Invalid status value", errors: error.details });
    }

    const updated = await DOCT.findByIdAndUpdate(
      req.params.id,
      { 
        status: value.status,
        lastStatusUpdate: new Date()
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return res.status(404).json({ success: false, message: "DOCT not found" });

    res.status(200).json({ success: true, message: "DOCT status updated", doct: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating doct status", error: err.message });
  }
});

router.delete("/:id", validateObjectId, async (req, res) => {
  try {
    const doct = await DOCT.findById(req.params.id).lean();
    if (!doct) return res.status(404).json({ success: false, message: req.t ? req.t("doct.doctNotFound") : "Therapist not found" });

    await DOCT.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: req.t ? req.t("doct.doctDeleted") : "Therapist deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: req.t ? req.t("doct.internalServerError") : "Internal server error", error: err.message });
  }
});

module.exports = router;
