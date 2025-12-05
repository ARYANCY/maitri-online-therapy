const express = require("express");
const router = express.Router();
const { requireLogin } = require("../middleware/authMiddleware");
const therapistController = require("../controllers/therapistController");

router.post("/apply", therapistController.createDOCT); 
router.get("/accepted", therapistController.getAcceptedDOCTs);
router.get("/my-profile", requireLogin, therapistController.getDOCTByEmail);
router.post("/appointments", requireLogin, therapistController.createAppointment);
router.get("/appointments", requireLogin, therapistController.getDOCTAppointments);
router.patch("/appointments/:appointmentId/status", requireLogin, therapistController.updateAppointmentStatus);

module.exports = router;
