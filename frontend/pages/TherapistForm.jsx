import React, { useState } from "react";
import { Link } from "react-router-dom";
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

  const containerStyle = {
    maxWidth: "600px",
    margin: "40px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    backgroundColor: "#f9f9f9",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    margin: "5px 0 15px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  };

  const buttonStyle = {
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#4CAF50",
    color: "white",
    cursor: "pointer",
  };

  return (
    <div>
      <Navbar />
      <div style={containerStyle}>
        <h1>Therapist Application Form</h1>
        <form onSubmit={handleSubmit}>
          {["name", "email", "phone", "specialization", "experience", "qualifications"].map(field => (
            <label key={field}>
              {field.charAt(0).toUpperCase() + field.slice(1)}
              <input
                type={field === "email" ? "email" : field === "experience" ? "number" : "text"}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required={field !== "qualifications"}
                style={inputStyle}
              />
            </label>
          ))}
          <button type="submit" style={buttonStyle}>Submit</button>
        </form>
        {message && <p style={{ marginTop: "10px" }}>{message}</p>}

        <footer style={{ marginTop: "40px", textAlign: "center" }}>
          <hr style={{ margin: "20px 0" }} />
          <Link to="/admin" style={{ marginRight: "20px" }}>Admin Dashboard</Link>
          <Link to="/talk-to-counselor">Talk to Counselor</Link>
        </footer>
      </div>
    </div>
  );
}
