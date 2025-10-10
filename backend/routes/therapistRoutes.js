const express = require("express");
const router = express.Router();
const { requireLogin } = require("../controllers/authController");
const { checkAdmin } = require("../middleware/checkAdmin");
const {
  getAllTherapists,
  updateTherapistStatus,
  deleteTherapist
} = require("../controllers/therapistController");

// Admin-only routes
router.use(requireLogin);
router.get("/therapists", checkAdmin, getAllTherapists);
router.patch("/therapists/:id/status", checkAdmin, updateTherapistStatus);
router.delete("/therapists/:id", checkAdmin, deleteTherapist);

module.exports = router;
