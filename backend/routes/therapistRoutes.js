const express = require("express");
const router = express.Router();
const { createTherapist, getAcceptedTherapists } = require("../controllers/therapistController");

router.post("/apply", createTherapist); 
router.get("/accepted", getAcceptedTherapists); 

module.exports = router;
