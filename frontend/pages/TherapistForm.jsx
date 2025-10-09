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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/therapis/apply", formData);
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
      console.error(err);
      setMessage(err.response?.data?.error || "Error submitting form");
    }
  };

  const containerStyle = {
    maxWidth: "600px",
    margin: "40px auto",
    padding: "20px",
    background: "#f7f7f7",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    fontFamily: "Arial, sans-serif",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    margin: "8px 0",
    borderRadius: "5px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  };

  const buttonStyle = {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px",
  };

  const footerStyle = { marginTop: "30px", textAlign: "center", fontSize: "14px" };
  const linkStyle = { marginRight: "20px", color: "#007BFF", textDecoration: "none" };

  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: "center" }}>Therapist Application Form</h1>
      <form onSubmit={handleSubmit}>
        {["name","email","phone","specialization","experience","qualifications"].map((field) => (
          <div key={field}>
            <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
            <input
              type={field === "email" ? "email" : field === "experience" ? "number" : "text"}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              style={inputStyle}
              required={field !== "qualifications"}
            />
          </div>
        ))}
        <button type="submit" style={buttonStyle}>Submit</button>
      </form>
      {message && <p style={{ marginTop: "10px", color: "green" }}>{message}</p>}
      <footer style={footerStyle}>
        <hr style={{ margin: "20px 0" }} />
        <Link to="/admin" style={linkStyle}>Admin Dashboard</Link>
        <Link to="/talk-to-counselor" style={linkStyle}>Talk to Counselor</Link>
      </footer>
    </div>
  );
}
