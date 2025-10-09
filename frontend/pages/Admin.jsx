import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../utils/axiosClient";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Admin() {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
      await fetchTherapists(); // refresh the list
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
    <div className="container mt-5">
      <h1 className="text-center mb-4">Therapist Applications</h1>

      {error && <div className="alert alert-danger text-center">{error}</div>}
      {loading && <p className="text-center">Loading applications...</p>}

      {!loading && therapists.length === 0 && (
        <div className="alert alert-warning text-center">No applications found.</div>
      )}

      {!loading && therapists.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped table-hover shadow-sm">
            <thead className="table-dark">
              <tr>
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
                <tr key={t._id}>
                  <td>{t.name}</td>
                  <td>{t.email}</td>
                  <td>{t.specialization}</td>
                  <td>{t.experience} yrs</td>
                  <td>
                    <span
                      className={`badge ${
                        t.status === "accepted"
                          ? "bg-success"
                          : t.status === "rejected"
                          ? "bg-danger"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    {["accepted", "rejected", "pending"].map((s) => (
                      <button
                        key={s}
                        className={`btn btn-sm me-1 ${
                          s === "accepted"
                            ? "btn-success"
                            : s === "rejected"
                            ? "btn-danger"
                            : "btn-warning text-dark"
                        }`}
                        onClick={() => updateStatus(t._id, s)}
                        disabled={updatingId === t._id}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center mt-5">
        <hr />
        <Link to="/talk-to-counselor" className="btn btn-link me-3">
          Talk to Counselor
        </Link>
        <Link to="/therapist-form" className="btn btn-link">
          Therapist Form
        </Link>
      </footer>
    </div>
  );
}
