import React, { useEffect, useState } from "react";
import API from "../utils/axiosClient";

export default function Admin() {
  const [therapists, setTherapists] = useState([]);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    setError("");
    try {
      const data = await API.therapist.getAll();
      setTherapists(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error fetching therapist applications");
    }
  };

  const updateStatus = async (id, status) => {
    setError("");
    try {
      await API.therapist.updateStatus(id, status);
      fetchAll();
    } catch (err) {
      console.error(err);
      setError(err.message || "Error updating status");
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Therapist Applications</h1>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}>
        <thead style={{ backgroundColor: "#f2f2f2" }}>
          <tr>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Name</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Email</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Specialization</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Experience</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Status</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {therapists.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>No applications found.</td>
            </tr>
          ) : (
            therapists.map(t => (
              <tr key={t._id}>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{t.name}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{t.email}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{t.specialization}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{t.experience} yrs</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{t.status}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {["accepted", "rejected", "pending"].map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(t._id, s)}
                      style={{
                        marginRight: "5px",
                        padding: "5px 10px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        backgroundColor: s === "accepted" ? "#28a745" : s === "rejected" ? "#dc3545" : "#ffc107",
                        color: "#fff"
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

      <footer style={{ marginTop: "40px", textAlign: "center", fontSize: "14px" }}>
        <hr style={{ margin: "20px 0" }} />
        <p>
          <a href="/talk-to-counselor" style={{ marginRight: "20px", color: "#007BFF" }}>Talk to Counselor</a>
          <a href="/therapist-form" style={{ color: "#007BFF" }}>Therapist Form</a>
        </p>
      </footer>
    </div>
  );
}
