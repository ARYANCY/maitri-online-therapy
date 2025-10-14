const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Therapist = require("../models/therapist");
const { requireAdmin } = require("../middleware/authMiddleware");
const Joi = require("joi");

// ---------------------------
// Middleware: Validate ObjectId
// ---------------------------
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid therapist ID" });
  }
  next();
};

// ---------------------------
// All routes require admin
// ---------------------------
router.use(requireAdmin);

// ---------------------------
// JOI schemas
// ---------------------------
const statusSchema = Joi.object({
  status: Joi.string().valid("pending", "accepted", "rejected").required(),
});

const bulkStatusSchema = Joi.object({
  ids: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1).required(),
  status: Joi.string().valid("pending", "accepted", "rejected").required(),
});

// ---------------------------
// BULK update therapist status
// Must be BEFORE /:id route
// ---------------------------
router.patch("/bulk/status", async (req, res) => {
  try {
    const { error, value } = bulkStatusSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: "Invalid input", errors: error.details });
    }

    const { ids, status } = value;
    const result = await Therapist.updateMany(
      { _id: { $in: ids } }, 
      { 
        status, 
        lastStatusUpdate: new Date() 
      }
    );

    res.status(200).json({
      success: true,
      message: "Therapist statuses updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("Bulk update error:", err);
    res.status(500).json({ success: false, message: "Error updating statuses", error: err.message });
  }
});

// ---------------------------
// GET all therapists
// ---------------------------
router.get("/", async (req, res) => {
  try {
    const therapists = await Therapist.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, therapists });
  } catch (err) {
    console.error("Get all therapists error:", err);
    res.status(500).json({ success: false, message: "Error fetching therapists", error: err.message });
  }
});

// ---------------------------
// PATCH single therapist status
// ---------------------------
router.patch("/:id/status", validateObjectId, async (req, res) => {
  try {
    const { error, value } = statusSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: "Invalid status value", errors: error.details });
    }

    const updated = await Therapist.findByIdAndUpdate(
      req.params.id,
      { 
        status: value.status,
        lastStatusUpdate: new Date()
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return res.status(404).json({ success: false, message: "Therapist not found" });

    res.status(200).json({ success: true, message: "Therapist status updated", therapist: updated });
  } catch (err) {
    console.error("Update therapist status error:", err);
    res.status(500).json({ success: false, message: "Error updating therapist status", error: err.message });
  }
});

// ---------------------------
// DELETE therapist (cannot delete accepted)
// ---------------------------
router.delete("/:id", validateObjectId, async (req, res) => {
  try {
    const therapist = await Therapist.findById(req.params.id).lean();
    if (!therapist) return res.status(404).json({ success: false, message: "Therapist not found" });

    if (therapist.status === "accepted") {
      return res.status(403).json({ success: false, message: "Cannot delete an accepted therapist" });
    }

    await Therapist.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Therapist deleted successfully" });
  } catch (err) {
    console.error("Delete therapist error:", err);
    res.status(500).json({ success: false, message: "Error deleting therapist", error: err.message });
  }
});

module.exports = router;
