const express = require("express");
const {
  createTherapist,
  getAllTherapists,
  updateTherapistStatus,
  getAcceptedTherapists,
} = require("../controllers/therapisController");

const router = express.Router();

router.post("/apply", createTherapist);
router.get("/all", getAllTherapists);
router.patch("/:id/status", updateTherapistStatus);
router.get("/accepted", getAcceptedTherapists);

module.exports = router;
