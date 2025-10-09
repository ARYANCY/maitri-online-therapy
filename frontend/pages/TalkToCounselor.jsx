import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../utils/axiosClient";
import Navbar from "../components/Navbar";
import "../css/TalkToCounselor.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function TalkToCounselor() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState({ user: true, list: true });
  const [error, setError] = useState({ user: "", list: "" });

  const fetchUser = useCallback(async () => {
    try {
      const data = await API.auth.checkSession();
      if (!data?.user) {
        navigate("/login");
        return;
      }
      setUser(data.user);
      setError(prev => ({ ...prev, user: "" }));
    } catch (err) {
      navigate("/login");
    } finally {
      setLoading(prev => ({ ...prev, user: false }));
    }
  }, [navigate]);

  const fetchCounselors = useCallback(async () => {
    setLoading(prev => ({ ...prev, list: true }));
    setError(prev => ({ ...prev, list: "" }));
    try {
      const data = await API.therapist.getAccepted();
      setCounselors(data);
    } catch (err) {
      setError(prev => ({
        ...prev,
        list: err.response?.data?.message || err.message || "Error fetching counselors",
      }));
    } finally {
      setLoading(prev => ({ ...prev, list: false }));
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) fetchCounselors();
  }, [user, fetchCounselors]);

  return (
    <div className="talk-container light-version" style={{ minHeight: "100vh", backgroundColor: "#f4f4f4" }}>
      <Navbar user={user} />
      <div className="container py-5">
        <header className="text-center mb-5">
          <h1 className="fw-bold text-primary">Talk to a Counselor</h1>
          <p className="lead text-muted">Our verified counselors are ready to assist you professionally.</p>
        </header>

        {error.list && <div className="alert alert-danger text-center">{error.list}</div>}
        {loading.list && <p className="text-center">Loading counselors...</p>}
        {!loading.list && counselors.length === 0 && (
          <p className="text-center text-muted">No counselors available right now.</p>
        )}

        <div className="row">
          {!loading.list &&
            counselors.map((c) => (
              <div key={c._id} className="col-md-6 col-lg-4 mb-4">
                <div className="card shadow-sm glass-card h-100 border-0">
                  <div className="card-body">
                    <h5 className="card-title text-dark">{c.name}</h5>
                    <p className="card-text mb-1"><strong>Email:</strong> {c.email}</p>
                    <p className="card-text mb-1"><strong>Phone:</strong> {c.phone}</p>
                    <p className="card-text mb-1"><strong>Specialization:</strong> {c.specialization}</p>
                    <p className="card-text mb-1"><strong>Experience:</strong> {c.experience} yrs</p>
                    {c.qualifications && (
                      <p className="card-text mb-1"><strong>Qualifications:</strong> {c.qualifications}</p>
                    )}
                    <a href={`tel:${c.phone}`} className="btn btn-primary w-100 mt-3">
                      Call Now
                    </a>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <footer className="text-center py-4 border-top bg-white">
        <div className="container">
          <p className="mb-2 text-muted">&copy; 2025 MindConnect | Empowering mental wellness</p>
          <div>
            <Link to="/therapist-form" className="btn btn-link">Therapist Form</Link>
            <Link to="/admin" className="btn btn-link">Admin Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}


