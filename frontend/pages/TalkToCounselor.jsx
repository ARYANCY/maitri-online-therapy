import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../utils/axiosClient";
import "bootstrap/dist/css/bootstrap.min.css";

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
    <div className="container mt-5">
      {/* Landing Section */}
      <div className="text-center mb-4">
        <h1 className="text-primary">Talk to a Counselor</h1>
        <p>Our verified counselors are ready to assist you professionally.</p>
      </div>

      {/* Error & Loading */}
      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="text-center">Loading counselors...</div>}

      {/* No counselors available */}
      {!loading && counselors.length === 0 && (
        <div className="alert alert-warning text-center">No counselors available right now.</div>
      )}

      {/* Counselor List */}
      <div className="row">
        {!loading &&
          counselors.map((c) => (
            <div className="col-md-6 mb-4" key={c._id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{c.name}</h5>
                  <p className="card-text"><strong>Email:</strong> {c.email}</p>
                  <p className="card-text"><strong>Phone:</strong> {c.phone}</p>
                  <p className="card-text"><strong>Specialization:</strong> {c.specialization}</p>
                  <p className="card-text"><strong>Experience:</strong> {c.experience} yrs</p>
                  {c.qualifications && <p className="card-text"><strong>Qualifications:</strong> {c.qualifications}</p>}
                </div>
                <div className="card-footer text-center">
                  <a href={`tel:${c.phone}`} className="btn btn-success w-100">Call Now</a>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Footer Links */}
      <footer className="text-center mt-5">
        <hr />
        <Link to="/therapist-form" className="btn btn-link me-3">Therapist Form</Link>
        <Link to="/admin" className="btn btn-link">Admin Dashboard</Link>
      </footer>
    </div>
  );
}
