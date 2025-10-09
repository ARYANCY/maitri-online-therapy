import React, { useEffect, useState } from "react";
import API from "../utils/axiosClient";
import "../css/TalkToCounselor.css";

export default function TalkToCounselor() {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCounselors = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await API.therapist.getAccepted(); // API route must exist
        setCounselors(data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message || "Error fetching counselors");
      } finally {
        setLoading(false);
      }
    };
    fetchCounselors();
  }, []);

  return (
    <div className="counselor-container light-version">
      <header className="counselor-header">
        <h1>Talk to a Counselor</h1>
        <p>Our verified counselors are ready to assist you professionally.</p>
      </header>

      {error && <p className="error-msg">{error}</p>}
      {loading && <p className="loading-msg">Loading counselors...</p>}

      {!loading && counselors.length === 0 && (
        <p className="no-counselors">No counselors available right now.</p>
      )}

      {!loading && counselors.length > 0 && (
        <div className="counselor-list">
          {counselors.map(c => (
            <div className="counselor-card" key={c._id}>
              <h3>{c.name}</h3>
              <p><strong>Email:</strong> {c.email}</p>
              <p><strong>Phone:</strong> {c.phone}</p>
              <p><strong>Specialization:</strong> {c.specialization}</p>
              <p><strong>Experience:</strong> {c.experience} yrs</p>
              {c.qualifications && <p><strong>Qualifications:</strong> {c.qualifications}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
