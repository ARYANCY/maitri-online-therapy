import React, { useEffect, useState } from "react";
import API from "../utils/axiosClient";
import { Link } from "react-router-dom";

export default function Admin() {
  const [therapists, setTherapists] = useState([]);

  const fetchTherapists = async () => {
    try {
      const res = await API.get("/therapis/all");
      setTherapists(res.data);
    } catch (err) {
      console.error("Error fetching therapists:", err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/therapis/${id}/status`, { status });
      fetchTherapists();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  useEffect(() => {
    fetchTherapists();
  }, []);

  const containerStyle = {
    maxWidth: "1000px",
    margin: "40px auto",
    padding: "20px",
    background: "#f7f7f7",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    fontFamily: "Arial, sans-serif",
  };

  const thTdStyle = {
    borderBottom: "1px solid #ddd",
    padding: "10px",
    textAlign: "left",
  };

  const statusButtonStyle = {
    padding: "6px 10px",
    marginRight: "5px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    color: "white",
  };

  const getButtonColor = (status) => {
    if (status === "accepted") return "#4CAF50";
    if (status === "rejected") return "#f44336";
    return "#FFC107";
  };

  const footerStyle = { marginTop: "40px", textAlign: "center", fontSize: "14px" };
  const linkStyle = { marginRight: "20px", color: "#007BFF", textDecoration: "none" };

  return (
    <div style={{ background: "#e9ecef", minHeight: "100vh" }}>
      <div style={containerStyle}>
        <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Therapist Applications</h1>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Name","Email","Specialization","Experience","Status","Actions"].map((h) => (
                <th key={h} style={thTdStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {therapists.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#777" }}>
                  No applications yet.
                </td>
              </tr>
            ) : (
              therapists.map((t) => (
                <tr key={t._id}>
                  <td style={thTdStyle}>{t.name}</td>
                  <td style={thTdStyle}>{t.email}</td>
                  <td style={thTdStyle}>{t.specialization}</td>
                  <td style={thTdStyle}>{t.experience} yrs</td>
                  <td style={thTdStyle}>{t.status}</td>
                  <td style={thTdStyle}>
                    {["accepted","rejected","pending"].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(t._id, s)}
                        style={{ ...statusButtonStyle, backgroundColor: getButtonColor(s) }}
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
        <footer style={footerStyle}>
          <hr style={{ margin: "20px 0" }} />
          <Link to="/talk-to-counselor" style={linkStyle}>Talk to Counselor</Link>
          <Link to="/therapist-form" style={linkStyle}>Therapist Form</Link>
        </footer>
      </div>
    </div>
  );
}
