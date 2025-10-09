import React, { useState } from "react";
import API from "../utils/axiosClient";
import { Link } from "react-router-dom";

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

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage("");
    setError("");

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
      setError(err.message || "Error submitting form");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Therapist Application Form</h1>

      <form onSubmit={handleSubmit}>
        {[
          { label: "Name", type: "text", name: "name" },
          { label: "Email", type: "email", name: "email" },
          { label: "Phone", type: "text", name: "phone" },
          { label: "Specialization", type: "text", name: "specialization" },
          { label: "Experience (Years)", type: "number", name: "experience" },
          { label: "Qualifications", type: "text", name: "qualifications" },
        ].map(field => (
          <label key={field.name} style={{ display: "block", marginBottom: "12px" }}>
            {field.label}:
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              required={field.name !== "qualifications"}
              style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </label>
        ))}

        <button type="submit" style={{ padding: "10px 25px", border: "none", borderRadius: "4px", backgroundColor: "#007BFF", color: "#fff", cursor: "pointer", fontSize: "16px" }}>
          Submit
        </button>
      </form>

      {message && <p style={{ marginTop: "15px", color: "green" }}>{message}</p>}
      {error && <p style={{ marginTop: "15px", color: "red" }}>{error}</p>}

      <footer style={{ marginTop: "40px", textAlign: "center", fontSize: "14px" }}>
        <hr style={{ margin: "20px 0" }} />
        <p>
          <Link to="/admin" style={{ marginRight: "20px", color: "#007BFF" }}>Admin Dashboard</Link>
          <Link to="/talk-to-counselor" style={{ color: "#007BFF" }}>Talk to Counselor</Link>
        </p>
      </footer>
    </div>
  );
}
