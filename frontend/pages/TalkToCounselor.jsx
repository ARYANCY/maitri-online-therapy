import React, { useState, useEffect } from "react";
import API from "../utils/axiosClient";
import Navbar from "../components/Navbar";
import "../css/TalkToCounselor.css";

export default function TalkToCounselor() {
  const [therapists, setTherapists] = useState([]);

  const fetchAcceptedTherapists = async () => {
    try {
      const res = await API.get("/therapis/accepted");
      setTherapists(res.data);
    } catch (err) {
      console.error("Error fetching accepted therapists:", err);
    }
  };

  useEffect(() => {
    fetchAcceptedTherapists();
  }, []);

  return (
    <div className="talk-counselor-page">
      <Navbar />

      <div className="talk-counselor-container">
        <section className="hero">
          <h1>Talk to a Counselor</h1>
          <p>Our qualified therapists are ready to help you.</p>
        </section>

        <section className="counselor-list">
          {therapists.length === 0 ? (
            <p>No counselors available yet.</p>
          ) : (
            therapists.map((t) => (
              <div key={t._id} className="counselor-profile">
                <img
                  src="/default-counselor.jpg"
                  alt={t.name}
                  className="counselor-img"
                />
                <div className="counselor-details">
                  <h2>{t.name}</h2>
                  <p><strong>Specialization:</strong> {t.specialization}</p>
                  <p><strong>Experience:</strong> {t.experience} years</p>
                  <p><strong>Qualifications:</strong> {t.qualifications || "N/A"}</p>
                  <a href={`mailto:${t.email}`} className="call-btn">Contact</a>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Footer with links */}
        <footer className="talk-footer" style={{ marginTop: "40px", textAlign: "center" }}>
          <hr style={{ margin: "20px 0" }} />
          <p>
            <a href="/admin" style={{ marginRight: "20px", color: "#007bff", textDecoration: "underline" }}>
              Admin Dashboard
            </a>
            <a href="/therapist-form" style={{ color: "#007bff", textDecoration: "underline" }}>
              Therapist Form
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
