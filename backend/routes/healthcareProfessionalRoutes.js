const express = require("express");
const router = express.Router();
const { getActiveDOCHs, applyDOCH, createAppointment, getDOCHAppointments, getDOCHByEmail, updateAppointmentStatus } = require("../controllers/healthcareProfessionalController");
const { requireLogin } = require("../middleware/authMiddleware");

router.post("/apply", applyDOCH);
router.get("/", getActiveDOCHs);
router.get("/my-profile", requireLogin, getDOCHByEmail);
router.post("/appointments", requireLogin, createAppointment);
router.get("/appointments", requireLogin, getDOCHAppointments);
router.patch("/appointments/:appointmentId/status", requireLogin, updateAppointmentStatus);

module.exports = router;
