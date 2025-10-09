import React, { useState } from "react";
import API from "../utils/axiosClient";
import { Link } from "react-router-dom";
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
  const [validated, setValidated] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const form = e.currentTarget;
    if (form.checkValidity() === false || !/^\d{10}$/.test(formData.phone)) {
      e.stopPropagation();
      setValidated(true);
      if (!/^\d{10}$/.test(formData.phone)) setError("Phone number must be 10 digits.");
      return;
    }

    setValidated(true);

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
      setValidated(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error submitting form");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{ backgroundColor: "#f4f4f4" }}
    >
      <div
        className="p-5 rounded shadow-lg"
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(10px)",
          borderRadius: "15px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h1 className="text-center mb-4 text-primary">Therapist Application Form</h1>

        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <form noValidate className={validated ? "was-validated" : ""} onSubmit={handleSubmit}>
          {[
            { label: "Name", type: "text", name: "name" },
            { label: "Email", type: "email", name: "email" },
            { label: "Phone", type: "text", name: "phone" },
            { label: "Specialization", type: "text", name: "specialization" },
            { label: "Experience (Years)", type: "number", name: "experience" },
            { label: "Qualifications", type: "text", name: "qualifications" },
          ].map((field) => (
            <div className="mb-3" key={field.name}>
              <label className="form-label">{field.label}{field.name !== "qualifications" && " *"}</label>
              <input
                type={field.type}
                className="form-control"
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                required={field.name !== "qualifications"}
              />
              <div className="invalid-feedback">
                {field.name === "phone"
                  ? "Please enter a valid 10-digit phone number."
                  : `Please provide your ${field.label.toLowerCase()}.`}
              </div>
            </div>
          ))}

          <button type="submit" className="btn btn-primary w-100">
            Submit
          </button>
        </form>

        <footer className="text-center mt-4">
          <hr />
          <Link to="/admin" className="me-3 btn btn-link">Admin Dashboard</Link>
          <Link to="/talk-to-counselor" className="btn btn-link">Talk to Counselor</Link>
        </footer>
      </div>
    </div>
  );
}
