const express = require("express");
const router = express.Router();
const { requireLogin, requireAdmin } = require("../middleware/authMiddleware");
const {
  getAllTherapists,
  updateTherapistStatus,
  deleteTherapist
} = require("../controllers/therapistController");
const mongoose = require("mongoose");

// Middleware to validate ObjectId
function validateObjectId(req, res, next) {
  const { id } = req.params;
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }
  next();
}

// All routes below require admin login
router.use(requireAdmin);

// GET all therapist forms
router.get("/", getAllTherapists);

// PATCH therapist status
router.patch("/:id/status", validateObjectId, updateTherapistStatus);

// DELETE therapist (cannot delete accepted)
router.delete("/:id", validateObjectId, deleteTherapist);

// Optional: Bulk update status (production-ready)
router.patch("/bulk/status", async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || !["pending", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    const result = await require("../models/therapist").updateMany(
      { _id: { $in: validIds } },
      { status }
    );

    res.status(200).json({ message: "Statuses updated successfully", modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error("Bulk update error:", err);
    res.status(500).json({ message: "Error updating statuses" });
  }
});

module.exports = router;
