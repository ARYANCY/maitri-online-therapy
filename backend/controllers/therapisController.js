const therapist = require("../models/therapist");

// Therapist submits form
exports.createTherapist = async (req, res) => {
  try {
    const form = new therapist(req.body);
    await form.save();
    res.status(201).json({ message: "Form submitted successfully", form });
  } catch (error) {
    res.status(400).json({ message: "Error submitting form", error });
  }
};

// Admin: get all therapist forms
exports.getAllTherapists = async (req, res) => {
  try {
    const forms = await therapist.find().sort({ createdAt: -1 });
    res.status(200).json(forms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching therapists", error });
  }
};

// Admin: update therapist status
exports.updateTherapistStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updated = await therapist.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Therapist not found" });
    }

    res.status(200).json({ message: "Status updated successfully", updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error });
  }
};

// Public: get accepted therapists
exports.getAcceptedTherapists = async (req, res) => {
  try {
    const accepted = await therapist.find({ status: "accepted" }).sort({ createdAt: -1 });
    res.status(200).json(accepted);
  } catch (error) {
    res.status(500).json({ message: "Error fetching accepted therapists", error });
  }
};
