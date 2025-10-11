import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/axiosClient";
import Navbar from "../components/Navbar";
import "../css/Admin.css";

export default function Admin() {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const checkAdmin = async () => {
      try {
        const session = await API.auth.checkSession();
        if (!session?.user?.isAdmin) {
          navigate("/admin-login", { replace: true });
          return;
        }
        if (mounted) setUserName(session.user.name || "");
      } catch {
        navigate("/admin-login", { replace: true });
      }
    };
    checkAdmin();
    return () => { mounted = false; };
  }, [navigate]);

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

  const handleAction = useCallback(
    async (id, action) => {
      if (!id || !action) return;
      setActionLoading(id);
      try {
        if (action === "accept") await API.adminTherapist.updateStatus(id, "accepted");
        else if (action === "reject") await API.adminTherapist.updateStatus(id, "rejected");
        else if (action === "delete") await API.adminTherapist.delete(id);
        await fetchTherapists();
      } catch (err) {
        setError(err.message || `Failed to ${action} therapist.`);
      } finally {
        setActionLoading(null);
      }
    },
    [fetchTherapists]
  );

  useEffect(() => { fetchTherapists(); }, [fetchTherapists]);

  return (
    <>
      <Navbar />
      <div className="admin-container container my-5 p-4">
        <div className="text-center mb-4">
          <h1 className="text-primary fw-bold">Hello, {userName}</h1>
          <p className="text-muted lead">Review therapist applications and manage your platform.</p>
        </div>

        {error && <div className="alert alert-danger text-center">{error}</div>}
        {loading && <div className="text-center my-3">Loading therapists...</div>}

        {!loading && therapists.length > 0 ? (
          <div className="table-responsive shadow-sm glass-card p-3 rounded">
            <table className="table table-hover align-middle text-center">
              <thead className="table-light">
                <tr>
                  {["Name", "Email", "Phone", "Specialization", "Experience", "Qualifications", "Status", "Actions"].map(header => (
                    <th key={header}>{header}</th>
                  ))}
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
                    <td>{status.charAt(0).toUpperCase() + status.slice(1)}</td>
                    <td>
                      <button className="btn btn-sm btn-success mx-1" onClick={() => handleAction(_id, "accept")} disabled={status === "accepted" || actionLoading === _id}>Accept</button>
                      <button className="btn btn-sm btn-warning mx-1" onClick={() => handleAction(_id, "reject")} disabled={status === "rejected" || actionLoading === _id}>Reject</button>
                      <button className="btn btn-sm btn-danger mx-1" onClick={() => handleAction(_id, "delete")} disabled={actionLoading === _id}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !loading ? (
          <div className="text-center py-4 text-muted">No therapist applications found.</div>
        ) : null}
      </div>
    </>
  );
}
