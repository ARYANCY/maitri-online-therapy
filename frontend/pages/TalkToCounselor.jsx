import React, { useEffect, useState } from "react";
import API from "../utils/axiosClient";
import Navbar from "../components/Navbar";
import "../css/TalkToCounselor.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function TalkToCounselor() {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCounselors = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await API.therapist.getAccepted(); // Ensure this route exists
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
    <div className="talk-container light-version" style={{ minHeight: "100vh", backgroundColor: "#f4f4f4" }}>
      <Navbar />
      
      <div className="container py-5">
        <header className="text-center mb-5">
          <h1>Talk to a Counselor</h1>
          <p>Our verified counselors are ready to assist you professionally.</p>
        </header>

        {error && <div className="alert alert-danger text-center">{error}</div>}
        {loading && <p className="text-center">Loading counselors...</p>}

        {!loading && counselors.length === 0 && (
          <p className="text-center">No counselors available right now.</p>
        )}

        <div className="row">
          {!loading && counselors.map(c => (
            <div key={c._id} className="col-md-6 mb-4">
              <div className="card shadow-sm glass-card h-100">
                <div className="card-body">
                  <h5 className="card-title">{c.name}</h5>
                  <p className="card-text"><strong>Email:</strong> {c.email}</p>
                  <p className="card-text"><strong>Phone:</strong> {c.phone}</p>
                  <p className="card-text"><strong>Specialization:</strong> {c.specialization}</p>
                  <p className="card-text"><strong>Experience:</strong> {c.experience} yrs</p>
                  {c.qualifications && <p className="card-text"><strong>Qualifications:</strong> {c.qualifications}</p>}
                  <a href={`tel:${c.phone}`} className="btn btn-primary w-100 mt-3">Call Now</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
