import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/axiosClient";
import Navbar from "../components/Navbar";
import "../css/Admin.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Admin() {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const autoDeleteTimers = useRef({});

  // --- Fetch therapist applications
  const fetchTherapists = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const data = await API.adminTherapist.getAll();
      setTherapists(data.map(t => ({ ...t, status: t.status || "pending" })));
    } catch (err) {
      setError(err.message || "Failed to fetch therapist applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Handle accept/reject/delete actions
  const handleAction = useCallback(
    async (id, action) => {
      if (!id || !action) return;
      setActionLoading(id);

      try {
        switch (action) {
          case "accept":
            await API.adminTherapist.updateStatus(id, "accepted");
            break;
          case "reject":
            await API.adminTherapist.updateStatus(id, "rejected");

            // Schedule auto-delete after 2 hours
            if (autoDeleteTimers.current[id]) clearTimeout(autoDeleteTimers.current[id]);
            autoDeleteTimers.current[id] = setTimeout(async () => {
              try {
                await API.adminTherapist.delete(id);
                fetchTherapists();
                delete autoDeleteTimers.current[id];
              } catch (err) {
                console.error("Auto-delete failed:", err);
              }
            }, 2 * 60 * 60 * 1000);
            break;
          case "delete":
            await API.adminTherapist.delete(id);
            break;
          default:
            break;
        }
        await fetchTherapists();
      } catch (err) {
        setError(err.message || `Failed to ${action} therapist.`);
      } finally {
        setActionLoading(null);
      }
    },
    [fetchTherapists]
  );

  // --- Load therapists once
  useEffect(() => {
    fetchTherapists();

    return () => {
      // Clear all scheduled auto-delete timers
      Object.values(autoDeleteTimers.current).forEach(timer => clearTimeout(timer));
      autoDeleteTimers.current = {};
    };
  }, [fetchTherapists]);

  return (
    <>
      <Navbar />
      <div className="admin-container container my-5 p-4">
        <div className="text-center mb-4">
          <h1 className="text-primary fw-bold">Therapist Applications</h1>
          <p className="text-muted lead">
            Review therapist applications. Approve trusted professionals or reject unverified entries.
          </p>
          <button className="btn btn-outline-primary mt-3" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </button>
        </div>

        {error && <div className="alert alert-danger text-center">{error}</div>}
        {loading && <div className="text-center my-3">Loading therapists...</div>}

        {!loading && therapists.length > 0 ? (
          <div className="table-responsive shadow-sm glass-card p-3 rounded">
            <table className="table table-hover align-middle text-center admin-table">
              <thead className="table-light">
                <tr>
                  {["Name", "Email", "Phone", "Specialization", "Experience", "Qualifications", "Status", "Actions"].map(
                    (header) => (
                      <th key={header}>{header}</th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {therapists.map(({ _id, name, email, phone, specialization, experience, qualifications, status }) => (
                  <tr key={_id}>
                    <td>{name}</td>
                    <td>{email}</td>
                    <td>{phone}</td>
                    <td>{specialization}</td>
                    <td>{experience} yrs</td>
                    <td>{qualifications || "N/A"}</td>
                    <td className={`status ${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</td>
                    <td className="action-buttons">
                      <button
                        className="btn btn-sm mx-1 status-btn accepted"
                        onClick={() => handleAction(_id, "accept")}
                        disabled={status === "accepted" || actionLoading === _id}
                      >
                        {actionLoading === _id && status !== "accepted" ? "..." : "Accept"}
                      </button>
                      <button
                        className="btn btn-sm mx-1 status-btn rejected"
                        onClick={() => handleAction(_id, "reject")}
                        disabled={status === "rejected" || actionLoading === _id}
                      >
                        {actionLoading === _id && status !== "rejected" ? "..." : "Reject"}
                      </button>
                      <button
                        className="btn btn-sm mx-1 status-btn deleted"
                        onClick={() => handleAction(_id, "delete")}
                        disabled={actionLoading === _id}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !loading && <div className="text-center py-4 text-muted">No therapist applications found.</div>
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
