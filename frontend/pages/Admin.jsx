import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../utils/axiosClient";

export default function Admin() {
  const [therapists, setTherapists] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null); // to disable buttons while updating

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

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  };

  const thTdStyle = {
    border: "1px solid #ddd",
    padding: "10px",
    textAlign: "left",
  };

  const buttonStyle = {
    marginRight: "5px",
    padding: "5px 12px",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Therapist Applications</h1>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      {loading ? (
        <p style={{ textAlign: "center" }}>Loading applications...</p>
      ) : (
        <table style={tableStyle}>
          <thead style={{ backgroundColor: "#f7f7f7" }}>
            <tr>
              {["Name", "Email", "Specialization", "Experience", "Status", "Actions"].map((h) => (
                <th key={h} style={thTdStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {therapists.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>No applications found.</td>
              </tr>
            ) : (
              therapists.map((t) => (
                <tr key={t._id} style={{ backgroundColor: "#fff", transition: "background 0.2s" }}>
                  <td style={thTdStyle}>{t.name}</td>
                  <td style={thTdStyle}>{t.email}</td>
                  <td style={thTdStyle}>{t.specialization}</td>
                  <td style={thTdStyle}>{t.experience} yrs</td>
                  <td style={{ ...thTdStyle, fontWeight: "bold", color: t.status === "accepted" ? "#4CAF50" : t.status === "rejected" ? "#f44336" : "#FFC107" }}>
                    {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                  </td>
                  <td style={thTdStyle}>
                    {["accepted", "rejected", "pending"].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(t._id, s)}
                        disabled={updatingId === t._id}
                        style={{
                          ...buttonStyle,
                          backgroundColor:
                            s === "accepted" ? "#4CAF50" :
                            s === "rejected" ? "#f44336" :
                            "#FFC107",
                          color: "#fff",
                          opacity: updatingId === t._id ? 0.6 : 1,
                          cursor: updatingId === t._id ? "not-allowed" : "pointer",
                        }}
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

      <footer style={{ marginTop: "40px", textAlign: "center", fontSize: "14px" }}>
        <hr style={{ margin: "20px 0" }} />
        <Link to="/talk-to-counselor" style={{ marginRight: "20px", color: "#007BFF" }}>Talk to Counselor</Link>
        <Link to="/therapist-form" style={{ color: "#007BFF" }}>Therapist Form</Link>
      </footer>
    </div>
  );
}
