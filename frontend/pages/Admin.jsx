import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../utils/axiosClient";
import "../css/Admin.css";

export default function Admin() {
  const [therapists, setTherapists] = useState([]);
  const [error, setError] = useState("");

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
    <div className="admin-container light-version">
      <h1>Therapist Applications</h1>

      {error && <p className="error-msg">{error}</p>}

      <table className="admin-table">
        <thead>
          <tr>
            {["Name", "Email", "Phone", "Specialization", "Experience", "Qualifications", "Status", "Actions"].map(h => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {therapists.length === 0 ? (
            <tr>
              <td colSpan="8" className="no-data">No applications found.</td>
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
                <td className={`status ${t.status}`}>{t.status.charAt(0).toUpperCase() + t.status.slice(1)}</td>
                <td className="action-buttons">
                  {["accepted", "rejected", "pending"].map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(t._id, s)}
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

      <footer className="admin-footer">
        <Link to="/talk-to-counselor">Talk to Counselor</Link>
        <Link to="/therapist-form">Therapist Form</Link>
      </footer>
    </div>
  );
}
