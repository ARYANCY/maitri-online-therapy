import React, { useEffect, useState, useCallback, useMemo } from "react";
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

  // Fetch therapists
  const fetchTherapists = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const data = await API.adminTherapist.getAll();
      if (!Array.isArray(data)) throw new Error("Invalid therapist data received");

      // Ensure each therapist has _id
      setTherapists(
        data.map((t) => ({
          ...t,
          _id: t._id || t.id || t.therapistId,
          status: t.status || "pending",
        }))
      );
    } catch (err) {
      setError(err?.message || "Failed to fetch therapist applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Check admin session on mount
  useEffect(() => {
    let mounted = true;
    const checkAdmin = async () => {
      try {
        const session = await API.auth.checkSession();
        if (!session?.user?.isAdmin) {
          navigate("/admin-login", { replace: true });
          return;
        }
        if (mounted) {
          setUserName(session.user.name || "");
          await fetchTherapists();
        }
      } catch (err) {
        console.error("Admin session check failed:", err);
        navigate("/admin-login", { replace: true });
      }
    };
    checkAdmin();
    return () => {
      mounted = false;
    };
  }, [navigate, fetchTherapists]);

  // Handle individual action
  const handleAction = useCallback(
    async (id, action) => {
      if (!id || !action) return;
      setActionLoading(id);
      setError("");
      setSuccess("");

      try {
        if (action === "accept") await API.adminTherapist.updateStatus(id, "accepted");
        if (action === "reject") await API.adminTherapist.updateStatus(id, "rejected");
        if (action === "delete") await API.adminTherapist.delete(id);

        setSuccess(
          action === "accept"
            ? "Therapist application accepted successfully!"
            : action === "reject"
            ? "Therapist application rejected."
            : "Therapist application deleted successfully!"
        );

        await fetchTherapists();
      } catch (err) {
        const message =
          err?.response?.data?.message || err?.message || `Failed to ${action} therapist.`;
        setError(message);
      } finally {
        setActionLoading(null);
        setTimeout(() => setSuccess(""), 3000);
      }
    },
    [fetchTherapists]
  );

  // Handle bulk actions
  const handleBulkAction = useCallback(
    async (action, selectedIds) => {
      if (!selectedIds?.length) return;
      setActionLoading("bulk");
      setError("");
      setSuccess("");

      try {
        const promises = selectedIds.map((id) => {
          if (action === "accept") return API.adminTherapist.updateStatus(id, "accepted");
          if (action === "reject") return API.adminTherapist.updateStatus(id, "rejected");
          if (action === "delete") return API.adminTherapist.delete(id);
          return Promise.resolve();
        });

        await Promise.all(promises);
        setSuccess(
          `${action === "accept" ? "Accepted" : action === "reject" ? "Rejected" : "Deleted"} ${
            selectedIds.length
          } therapist(s) successfully!`
        );

        await fetchTherapists();
      } catch (err) {
        const message = err?.response?.data?.message || err?.message || "Bulk action failed";
        setError(message);
      } finally {
        setActionLoading(null);
        setTimeout(() => setSuccess(""), 3000);
      }
    },
    [fetchTherapists]
  );

  // Filter and sort therapists
  const filteredAndSortedTherapists = useMemo(() => {
    return therapists
      .filter((t) => {
        const searchMatch =
          t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
        const statusMatch = statusFilter === "all" || t.status === statusFilter;
        return searchMatch && statusMatch;
      })
      .sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];

        if (sortBy === "createdAt") {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        }

        if (sortOrder === "asc") return aVal > bVal ? 1 : -1;
        return aVal < bVal ? 1 : -1;
      });
  }, [therapists, searchTerm, statusFilter, sortBy, sortOrder]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "accepted":
        return "badge bg-success";
      case "rejected":
        return "badge bg-danger";
      case "pending":
        return "badge bg-warning";
      default:
        return "badge bg-secondary";
    }
  };

  return (
    <>
      <Navbar user={{ name: userName }} />
      <div className="admin-container container-fluid py-4">
        <div className="row">
          <div className="col-12">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="text-primary fw-bold mb-1">Admin Dashboard</h1>
                <p className="text-muted mb-0">Welcome back, {userName}</p>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-primary" onClick={fetchTherapists} disabled={loading}>
                  <i className="bi bi-arrow-clockwise"></i> Refresh
                </button>
                <button className="btn btn-outline-secondary" onClick={() => navigate("/dashboard")}>
                  <i className="bi bi-house"></i> User Dashboard
                </button>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
                <button type="button" className="btn-close" onClick={() => setError("")}></button>
              </div>
            )}
            {success && (
              <div className="alert alert-success alert-dismissible fade show" role="alert">
                <i className="bi bi-check-circle me-2"></i>
                {success}
                <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
              </div>
            )}

            {/* Statistics Cards */}
            <div className="row mb-4">
              {[
                { title: "Total Applications", count: therapists.length, icon: "bi-people", bg: "bg-primary" },
                { title: "Pending", count: therapists.filter((t) => t.status === "pending").length, icon: "bi-clock", bg: "bg-warning" },
                { title: "Accepted", count: therapists.filter((t) => t.status === "accepted").length, icon: "bi-check-circle", bg: "bg-success" },
                { title: "Rejected", count: therapists.filter((t) => t.status === "rejected").length, icon: "bi-x-circle", bg: "bg-danger" },
              ].map((card, idx) => (
                <div className="col-md-3" key={idx}>
                  <div className={`card ${card.bg} text-white`}>
                    <div className="card-body d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="card-title">{card.title}</h6>
                        <h3 className="mb-0">{card.count}</h3>
                      </div>
                      <i className={`bi ${card.icon} fs-1 opacity-50`}></i>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
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
                    <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Sort By</label>
                    <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="createdAt">Date Applied</option>
                      <option value="name">Name</option>
                      <option value="email">Email</option>
                      <option value="experience">Experience</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Order</label>
                    <select className="form-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading therapist applications...</p>
              </div>
            )}

            {/* Table */}
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
                          .filter((t) => t.status === "pending")
                          .map((t) => t._id);
                        if (selectedIds.length > 0) handleBulkAction("accept", selectedIds);
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
                        {filteredAndSortedTherapists.map((t) => (
                          <tr key={t._id || t.email || Math.random()}>
                            <td>
                              <input type="checkbox" className="form-check-input" />
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2">
                                  {t.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <strong>{t.name}</strong>
                              </div>
                            </td>
                            <td>
                              <a href={`mailto:${t.email}`} className="text-decoration-none">
                                {t.email}
                              </a>
                            </td>
                            <td>
                              <a href={`tel:${t.phone}`} className="text-decoration-none">
                                {t.phone}
                              </a>
                            </td>
                            <td>
                              <span className="badge bg-info">{t.specialization}</span>
                            </td>
                            <td>{t.experience} years</td>
                            <td>
                              <span
                                className="text-truncate d-inline-block"
                                style={{ maxWidth: "150px" }}
                                title={t.qualifications || "N/A"}
                              >
                                {t.qualifications || "N/A"}
                              </span>
                            </td>
                            <td>
                              <span className={getStatusBadgeClass(t.status)}>
                                {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                              </span>
                            </td>
                            <td>
                              <small className="text-muted">
                                {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "N/A"}
                              </small>
                            </td>
                            <td>
                              <div className="btn-group" role="group">
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleAction(t._id, "accept")}
                                  disabled={t.status === "accepted" || actionLoading === t._id}
                                  title="Accept Application"
                                >
                                  <i className="bi bi-check"></i>
                                </button>
                                <button
                                  className="btn btn-warning btn-sm"
                                  onClick={() => handleAction(t._id, "reject")}
                                  disabled={t.status === "rejected" || actionLoading === t._id}
                                  title="Reject Application"
                                >
                                  <i className="bi bi-x"></i>
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        "Are you sure you want to delete this application? This action cannot be undone."
                                      )
                                    ) {
                                      handleAction(t._id, "delete");
                                    }
                                  }}
                                  disabled={actionLoading === t._id}
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
