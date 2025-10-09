import React, { useState, useEffect } from "react";
import API from "../utils/axiosClient";
import Navbar from "../components/Navbar";

export default function TalkToCounselor() {
  const [therapists, setTherapists] = useState([]);

  useEffect(() => {
    const fetchAcceptedTherapists = async () => {
      try {
        const res = await API.get("/therapis/accepted");
        setTherapists(res.data);
      } catch (err) {
        console.error("Error fetching accepted therapists:", err);
      }
    };
    fetchAcceptedTherapists();
  }, []);

  const containerStyle = {
    maxWidth: "900px",
    margin: "40px auto",
    padding: "20px",
    background: "#f7f7f7",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  };

  const cardStyle = {
    display: "flex",
    alignItems: "center",
    background: "#fff",
    padding: "20px",
    marginBottom: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  };

  const imgStyle = {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    marginRight: "20px",
    objectFit: "cover",
    border: "2px solid #4CAF50",
  };

  const buttonStyle = {
    background: "#4CAF50",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    textDecoration: "none",
    cursor: "pointer",
    transition: "0.3s",
  };

  const buttonHover = {
    background: "#45a049",
  };

  const footerStyle = {
    marginTop: "40px",
    textAlign: "center",
    fontSize: "14px",
  };

  const linkStyle = {
    marginRight: "20px",
    color: "#007BFF",
    textDecoration: "none",
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#e9ecef", minHeight: "100vh" }}>
      <Navbar />
      <div style={containerStyle}>
        <h1 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>Talk to a Counselor</h1>
        <p style={{ textAlign: "center", marginBottom: "30px", color: "#555" }}>
          Our qualified therapists are ready to help you.
        </p>

        {therapists.length === 0 ? (
          <p style={{ textAlign: "center", color: "#777" }}>No counselors available yet.</p>
        ) : (
          therapists.map((t) => (
            <div key={t._id} style={cardStyle}>
              <img src="/default-counselor.jpg" alt={t.name} style={imgStyle} />
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: "0 0 10px 0", color: "#333" }}>{t.name}</h2>
                <p style={{ margin: "4px 0" }}><strong>Specialization:</strong> {t.specialization}</p>
                <p style={{ margin: "4px 0" }}><strong>Experience:</strong> {t.experience} years</p>
                <p style={{ margin: "4px 0" }}><strong>Qualifications:</strong> {t.qualifications || "N/A"}</p>
                <a href={`mailto:${t.email}`} style={buttonStyle}>Contact</a>
              </div>
            </div>
          ))
        )}

        <footer style={footerStyle}>
          <hr style={{ margin: "20px 0" }} />
          <p>
            <a href="/admin" style={linkStyle}>Admin Dashboard</a>
            <a href="/therapist-form" style={linkStyle}>Therapist Form</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
