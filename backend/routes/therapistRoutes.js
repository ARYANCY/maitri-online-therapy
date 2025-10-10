const express = require("express");
const router = express.Router();
const requireLogin = require("../middleware/authMiddleware");
const { checkAdmin } = require("../middleware/checkAdmin");
const {
  createTherapist,
  getAcceptedTherapists,
  getAllTherapists,
  updateTherapistStatus,
  deleteTherapist
} = require("../controllers/therapistController");

router.post("/apply", createTherapist);
router.get("/accepted", getAcceptedTherapists);

router.use(requireLogin);
router.get("/", checkAdmin, getAllTherapists);
router.patch("/:id/status", checkAdmin, updateTherapistStatus);
router.delete("/:id", checkAdmin, deleteTherapist);

module.exports = router;
