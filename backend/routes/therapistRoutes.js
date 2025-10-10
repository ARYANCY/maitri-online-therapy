const express = require("express");
const router = express.Router();
const requireLogin = require("../middleware/authMiddleware");
const { checkAdmin } = require("../middleware/checkAdmin");
const {
  getAllTherapists,
  getAcceptedTherapists,
  updateTherapistStatus,
  deleteTherapist,
} = require("../controllers/therapistController");

router.get("/accepted", getAcceptedTherapists);

router.use(requireLogin);

router.get("/", checkAdmin, getAllTherapists);

router.patch("/:id/status", checkAdmin, updateTherapistStatus);

router.delete("/:id", checkAdmin, deleteTherapist);

module.exports = router;
