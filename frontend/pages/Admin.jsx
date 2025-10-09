import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../utils/axiosClient";

export default function Admin() {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchTherapists = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await API.therapist.getAll();
      setTherapists(data);
    } catch (err) {
      console.error(err);
      setError("Error fetching applications.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    setError("");
    setUpdatingId(id);
    try {
      await API.therapist.updateStatus(id, status);
      await fetchTherapists();
    } catch (err) {
      console.error(err);
      setError(err.message || "Error updating status.");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchTherapists();
  }, []);

  const statusColor = status => {
    if (status === "accepted") return "success";
    if (status === "rejected") return "danger";
    return "warning";
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Therapist Applications</h1>

      {error && <div className="alert alert-danger text-center">{error}</div>}
      {loading ? (
        <p className="text-center">Loading applications...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead className="table-dark">
              <tr>
                {["Name", "Email", "Specialization", "Experience", "Status", "Actions"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {therapists.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">No applications found.</td>
                </tr>
              ) : (
                therapists.map(t => (
                  <tr key={t._id}>
                    <td>{t.name}</td>
                    <td>{t.email}</td>
                    <td>{t.specialization}</td>
                    <td>{t.experience} yrs</td>
                    <td>
                      <span className={`badge bg-${statusColor(t.status)}`}>
                        {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      {["accepted", "rejected", "pending"].map(s => (
                        <button
                          key={s}
                          className={`btn btn-sm btn-${statusColor(s)} me-1 mb-1`}
                          disabled={updatingId === t._id}
                          onClick={() => updateStatus(t._id, s)}
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
        </div>
      )}

      <footer className="text-center mt-4">
        <hr />
        <Link to="/talk-to-counselor" className="btn btn-link me-3">Talk to Counselor</Link>
        <Link to="/therapist-form" className="btn btn-link">Therapist Form</Link>
      </footer>
    </div>
  );
}
