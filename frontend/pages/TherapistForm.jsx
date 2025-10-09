import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../utils/axiosClient";
import "bootstrap/dist/css/bootstrap.min.css";

export default function TherapistForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    qualifications: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Client-side validation
    if (!formData.name || !formData.email || !formData.phone || !formData.specialization || !formData.experience) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setError("Phone number must be 10 digits.");
      return;
    }

    setSubmitting(true);
    try {
      await API.therapist.apply(formData);
      setMessage("Form submitted successfully!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        experience: "",
        qualifications: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error submitting form");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center text-primary mb-4">Therapist Application Form</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label className="form-label">Name *</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email *</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Phone *</label>
          <input
            type="text"
            className="form-control"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Specialization *</label>
          <input
            type="text"
            className="form-control"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Experience (Years) *</label>
          <input
            type="number"
            className="form-control"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            required
            min="0"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Qualifications</label>
          <input
            type="text"
            className="form-control"
            name="qualifications"
            value={formData.qualifications}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </form>

      <footer className="text-center mt-5">
        <hr />
        <Link to="/admin" className="me-3 btn btn-link">Admin Dashboard</Link>
        <Link to="/talk-to-counselor" className="btn btn-link">Talk to Counselor</Link>
      </footer>
    </div>
  );
}
