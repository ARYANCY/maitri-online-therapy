import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../utils/axiosClient";
import "../css/CounselorList.css";

export default function CounselorList() {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCounselors = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await API.therapist.getAccepted();
        setCounselors(data);
      } catch (err) {
        console.error(err);
        setError("Error fetching counselors");
      } finally {
        setLoading(false);
      }
    };
    fetchCounselors();
  }, []);

  return (
    <div className="counselor-container">
      {/* Landing Section */}
      <header className="counselor-header">
        <h1>Talk to a Counselor</h1>
        <p>Our verified counselors are ready to assist you professionally.</p>
      </header>

      {/* Error & Loading */}
      {error && <p className="error-msg">{error}</p>}
      {loading && <p className="loading-msg">Loading counselors...</p>}

      {/* No counselors available */}
      {!loading && counselors.length === 0 && (
        <p className="no-counselors">No counselors available right now.</p>
      )}

      {/* Counselor List */}
      <div className="counselor-list">
        {!loading && counselors.map(c => (
          <div className="counselor-card" key={c._id}>
            <div className="counselor-info">
              <h3>{c.name}</h3>
              <p><strong>Email:</strong> {c.email}</p>
              <p><strong>Specialization:</strong> {c.specialization}</p>
              <p><strong>Experience:</strong> {c.experience} yrs</p>
              {c.qualifications && <p><strong>Qualifications:</strong> {c.qualifications}</p>}
              <p><strong>Phone:</strong> {c.phone}</p>
            </div>
            <a href={`tel:${c.phone}`} className="call-button">Call Now</a>
          </div>
        ))}
      </div>

      {/* Footer Links */}
      <footer className="counselor-footer">
        <Link to="/therapist-form" className="footer-link">Therapist Form</Link>
        <Link to="/admin" className="footer-link">Admin Dashboard</Link>
      </footer>
    </div>
  );
}
