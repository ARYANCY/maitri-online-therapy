import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/axiosClient";
import "../css/Admin.css";
import Navbar from "../components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Admin() {
  const [therapists, setTherapists] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchTherapists = async () => {
    setError("");
    try {
      const data = await API.therapist.getAll();
      setTherapists(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Error fetching therapist applications");
    }
  };

  const updateStatus = async (id, status) => {
    setError("");
    try {
      await API.therapist.updateStatus(id, status);
      fetchTherapists();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Error updating status");
    }
  };

  useEffect(() => {
    fetchTherapists();
  }, []);

  return (
    <>
      <Navbar />
      <div className="admin-container light-version container my-5 p-4">
        {/* ===== Intro Section ===== */}
        <div className="text-center mb-4 intro-section">
          <h1 className="text-primary fw-bold">Therapist Applications</h1>
          <p className="text-muted lead">
            Manage and review therapist applications submitted by professionals.
            Approve trusted therapists, help patients connect faster, and maintain the highest quality of mental health support.
          </p>

          <button
            className="btn btn-outline-primary mt-3"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
        </div>

        {/* ===== Error Message ===== */}
        {error && <div className="alert alert-danger text-center">{error}</div>}

        {/* ===== Table Section ===== */}
        <div className="table-responsive shadow-sm glass-card p-3 rounded">
          <table className="table table-hover align-middle text-center admin-table">
            <thead className="table-light">
              <tr>
                {["Name", "Email", "Phone", "Specialization", "Experience", "Qualifications", "Status", "Actions"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {therapists.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-muted py-4">No applications found.</td>
                </tr>
              ) : (
                therapists.map(t => (
                  <tr key={t._id}>
                    <td>{t.name}</td>
                    <td>{t.email}</td>
                    <td>{t.phone}</td>
                    <td>{t.specialization}</td>
                    <td>{t.experience} yrs</td>
                    <td>{t.qualifications || "N/A"}</td>
                    <td className={`status ${t.status}`}>
                      {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </td>
                    <td className="action-buttons">
                      {["accepted", "rejected", "pending"].map(s => (
                        <button
                          key={s}
                          onClick={() => updateStatus(t._id, s)}
                          className={`btn btn-sm mx-1 status-btn ${s}`}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ===== Footer ===== */}
        <footer className="text-center mt-5">
          <hr />
          <Link to="/talk-to-counselor" className="btn btn-link me-3">Talk to Counselor</Link>
          <Link to="/therapist-form" className="btn btn-link">Therapist Form</Link>
        </footer>
      </div>
    </>
  );
}
