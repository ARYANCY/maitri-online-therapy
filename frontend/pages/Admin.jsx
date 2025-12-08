import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API, { ensureAdminSession } from "../utils/axiosClient";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../css/pages/Admin.css";

export default function Admin() {
  const { t, i18n } = useTranslation();
  
  const [activeTab, setActiveTab] = useState(() => {
    try { return localStorage.getItem("admin_active_tab") || "docts"; } catch { return "docts"; }
  });

  
  const [docts, setTherapists] = useState([]);
  const [doctLoading, setTherapistLoading] = useState(true);
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

  
  const [dochs, setDochs] = useState([]);
  const [hpLoading, setHpLoading] = useState(false);
  const [showHpModal, setShowHpModal] = useState(false);
  const [hpModalMode, setHpModalMode] = useState("create");
  const [editingHp, setEditingHp] = useState(null);
  const [hpFormData, setHpFormData] = useState({
    name: "",
    email: "",
    specialization: "",
    experience: "",
    priority: 5,
    isActive: true,
    availability: []
  });
  const [availabilityDate, setAvailabilityDate] = useState("");
  const [availabilityTimeSlots, setAvailabilityTimeSlots] = useState([""]);
  
  const [therapistAvailDate, setTherapistAvailDate] = useState("");
  const [therapistAvailSlots, setTherapistAvailSlots] = useState([""]);
  const [showTherapistAvailForm, setShowTherapistAvailForm] = useState(false);


  const navigate = useNavigate();

  
  useEffect(() => {
    try { localStorage.setItem("admin_active_tab", activeTab); } catch {}
  }, [activeTab]);

  
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const state = { searchTerm, statusFilter, sortBy, sortOrder };
    try { localStorage.setItem("admin_dashboard_state", JSON.stringify(state)); } catch {}
  }, [searchTerm, statusFilter, sortBy, sortOrder]);

  
  const [showTherapistModal, setShowTherapistModal] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);

  const fetchTherapists = useCallback(async () => {
    setError(""); setTherapistLoading(true);
    try {
      const response = await API.adminDOCT.getAll();
      if (!response?.success || !Array.isArray(response.docts)) {
        console.error("Invalid doct data received:", response);
        throw new Error("Invalid doct data received");
      }

      setTherapists(
        response.docts.map((t) => ({
          _id: t._id || t.id,
          name: t.fullName || t.name || "N/A",
          fullName: t.fullName || t.name || "N/A",
          preferredName: t.preferredName || "",
          pronouns: t.pronouns || "They/Them",
          profilePhoto: t.profilePhoto || "",
          email: t.email || "N/A",
          specialization: t.specializations?.[0] || t.specialization || "N/A",
          specializations: t.specializations || [],
          approachesUsed: t.approachesUsed || [],
          experience: t.yearsOfPractice || t.experience || 0,
          yearsOfPractice: t.yearsOfPractice || t.experience || 0,
          primaryQualification: t.primaryQualification || "",
          additionalCertifications: t.additionalCertifications || [],
          licensingBody: t.licensingBody || "",
          therapistCouncilNumber: t.therapistCouncilNumber || "",
          licenseFiles: t.licenseFiles || [],
          shortBio: t.shortBio || "",
          preferredTherapyStyle: t.preferredTherapyStyle || "Supportive",
          areasComfortableWith: t.areasComfortableWith || [],
          areasNotHandled: t.areasNotHandled || [],
          languagesForSession: t.languagesForSession || ["English"],
          ageGroupsServed: t.ageGroupsServed || [],
          sessionDuration: t.sessionDuration || 60,
          sessionLimitPerDay: t.sessionLimitPerDay || 8,
          preferredCommunicationMode: t.preferredCommunicationMode || ["Video"],
          emergencyResponsePolicy: t.emergencyResponsePolicy || "Within Business Hours",
          sessionFee: t.sessionFee || {},
          packagePricing: t.packagePricing || [],
          slidingScaleOptions: t.slidingScaleOptions || false,
          location: t.location || "",
          timeZone: t.timeZone || "Asia/Kolkata",
          priority: t.priority ?? 5,
          availability: t.availability || [],
          isActive: t.isActive !== undefined ? t.isActive : true,
          status: t.status || "pending",
          createdAt: t.createdAt || new Date(),
          lastStatusUpdate: t.lastStatusUpdate || t.updatedAt || t.createdAt,
          confidentialityAgreement: t.confidentialityAgreement || false,
          mandatoryReportingConsent: t.mandatoryReportingConsent || false,
          ethicalPracticeDeclaration: t.ethicalPracticeDeclaration || false,
        }))
      );
    } catch (err) {
      console.error("Fetch docts error:", err);
      setError(err?.message || "Failed to fetch doct applications.");
    } finally {
      setTherapistLoading(false);
    }
  }, []);

  
  const [showHcDetailModal, setShowHcDetailModal] = useState(false);
  const [selectedHc, setSelectedHc] = useState(null);

  const fetchHealthcareProfessionals = useCallback(async () => {
    setError(""); setHpLoading(true);
    try {
      const response = await API.adminDOCH.getAll();
      if (!response?.success || !Array.isArray(response.dochs)) {
        throw new Error("Invalid healthcare professional data received");
      }
      setDochs(response.dochs.map(h => ({
        _id: h._id || h.id,
        name: h.fullName || h.name || "N/A",
        fullName: h.fullName || h.name || "N/A",
        preferredName: h.preferredName || "",
        gender: h.gender || "Prefer not to say",
        pronouns: h.pronouns || "They/Them",
        profilePhoto: h.profilePhoto || "",
        email: h.email || "N/A",
        phone: h.phone || "",
        city: h.city || "",
        state: h.state || "",
        country: h.country || "",
        emergencyContact: h.emergencyContact || {},
        roleCategories: h.roleCategories || [],
        specialization: h.roleCategories?.[0] || h.specialization || "N/A",
        highestQualification: h.highestQualification || "",
        dementiaCertifications: h.dementiaCertifications || [],
        licenseNumber: h.licenseNumber || "",
        licenseFiles: h.licenseFiles || [],
        experience: h.yearsInDementiaCare || h.experience || 0,
        yearsInDementiaCare: h.yearsInDementiaCare || h.experience || 0,
        previousInstitutions: h.previousInstitutions || [],
        dementiaTypesExperienced: h.dementiaTypesExperienced || [],
        dementiaStagesHandled: h.dementiaStagesHandled || [],
        shortBio: h.shortBio || "",
        specialSkills: h.specialSkills || [],
        languagesSpoken: h.languagesSpoken || ["English"],
        sessionDuration: h.sessionDuration || 60,
        preferredCommunicationMode: h.preferredCommunicationMode || ["Video"],
        consultationFee: h.consultationFee || {},
        acceptsInsurance: h.acceptsInsurance || false,
        insuranceProviders: h.insuranceProviders || [],
        priority: h.priority ?? 5,
        availability: h.availability || [],
        isActive: h.isActive !== undefined ? h.isActive : true,
        status: h.status || "pending",
        createdAt: h.createdAt || new Date(),
        lastStatusUpdate: h.lastStatusUpdate || h.updatedAt || h.createdAt,
      })));
    } catch (err) {
      console.error("Fetch healthcare professionals error:", err);
      setError(err?.message || "Failed to fetch healthcare professionals.");
    } finally {
      setHpLoading(false);
    }
  }, []);


  
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
        
        if (!session?.success || !session?.user || !session.user.isAdmin) {
          console.error(`[SESSION ERROR] Admin access denied (Admin.jsx - init):`, {
            success: session?.success,
            hasUser: !!session?.user,
            isAdmin: session?.user?.isAdmin,
            message: session?.message,
            fullResponse: session
          });
          navigate("/admin-login", { replace: true });
          return;
        }

        
        try {
          localStorage.setItem("userId", session.user._id || "");
          localStorage.setItem("userEmail", session.user.email || "");
          localStorage.setItem("userName", session.user.name || "");
          localStorage.setItem("isAdmin", session.user.isAdmin ? "true" : "false");
          localStorage.setItem("sessionTime", Date.now().toString());
          
          if (session.user.avatar || session.user.profilePic || session.user.picture) {
            localStorage.setItem("userProfilePic", session.user.avatar || session.user.profilePic || session.user.picture || "");
          }
        } catch (storageErr) {
          console.error(`[SESSION ERROR] Failed to store session (Admin.jsx - init):`, {
            error: storageErr.message,
            name: storageErr.name,
            code: storageErr.code,
            stack: storageErr.stack,
            userId: session.user._id
          });
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
        await fetchHealthcareProfessionals();
      } catch (err) {
        console.error("Admin initialization error:", err);
        navigate("/admin-login", { replace: true });
      }
    };

    initAdmin();
    const heartbeat = setInterval(async () => {
      try {
        const sess = await API.auth.checkSession();
        
        if (!sess?.success || !sess?.user || !sess.user.isAdmin) {
          console.error(`[SESSION ERROR] Admin access denied (Admin.jsx - heartbeat):`, {
            success: sess?.success,
            hasUser: !!sess?.user,
            isAdmin: sess?.user?.isAdmin,
            message: sess?.message
          });
          navigate("/admin-login", { replace: true });
          return;
        }
        
        
        try {
          localStorage.setItem("userId", sess.user._id || "");
          localStorage.setItem("userEmail", sess.user.email || "");
          localStorage.setItem("userName", sess.user.name || "");
          localStorage.setItem("isAdmin", sess.user.isAdmin ? "true" : "false");
          localStorage.setItem("sessionTime", Date.now().toString());
          
          if (sess.user.avatar || sess.user.profilePic || sess.user.picture) {
            localStorage.setItem("userProfilePic", sess.user.avatar || sess.user.profilePic || sess.user.picture || "");
          }
        } catch (storageErr) {
          console.error(`[SESSION ERROR] Failed to update session in heartbeat (Admin.jsx):`, {
            error: storageErr.message,
            name: storageErr.name,
            code: storageErr.code,
            stack: storageErr.stack,
            userId: sess.user._id
          });
        }
        
        const prev = (() => { try { return JSON.parse(localStorage.getItem("admin_session") || "{}"); } catch { return {}; } })();
        const next = { ...prev, lastActiveAt: new Date().toISOString(), status: "active" };
        try { localStorage.setItem("admin_session", JSON.stringify(next)); } catch {}
      } catch (e) {
        console.error(`[SESSION ERROR] Admin heartbeat failed (Admin.jsx):`, {
          message: e?.message || e,
          name: e?.name,
          stack: e?.stack,
          code: e?.code,
          response: e?.response?.data,
          status: e?.response?.status
        });
        navigate("/admin-login", { replace: true });
      }
    }, 120000);
    return () => { mounted = false; };
  }, [fetchTherapists, fetchHealthcareProfessionals, navigate]);

  
  const handleAction = useCallback(async (id, action) => {
    if (!id || !action) return;
    setActionLoading(id); setError(""); setSuccess("");

    try {
      let response;
      switch (action) {
        case "accept":
        case "reject":
          response = await API.adminDOCT.updateStatus(id, action === "accept" ? "accepted" : "rejected");
          break;
        case "delete":
          response = await API.adminDOCT.delete(id);
          break;
        default: return;
      }

      if (!response?.success) throw new Error(`Failed to ${action} doct.`);
      setSuccess(`Therapist ${action}ed successfully!`);
      await fetchTherapists();
    } catch (err) {
      console.error(`Handle action (${action}) error:`, err);
      if (err?.message?.includes("401")) navigate("/admin-login", { replace: true });
      else setError(err?.message || `Failed to ${action} doct.`);
    } finally {
      setActionLoading(null);
      setTimeout(() => setSuccess(""), 3000);
    }
  }, [fetchTherapists, navigate]);

  
  const handleBulkAction = useCallback(async (action) => {
    if (!selectedIds.length) return;
    setActionLoading("bulk"); setError(""); setSuccess("");

    try {
      if (action === "delete") {
        const results = await Promise.allSettled(selectedIds.map((id) => API.adminDOCT.delete(id)));
        const successCount = results.filter(r => r.status === "fulfilled" && r.value?.success).length;
        if (!successCount) throw new Error("No docts were deleted successfully");
        setSuccess(`${successCount} docts deleted successfully`);
      } else {
        await API.adminDOCT.updateBulkStatus(
          selectedIds,
          action === "accept" ? "accepted" : "rejected"
        );
        setSuccess(`Bulk ${action} completed successfully!`);
      }
      await fetchTherapists();
    } catch (err) {
      console.error(`Bulk action (${action}) error:`, err);
      setError(err?.message || `Failed to ${action} doct.`);
    } finally {
      setActionLoading(null);
      setTimeout(() => setSuccess(""), 3000);
    }
  }, [fetchTherapists, selectedIds]);

  
  const handleUpdateTherapistPriority = useCallback(async (id, newPriority) => {
    setActionLoading(id);
    setError("");
    try {
      const response = await API.adminDOCT.update(id, { priority: Number(newPriority) });
      if (!response?.success) throw new Error(response?.message || "Failed to update priority");
      setSuccess(`Therapist priority updated to ${newPriority} successfully!`);
      await fetchTherapists();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.message || "Failed to update priority.");
    } finally {
      setActionLoading(null);
    }
  }, [fetchTherapists]);

  
  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAndSortedTherapists.length) setSelectedIds([]);
    else setSelectedIds(filteredAndSortedTherapists.map(t => t._id));
  };

  
  const filteredAndSortedTherapists = useMemo(() => {
    return docts
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
        if (sortBy === "priority") return factor * ((a.priority || 5) - (b.priority || 5));
        if (sortBy === "experience") return factor * ((a.experience || 0) - (b.experience || 0));
        if (sortBy === "name") return factor * a.name.localeCompare(b.name);
        return factor * (new Date(a.createdAt) - new Date(b.createdAt));
      });
  }, [docts, debouncedSearch, statusFilter, sortBy, sortOrder]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "accepted": return "badge bg-success";
      case "rejected": return "badge bg-danger";
      case "pending": return "badge bg-warning";
      default: return "badge bg-secondary";
    }
  };

  
  const displayUser = user || {
    name: localStorage.getItem("userName") || "",
    email: localStorage.getItem("userEmail") || "",
    _id: localStorage.getItem("userId") || "",
    avatar: localStorage.getItem("userProfilePic") || null,
    isAdmin: localStorage.getItem("isAdmin") === "true"
  };

  
  const handleOpenHpModal = (mode, professional = null) => {
    setHpModalMode(mode);
    setEditingHp(professional);
    if (mode === "edit" && professional) {
      setHpFormData({
        name: professional.name || "",
        email: professional.email || "",
        specialization: professional.specialization || "",
        experience: professional.experience || "",
        priority: professional.priority || 5,
        isActive: professional.isActive !== undefined ? professional.isActive : true,
        availability: professional.availability || []
      });
    } else {
      setHpFormData({
        name: "",
        email: "",
        specialization: "",
        experience: "",
        priority: 5,
        isActive: true,
        availability: []
      });
    }
    setAvailabilityDate("");
    setAvailabilityTimeSlots([""]);
    setError("");
    setShowHpModal(true);
  };

  const handleAddAvailability = () => {
    if (!availabilityDate) {
      setError("Please select a date");
      return;
    }
    const validTimeSlots = availabilityTimeSlots.filter(ts => ts.trim() !== "");
    if (validTimeSlots.length === 0) {
      setError("Please add at least one time slot");
      return;
    }
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const invalidSlots = validTimeSlots.filter(ts => !timeRegex.test(ts));
    if (invalidSlots.length > 0) {
      setError("Invalid time format. Use HH:MM (e.g., 09:00, 14:30)");
      return;
    }
    setHpFormData(prev => ({
      ...prev,
      availability: [...prev.availability, { date: new Date(availabilityDate), time_slots: validTimeSlots }]
    }));
    setAvailabilityDate("");
    setAvailabilityTimeSlots([""]);
    setError("");
  };

  const handleAddTherapistAvailability = useCallback(async () => {
    if (!selectedTherapist) return;
    if (!therapistAvailDate) {
      setError("Please select a date");
      return;
    }
    const validTimeSlots = therapistAvailSlots.filter(ts => ts.trim() !== "");
    if (validTimeSlots.length === 0) {
      setError("Please add at least one time slot");
      return;
    }
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const invalidSlots = validTimeSlots.filter(ts => !timeRegex.test(ts));
    if (invalidSlots.length > 0) {
      setError("Invalid time format. Use HH:MM (e.g., 09:00, 14:30)");
      return;
    }
    
    setActionLoading(selectedTherapist._id);
    try {
      const newAvailability = [
        ...(selectedTherapist.availability || []),
        { date: new Date(therapistAvailDate), time_slots: validTimeSlots }
      ];
      
      const response = await API.adminDOCT.update(selectedTherapist._id, { availability: newAvailability });
      if (!response?.success) throw new Error(response?.message || "Failed to add availability");
      
      setSelectedTherapist(prev => ({ ...prev, availability: newAvailability }));
      setSuccess("Availability added successfully!");
      setTherapistAvailDate("");
      setTherapistAvailSlots([""]);
      setShowTherapistAvailForm(false);
      fetchTherapists();
    } catch (err) {
      setError(err?.message || "Failed to add availability");
    } finally {
      setActionLoading(null);
    }
  }, [selectedTherapist, therapistAvailDate, therapistAvailSlots, fetchTherapists]);

  const handleRemoveAvailability = (index) => {
    setHpFormData(prev => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index)
    }));
  };

  const handleHpSubmit = async () => {
    setError("");
    setActionLoading("hp-submit");
    try {
      if (!hpFormData.name || !hpFormData.email || !hpFormData.specialization || hpFormData.experience === "") {
        throw new Error("Please fill in all required fields");
      }
      const submitData = {
        ...hpFormData,
        experience: Number(hpFormData.experience),
        priority: Number(hpFormData.priority)
      };
      let response;
      if (hpModalMode === "create") {
        response = await API.adminDOCH.create(submitData);
        } else {
        response = await API.adminDOCH.update(editingHp._id, submitData);
      }
      if (!response?.success) throw new Error(response?.message || "Operation failed");
      setSuccess(`Healthcare professional ${hpModalMode === "create" ? "created" : "updated"} successfully!`);
      setShowHpModal(false);
      await fetchHealthcareProfessionals();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.message || `Failed to ${hpModalMode} healthcare professional.`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateHpStatus = async (id, status) => {
    setActionLoading(id);
    setError("");
    try {
      const response = await API.adminDOCH.updateStatus(id, status);
      if (!response?.success) throw new Error(response?.message || "Failed to update status");
      setSuccess(`Healthcare professional ${status} successfully!`);
      await fetchHealthcareProfessionals();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.message || "Failed to update status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteHp = async (id) => {
    if (!window.confirm("Are you sure you want to delete this healthcare professional?")) return;
    setActionLoading(id);
    setError("");
    try {
      const response = await API.adminDOCH.delete(id);
      if (!response?.success) throw new Error(response?.message || "Failed to delete");
      setSuccess("Healthcare professional deleted successfully!");
      await fetchHealthcareProfessionals();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.message || "Failed to delete healthcare professional.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateHpPriority = async (id, newPriority) => {
    setActionLoading(id);
    setError("");
    try {
      const response = await API.adminDOCH.update(id, { priority: Number(newPriority) });
      if (!response?.success) throw new Error(response?.message || "Failed to update priority");
      setSuccess(`Priority updated to ${newPriority} successfully!`);
      await fetchHealthcareProfessionals();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.message || "Failed to update priority.");
    } finally {
      setActionLoading(null);
    }
  };


  
  const filteredAndSortedHp = useMemo(() => {
    return dochs
      .filter(p => {
        const matchSearch = 
          p.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          p.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          p.specialization?.toLowerCase().includes(debouncedSearch.toLowerCase());
        return matchSearch;
      })
      .sort((a, b) => {
        const factor = sortOrder === "asc" ? 1 : -1;
        if (sortBy === "priority") return factor * (a.priority - b.priority);
        if (sortBy === "experience") return factor * (a.experience - b.experience);
        if (sortBy === "name") return factor * a.name.localeCompare(b.name);
        return factor * (new Date(a.createdAt) - new Date(b.createdAt));
      });
  }, [dochs, debouncedSearch, sortBy, sortOrder]);


  return (
    <div className="admin-page" style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f0f7f4 0%, #abd1c6 50%, #f0f7f4 100%)' 
    }}>
      <Navbar user={displayUser} />
      <div className="navbar-spacer"></div>
      <div className="admin-container container-fluid py-4">
        
        {error && <div className="alert alert-danger alert-dismissible fade show">{error}
          <button type="button" className="btn-close" onClick={() => setError("")}></button>
        </div>}
        {success && <div className="alert alert-success alert-dismissible fade show">{success}
          <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
        </div>}

        
        <div className="text-center mb-4">
          <h1 style={{ 
            background: 'linear-gradient(135deg, rgb(0, 70, 67) 0%, rgb(61, 153, 112) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 700,
            fontSize: '2.5rem',
            marginTop: '4rem'
          }}>
            <i className="bi bi-shield-lock me-2" style={{ WebkitTextFillColor: '#3d9970' }}></i>
            Admin Dashboard
          </h1>
          <p className="text-muted">Manage therapists and healthcare professionals</p>
        </div>

        
        <div className="d-flex justify-content-center mb-4">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "docts" ? "active" : ""}`}
                onClick={() => setActiveTab("docts")}
              >
                <i className="bi bi-person-hearts me-2"></i>
                Therapist Applications
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "healthcare-professionals" ? "active" : ""}`}
                onClick={() => setActiveTab("healthcare-professionals")}
              >
                <i className="bi bi-hospital me-2"></i>
                Healthcare Professionals
              </button>
            </li>
          </ul>
        </div>

        
        {activeTab === "docts" && (
          <>
            
            <div className="card mb-4">
              <div className="card-body row g-3">
                <div className="col-md-4">
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-search"></i></span>
                    <input type="text" id="admin-search-input" name="admin-search-input" className="form-control" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    {searchTerm && <button className="btn btn-outline-secondary" type="button" onClick={() => setSearchTerm("")}>Clear</button>}
                  </div>
                </div>
                <div className="col-md-3">
                  <select id="admin-status-filter" name="admin-status-filter" className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label htmlFor="admin-sort-by-select" className="form-label small mb-1">Sort By</label>
                  <select id="admin-sort-by-select" name="admin-sort-by-select" className="form-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="priority">Priority</option>
                    <option value="createdAt">Date Applied</option>
                    <option value="name">Name</option>
                    <option value="experience">Experience</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label htmlFor="admin-sort-order-select" className="form-label small mb-1">Order</label>
                  <select id="admin-sort-order-select" name="admin-sort-order-select" className="form-select" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>

            
            {doctLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="card shadow-sm" style={{ overflow: 'visible' }}>
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5>Counselor Applications ({filteredAndSortedTherapists.length})</h5>
                  <div className="btn-group">
                    <button className="btn btn-outline-success btn-sm" disabled={!selectedIds.length || actionLoading === "bulk"} onClick={() => handleBulkAction("accept")}>Accept Selected</button>
                    <button className="btn btn-outline-warning btn-sm" disabled={!selectedIds.length || actionLoading === "bulk"} onClick={() => handleBulkAction("reject")}>Reject Selected</button>
                    <button className="btn btn-outline-danger btn-sm" disabled={!selectedIds.length || actionLoading === "bulk"} onClick={() => handleBulkAction("delete")}>Delete Selected</button>
                  </div>
                </div>
                <div className="card-body p-0" style={{ overflow: 'visible' }}>
                  <div className="table-responsive" style={{ overflow: 'visible' }}>
                    <table className="table table-hover align-middle mb-0" style={{ overflow: 'visible' }}>
                      <thead className="table-light">
                        <tr>
                          <th><input type="checkbox" id="admin-select-all" name="admin-select-all" checked={selectedIds.length === filteredAndSortedTherapists.length && filteredAndSortedTherapists.length > 0} onChange={toggleSelectAll} /></th>
                          <th>Photo</th><th>Name</th><th>Email</th><th>Specialization</th><th>Status</th><th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAndSortedTherapists.length > 0 ? filteredAndSortedTherapists.map(t => (
                          <tr key={t._id}>
                            <td><input type="checkbox" id={`admin-doct-checkbox-${t._id}`} name={`admin-doct-checkbox-${t._id}`} checked={selectedIds.includes(t._id)} onChange={() => toggleSelect(t._id)} /></td>
                            <td>
                              {t.profilePhoto ? (
                                <img 
                                  src={t.profilePhoto} 
                                  alt={t.name} 
                                  className="rounded-circle" 
                                  style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                                  crossOrigin="anonymous"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                  <i className="bi bi-person text-white"></i>
                                </div>
                              )}
                            </td>
                            <td>
                              <strong>{t.name}</strong>
                              {t.preferredName && <small className="text-muted d-block">"{t.preferredName}"</small>}
                            </td>
                            <td><small>{t.email}</small></td>
                            <td>
                              {t.specializations?.length > 0 ? (
                                <span className="badge bg-primary">{t.specializations[0]}</span>
                              ) : (
                                <span className="text-muted">{t.specialization}</span>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${t.status === 'accepted' ? 'bg-success' : t.status === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                {t.status}
                              </span>
                            </td>
                            <td>
                              <button className="btn btn-sm btn-primary" onClick={() => { setSelectedTherapist(t); setShowTherapistModal(true); }}>
                                <i className="bi bi-eye me-1"></i>View
                              </button>
                            </td>
                          </tr>
                        )) : <tr><td colSpan={7} className="text-center text-muted py-4">No therapist applications found.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "healthcare-professionals" && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5>Healthcare Professionals Management</h5>
              <small className="text-muted">Accept, reject, or delete applications only</small>
            </div>

            
            <div className="card mb-4">
              <div className="card-body row g-3">
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-search"></i></span>
                    <input type="text" className="form-control" placeholder="Search by name, email, or specialization..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    {searchTerm && <button className="btn btn-outline-secondary" type="button" onClick={() => setSearchTerm("")}>Clear</button>}
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="form-label small mb-1">Sort By</label>
                  <select className="form-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="priority">Priority</option>
                    <option value="name">Name</option>
                    <option value="experience">Experience</option>
                    <option value="createdAt">Date Created</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label small mb-1">Order</label>
                  <select className="form-select" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>
            </div>

            
            {hpLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="card shadow-sm" style={{ overflow: 'visible' }}>
                <div className="card-body p-0" style={{ overflow: 'visible' }}>
                  <div className="table-responsive" style={{ overflow: 'visible' }}>
                    <table className="table table-hover align-middle mb-0" style={{ overflow: 'visible' }}>
                      <thead className="table-light">
                        <tr>
                          <th>Photo</th><th>Name</th><th>Email</th><th>Specialization</th><th>Status</th><th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAndSortedHp.length > 0 ? filteredAndSortedHp.map(p => (
                          <tr key={p._id}>
                            <td>
                              {p.profilePhoto ? (
                                <img 
                                  src={p.profilePhoto} 
                                  alt={p.name} 
                                  className="rounded-circle" 
                                  style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                                  crossOrigin="anonymous"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                  <i className="bi bi-person text-white"></i>
                                </div>
                              )}
                            </td>
                            <td>
                              <strong>{p.fullName || p.name}</strong>
                              {p.preferredName && <small className="text-muted d-block">"{p.preferredName}"</small>}
                            </td>
                            <td><small>{p.email}</small></td>
                            <td>
                              {p.roleCategories?.length > 0 ? (
                                <span className="badge bg-info">{p.roleCategories[0]}</span>
                              ) : (
                                <span className="text-muted">{p.specialization}</span>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${p.status === 'accepted' ? 'bg-success' : p.status === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                {p.status || 'pending'}
                              </span>
                            </td>
                            <td>
                              <button className="btn btn-sm btn-primary" onClick={() => { setSelectedHc(p); setShowHcDetailModal(true); }}>
                                <i className="bi bi-eye me-1"></i>View
                              </button>
                            </td>
                          </tr>
                        )) : <tr><td colSpan={6} className="text-center text-muted py-4">No healthcare professionals found.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}


        
        {showHpModal && (
          <div 
            className="modal show d-block" 
            tabIndex="-1" 
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 10000,
              overflowY: "auto"
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowHpModal(false);
                setError("");
              }
            }}
          >
            <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered" style={{ marginTop: "2rem", marginBottom: "2rem" }}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h5 className="modal-title">{hpModalMode === "create" ? "Add" : "Edit"} Healthcare Professional</h5>
                  <button type="button" className="btn-close" onClick={() => { setShowHpModal(false); setError(""); }}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Name *</label>
                      <input type="text" className="form-control" value={hpFormData.name} onChange={e => setHpFormData({...hpFormData, name: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email *</label>
                      <input type="email" className="form-control" value={hpFormData.email} onChange={e => setHpFormData({...hpFormData, email: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Specialization *</label>
                      <input type="text" className="form-control" value={hpFormData.specialization} onChange={e => setHpFormData({...hpFormData, specialization: e.target.value})} required />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Experience (years) *</label>
                      <input type="number" className="form-control" value={hpFormData.experience} onChange={e => setHpFormData({...hpFormData, experience: e.target.value})} min="0" max="70" required />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Priority (1-10) *</label>
                      <input type="number" className="form-control" value={hpFormData.priority} onChange={e => setHpFormData({...hpFormData, priority: e.target.value})} min="1" max="10" required />
                    </div>
                    <div className="col-md-12">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" checked={hpFormData.isActive} onChange={e => setHpFormData({...hpFormData, isActive: e.target.checked})} />
                        <label className="form-check-label">Active</label>
                      </div>
                    </div>
                  </div>

                  
                  <div className="mt-4">
                    <h6>Availability Schedule</h6>
                    <div className="card">
                      <div className="card-body">
                        <div className="row g-3 mb-3">
                          <div className="col-md-4">
                            <label className="form-label">Date</label>
                            <input type="date" className="form-control" value={availabilityDate} onChange={e => setAvailabilityDate(e.target.value)} />
                          </div>
                          <div className="col-md-8">
                            <label className="form-label">Time Slots (HH:MM format)</label>
                            {availabilityTimeSlots.map((slot, idx) => (
                              <div key={idx} className="input-group mb-2">
                                <input type="text" className="form-control" placeholder="09:00" value={slot} onChange={e => {
                                  const newSlots = [...availabilityTimeSlots];
                                  newSlots[idx] = e.target.value;
                                  setAvailabilityTimeSlots(newSlots);
                                }} pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$" />
                                {availabilityTimeSlots.length > 1 && (
                                  <button className="btn btn-outline-danger" type="button" onClick={() => setAvailabilityTimeSlots(availabilityTimeSlots.filter((_, i) => i !== idx))}>
                                    <i className="bi bi-x"></i>
                                  </button>
                                )}
                              </div>
                            ))}
                            <button className="btn btn-sm btn-outline-secondary" type="button" onClick={() => setAvailabilityTimeSlots([...availabilityTimeSlots, ""])}>
                              <i className="bi bi-plus me-1"></i>Add Time Slot
                            </button>
                          </div>
                        </div>
                        <button className="btn btn-sm btn-primary" type="button" onClick={handleAddAvailability}>
                          <i className="bi bi-plus-circle me-1"></i>Add Availability
                        </button>
                      </div>
                    </div>

                    {hpFormData.availability.length > 0 && (
                      <div className="mt-3">
                        <h6>Added Availability:</h6>
                        {hpFormData.availability.map((avail, idx) => (
                          <div key={idx} className="card mb-2">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <strong>{new Date(avail.date).toLocaleDateString()}</strong>
                                  <div className="mt-1">
                                    {avail.time_slots.map((slot, slotIdx) => (
                                      <span key={slotIdx} className="badge bg-primary me-1">{slot}</span>
                                    ))}
                                  </div>
                                </div>
                                <button className="btn btn-sm btn-danger" type="button" onClick={() => handleRemoveAvailability(idx)}>
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowHpModal(false); setError(""); }} disabled={actionLoading === "hp-submit"}>Cancel</button>
                  <button type="button" className="btn btn-primary" onClick={handleHpSubmit} disabled={actionLoading === "hp-submit"}>
                    {actionLoading === "hp-submit" ? (
                      <> <span className="spinner-border spinner-border-sm me-2" role="status"></span> {hpModalMode === "create" ? "Creating..." : "Updating..."} </>
                    ) : (
                      <> <i className="bi bi-check-circle me-2"></i> {hpModalMode === "create" ? "Create" : "Update"} </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showTherapistModal && selectedTherapist && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header" style={{ background: 'linear-gradient(135deg, #c0d7d6 0%, rgb(5, 82, 47) 100%)', color: '#fff' }}>
                  <h5 className="modal-title">
                    <i className="bi bi-person-badge me-2"></i>
                    Therapist Details
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => { setShowTherapistModal(false); setSelectedTherapist(null); setShowTherapistAvailForm(false); setTherapistAvailDate(""); setTherapistAvailSlots([""]); }}></button>
                </div>
                <div className="modal-body">
                  <div className="row mb-4">
                    <div className="col-md-4 text-center">
                      {selectedTherapist.profilePhoto ? (
                        <img 
                          src={selectedTherapist.profilePhoto} 
                          alt="Profile" 
                          className="rounded-circle mb-3" 
                          style={{ width: '120px', height: '120px', objectFit: 'cover', border: '4px solid #abd1c6' }} 
                          crossOrigin="anonymous"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '120px', height: '120px' }}>
                          <i className="bi bi-person-fill text-white" style={{ fontSize: '3rem' }}></i>
                        </div>
                      )}
                      <h5 className="mb-1">{selectedTherapist.fullName}</h5>
                      {selectedTherapist.preferredName && <p className="text-muted small mb-1">"{selectedTherapist.preferredName}"</p>}
                      <p className="text-muted small">{selectedTherapist.pronouns}</p>
                      <span className={`badge ${selectedTherapist.status === 'accepted' ? 'bg-success' : selectedTherapist.status === 'rejected' ? 'bg-danger' : 'bg-warning'}`}>
                        {selectedTherapist.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="col-md-8">
                      <h6 className="text-primary"><i className="bi bi-envelope me-2"></i>Contact</h6>
                      <p className="mb-2">{selectedTherapist.email}</p>
                      {selectedTherapist.location && (
                        <p className="mb-2">
                          <i className="bi bi-geo-alt me-2"></i>
                          {selectedTherapist.location}
                          {selectedTherapist.timeZone && ` (${selectedTherapist.timeZone})`}
                        </p>
                      )}
                      
                      <h6 className="text-primary mt-3"><i className="bi bi-mortarboard me-2"></i>Qualifications</h6>
                      <p className="mb-1"><strong>Primary:</strong> {selectedTherapist.primaryQualification || 'N/A'}</p>
                      <p className="mb-1"><strong>Experience:</strong> {selectedTherapist.yearsOfPractice} years</p>
                      {selectedTherapist.licensingBody && <p className="mb-1"><strong>License:</strong> {selectedTherapist.licensingBody} ({selectedTherapist.therapistCouncilNumber})</p>}
                      
                      {selectedTherapist.additionalCertifications?.length > 0 && (
                        <div className="mt-2">
                          <strong>Certifications:</strong>
                          <ul className="mb-0 small">
                            {selectedTherapist.additionalCertifications.map((cert, i) => (
                              <li key={i}>{cert.name} {cert.year && `(${cert.year})`} {cert.institution && `- ${cert.institution}`}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedTherapist.shortBio && (
                    <div className="mb-4">
                      <h6 className="text-primary"><i className="bi bi-person-lines-fill me-2"></i>About</h6>
                      <p className="text-muted small">{selectedTherapist.shortBio}</p>
                    </div>
                  )}

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h6 className="text-primary"><i className="bi bi-stars me-2"></i>Specializations</h6>
                      <div className="d-flex flex-wrap gap-1">
                        {selectedTherapist.specializations?.length > 0 ? selectedTherapist.specializations.map((s, i) => (
                          <span key={i} className="badge bg-success">{s}</span>
                        )) : <span className="text-muted small">Not specified</span>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-primary"><i className="bi bi-diagram-3 me-2"></i>Approaches</h6>
                      <div className="d-flex flex-wrap gap-1">
                        {selectedTherapist.approachesUsed?.length > 0 ? selectedTherapist.approachesUsed.map((a, i) => (
                          <span key={i} className="badge bg-info">{a}</span>
                        )) : <span className="text-muted small">Not specified</span>}
                      </div>
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h6 className="text-primary"><i className="bi bi-check-circle me-2"></i>Comfortable With</h6>
                      <div className="d-flex flex-wrap gap-1">
                        {selectedTherapist.areasComfortableWith?.length > 0 ? selectedTherapist.areasComfortableWith.map((a, i) => (
                          <span key={i} className="badge bg-outline-success" style={{ border: '1px solid #198754', color: '#198754' }}>{a}</span>
                        )) : <span className="text-muted small">Not specified</span>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-primary"><i className="bi bi-x-circle me-2"></i>Does Not Handle</h6>
                      <div className="d-flex flex-wrap gap-1">
                        {selectedTherapist.areasNotHandled?.length > 0 ? selectedTherapist.areasNotHandled.map((a, i) => (
                          <span key={i} className="badge bg-outline-danger" style={{ border: '1px solid #dc3545', color: '#dc3545' }}>{a}</span>
                        )) : <span className="text-muted small">Not specified</span>}
                      </div>
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-4">
                      <h6 className="text-primary"><i className="bi bi-clock me-2"></i>Session Details</h6>
                      <p className="small mb-1"><strong>Duration:</strong> {selectedTherapist.sessionDuration} mins</p>
                      <p className="small mb-1"><strong>Max/Day:</strong> {selectedTherapist.sessionLimitPerDay}</p>
                      <p className="small mb-1"><strong>Style:</strong> {selectedTherapist.preferredTherapyStyle}</p>
                    </div>
                    <div className="col-md-4">
                      <h6 className="text-primary"><i className="bi bi-camera-video me-2"></i>Communication</h6>
                      <div className="d-flex flex-wrap gap-1">
                        {selectedTherapist.preferredCommunicationMode?.map((m, i) => (
                          <span key={i} className="badge bg-primary">{m}</span>
                        ))}
                      </div>
                      <p className="small mt-2"><strong>Emergency:</strong> {selectedTherapist.emergencyResponsePolicy}</p>
                    </div>
                    <div className="col-md-4">
                      <h6 className="text-primary"><i className="bi bi-people me-2"></i>Serves</h6>
                      <p className="small mb-1"><strong>Languages:</strong> {selectedTherapist.languagesForSession?.join(', ') || 'English'}</p>
                      <p className="small mb-1"><strong>Age Groups:</strong> {selectedTherapist.ageGroupsServed?.join(', ') || 'All'}</p>
                    </div>
                  </div>

                  {(selectedTherapist.sessionFee?.individual || selectedTherapist.packagePricing?.length > 0) && (
                    <div className="mb-4">
                      <h6 className="text-primary"><i className="bi bi-currency-dollar me-2"></i>Pricing</h6>
                      <div className="row">
                        {selectedTherapist.sessionFee?.individual > 0 && (
                          <div className="col-md-3">
                            <div className="card bg-light">
                              <div className="card-body text-center p-2">
                                <small className="text-muted">Individual</small>
                                <div className="fw-bold">₹{selectedTherapist.sessionFee.individual}</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {selectedTherapist.sessionFee?.couple > 0 && (
                          <div className="col-md-3">
                            <div className="card bg-light">
                              <div className="card-body text-center p-2">
                                <small className="text-muted">Couple</small>
                                <div className="fw-bold">₹{selectedTherapist.sessionFee.couple}</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {selectedTherapist.sessionFee?.family > 0 && (
                          <div className="col-md-3">
                            <div className="card bg-light">
                              <div className="card-body text-center p-2">
                                <small className="text-muted">Family</small>
                                <div className="fw-bold">₹{selectedTherapist.sessionFee.family}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      {selectedTherapist.slidingScaleOptions && (
                        <p className="small text-success mt-2"><i className="bi bi-check-circle me-1"></i>Offers sliding scale pricing</p>
                      )}
                    </div>
                  )}

                  <div className="mb-4">
                    <h6 className="text-primary"><i className="bi bi-shield-check me-2"></i>Compliance</h6>
                    <div className="d-flex flex-wrap gap-2">
                      <span className={`badge ${selectedTherapist.confidentialityAgreement ? 'bg-success' : 'bg-secondary'}`}>
                        <i className={`bi bi-${selectedTherapist.confidentialityAgreement ? 'check' : 'x'} me-1`}></i>
                        Confidentiality
                      </span>
                      <span className={`badge ${selectedTherapist.mandatoryReportingConsent ? 'bg-success' : 'bg-secondary'}`}>
                        <i className={`bi bi-${selectedTherapist.mandatoryReportingConsent ? 'check' : 'x'} me-1`}></i>
                        Mandatory Reporting
                      </span>
                      <span className={`badge ${selectedTherapist.ethicalPracticeDeclaration ? 'bg-success' : 'bg-secondary'}`}>
                        <i className={`bi bi-${selectedTherapist.ethicalPracticeDeclaration ? 'check' : 'x'} me-1`}></i>
                        Ethical Practice
                      </span>
                    </div>
                  </div>

                  {selectedTherapist.licenseFiles?.length > 0 && (
                    <div className="mb-4">
                      <h6 className="text-primary"><i className="bi bi-file-earmark-text me-2"></i>Uploaded Documents</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {selectedTherapist.licenseFiles.map((file, i) => (
                          <a key={i} href={file.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                            <i className="bi bi-file-earmark me-1"></i>{file.fileName || `Document ${i + 1}`}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h6 className="text-primary d-flex justify-content-between align-items-center">
                      <span><i className="bi bi-calendar me-2"></i>Availability</span>
                      <button 
                        className="btn btn-sm btn-outline-primary" 
                        onClick={() => setShowTherapistAvailForm(!showTherapistAvailForm)}
                      >
                        <i className={`bi ${showTherapistAvailForm ? 'bi-x' : 'bi-plus'} me-1`}></i>
                        {showTherapistAvailForm ? 'Cancel' : 'Add'}
                      </button>
                    </h6>
                    
                    {showTherapistAvailForm && (
                      <div className="card mb-3 border-primary">
                        <div className="card-body">
                          <h6 className="card-title small">Add New Availability</h6>
                          <div className="row g-2">
                            <div className="col-md-5">
                              <label className="form-label small">Date</label>
                              <input 
                                type="date" 
                                className="form-control form-control-sm" 
                                value={therapistAvailDate} 
                                onChange={e => setTherapistAvailDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                              />
                            </div>
                            <div className="col-md-7">
                              <label className="form-label small">Time Slots (HH:MM)</label>
                              {therapistAvailSlots.map((slot, idx) => (
                                <div key={idx} className="input-group input-group-sm mb-1">
                                  <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="09:00" 
                                    value={slot} 
                                    onChange={e => {
                                      const newSlots = [...therapistAvailSlots];
                                      newSlots[idx] = e.target.value;
                                      setTherapistAvailSlots(newSlots);
                                    }}
                                  />
                                  {therapistAvailSlots.length > 1 && (
                                    <button 
                                      className="btn btn-outline-danger btn-sm" 
                                      type="button" 
                                      onClick={() => setTherapistAvailSlots(therapistAvailSlots.filter((_, i) => i !== idx))}
                                    >
                                      <i className="bi bi-x"></i>
                                    </button>
                                  )}
                                </div>
                              ))}
                              <button 
                                className="btn btn-sm btn-outline-secondary mt-1" 
                                type="button" 
                                onClick={() => setTherapistAvailSlots([...therapistAvailSlots, ""])}
                              >
                                <i className="bi bi-plus me-1"></i>Add Slot
                              </button>
                            </div>
                          </div>
                          <button 
                            className="btn btn-primary btn-sm mt-2" 
                            onClick={handleAddTherapistAvailability}
                            disabled={actionLoading === selectedTherapist._id}
                          >
                            {actionLoading === selectedTherapist._id ? (
                              <span className="spinner-border spinner-border-sm me-1"></span>
                            ) : (
                              <i className="bi bi-check me-1"></i>
                            )}
                            Save Availability
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {selectedTherapist.availability?.length > 0 ? (
                      <div className="row g-2">
                        {selectedTherapist.availability.slice(0, 4).map((avail, i) => (
                          <div key={i} className="col-md-6">
                            <div className="card bg-light">
                              <div className="card-body p-2">
                                <strong className="small">{new Date(avail.date).toLocaleDateString()}</strong>
                                <div className="mt-1">
                                  {avail.time_slots?.map((slot, j) => (
                                    <span key={j} className="badge bg-primary me-1">{slot}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {selectedTherapist.availability.length > 4 && (
                          <p className="small text-muted mt-2">+{selectedTherapist.availability.length - 4} more dates</p>
                        )}
                      </div>
                    ) : (
                      <div className="alert alert-warning py-2 small">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        No availability dates set. Users won't be able to book appointments.
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer d-flex justify-content-between">
                  <div>
                    {(!selectedTherapist.status || selectedTherapist.status?.toLowerCase() === 'pending') ? (
                      <>
                        <button 
                          type="button" 
                          className="btn btn-success me-2" 
                          disabled={actionLoading === selectedTherapist._id}
                          onClick={async () => {
                            setActionLoading(selectedTherapist._id);
                            try {
                              await API.adminDOCT.updateStatus(selectedTherapist._id, "accepted");
                              setSuccess("Therapist accepted successfully!");
                              fetchTherapists();
                              setShowTherapistModal(false);
                              setSelectedTherapist(null);
                            } catch (err) {
                              setError(err.message || "Failed to accept");
                            } finally {
                              setActionLoading(null);
                            }
                          }}
                        >
                          {actionLoading === selectedTherapist._id ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-check-lg me-1"></i>Accept</>}
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-warning me-2" 
                          disabled={actionLoading === selectedTherapist._id}
                          onClick={async () => {
                            setActionLoading(selectedTherapist._id);
                            try {
                              await API.adminDOCT.updateStatus(selectedTherapist._id, "rejected");
                              setSuccess("Therapist rejected successfully!");
                              fetchTherapists();
                              setShowTherapistModal(false);
                              setSelectedTherapist(null);
                            } catch (err) {
                              setError(err.message || "Failed to reject");
                            } finally {
                              setActionLoading(null);
                            }
                          }}
                        >
                          <i className="bi bi-x-lg me-1"></i>Reject
                        </button>
                      </>
                    ) : (
                      <span className={`badge ${selectedTherapist.status?.toLowerCase() === 'accepted' ? 'bg-success' : 'bg-danger'} me-2`}>
                        {selectedTherapist.status?.toUpperCase() || 'PENDING'}
                      </span>
                    )}
                    <button 
                      type="button" 
                      className="btn btn-outline-danger" 
                      disabled={actionLoading === selectedTherapist._id}
                      onClick={async () => {
                        if (!window.confirm("Are you sure you want to delete this therapist application?")) return;
                        setActionLoading(selectedTherapist._id);
                        try {
                          await API.adminDOCT.delete(selectedTherapist._id);
                          setSuccess("Therapist deleted successfully!");
                          fetchTherapists();
                          setShowTherapistModal(false);
                          setSelectedTherapist(null);
                        } catch (err) {
                          setError(err.message || "Failed to delete");
                        } finally {
                          setActionLoading(null);
                        }
                      }}
                    >
                      <i className="bi bi-trash me-1"></i>Delete
                    </button>
                  </div>
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowTherapistModal(false); setSelectedTherapist(null); setShowTherapistAvailForm(false); setTherapistAvailDate(""); setTherapistAvailSlots([""]); }}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showHcDetailModal && selectedHc && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header" style={{ background: 'linear-gradient(135deg, #c0d7d6 0%, rgb(5, 82, 47) 100%)', color: '#fff' }}>
                  <h5 className="modal-title">
                    <i className="bi bi-hospital me-2"></i>
                    Healthcare Professional Details
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => { setShowHcDetailModal(false); setSelectedHc(null); }}></button>
                </div>
                <div className="modal-body">
                  <div className="row mb-4">
                    <div className="col-md-4 text-center">
                      {selectedHc.profilePhoto ? (
                        <img 
                          src={selectedHc.profilePhoto} 
                          alt="Profile" 
                          className="rounded-circle mb-3" 
                          style={{ width: '120px', height: '120px', objectFit: 'cover', border: '4px solid #abd1c6' }} 
                          crossOrigin="anonymous"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '120px', height: '120px' }}>
                          <i className="bi bi-person-fill text-white" style={{ fontSize: '3rem' }}></i>
                        </div>
                      )}
                      <h5 className="mb-1">{selectedHc.fullName}</h5>
                      {selectedHc.preferredName && <p className="text-muted small mb-1">"{selectedHc.preferredName}"</p>}
                      <p className="text-muted small">{selectedHc.gender} • {selectedHc.pronouns}</p>
                      <span className={`badge ${selectedHc.status === 'accepted' ? 'bg-success' : selectedHc.status === 'rejected' ? 'bg-danger' : 'bg-warning'}`}>
                        {selectedHc.status?.toUpperCase()}
                      </span>
                    </div>
                    <div className="col-md-8">
                      <h6 className="text-primary"><i className="bi bi-envelope me-2"></i>Contact Information</h6>
                      <p className="mb-1"><i className="bi bi-envelope me-2"></i>{selectedHc.email}</p>
                      {selectedHc.phone && <p className="mb-1"><i className="bi bi-telephone me-2"></i>{selectedHc.phone}</p>}
                      {(selectedHc.city || selectedHc.state || selectedHc.country) && (
                        <p className="mb-2"><i className="bi bi-geo-alt me-2"></i>{[selectedHc.city, selectedHc.state, selectedHc.country].filter(Boolean).join(', ')}</p>
                      )}
                      
                      {selectedHc.emergencyContact?.name && (
                        <div className="mt-2 p-2 bg-light rounded">
                          <small className="text-muted"><strong>Emergency Contact:</strong> {selectedHc.emergencyContact.name} ({selectedHc.emergencyContact.relationship}) - {selectedHc.emergencyContact.phone}</small>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6 className="text-primary"><i className="bi bi-briefcase me-2"></i>Role Categories</h6>
                    <div className="d-flex flex-wrap gap-1">
                      {selectedHc.roleCategories?.length > 0 ? selectedHc.roleCategories.map((role, i) => (
                        <span key={i} className="badge bg-primary">{role}</span>
                      )) : <span className="text-muted small">Not specified</span>}
                    </div>
                  </div>

                  {selectedHc.shortBio && (
                    <div className="mb-4">
                      <h6 className="text-primary"><i className="bi bi-person-lines-fill me-2"></i>About</h6>
                      <p className="text-muted small">{selectedHc.shortBio}</p>
                    </div>
                  )}

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h6 className="text-primary"><i className="bi bi-mortarboard me-2"></i>Qualifications</h6>
                      <p className="mb-1"><strong>Highest:</strong> {selectedHc.highestQualification || 'N/A'}</p>
                      <p className="mb-1"><strong>Experience:</strong> {selectedHc.yearsInDementiaCare} years in dementia care</p>
                      {selectedHc.licenseNumber && <p className="mb-1"><strong>License:</strong> {selectedHc.licenseNumber}</p>}
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-primary"><i className="bi bi-translate me-2"></i>Languages & Skills</h6>
                      <p className="mb-1"><strong>Languages:</strong> {selectedHc.languagesSpoken?.join(', ') || 'English'}</p>
                      {selectedHc.specialSkills?.length > 0 && (
                        <div className="d-flex flex-wrap gap-1 mt-2">
                          {selectedHc.specialSkills.map((skill, i) => (
                            <span key={i} className="badge bg-info">{skill}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedHc.dementiaCertifications?.length > 0 && (
                    <div className="mb-4">
                      <h6 className="text-primary"><i className="bi bi-award me-2"></i>Dementia Certifications</h6>
                      <ul className="small mb-0">
                        {selectedHc.dementiaCertifications.map((cert, i) => (
                          <li key={i}>{cert.name} {cert.issuingBody && `- ${cert.issuingBody}`} {cert.year && `(${cert.year})`}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedHc.previousInstitutions?.length > 0 && (
                    <div className="mb-4">
                      <h6 className="text-primary"><i className="bi bi-building me-2"></i>Previous Institutions</h6>
                      <ul className="small mb-0">
                        {selectedHc.previousInstitutions.map((inst, i) => (
                          <li key={i}><strong>{inst.name}</strong> - {inst.role} {inst.duration && `(${inst.duration})`} {inst.location && `@ ${inst.location}`}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h6 className="text-primary"><i className="bi bi-clipboard2-pulse me-2"></i>Dementia Types Experienced</h6>
                      <div className="d-flex flex-wrap gap-1">
                        {selectedHc.dementiaTypesExperienced?.length > 0 ? selectedHc.dementiaTypesExperienced.map((type, i) => (
                          <span key={i} className="badge bg-success">{type}</span>
                        )) : <span className="text-muted small">Not specified</span>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-primary"><i className="bi bi-layers me-2"></i>Stages Handled</h6>
                      <div className="d-flex flex-wrap gap-1">
                        {selectedHc.dementiaStagesHandled?.length > 0 ? selectedHc.dementiaStagesHandled.map((stage, i) => (
                          <span key={i} className="badge bg-warning text-dark">{stage}</span>
                        )) : <span className="text-muted small">Not specified</span>}
                      </div>
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h6 className="text-primary"><i className="bi bi-clock me-2"></i>Session Details</h6>
                      <p className="small mb-1"><strong>Duration:</strong> {selectedHc.sessionDuration} minutes</p>
                      <p className="small mb-1"><strong>Mode:</strong> {selectedHc.preferredCommunicationMode?.join(', ') || 'Video'}</p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-primary"><i className="bi bi-currency-rupee me-2"></i>Consultation Fees</h6>
                      {selectedHc.consultationFee?.initial > 0 && <p className="small mb-1"><strong>Initial:</strong> ₹{selectedHc.consultationFee.initial}</p>}
                      {selectedHc.consultationFee?.followUp > 0 && <p className="small mb-1"><strong>Follow-up:</strong> ₹{selectedHc.consultationFee.followUp}</p>}
                      {selectedHc.consultationFee?.homeVisit > 0 && <p className="small mb-1"><strong>Home Visit:</strong> ₹{selectedHc.consultationFee.homeVisit}</p>}
                      {selectedHc.acceptsInsurance && (
                        <p className="small text-success mb-0"><i className="bi bi-check-circle me-1"></i>Accepts Insurance</p>
                      )}
                    </div>
                  </div>

                  {selectedHc.licenseFiles?.length > 0 && (
                    <div className="mb-4">
                      <h6 className="text-primary"><i className="bi bi-file-earmark-text me-2"></i>Uploaded Documents</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {selectedHc.licenseFiles.map((file, i) => (
                          <a key={i} href={file.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                            <i className="bi bi-file-earmark me-1"></i>{file.fileName || `Document ${i + 1}`}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h6 className="text-primary"><i className="bi bi-calendar me-2"></i>Availability</h6>
                    {selectedHc.availability?.length > 0 ? (
                      <div className="row g-2">
                        {selectedHc.availability.slice(0, 4).map((avail, i) => (
                          <div key={i} className="col-md-6">
                            <div className="card bg-light">
                              <div className="card-body p-2">
                                <strong className="small">{new Date(avail.date).toLocaleDateString()}</strong>
                                <div className="mt-1">
                                  {avail.time_slots?.map((slot, j) => (
                                    <span key={j} className="badge bg-primary me-1">{slot}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {selectedHc.availability.length > 4 && (
                          <p className="small text-muted mt-2">+{selectedHc.availability.length - 4} more dates</p>
                        )}
                      </div>
                    ) : (
                      <div className="alert alert-warning py-2 small">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        No availability dates set. Users won't be able to book appointments.
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer d-flex justify-content-between">
                  <div>
                    {(!selectedHc.status || selectedHc.status?.toLowerCase() === 'pending') ? (
                      <>
                        <button 
                          type="button" 
                          className="btn btn-success me-2" 
                          disabled={actionLoading === selectedHc._id}
                          onClick={async () => {
                            setActionLoading(selectedHc._id);
                            try {
                              await API.adminDOCH.updateStatus(selectedHc._id, "accepted");
                              setSuccess("Healthcare professional accepted successfully!");
                              fetchHealthcareProfessionals();
                              setShowHcDetailModal(false);
                              setSelectedHc(null);
                            } catch (err) {
                              setError(err.message || "Failed to accept");
                            } finally {
                              setActionLoading(null);
                            }
                          }}
                        >
                          {actionLoading === selectedHc._id ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-check-lg me-1"></i>Accept</>}
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-warning me-2" 
                          disabled={actionLoading === selectedHc._id}
                          onClick={async () => {
                            setActionLoading(selectedHc._id);
                            try {
                              await API.adminDOCH.updateStatus(selectedHc._id, "rejected");
                              setSuccess("Healthcare professional rejected successfully!");
                              fetchHealthcareProfessionals();
                              setShowHcDetailModal(false);
                              setSelectedHc(null);
                            } catch (err) {
                              setError(err.message || "Failed to reject");
                            } finally {
                              setActionLoading(null);
                            }
                          }}
                        >
                          <i className="bi bi-x-lg me-1"></i>Reject
                        </button>
                      </>
                    ) : (
                      <span className={`badge ${selectedHc.status?.toLowerCase() === 'accepted' ? 'bg-success' : 'bg-danger'} me-2`}>
                        {selectedHc.status?.toUpperCase() || 'PENDING'}
                      </span>
                    )}
                    <button 
                      type="button" 
                      className="btn btn-outline-danger" 
                      disabled={actionLoading === selectedHc._id}
                      onClick={async () => {
                        if (!window.confirm("Are you sure you want to delete this healthcare professional application?")) return;
                        setActionLoading(selectedHc._id);
                        try {
                          await API.adminDOCH.delete(selectedHc._id);
                          setSuccess("Healthcare professional deleted successfully!");
                          fetchHealthcareProfessionals();
                          setShowHcDetailModal(false);
                          setSelectedHc(null);
                        } catch (err) {
                          setError(err.message || "Failed to delete");
                        } finally {
                          setActionLoading(null);
                        }
                      }}
                    >
                      <i className="bi bi-trash me-1"></i>Delete
                    </button>
                  </div>
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowHcDetailModal(false); setSelectedHc(null); }}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}
