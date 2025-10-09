import React, { useEffect, useState } from "react";
import API from "../utils/axiosClient";

export default function CounselorList() {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCounselors = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await API.therapist.getAccepted();
        setCounselors(data);
      } catch (err) {
        console.error(err);
        setError("Error fetching counselors");
      } finally {
        setLoading(false);
      }
    };
    fetchCounselors();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto", fontFamily: "sans-serif" }}>
      
      {/* Landing Section */}
      <h1>Talk to a Counselor</h1>
      <p>Our verified counselors are ready to assist you.</p>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading counselors...</p>}

      {!loading && counselors.length === 0 && <p>No counselors available right now.</p>}

      {!loading && counselors.length > 0 && (
        <ul style={{ paddingLeft: "0" }}>
          {counselors.map(c => (
            <li key={c._id} style={{ listStyle: "none", marginBottom: "10px", borderBottom: "1px solid #ccc", paddingBottom: "8px" }}>
              <strong>{c.name}</strong> - {c.specialization} ({c.experience} yrs)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
