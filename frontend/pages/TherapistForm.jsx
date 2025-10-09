import React, { useState } from "react";
import Navbar from "../components/Navbar";
import API from "../utils/axiosClient";

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

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
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
      setMessage(err.message);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <Navbar />
      <h1>Therapist Application Form</h1>
      <form onSubmit={handleSubmit}>
        {["name", "email", "phone", "specialization", "experience", "qualifications"].map(field => (
          <label key={field} style={{ display: "block", marginBottom: "10px" }}>
            {field.charAt(0).toUpperCase() + field.slice(1)}:
            <input
              type={field === "email" ? "email" : field === "experience" ? "number" : "text"}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              required={field !== "qualifications"}
              style={{ width: "100%", padding: "5px", marginTop: "3px" }}
            />
          </label>
        ))}
        <button type="submit" style={{ marginTop: "10px", padding: "10px 20px" }}>Submit</button>
      </form>
      {message && <p style={{ marginTop: "15px", color: "green" }}>{message}</p>}

      <footer style={{ marginTop: "40px", textAlign: "center" }}>
        <hr />
        <p>
          <a href="/admin" style={{ marginRight: "20px" }}>Admin Dashboard</a>
          <a href="/talk-to-counselor">Talk to Counselor</a>
        </p>
      </footer>
    </div>
  );
}
