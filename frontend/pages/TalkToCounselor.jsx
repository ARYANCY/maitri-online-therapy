import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../utils/axiosClient";

export default function TalkToCounselor() {
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
        setError("Error fetching counselors.");
      } finally {
        setLoading(false);
      }
    };
    fetchCounselors();
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-3">Talk to a Counselor</h1>
      <p className="text-center">Our verified counselors are ready to assist you professionally.</p>

      {error && <div className="alert alert-danger text-center">{error}</div>}
      {loading && <p className="text-center">Loading counselors...</p>}

      {!loading && counselors.length === 0 && (
        <p className="text-center">No counselors available at the moment.</p>
      )}

      <div className="row">
        {!loading &&
          counselors.map(c => (
            <div key={c._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{c.name}</h5>
                  <p className="card-text"><strong>Specialization:</strong> {c.specialization}</p>
                  <p className="card-text"><strong>Experience:</strong> {c.experience} yrs</p>
                  {c.qualifications && <p className="card-text"><strong>Qualifications:</strong> {c.qualifications}</p>}
                  <p className="card-text"><strong>Email:</strong> {c.email}</p>
                  <p className="card-text"><strong>Phone:</strong> {c.phone}</p>
                  <a href={`tel:${c.phone}`} className="btn btn-primary w-100">Call Now</a>
                </div>
              </div>
            </div>
          ))}
      </div>

      <footer className="text-center mt-5">
        <hr />
        <Link to="/therapist-form" className="btn btn-link me-3">Therapist Form</Link>
        <Link to="/admin" className="btn btn-link">Admin Dashboard</Link>
      </footer>
    </div>
  );
}
