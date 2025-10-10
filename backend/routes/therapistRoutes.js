const express = require("express");
const router = express.Router();
const { createTherapist, getAcceptedTherapists } = require("../controllers/therapistController");

router.post("/apply", createTherapist);         // Anyone can apply
router.get("/accepted", getAcceptedTherapists); // Anyone can view accepted therapists

module.exports = router;
