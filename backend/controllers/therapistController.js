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
exports.updateTherapistStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  console.log(`[THERAPIST STATUS UPDATE] Attempting to update therapist ${id} to status: ${status}`);

  if (!isValidObjectId(id)) {
    console.error(`[THERAPIST ERROR] Invalid therapist ID: ${id}`);
    return res.status(400).json({ message: "Invalid therapist ID" });
  }

  const { error } = statusSchema.validate({ status });
  if (error) {
    console.error(`[THERAPIST ERROR] Invalid status value: ${status}`, error.details);
    return res.status(400).json({ message: "Invalid status value", errors: error.details });
  }

  const therapist = await Therapist.findById(id);
  if (!therapist) {
    console.error(`[THERAPIST ERROR] Therapist not found with ID: ${id}`);
    return res.status(404).json({ message: "Therapist not found" });
  }

  if (therapist.status === status) {
    console.log(`[THERAPIST STATUS] Status unchanged for therapist ${id}, already ${status}`);
    return res.status(200).json({ message: "Status unchanged", therapist });
  }

  const previousStatus = therapist.status;
  therapist.status = status;
  therapist.lastStatusUpdate = new Date();
  await therapist.save();

  console.log(`[THERAPIST STATUS SUCCESS] Therapist ${id} status updated from ${previousStatus} to ${status}`);
  
  // Log specific action type
  if (status === "accepted") {
    console.log(`[THERAPIST ACCEPTED] Therapist ${id} has been accepted`);
  } else if (status === "rejected") {
    console.log(`[THERAPIST REJECTED] Therapist ${id} has been rejected`);
  }
  
  return res.status(200).json({
    message: "Therapist status updated successfully",
    therapist: therapist.toObject(),
    updatedAt: new Date(),
  });
});



// ----------------------------
// Admin: Bulk Update Therapist Status
// ----------------------------
exports.updateBulkTherapistStatus = asyncHandler(async (req, res) => {
  const { ids, status } = req.body;
  
  console.log(`[BULK STATUS UPDATE] Attempting to update ${ids.length} therapists to status: ${status}`);

  const { error, value } = bulkStatusSchema.validate({ ids, status });
  if (error) {
    console.error(`[THERAPIST ERROR] Invalid bulk update input:`, error.details);
    return res.status(400).json({ message: "Invalid input", errors: error.details });
  }

  const validIds = value.ids.filter(isValidObjectId);
  if (validIds.length === 0) {
    console.error(`[THERAPIST ERROR] No valid IDs provided for bulk update`);
    return res.status(400).json({ message: "No valid IDs provided" });
  }

  // Fetch current statuses to skip unnecessary updates
  const therapists = await Therapist.find({ _id: { $in: validIds } });
  const idsToUpdate = therapists.filter((t) => t.status !== status).map((t) => t._id);

  if (idsToUpdate.length === 0) {
    console.log(`[BULK STATUS] No status changes needed, all therapists already have status: ${status}`);
    return res.status(200).json({ message: "No statuses needed updating", modifiedCount: 0 });
  }

  const result = await Therapist.updateMany(
    { _id: { $in: idsToUpdate } },
    { 
      status,
      lastStatusUpdate: new Date()
    }
  );

  console.log(`[BULK STATUS SUCCESS] Updated ${result.modifiedCount} therapists to status: ${status}`);

  return res.status(200).json({
    message: `Therapist statuses updated successfully`,
    requested: validIds.length,
    modifiedCount: result.modifiedCount,
    skipped: validIds.length - result.modifiedCount,
    updatedAt: new Date(),
  });
});
// ----------------------------
// Admin: Delete Therapist
// ----------------------------
exports.deleteTherapist = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  console.log(`[THERAPIST DELETE] Attempting to delete therapist: ${id}`);

  if (!isValidObjectId(id)) {
    console.error(`[THERAPIST ERROR] Invalid therapist ID for deletion: ${id}`);
    return res.status(400).json({ message: "Invalid therapist ID" });
  }

  const therapist = await Therapist.findById(id).lean();
  if (!therapist) {
    console.error(`[THERAPIST ERROR] Therapist not found for deletion: ${id}`);
    return res.status(404).json({ message: "Therapist not found" });
  }
  
  if (therapist.status === "accepted") {
    console.error(`[THERAPIST ERROR] Cannot delete accepted therapist: ${id}`);
    return res.status(403).json({ message: "Cannot delete an accepted therapist" });
  }

  await Therapist.findByIdAndDelete(id);
  console.log(`[THERAPIST DELETE SUCCESS] Therapist deleted successfully: ${id}`);
  
  return res.status(200).json({ message: "Therapist deleted successfully" });
});
