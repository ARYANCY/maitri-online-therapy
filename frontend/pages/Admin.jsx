import React, { useEffect, useState } from "react";
import API from "../utils/axiosClient";

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

  return (
    <div style={{ padding: "20px" }}>
      <h1>Therapist Applications</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #ddd" }}>
            <th>Name</th>
            <th>Email</th>
            <th>Specialization</th>
            <th>Experience</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {therapists.map((t) => (
            <tr key={t._id} style={{ borderBottom: "1px solid #eee" }}>
              <td>{t.name}</td>
              <td>{t.email}</td>
              <td>{t.specialization}</td>
              <td>{t.experience} yrs</td>
              <td>{t.status}</td>
              <td>
                {["accepted", "rejected", "pending"].map((s) => (
                  <button key={s} onClick={() => updateStatus(t._id, s)} style={{ marginRight: "5px" }}>
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
        <p>
          <a href="/talk-to-counselor" style={{ marginRight: "20px" }}>Talk to Counselor</a>
          <a href="/therapist-form">Therapist Form</a>
        </p>
      </footer>
    </div>
  );
}
