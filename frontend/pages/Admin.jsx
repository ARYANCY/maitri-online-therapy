import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API, { ensureAdminSession } from "../utils/axiosClient";
import Navbar from "../components/Navbar";
import "../css/Admin.css";

export default function Admin() {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState(() => {
    try { return JSON.parse(localStorage.getItem("admin_dashboard_state") || "{}").searchTerm || ""; } catch { return ""; }
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(() => {
    try { return JSON.parse(localStorage.getItem("admin_dashboard_state") || "{}").statusFilter || "all"; } catch { return "all"; }
  });
  const [sortBy, setSortBy] = useState(() => {
    try { return JSON.parse(localStorage.getItem("admin_dashboard_state") || "{}").sortBy || "createdAt"; } catch { return "createdAt"; }
  });
  const [sortOrder, setSortOrder] = useState(() => {
    try { return JSON.parse(localStorage.getItem("admin_dashboard_state") || "{}").sortOrder || "desc"; } catch { return "desc"; }
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const navigate = useNavigate();

  // --- Debounce search input ---
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const state = { searchTerm, statusFilter, sortBy, sortOrder };
    try { localStorage.setItem("admin_dashboard_state", JSON.stringify(state)); } catch {}
  }, [searchTerm, statusFilter, sortBy, sortOrder]);

  // --- Fetch therapists ---
  const fetchTherapists = useCallback(async () => {
    setError(""); setLoading(true);
    try {
      const response = await API.adminTherapist.getAll();
      if (!response?.success || !Array.isArray(response.therapists)) {
        console.error("Invalid therapist data received:", response);
        throw new Error("Invalid therapist data received");
      }

      setTherapists(
        response.therapists.map((t) => ({
          _id: t._id || t.id,
          name: t.name || "N/A",
          email: t.email || "N/A",
          phone: t.phone || "N/A",
          specialization: t.specialization || "N/A",
          experience: t.experience ?? 0,
          qualifications: t.qualifications || "N/A",
          status: t.status || "pending",
          createdAt: t.createdAt || new Date(),
          lastStatusUpdate: t.lastStatusUpdate || t.updatedAt || t.createdAt,
        }))
      );
    } catch (err) {
      console.error("Fetch therapists error:", err);
      setError(err?.message || "Failed to fetch therapist applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Admin session + initial fetch ---
  useEffect(() => {
    let mounted = true;
    const initAdmin = async () => {
      try {
        const valid = await ensureAdminSession();
        if (!valid) {
          console.warn("Admin session invalid, redirecting to login.");
          navigate("/admin-login", { replace: true });
          return;
        }

        const session = await API.auth.checkSession();
        if (!session?.user?.isAdmin) {
          console.warn("User is not admin, redirecting.");
          navigate("/admin-login", { replace: true });
          return;
        }

        // Store session info in localStorage (matching Dashboard.jsx pattern)
        if (session.user) {
          localStorage.setItem("userId", session.user._id || "");
          localStorage.setItem("userEmail", session.user.email || "");
          localStorage.setItem("userName", session.user.name || "");
          localStorage.setItem("isAdmin", session.user.isAdmin ? "true" : "false");
          localStorage.setItem("sessionTime", Date.now().toString());
          // Store profile picture if available
          if (session.user.avatar || session.user.profilePic || session.user.picture) {
            localStorage.setItem("userProfilePic", session.user.avatar || session.user.profilePic || session.user.picture || "");
          }
        }

        if (mounted) {
          const profilePic = session.user?.avatar || session.user?.profilePic || session.user?.picture || localStorage.getItem("userProfilePic") || null;
          setUser({
            name: session.user?.name || localStorage.getItem("userName") || "",
            email: session.user?.email || localStorage.getItem("userEmail") || "",
            _id: session.user?._id || localStorage.getItem("userId") || "",
            avatar: profilePic,
            isAdmin: session.user?.isAdmin || localStorage.getItem("isAdmin") === "true"
          });
        }
        await fetchTherapists();
      } catch (err) {
        console.error("Admin initialization error:", err);
        navigate("/admin-login", { replace: true });
      }
    };

    initAdmin();
    const heartbeat = setInterval(async () => {
      try {
        const sess = await API.auth.checkSession();
        if (!sess?.user?.isAdmin) {
          navigate("/admin-login", { replace: true });
          return;
        }
        
        // Update session info in localStorage
        if (sess.user) {
          localStorage.setItem("userId", sess.user._id || "");
          localStorage.setItem("userEmail", sess.user.email || "");
          localStorage.setItem("userName", sess.user.name || "");
          localStorage.setItem("isAdmin", sess.user.isAdmin ? "true" : "false");
          localStorage.setItem("sessionTime", Date.now().toString());
          // Update profile picture if available
          if (sess.user.avatar || sess.user.profilePic || sess.user.picture) {
            localStorage.setItem("userProfilePic", sess.user.avatar || sess.user.profilePic || sess.user.picture || "");
          }
        }
        
        const prev = (() => { try { return JSON.parse(localStorage.getItem("admin_session") || "{}"); } catch { return {}; } })();
        const next = { ...prev, lastActiveAt: new Date().toISOString(), status: "active" };
        try { localStorage.setItem("admin_session", JSON.stringify(next)); } catch {}
      } catch (e) {
        console.warn("Admin heartbeat failed", e?.message || e);
        navigate("/admin-login", { replace: true });
      }
    }, 120000);
    return () => { mounted = false; };
  }, [fetchTherapists, navigate]);

  // --- Single action ---
  const handleAction = useCallback(async (id, action) => {
    if (!id || !action) return;
    setActionLoading(id); setError(""); setSuccess("");

    try {
      let response;
      switch (action) {
        case "accept":
        case "reject":
          response = await API.adminTherapist.updateStatus(id, action === "accept" ? "accepted" : "rejected");
          break;
        case "delete":
          response = await API.adminTherapist.delete(id);
          break;
        default: return;
      }

      if (!response?.success) throw new Error(`Failed to ${action} therapist.`);
      setSuccess(`Therapist ${action}ed successfully!`);
      await fetchTherapists();
    } catch (err) {
      console.error(`Handle action (${action}) error:`, err);
      if (err?.message?.includes("401")) navigate("/admin-login", { replace: true });
      else setError(err?.message || `Failed to ${action} therapist.`);
    } finally {
      setActionLoading(null);
      setTimeout(() => setSuccess(""), 3000);
    }
  }, [fetchTherapists, navigate]);

  // --- Bulk actions ---
  const handleBulkAction = useCallback(async (action) => {
    if (!selectedIds.length) return;
    setActionLoading("bulk"); setError(""); setSuccess("");

    try {
      if (action === "delete") {
        const results = await Promise.allSettled(selectedIds.map((id) => API.adminTherapist.delete(id)));
        const successCount = results.filter(r => r.status === "fulfilled" && r.value?.success).length;
        if (!successCount) throw new Error("No therapists were deleted successfully");
        setSuccess(`${successCount} therapists deleted successfully`);
      } else {
        await API.adminTherapist.updateBulkStatus(
          selectedIds,
          action === "accept" ? "accepted" : "rejected"
        );
        setSuccess(`Bulk ${action} completed successfully!`);
      }
      await fetchTherapists();
    } catch (err) {
      console.error(`Bulk action (${action}) error:`, err);
      setError(err?.message || `Failed to ${action} therapist.`);
    } finally {
      setActionLoading(null);
      setTimeout(() => setSuccess(""), 3000);
    }
  }, [fetchTherapists, selectedIds]);

  // --- Selection helpers ---
  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAndSortedTherapists.length) setSelectedIds([]);
    else setSelectedIds(filteredAndSortedTherapists.map(t => t._id));
  };

  // --- Filter & sort ---
  const filteredAndSortedTherapists = useMemo(() => {
    return therapists
      .filter(t => {
        const matchSearch = t.name.toLowerCase().includes(debouncedSearch.toLowerCase())
          || t.email.toLowerCase().includes(debouncedSearch.toLowerCase())
          || t.specialization.toLowerCase().includes(debouncedSearch.toLowerCase());
        const matchStatus = statusFilter === "all" || t.status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        const factor = sortOrder === "asc" ? 1 : -1;
        if (sortBy === "createdAt") return factor * (new Date(a.createdAt) - new Date(b.createdAt));
        return factor * a[sortBy].toString().localeCompare(b[sortBy].toString());
      });
  }, [therapists, debouncedSearch, statusFilter, sortBy, sortOrder]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "accepted": return "badge bg-success";
      case "rejected": return "badge bg-danger";
      case "pending": return "badge bg-warning";
      default: return "badge bg-secondary";
    }
  };

  // Get user from state or localStorage fallback
  const displayUser = user || {
    name: localStorage.getItem("userName") || "",
    email: localStorage.getItem("userEmail") || "",
    _id: localStorage.getItem("userId") || "",
    avatar: localStorage.getItem("userProfilePic") || null,
    isAdmin: localStorage.getItem("isAdmin") === "true"
  };

  return (
    <>
      <Navbar user={displayUser} />
      <div className="admin-container container-fluid py-4">
        {/* Alerts */}
        {error && <div className="alert alert-danger alert-dismissible fade show">{error}
          <button type="button" className="btn-close" onClick={() => setError("")}></button>
        </div>}
        {success && <div className="alert alert-success alert-dismissible fade show">{success}
          <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
        </div>}

        {/* Filters */}
        <div className="card mb-4">
          <div className="card-body row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input type="text" className="form-control" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                {searchTerm && <button className="btn btn-outline-secondary" type="button" onClick={() => setSearchTerm("")}>Clear</button>}
              </div>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="createdAt">Date Applied</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="experience">Experience</option>
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table & Bulk Actions */}
        <div className="card shadow-sm">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5>Counselor Applications ({filteredAndSortedTherapists.length})</h5>
            <div className="btn-group">
              <button className="btn btn-outline-success btn-sm" disabled={!selectedIds.length || actionLoading === "bulk"} onClick={() => handleBulkAction("accept")}>Accept Selected</button>
              <button className="btn btn-outline-warning btn-sm" disabled={!selectedIds.length || actionLoading === "bulk"} onClick={() => handleBulkAction("reject")}>Reject Selected</button>
              <button className="btn btn-outline-danger btn-sm" disabled={!selectedIds.length || actionLoading === "bulk"} onClick={() => handleBulkAction("delete")}>Delete Selected</button>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th><input type="checkbox" checked={selectedIds.length === filteredAndSortedTherapists.length && filteredAndSortedTherapists.length > 0} onChange={toggleSelectAll} /></th>
                    <th>Name</th><th>Email</th><th>Phone</th><th>Specialization</th><th>Experience</th><th>Qualifications</th><th>Status</th><th>Applied</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedTherapists.length > 0 ? filteredAndSortedTherapists.map(t => (
                    <tr key={t._id}>
                      <td><input type="checkbox" checked={selectedIds.includes(t._id)} onChange={() => toggleSelect(t._id)} /></td>
                      <td>{t.name}</td>
                      <td>{t.email}</td>
                      <td>{t.phone}</td>
                      <td>{t.specialization}</td>
                      <td>{t.experience} yrs</td>
                      <td>{t.qualifications}</td>
                      <td><span className={getStatusBadgeClass(t.status)}>{t.status}</span></td>
                      <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="btn-group">
                          <button className="btn btn-success btn-sm" onClick={() => handleAction(t._id, "accept")} disabled={t.status === "accepted" || actionLoading === t._id}><i className="bi bi-check"></i></button>
                          <button className="btn btn-warning btn-sm" onClick={() => handleAction(t._id, "reject")} disabled={t.status === "rejected" || actionLoading === t._id}><i className="bi bi-x"></i></button>
                          <button className="btn btn-danger btn-sm" onClick={() => { if (window.confirm("Delete this application?")) handleAction(t._id, "delete"); }} disabled={actionLoading === t._id}><i className="bi bi-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                  )) : <tr><td colSpan={10} className="text-center text-muted py-4">No counselor applications found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
