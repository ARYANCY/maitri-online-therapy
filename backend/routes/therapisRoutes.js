import express from "express";
import {
  createTherapist,
  getAllTherapists,
  updateTherapistStatus,
  getAcceptedTherapists,
} from "../controllers/therapisController.js";

const router = express.Router();

router.post("/apply", createTherapist);
router.get("/all", getAllTherapists);
router.patch("/:id/status", updateTherapistStatus);
router.get("/accepted", getAcceptedTherapists);

export default router;
