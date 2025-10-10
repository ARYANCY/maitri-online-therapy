import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/axiosClient";
import "../css/Admin.css";
import Navbar from "../components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Admin() {
  const [therapists, setTherapists] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  // --- Fetch therapists
  const fetchTherapists = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await API.therapist.getAll();
      setTherapists(
        data.map((t) => ({
          ...t,
          status: t.status || "pending",
        }))
      );
    } catch (err) {
      setError(err.message || "Error fetching therapist applications");
    } finally {
      setLoading(false);
    }
  };

  // --- Accept therapist
  const handleAccept = async (id) => {
    setActionLoading(id);
    try {
      await API.therapist.updateStatus(id, "accepted");
      fetchTherapists();
    } catch (err) {
      setError(err.message || "Error accepting therapist");
    } finally {
      setActionLoading(null);
    }
  };

  // --- Reject therapist
  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this therapist?")) return;
    setActionLoading(id);
    try {
      await API.therapist.updateStatus(id, "rejected");
      fetchTherapists();

      // Auto-delete after 2 hours
      setTimeout(async () => {
        try {
          await API.therapist.delete(id);
          fetchTherapists();
        } catch (err) {
          console.error("Auto-delete failed:", err);
        }
      }, 2 * 60 * 60 * 1000);
    } catch (err) {
      setError(err.message || "Error rejecting therapist");
    } finally {
      setActionLoading(null);
    }
  };

  // --- Delete therapist
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this therapist?")) return;
    setActionLoading(id);
    try {
      await API.therapist.delete(id);
      fetchTherapists();
    } catch (err) {
      setError(err.message || "Error deleting therapist");
    } finally {
      setActionLoading(null);
    }
  };

  // --- Initial fetch
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
            Review therapist applications. Approve trusted professionals to connect faster, or reject unverified entries for quality assurance.
          </p>

          <button
            className="btn btn-outline-primary mt-3"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
        </div>

        {/* Error */}
        {error && <div className="alert alert-danger text-center">{error}</div>}

        {/* Loading */}
        {loading && <div className="text-center my-3">Loading therapists...</div>}

        {/* Therapist Table */}
        {!loading && therapists.length > 0 && (
          <div className="table-responsive shadow-sm glass-card p-3 rounded">
            <table className="table table-hover align-middle text-center admin-table">
              <thead className="table-light">
                <tr>
                  {[
                    "Name",
                    "Email",
                    "Phone",
                    "Specialization",
                    "Experience",
                    "Qualifications",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {therapists.map((t) => (
                  <tr key={t._id} className="therapist-row">
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
                        disabled={t.status === "accepted" || actionLoading === t._id}
                      >
                        {actionLoading === t._id && t.status !== "accepted" ? "..." : "Accept"}
                      </button>
                      <button
                        onClick={() => handleReject(t._id)}
                        className="btn btn-sm mx-1 status-btn rejected"
                        disabled={t.status === "rejected" || actionLoading === t._id}
                      >
                        {actionLoading === t._id && t.status !== "rejected" ? "..." : "Reject"}
                      </button>
                      <button
                        onClick={() => handleDelete(t._id)}
                        className="btn btn-sm mx-1 status-btn deleted"
                        disabled={actionLoading === t._id}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && therapists.length === 0 && (
          <div className="text-center py-4 text-muted">No therapist applications found.</div>
        )}

        <footer className="text-center mt-5">
          <hr />
          <Link to="/talk-to-counselor" className="btn btn-link me-3">
            Talk to Counselor
          </Link>
          <Link to="/therapist-form" className="btn btn-link">
            Therapist Form
          </Link>
        </footer>
      </div>
    </>
  );
}
