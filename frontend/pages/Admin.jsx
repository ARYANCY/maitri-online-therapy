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
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const navigate = useNavigate();
  const autoDeleteTimers = useRef({});

  // --- Verify admin session only once
  const checkAdmin = useCallback(async () => {
    setCheckingAdmin(true);

    if (localStorage.getItem("isAdmin") === "true") {
      setCheckingAdmin(false);
      return true;
    }

    try {
      const session = await API.auth.adminCheckSession();
      if (session?.user?.isAdmin) {
        localStorage.setItem("isAdmin", "true");
        setCheckingAdmin(false);
        return true;
      } else {
        localStorage.removeItem("isAdmin");
        navigate("/admin-login", { replace: true });
        return false;
      }
    } catch {
      localStorage.removeItem("isAdmin");
      navigate("/admin-login", { replace: true });
      return false;
    }
  }, [navigate]);

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

  // --- Handle therapist actions
  const handleAction = async (id, action) => {
    if (!id || !action) return;
    setActionLoading(id);

    try {
      switch (action) {
        case "accept":
          await API.adminTherapist.updateStatus(id, "accepted");
          break;
        case "reject":
          await API.adminTherapist.updateStatus(id, "rejected");

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
      }
      await fetchTherapists();
    } catch (err) {
      setError(err.message || `Failed to ${action} therapist.`);
    } finally {
      setActionLoading(null);
    }
  };

  // --- Initialize: check admin and fetch therapists
  useEffect(() => {
    let isMounted = true;

    (async () => {
      const ok = await checkAdmin();
      if (ok && isMounted) fetchTherapists();
    })();

    return () => {
      isMounted = false;
      Object.values(autoDeleteTimers.current).forEach(timer => clearTimeout(timer));
      autoDeleteTimers.current = {};
    };
  }, [checkAdmin, fetchTherapists]);

  if (checkingAdmin)
    return <div className="text-center py-5">Verifying admin privileges...</div>;

  return (
    <>
      <Navbar />
      <div className="admin-container container my-5 p-4">
        <div className="text-center mb-4">
          <h1 className="text-primary fw-bold">Therapist Applications</h1>
          <p className="text-muted lead">
            Review therapist applications. Approve trusted professionals or reject unverified entries.
          </p>
          <button
            className="btn btn-outline-primary mt-3"
            onClick={() => navigate("/dashboard")}
          >
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
                  {[
                    "Name",
                    "Email",
                    "Phone",
                    "Specialization",
                    "Experience",
                    "Qualifications",
                    "Status",
                    "Actions",
                  ].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {therapists.map(t => (
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
                        className="btn btn-sm mx-1 status-btn accepted"
                        onClick={() => handleAction(t._id, "accept")}
                        disabled={t.status === "accepted" || actionLoading === t._id}
                      >
                        {actionLoading === t._id && t.status !== "accepted" ? "..." : "Accept"}
                      </button>
                      <button
                        className="btn btn-sm mx-1 status-btn rejected"
                        onClick={() => handleAction(t._id, "reject")}
                        disabled={t.status === "rejected" || actionLoading === t._id}
                      >
                        {actionLoading === t._id && t.status !== "rejected" ? "..." : "Reject"}
                      </button>
                      <button
                        className="btn btn-sm mx-1 status-btn deleted"
                        onClick={() => handleAction(t._id, "delete")}
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
        ) : (
          !loading && (
            <div className="text-center py-4 text-muted">No therapist applications found.</div>
          )
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
