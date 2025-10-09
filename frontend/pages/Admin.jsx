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
      setTherapists(
        data.map(t => ({
          ...t,
          status: t.status || "pending", // Ensure all new ones default to pending
        }))
      );
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Error fetching therapist applications");
    }
  };

  const handleReject = async (id) => {
    try {
      await API.therapist.updateStatus(id, "rejected");
      fetchTherapists();

      // Schedule deletion after 2 hours
      setTimeout(async () => {
        try {
          await API.therapist.delete(id);
          console.log(`Therapist ${id} auto-deleted after rejection.`);
          fetchTherapists();
        } catch (err) {
          console.error("Auto-delete failed:", err);
        }
      }, 2 * 60 * 60 * 1000); // 2 hours in ms
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Error rejecting therapist");
    }
  };

  const handleAccept = async (id) => {
    try {
      await API.therapist.updateStatus(id, "accepted");
      fetchTherapists();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Error accepting therapist");
    }
  };

  useEffect(() => {
    fetchTherapists();
  }, []);

  return (
    <>
      <Navbar />
      <div className="admin-container light-version container my-5 p-4">
        <div className="text-center mb-4 intro-section">
          <h1 className="text-primary fw-bold">Therapist Applications</h1>
          <p className="text-muted lead">
            Manage and review therapist applications submitted by professionals.
            Approve trusted therapists to connect faster, or reject unverified entries for quality assurance.
          </p>

          <button
            className="btn btn-outline-primary mt-3"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
        </div>

        {error && <div className="alert alert-danger text-center">{error}</div>}

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
                      <button
                        onClick={() => handleAccept(t._id)}
                        className="btn btn-sm mx-1 status-btn accepted"
                        disabled={t.status === "accepted"}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(t._id)}
                        className="btn btn-sm mx-1 status-btn rejected"
                        disabled={t.status === "rejected"}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="text-center mt-5">
          <hr />
          <Link to="/talk-to-counselor" className="btn btn-link me-3">Talk to Counselor</Link>
          <Link to="/therapist-form" className="btn btn-link">Therapist Form</Link>
        </footer>
      </div>
    </>
  );
}
