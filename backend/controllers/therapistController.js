const Therapist = require("../models/therapist");

// Public: Therapist submits form
exports.createTherapist = async (req, res) => {
  try {
    const form = new Therapist(req.body);
    await form.save();
    res.status(201).json({ message: "Form submitted successfully", form });
  } catch (error) {
    let errMsg = error.message;
    if (error.code === 11000) errMsg = "Email already exists";
    res.status(400).json({ message: "Error submitting form", error: errMsg });
  }
};

// Public: Get accepted therapists
exports.getAcceptedTherapists = async (req, res) => {
  try {
    const accepted = await Therapist.find({ status: "accepted" }).sort({ createdAt: -1 });
    res.status(200).json(Array.isArray(accepted) ? accepted : []);
  } catch (error) {
    res.status(500).json({ message: "Error fetching accepted therapists", error });
  }
};

// Admin: Get all therapist forms
exports.getAllTherapists = async (req, res) => {
  try {
    const forms = await Therapist.find().sort({ createdAt: -1 });
    res.status(200).json(forms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching therapists", error });
  }
};

// Admin: Update therapist status
exports.updateTherapistStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updated = await Therapist.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: "Therapist not found" });

    res.status(200).json({ message: "Status updated successfully", updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error });
  }
};

// Admin: Delete therapist
exports.deleteTherapist = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Therapist.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Therapist not found" });

    res.status(200).json({ message: "Therapist deleted successfully", deleted });
  } catch (error) {
    res.status(500).json({ message: "Error deleting therapist", error });
  }
};
