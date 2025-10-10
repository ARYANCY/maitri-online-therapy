const express = require("express");
const router = express.Router();
const { requireLogin, requireAdmin } = require("../middleware/authMiddleware");
const {
  createTherapist,
  getAcceptedTherapists,
  getAllTherapists,
  updateTherapistStatus,
  deleteTherapist
} = require("../controllers/therapistController");

// Public routes
router.post("/apply", createTherapist);        // Anyone can apply
router.get("/accepted", getAcceptedTherapists); // Anyone can view accepted therapists

// Protected routes (admin only)
router.use(requireLogin, requireAdmin);
router.get("/", getAllTherapists);                // Admin: get all
router.patch("/:id/status", updateTherapistStatus); // Admin: update status
router.delete("/:id", deleteTherapist);           // Admin: delete therapist

module.exports = router;
