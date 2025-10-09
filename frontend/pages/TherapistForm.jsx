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
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Client-side validation
    const { name, email, phone, specialization, experience } = formData;
    if (!name || !email || !phone || !specialization || !experience) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
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
      setError(err.response?.data?.message || err.message || "Error submitting form.");
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
        {[
          { label: "Name", name: "name", type: "text", required: true },
          { label: "Email", name: "email", type: "email", required: true },
          { label: "Phone", name: "phone", type: "text", required: true },
          { label: "Specialization", name: "specialization", type: "text", required: true },
          { label: "Experience (Years)", name: "experience", type: "number", required: true, min: 0 },
          { label: "Qualifications", name: "qualifications", type: "text", required: false },
        ].map((field) => (
          <div className="mb-3" key={field.name}>
            <label className="form-label">
              {field.label} {field.required && "*"}
            </label>
            <input
              type={field.type}
              className="form-control"
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              required={field.required}
              min={field.min}
            />
          </div>
        ))}

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={submitting}
        >
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
