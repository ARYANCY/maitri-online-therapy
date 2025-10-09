import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../utils/axiosClient";
import "../css/Admin.css";

export default function Admin() {
  const [therapists, setTherapists] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch all therapist applications
  const fetchTherapists = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await API.therapist.getAll();
      setTherapists(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error fetching therapist applications");
    } finally {
      setLoading(false);
    }
  };

  // Update therapist status
  const updateStatus = async (id, status) => {
    setError("");
    setUpdatingId(id);
    try {
      await API.therapist.updateStatus(id, status);
      await fetchTherapists();
    } catch (err) {
      console.error(err);
      setError(err.message || "Error updating status");
      alert(err.message || "Error updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchTherapists();
  }, []);

  return (
    <div className="admin-container">
      <h1>Therapist Applications</h1>

      {error && <p className="error-msg">{error}</p>}
      {loading ? (
        <p className="loading-msg">Loading applications...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              {["Name", "Email", "Specialization", "Experience", "Status", "Actions"].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {therapists.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No applications found.</td>
              </tr>
            ) : (
              therapists.map(t => (
                <tr key={t._id}>
                  <td>{t.name}</td>
                  <td>{t.email}</td>
                  <td>{t.specialization}</td>
                  <td>{t.experience} yrs</td>
                  <td className={`status ${t.status}`}>{t.status.charAt(0).toUpperCase() + t.status.slice(1)}</td>
                  <td>
                    {["accepted", "rejected", "pending"].map(s => (
                      <button
                        key={s}
                        onClick={() => updateStatus(t._id, s)}
                        disabled={updatingId === t._id}
                        className={`status-btn ${s}`}
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
      )}

      <footer className="admin-footer">
        <Link to="/talk-to-counselor">Talk to Counselor</Link>
        <Link to="/therapist-form">Therapist Form</Link>
      </footer>
    </div>
  );
}
