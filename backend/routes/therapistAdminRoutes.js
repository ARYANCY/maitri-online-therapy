const express = require("express");
const router = express.Router();
const { requireLogin, requireAdmin } = require("../middleware/authMiddleware");
const {
  getAllTherapists,
  updateTherapistStatus,
  deleteTherapist
} = require("../controllers/therapistController");

router.use(requireLogin, requireAdmin);

router.get("/", getAllTherapists);
router.patch("/:id/status", updateTherapistStatus);
router.delete("/:id", deleteTherapist);

module.exports = router;
