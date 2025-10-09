import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../utils/axiosClient";

export default function Admin() {
  const [therapists, setTherapists] = useState([]);

  const fetchTherapists = async () => {
    try {
      const data = await API.therapist.getAll();
      setTherapists(data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.therapist.updateStatus(id, status);
      fetchTherapists();
    } catch (err) {
      console.error(err);
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
    padding: "8px",
    textAlign: "left",
  };

  const buttonStyle = {
    marginRight: "5px",
    padding: "5px 10px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "auto" }}>
      <h1>Therapist Applications</h1>

      <table style={tableStyle}>
        <thead>
          <tr>
            {["Name", "Email", "Specialization", "Experience", "Status", "Actions"].map(h => (
              <th key={h} style={thTdStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {therapists.map(t => (
            <tr key={t._id}>
              <td style={thTdStyle}>{t.name}</td>
              <td style={thTdStyle}>{t.email}</td>
              <td style={thTdStyle}>{t.specialization}</td>
              <td style={thTdStyle}>{t.experience} yrs</td>
              <td style={thTdStyle}>{t.status}</td>
              <td style={thTdStyle}>
                {["accepted", "rejected", "pending"].map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(t._id, s)}
                    style={{ ...buttonStyle, backgroundColor: s === "accepted" ? "#4CAF50" : s === "rejected" ? "#f44336" : "#FFC107", color: "white" }}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer style={{ marginTop: "40px", textAlign: "center" }}>
        <hr style={{ margin: "20px 0" }} />
        <Link to="/talk-to-counselor" style={{ marginRight: "20px" }}>Talk to Counselor</Link>
        <Link to="/therapist-form">Therapist Form</Link>
      </footer>
    </div>
  );
}
