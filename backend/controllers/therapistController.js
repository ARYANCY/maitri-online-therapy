const Therapist = require("../models/therapist");

// --------------------- Public Routes ---------------------

// Submit therapist application form
exports.createTherapist = async (req, res) => {
  try {
    const { name, email, phone, specialization, experience, qualifications } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "'name' and 'email' are required" });
    }

    const existing = await Therapist.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const form = new Therapist({
      name,
      email,
      phone,
      specialization,
      experience,
      qualifications,
    });

    await form.save();

    return res.status(201).json({ message: "Form submitted successfully", form });
  } catch (err) {
    console.error("createTherapist error:", err);
    return res.status(500).json({ message: "Error submitting form", error: err.message });
  }
};

// Get all accepted therapists (public)
exports.getAcceptedTherapists = async (req, res) => {
  try {
    const accepted = await Therapist.find({ status: "accepted" })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ therapists: accepted });
  } catch (err) {
    console.error("getAcceptedTherapists error:", err);
    return res.status(500).json({ message: "Error fetching accepted therapists", error: err.message });
  }
};

// --------------------- Admin Routes ---------------------

// Get all therapists
exports.getAllTherapists = async (req, res) => {
  try {
    const therapists = await Therapist.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({ therapists });
  } catch (err) {
    console.error("getAllTherapists error:", err);
    return res.status(500).json({ message: "Error fetching therapists", error: err.message });
  }
};

// Update therapist status (pending, accepted, rejected)
exports.updateTherapistStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updated = await Therapist.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: "Therapist not found" });
    }

    return res.status(200).json({ message: "Status updated successfully", therapist: updated });
  } catch (err) {
    console.error("updateTherapistStatus error:", err);
    return res.status(500).json({ message: "Error updating therapist status", error: err.message });
  }
};

// Delete therapist
exports.deleteTherapist = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Therapist.findByIdAndDelete(id).lean();

    if (!deleted) {
      return res.status(404).json({ message: "Therapist not found" });
    }

    return res.status(200).json({ message: "Therapist deleted successfully", therapist: deleted });
  } catch (err) {
    console.error("deleteTherapist error:", err);
    return res.status(500).json({ message: "Error deleting therapist", error: err.message });
  }
};
