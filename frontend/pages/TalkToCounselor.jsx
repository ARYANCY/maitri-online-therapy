import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../utils/axiosClient";

export default function TalkToCounselor() {
  const [therapists, setTherapists] = useState([]);

  useEffect(() => {
    const fetchAccepted = async () => {
      try {
        const data = await API.therapist.getAccepted();
        setTherapists(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAccepted();
  }, []);

  const profileStyle = {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ddd",
    padding: "15px",
    marginBottom: "15px",
    borderRadius: "8px",
    backgroundColor: "#fefefe",
  };

  const imgStyle = {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    marginRight: "20px",
    objectFit: "cover",
  };

  const buttonStyle = {
    padding: "5px 10px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#2196F3",
    color: "white",
    cursor: "pointer",
  };

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: "800px", margin: "40px auto" }}>
        <h1>Talk to a Counselor</h1>
        <p>Our qualified therapists are ready to help you.</p>

        {therapists.length === 0 ? (
          <p>No counselors available yet.</p>
        ) : (
          therapists.map(t => (
            <div key={t._id} style={profileStyle}>
              <img src="/default-counselor.jpg" alt={t.name} style={imgStyle} />
              <div>
                <h3>{t.name}</h3>
                <p><strong>Specialization:</strong> {t.specialization}</p>
                <p><strong>Experience:</strong> {t.experience} yrs</p>
                <p><strong>Qualifications:</strong> {t.qualifications || "N/A"}</p>
                <a href={`mailto:${t.email}`} style={buttonStyle}>Contact</a>
              </div>
            </div>
          ))
        )}

        <footer style={{ marginTop: "40px", textAlign: "center" }}>
          <hr style={{ margin: "20px 0" }} />
          <Link to="/admin" style={{ marginRight: "20px" }}>Admin Dashboard</Link>
          <Link to="/therapist-form">Therapist Form</Link>
        </footer>
      </div>
    </div>
  );
}
