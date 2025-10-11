import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/axiosClient";
import Navbar from "../components/Navbar";
import "../css/Admin.css";

export default function Admin() {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userName, setUserName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const checkAdmin = async () => {
      try {
        const session = await API.auth.checkSession();
        if (!session?.user?.isAdmin) {
          // User is not admin, redirect to admin login
          navigate("/admin-login", { replace: true });
          return;
        }
        if (mounted) {
          setUserName(session.user.name || "");
          // User is admin, proceed to load admin data
          fetchTherapists();
        }
      } catch (err) {
        console.error("Admin session check failed:", err);
        navigate("/admin-login", { replace: true });
      }
    };
    checkAdmin();
    return () => { mounted = false; };
  }, [navigate, fetchTherapists]);

  const fetchTherapists = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const data = await API.adminTherapist.getAll();
      setTherapists(data.map(t => ({ ...t, status: t.status || "pending" })));
    } catch (err) {
      setError(err.message || "Failed to fetch therapist applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAction = useCallback(
    async (id, action) => {
      if (!id || !action) return;
      setActionLoading(id);
      setError("");
      setSuccess("");
      
      try {
        if (action === "accept") {
          await API.adminTherapist.updateStatus(id, "accepted");
          setSuccess("Therapist application accepted successfully!");
        } else if (action === "reject") {
          await API.adminTherapist.updateStatus(id, "rejected");
          setSuccess("Therapist application rejected.");
        } else if (action === "delete") {
          await API.adminTherapist.delete(id);
          setSuccess("Therapist application deleted successfully!");
        }
        await fetchTherapists();
      } catch (err) {
        setError(err.message || `Failed to ${action} therapist.`);
      } finally {
        setActionLoading(null);
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      }
    },
    [fetchTherapists]
  );

  const handleBulkAction = useCallback(
    async (action, selectedIds) => {
      if (!selectedIds.length) return;
      setActionLoading("bulk");
      setError("");
      setSuccess("");
      
      try {
        const promises = selectedIds.map(id => {
          if (action === "accept") return API.adminTherapist.updateStatus(id, "accepted");
          if (action === "reject") return API.adminTherapist.updateStatus(id, "rejected");
          if (action === "delete") return API.adminTherapist.delete(id);
        });
        
        await Promise.all(promises);
        setSuccess(`${action === "accept" ? "Accepted" : action === "reject" ? "Rejected" : "Deleted"} ${selectedIds.length} therapist(s) successfully!`);
        await fetchTherapists();
      } catch (err) {
        setError(`Failed to ${action} selected therapists.`);
      } finally {
        setActionLoading(null);
        setTimeout(() => setSuccess(""), 3000);
      }
    },
    [fetchTherapists]
  );

  const filteredAndSortedTherapists = therapists
    .filter(therapist => {
      const matchesSearch = 
        therapist.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        therapist.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        therapist.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || therapist.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === "createdAt") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });


  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "accepted": return "badge bg-success";
      case "rejected": return "badge bg-danger";
      case "pending": return "badge bg-warning";
      default: return "badge bg-secondary";
    }
  };

  return (
    <>
      <Navbar />
      <div className="admin-container container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="text-primary fw-bold mb-1">Admin Dashboard</h1>
                <p className="text-muted mb-0">Welcome back, {userName}</p>
              </div>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-outline-primary"
                  onClick={fetchTherapists}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-clockwise"></i> Refresh
                </button>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => navigate("/dashboard")}
                >
                  <i className="bi bi-house"></i> User Dashboard
                </button>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setError("")}
                ></button>
              </div>
            )}
            
            {success && (
              <div className="alert alert-success alert-dismissible fade show" role="alert">
                <i className="bi bi-check-circle me-2"></i>
                {success}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSuccess("")}
                ></button>
              </div>
            )}

            {/* Statistics Cards */}
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card bg-primary text-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h6 className="card-title">Total Applications</h6>
                        <h3 className="mb-0">{therapists.length}</h3>
                      </div>
                      <i className="bi bi-people fs-1 opacity-50"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-warning text-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h6 className="card-title">Pending</h6>
                        <h3 className="mb-0">{therapists.filter(t => t.status === "pending").length}</h3>
                      </div>
                      <i className="bi bi-clock fs-1 opacity-50"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-success text-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h6 className="card-title">Accepted</h6>
                        <h3 className="mb-0">{therapists.filter(t => t.status === "accepted").length}</h3>
                      </div>
                      <i className="bi bi-check-circle fs-1 opacity-50"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-danger text-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h6 className="card-title">Rejected</h6>
                        <h3 className="mb-0">{therapists.filter(t => t.status === "rejected").length}</h3>
                      </div>
                      <i className="bi bi-x-circle fs-1 opacity-50"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="card mb-4">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Search</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name, email, or specialization..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Status Filter</label>
                    <select
                      className="form-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Sort By</label>
                    <select
                      className="form-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="createdAt">Date Applied</option>
                      <option value="name">Name</option>
                      <option value="email">Email</option>
                      <option value="experience">Experience</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Order</label>
                    <select
                      className="form-select"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading therapist applications...</p>
              </div>
            )}

            {/* Therapists Table */}
            {!loading && filteredAndSortedTherapists.length > 0 && (
              <div className="card shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Therapist Applications ({filteredAndSortedTherapists.length})</h5>
                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      className="btn btn-outline-success btn-sm"
                      onClick={() => {
                        const selectedIds = filteredAndSortedTherapists
                          .filter(t => t.status === "pending")
                          .map(t => t._id);
                        if (selectedIds.length > 0) {
                          handleBulkAction("accept", selectedIds);
                        }
                      }}
                      disabled={actionLoading === "bulk"}
                    >
                      Accept All Pending
                    </button>
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>
                            <input type="checkbox" className="form-check-input" />
                          </th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Specialization</th>
                          <th>Experience</th>
                          <th>Qualifications</th>
                          <th>Status</th>
                          <th>Applied</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAndSortedTherapists.map(({ _id, name, email, phone, specialization, experience, qualifications, status, createdAt }) => (
                          <tr key={_id}>
                            <td>
                              <input type="checkbox" className="form-check-input" />
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2">
                                  {name?.charAt(0)?.toUpperCase()}
                                </div>
                                <strong>{name}</strong>
                              </div>
                            </td>
                            <td>
                              <a href={`mailto:${email}`} className="text-decoration-none">
                                {email}
                              </a>
                            </td>
                            <td>
                              <a href={`tel:${phone}`} className="text-decoration-none">
                                {phone}
                              </a>
                            </td>
                            <td>
                              <span className="badge bg-info">{specialization}</span>
                            </td>
                            <td>{experience} years</td>
                            <td>
                              <span 
                                className="text-truncate d-inline-block" 
                                style={{maxWidth: "150px"}}
                                title={qualifications || "N/A"}
                              >
                                {qualifications || "N/A"}
                              </span>
                            </td>
                            <td>
                              <span className={getStatusBadgeClass(status)}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </span>
                            </td>
                            <td>
                              <small className="text-muted">
                                {new Date(createdAt).toLocaleDateString()}
                              </small>
                            </td>
                            <td>
                              <div className="btn-group" role="group">
                                <button 
                                  className="btn btn-success btn-sm" 
                                  onClick={() => handleAction(_id, "accept")} 
                                  disabled={status === "accepted" || actionLoading === _id}
                                  title="Accept Application"
                                >
                                  <i className="bi bi-check"></i>
                                </button>
                                <button 
                                  className="btn btn-warning btn-sm" 
                                  onClick={() => handleAction(_id, "reject")} 
                                  disabled={status === "rejected" || actionLoading === _id}
                                  title="Reject Application"
                                >
                                  <i className="bi bi-x"></i>
                                </button>
                                <button 
                                  className="btn btn-danger btn-sm" 
                                  onClick={() => {
                                    if (window.confirm("Are you sure you want to delete this application? This action cannot be undone.")) {
                                      handleAction(_id, "delete");
                                    }
                                  }} 
                                  disabled={actionLoading === _id}
                                  title="Delete Application"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredAndSortedTherapists.length === 0 && (
              <div className="text-center py-5">
                <i className="bi bi-inbox display-1 text-muted"></i>
                <h4 className="mt-3 text-muted">No therapist applications found</h4>
                <p className="text-muted">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search criteria or filters." 
                    : "No applications have been submitted yet."}
                </p>
                {(searchTerm || statusFilter !== "all") && (
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
