const express = require("express");
const router = express.Router();
const requireLogin = require("../middleware/authMiddleware");
const { checkAdmin } = require("../middleware/checkAdmin");
const {
  getAllTherapists,
  updateTherapistStatus,
  deleteTherapist,
} = require("./controllers/therapistController");

// Apply login middleware to all routes in this router
router.use(requireLogin);

// GET /therapists/          -> Get all therapists (admin only)
router.get("/", checkAdmin, getAllTherapists);

// PATCH /therapists/:id/status -> Update therapist status (admin only)
router.patch("/:id/status", checkAdmin, updateTherapistStatus);

// DELETE /therapists/:id    -> Delete a therapist (admin only)
router.delete("/:id", checkAdmin, deleteTherapist);

module.exports = router;


