const mongoose = require("mongoose");
const Joi = require("joi");
const Therapist = require("../models/therapist");
const logger = require("../utils/logger");
const asyncHandler = require("express-async-handler");

// ----------------------------
// Validation Schema
// ----------------------------
const therapistSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).required(),
  email: Joi.string().email().trim().lowercase().required(),
  phone: Joi.string().pattern(/^\d{10}$/).required(),
  specialization: Joi.string().trim().max(100).required(),
  experience: Joi.number().min(0).max(70).required(),
  qualifications: Joi.string().trim().max(500).optional().allow(""),
  status: Joi.string().valid("pending", "accepted", "rejected").default("pending"),
  availability: Joi.string().valid("full-time", "part-time", "weekends", "evenings", "flexible").default("flexible"),
  bio: Joi.string().trim().max(1000).optional().allow(""),
  profileComplete: Joi.boolean().default(false)
});
const statusSchema = Joi.object({
  status: Joi.string().valid("pending", "accepted", "rejected").required(),
});

const bulkStatusSchema = Joi.object({
  ids: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1).required(),
  status: Joi.string().valid("pending", "accepted", "rejected").required(),
});

// ----------------------------
// Helper: Validate Mongo ObjectId
// ----------------------------
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ----------------------------
// Public: Create Therapist
// ----------------------------
exports.createTherapist = asyncHandler(async (req, res) => {
  const { error, value } = therapistSchema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid therapist data",
      errors: error.details.map(e => e.message),
    });
  }

  const exists = await Therapist.exists({ email: value.email });
  if (exists) {
    return res.status(409).json({ 
      success: false,
      message: "Email already exists" 
    });
  }

  // Set initial values
  value.profileComplete = true;
  value.lastStatusUpdate = new Date();
  
  const therapist = await new Therapist(value).save();
  
  logger.info(`New therapist registered: ${therapist.email}`);
  
  res.status(201).json({
    success: true,
    message: "Therapist submitted successfully",
    therapist: therapist.toObject(),
  });
});

// ----------------------------
// Public: Get Accepted Therapists
// ----------------------------
exports.getAcceptedTherapists = asyncHandler(async (req, res) => {
  const accepted = await Therapist.find({ status: "accepted" })
    .select('-__v')
    .sort({ createdAt: -1 })
    .lean();
    
  res.status(200).json({
    success: true,
    therapists: accepted || []
  });
});

// ----------------------------
// Admin: Get All Therapists
// ----------------------------
exports.getAllTherapists = asyncHandler(async (req, res) => {
  const therapists = await Therapist.find()
    .select('-__v')
    .sort({ createdAt: -1 })
    .lean();
    
  res.status(200).json({
    success: true,
    therapists: therapists || []
  });
});

// ----------------------------
// Admin: Update Therapist Status
// ----------------------------
exports.updateTherapistStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid therapist ID" });

    const { error } = statusSchema.validate({ status });
    if (error)
      return res.status(400).json({ message: "Invalid status value", errors: error.details });

    const therapist = await Therapist.findById(id);
    if (!therapist) return res.status(404).json({ message: "Therapist not found" });

    if (therapist.status === status)
      return res.status(200).json({ message: "Status unchanged", therapist });

    therapist.status = status;
    await therapist.save();

    res.status(200).json({
      message: "Therapist status updated successfully",
      therapist: therapist.toObject(),
      updatedAt: new Date(),
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};



// ----------------------------
// Admin: Bulk Update Therapist Status
// ----------------------------
exports.updateBulkTherapistStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;

    const { error, value } = bulkStatusSchema.validate({ ids, status });
    if (error) {
      return res.status(400).json({ message: "Invalid input", errors: error.details });
    }

    const validIds = value.ids.filter(isValidObjectId);
    if (validIds.length === 0) {
      return res.status(400).json({ message: "No valid IDs provided" });
    }

    // Fetch current statuses to skip unnecessary updates
    const therapists = await Therapist.find({ _id: { $in: validIds } });
    const idsToUpdate = therapists.filter((t) => t.status !== status).map((t) => t._id);

    if (idsToUpdate.length === 0) {
      return res.status(200).json({ message: "No statuses needed updating", modifiedCount: 0 });
    }

    const result = await Therapist.updateMany(
      { _id: { $in: idsToUpdate } },
      { status }
    );

    res.status(200).json({
      message: `Therapist statuses updated successfully`,
      requested: validIds.length,
      modifiedCount: result.modifiedCount,
      skipped: validIds.length - result.modifiedCount,
      updatedAt: new Date(),
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
// ----------------------------
// Admin: Delete Therapist
// ----------------------------
exports.deleteTherapist = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid therapist ID" });

    const therapist = await Therapist.findById(id).lean();
    if (!therapist) return res.status(404).json({ message: "Therapist not found" });
    if (therapist.status === "accepted") return res.status(403).json({ message: "Cannot delete an accepted therapist" });

    await Therapist.findByIdAndDelete(id);
    res.status(200).json({ message: "Therapist deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
