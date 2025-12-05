const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { requireAdmin } = require("../middleware/authMiddleware");
const {
  getAllDOCHs,
  getDOCHById,
  updateDOCH,
  updateDOCHStatus,
  deleteDOCH
} = require("../controllers/healthcareProfessionalController");

const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid DOCH ID" });
  }
  next();
};

router.use(requireAdmin);

router.get("/", getAllDOCHs);
router.get("/:id", validateObjectId, getDOCHById);
router.put("/:id", validateObjectId, updateDOCH);
router.patch("/:id/status", validateObjectId, updateDOCHStatus);
router.delete("/:id", validateObjectId, deleteDOCH);

module.exports = router;
