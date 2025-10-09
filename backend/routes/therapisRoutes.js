const express = require("express");
const {
  createTherapist,
  getAllTherapists,
  updateTherapistStatus,
  getAcceptedTherapists,
} = require("../controllers/therapisController");

const router = express.Router();

router.post("/apply", createTherapist);          // POST /therapis/apply
router.get("/all", getAllTherapists);            // GET /therapis/all
router.patch("/:id/status", updateTherapistStatus);
router.get("/accepted", getAcceptedTherapists);

module.exports = router;
