import React, { useState } from "react";
import Navbar from "../components/Navbar";
import "../css/TalkToCounselor.css";
import dhriti from "../src/images/dd.jpeg"; 

export default function TalkToCounselor({ user }) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Your request has been submitted. Our counselor will contact you soon!");
    setFormData({ name: user?.name || "", email: "", message: "" });
  };

  return (
    <div className="talk-counselor-page">
      <Navbar user={user} />

      <div className="talk-counselor-container">

        <section className="hero">
          <h1>Talk to a Counselor</h1>
          <p>
            Need guidance or support? Reach out to our professional counselor for a confidential and empathetic conversation.
          </p>
        </section>

        <section className="counselor-profile">
          <img src={dhriti} alt="Dhriti Tapati Dey" className="counselor-img" />
          <div className="counselor-details">
            <h2>DHRITI TAPATI DEY</h2>
            <p><strong>Qualifications:</strong> M.A. in Clinical Psychology, Certified CBT Practitioner</p>
            <p><strong>Experience:</strong> 7 years in mental health counseling, specializing in anxiety, depression, and stress management</p>
            <p><strong>Languages:</strong> English, Hindi, Assamese</p>
            <p><strong>Availability:</strong> Mon-Fri, 10:00 AM - 6:00 PM</p>
            <a href="tel:8822925245" className="call-btn">Call 88229 25245</a>
          </div>
        </section>

        <section className="counselor-form-section">
          <h2>Request a Session</h2>
          <form className="counselor-form" onSubmit={handleSubmit}>
            <label>
              Name
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email"
                required
              />
            </label>
            <label>
              Message
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your concerns here..."
                rows="5"
                required
              ></textarea>
            </label>
            <button type="submit" className="submit-btn">Submit Request</button>
          </form>
        </section>

      </div>
    </div>
  );
}
