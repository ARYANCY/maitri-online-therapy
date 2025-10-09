import React, { useState } from "react";
import API from "../utils/axiosClient";
import Navbar from "../components/Navbar";
import "../css/TalkToCounselor.css";

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

  return (
    <div className="talk-counselor-page">
      <Navbar />
      <div className="talk-counselor-container">
        <h1>Therapist Application Form</h1>

        <form className="counselor-form" onSubmit={handleSubmit}>
          {["name","email","phone","specialization","experience","qualifications"].map((field) => (
            <label key={field}>
              {field.charAt(0).toUpperCase() + field.slice(1)}
              <input
                type={field === "email" ? "email" : field === "experience" ? "number" : "text"}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required={field !== "qualifications"}
              />
            </label>
          ))}
          <button type="submit">Submit</button>
        </form>

        {message && <p style={{ marginTop: "10px" }}>{message}</p>}

        <footer style={{ marginTop: "40px", textAlign: "center" }}>
          <hr style={{ margin: "20px 0" }} />
          <p>
            <a href="/admin" style={{ marginRight: "20px" }}>Admin Dashboard</a>
            <a href="/talk-to-counselor">Talk to Counselor</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
