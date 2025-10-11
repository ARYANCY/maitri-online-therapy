const Therapist = require("../models/therapist");
const mongoose = require("mongoose");

// Optional: Joi schema for validation
const Joi = require("joi");

const therapistSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
  specialization: Joi.string().optional(),
  status: Joi.string().valid("pending", "accepted", "rejected").default("pending")
});

// Public: Therapist submits form
exports.createTherapist = async (req, res) => {
  try {
    const { error } = therapistSchema.validate(req.body);
    if (error) return res.status(400).json({ message: "Invalid input", error: error.details[0].message });

    const form = new Therapist(req.body);
    await form.save();

    res.status(201).json({ message: "Form submitted successfully", form });
  } catch (err) {
    console.error("Create Therapist Error:", err);
    let errMsg = err.message;
    if (err.code === 11000) errMsg = "Email already exists";
    res.status(400).json({ message: "Error submitting form", error: errMsg });
  }
};

// Public: Get accepted therapists
exports.getAcceptedTherapists = async (req, res) => {
  try {
    const accepted = await Therapist.find({ status: "accepted" }).sort({ createdAt: -1 }).lean();
    res.status(200).json(accepted || []);
  } catch (err) {
    console.error("Get Accepted Therapists Error:", err);
    res.status(500).json({ message: "Error fetching accepted therapists" });
  }
};

// Admin: Get all therapist forms
exports.getAllTherapists = async (req, res) => {
  try {
    const forms = await Therapist.find().sort({ createdAt: -1 }).lean();
    res.status(200).json(forms);
  } catch (err) {
    console.error("Get All Therapists Error:", err);
    res.status(500).json({ message: "Error fetching therapists" });
  }
};

// Admin: Update therapist status
exports.updateTherapistStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid therapist ID" });
    if (!["pending", "accepted", "rejected"].includes(status)) return res.status(400).json({ message: "Invalid status value" });

    const updated = await Therapist.findByIdAndUpdate(id, { status }, { new: true, runValidators: true }).lean();
    if (!updated) return res.status(404).json({ message: "Therapist not found" });

    res.status(200).json({ message: "Status updated successfully", updated });
  } catch (err) {
    console.error("Update Therapist Status Error:", err);
    res.status(500).json({ message: "Error updating therapist status" });
  }
};

// Admin: Delete therapist
exports.deleteTherapist = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid therapist ID" });

    const therapist = await Therapist.findById(id).lean();
    if (!therapist) return res.status(404).json({ message: "Therapist not found" });
    if (therapist.status === "accepted") return res.status(403).json({ message: "Cannot delete an accepted therapist" });

    await Therapist.findByIdAndDelete(id);
    res.status(200).json({ message: "Therapist deleted successfully" });
  } catch (err) {
    console.error("Delete Therapist Error:", err);
    res.status(500).json({ message: "Error deleting therapist" });
  }
};
