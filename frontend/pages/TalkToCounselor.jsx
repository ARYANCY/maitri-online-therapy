import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../utils/axiosClient";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../css/pages/TalkToCounselor.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function TalkToCounselor() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("healthcare"); 
  const [dochs, setDochs] = useState([]);
  const [docts, setDocts] = useState([]);
  const [loading, setLoading] = useState({ user: true, healthcare: true, therapist: true });
  const [error, setError] = useState({ user: "", healthcare: "", therapist: "", booking: "" });
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterSpecialization, setFilterSpecialization] = useState("");
  
  
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [selectedProfessionalType, setSelectedProfessionalType] = useState(null); 
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [patientNotes, setPatientNotes] = useState("");

  const handleViewDetails = (professional, type) => {
    setSelectedProfessional(professional);
    setSelectedProfessionalType(type);
    setShowDetailModal(true);
  };

  
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(id);
  }, [searchTerm]);

  const fetchUser = useCallback(async () => {
    try {
      const res = await API.auth.checkSession();
      if (!res?.success || !res?.user) {
        navigate("/");
        return;
      }
      setUser(res.user);
      setError((prev) => ({ ...prev, user: "" }));
    } catch (err) {
      console.error("Session check failed:", err);
      navigate("/");
    } finally {
      setLoading((prev) => ({ ...prev, user: false }));
    }
  }, [navigate]);

  const fetchHealthcareProfessionals = useCallback(async () => {
    setLoading((prev) => ({ ...prev, healthcare: true }));
    setError((prev) => ({ ...prev, healthcare: "" }));

    try {
      const res = await API.doch.getAll();
      if (!res?.success) throw new Error(res?.message || "Failed to fetch");

      const professionals = Array.isArray(res.dochs) ? res.dochs : [];
      setDochs(professionals);
    } catch (err) {
      console.error("Healthcare professionals fetch error:", err);
      setError((prev) => ({
        ...prev,
        healthcare: err.message || t("talk.errorFetching", "Error fetching healthcare professionals"),
      }));
      setDochs([]);
    } finally {
      setLoading((prev) => ({ ...prev, healthcare: false }));
    }
  }, [t]);

  const fetchTherapists = useCallback(async () => {
    setLoading((prev) => ({ ...prev, therapist: true }));
    setError((prev) => ({ ...prev, therapist: "" }));

    try {
      const res = await API.doct.getAccepted();
      if (!res?.success) throw new Error(res?.message || "Failed to fetch");

      const professionals = Array.isArray(res.docts) ? res.docts : [];
      setDocts(professionals);
    } catch (err) {
      console.error("Therapists fetch error:", err);
      setError((prev) => ({
        ...prev,
        therapist: err.message || t("talk.errorFetching", "Error fetching therapists"),
      }));
      setDocts([]);
    } finally {
      setLoading((prev) => ({ ...prev, therapist: false }));
    }
  }, [t]);

  useEffect(() => {
    (async () => {
      await fetchUser();
      await fetchHealthcareProfessionals();
      await fetchTherapists();
    })();
  }, [fetchUser, fetchHealthcareProfessionals, fetchTherapists]);

  
  const currentProfessionals = useMemo(() => {
    return activeTab === "healthcare" ? dochs : docts;
  }, [activeTab, dochs, docts]);

  const specializations = useMemo(() => {
    const allSpecs = currentProfessionals
      .map((c) => c.specialization)
      .filter((s) => s && s.trim() !== "");
    return [...new Set(allSpecs)];
  }, [currentProfessionals]);

  const filteredProfessionals = useMemo(() => {
    return currentProfessionals
      .filter((c) => {
        const matchesSearch =
          !debouncedSearch ||
          c.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          c.specialization
            ?.toLowerCase()
            .includes(debouncedSearch.toLowerCase());
        const matchesSpec =
          !filterSpecialization ||
          c.specialization === filterSpecialization;
        return matchesSearch && matchesSpec;
      })
      .sort((a, b) => {
        
        return (a.priority || 10) - (b.priority || 10);
      });
  }, [currentProfessionals, debouncedSearch, filterSpecialization]);

  const handleRefresh = () => {
    if (activeTab === "healthcare") {
      fetchHealthcareProfessionals();
    } else {
      fetchTherapists();
    }
  };

  
  const handleBookAppointment = (professional, type) => {
    setSelectedProfessional(professional);
    setSelectedProfessionalType(type);
    setSelectedDate("");
    setSelectedTimeSlot("");
    setAvailableTimeSlots([]);
    setPatientNotes("");
    setShowBookingModal(true);
    setError((prev) => ({ ...prev, booking: "" }));
  };

  
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTimeSlot("");
    
    if (!selectedProfessional || !date) {
      setAvailableTimeSlots([]);
      return;
    }

    
    const selectedDateObj = new Date(date);
    const dateStr = selectedDateObj.toISOString().split('T')[0];
    
    const availabilityEntry = selectedProfessional.availability?.find(avail => {
      const availDateStr = new Date(avail.date).toISOString().split('T')[0];
      return availDateStr === dateStr;
    });

    if (availabilityEntry && availabilityEntry.time_slots) {
      setAvailableTimeSlots(availabilityEntry.time_slots);
    } else {
      setAvailableTimeSlots([]);
    }
  };

  
  const handleConfirmBooking = async () => {
    if (!selectedProfessional || !selectedDate || !selectedTimeSlot) {
      setError((prev) => ({ ...prev, booking: t("talk.selectDateAndTime", "Please select date and time slot") }));
      return;
    }

    setBookingLoading(true);
    setError((prev) => ({ ...prev, booking: "" }));

    try {
      const appointmentData = {
        appointmentDate: selectedDate,
        timeSlot: selectedTimeSlot,
        patientNotes: patientNotes.trim() || ""
      };

      
      if (selectedProfessionalType === "healthcare") {
        appointmentData.dochId = selectedProfessional._id;
      } else if (selectedProfessionalType === "therapist") {
        appointmentData.doctId = selectedProfessional._id;
      }

      
      const res = selectedProfessionalType === "healthcare" 
        ? await API.doch.createAppointment(appointmentData)
        : await API.doct.createAppointment(appointmentData);
      
      if (!res?.success) {
        throw new Error(res?.message || "Failed to book appointment");
      }

      setSuccess(t("talk.bookingSuccess", "Appointment booked successfully!"));
      setShowBookingModal(false);
      setSelectedProfessional(null);
      setSelectedProfessionalType(null);
      setSelectedDate("");
      setSelectedTimeSlot("");
      setAvailableTimeSlots([]);
      setPatientNotes("");
      
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      console.error("Booking error:", err);
      setError((prev) => ({
        ...prev,
        booking: err.message || t("talk.bookingError", "Failed to book appointment. Please try again."),
      }));
    } finally {
      setBookingLoading(false);
    }
  };

  
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const safe = (v) =>
    v && v.trim() !== ""
      ? v
      : t("talk.notProvided", "N/A");

  const currentLoading = activeTab === "healthcare" ? loading.healthcare : loading.therapist;
  const currentError = activeTab === "healthcare" ? error.healthcare : error.therapist;

  return (
    <div className="talk-page">
      <Navbar user={user} />
      <div className="navbar-spacer"></div>
      <main className="talk-content container py-4 py-md-5 px-3 px-md-4">
        
        <header className="talk-header text-center mb-4 mb-md-5">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body p-3 p-md-5">
              <h1 className="display-5 display-md-4 fw-bold mb-3">
                <i className="bi bi-heart-pulse-fill me-3 text-primary"></i>
                {t("talk.title", "Connect with Healthcare Professionals")}
              </h1>
              <p className="lead text-muted mb-0 mx-auto px-2" style={{maxWidth: "700px", lineHeight: 1.8, fontSize: "1.1rem"}}>
                {t(
                  "talk.subtitle",
                  "Book appointments with our verified network of therapists and healthcare professionals. Get the support you need, when you need it."
                )}
              </p>
            </div>
          </div>
        </header>

        
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body p-0">
            <ul className="nav nav-pills nav-justified talk-tabs" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "healthcare" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("healthcare");
                    setSearchTerm("");
                    setFilterSpecialization("");
                  }}
                  type="button"
                >
                  <i className="bi bi-hospital me-2"></i>
                  {t("talk.healthcareProfessionalsTab", "Healthcare Professionals")}
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "therapist" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("therapist");
                    setSearchTerm("");
                    setFilterSpecialization("");
                  }}
                  type="button"
                >
                  <i className="bi bi-person-hearts me-2"></i>
                  {t("talk.therapistsTab", "Therapists")}
                </button>
              </li>
            </ul>
          </div>
        </div>

        
        {currentError && (
          <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
            <strong>{t("talk.error", "Error")}:</strong> {currentError}
            <button
              type="button"
              className="btn-close"
              onClick={() =>
                setError((prev) => ({ ...prev, [activeTab]: "" }))
              }
              aria-label="Close"
            ></button>
          </div>
        )}

        
        <div className="counselor-filters card shadow-sm border-0 mb-4 mb-md-5">
          <div className="card-body p-3 p-md-4">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label htmlFor="counselor-search-input" className="form-label fw-semibold mb-2 small">
                  {t("talk.search", "Search")}
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    id="counselor-search-input"
                    name="counselor-search-input"
                    className="form-control"
                    placeholder={t(
                      "talk.searchPlaceholder",
                      "Search by name or specialization..."
                    )}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setSearchTerm("")}
                      aria-label="Clear search"
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  )}
                </div>
              </div>
              <div className="col-12 col-md-4">
                <label htmlFor="counselor-specialization-filter" className="form-label fw-semibold mb-2 small">
                  {t("talk.filterBy", "Filter By")}
                </label>
                <select
                  id="counselor-specialization-filter"
                  name="counselor-specialization-filter"
                  className="form-select"
                  value={filterSpecialization}
                  onChange={(e) =>
                    setFilterSpecialization(e.target.value)
                  }
                >
                  <option value="">
                    {t(
                      "talk.allSpecializations",
                      "All Specializations"
                    )}
                  </option>
                  {specializations.map((spec, i) => (
                    <option key={i} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-2 d-flex align-items-end">
                <button
                  className="btn btn-primary w-100"
                  onClick={handleRefresh}
                  disabled={currentLoading}
                >
                  {currentLoading ? (
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  ) : (
                    <i className="bi bi-arrow-clockwise me-2 d-none d-md-inline"></i>
                  )}
                  <span className="d-md-none">{t("talk.refresh", "Refresh")}</span>
                  <span className="d-none d-md-inline">{t("talk.refresh", "Refresh")}</span>
                </button>
              </div>
            </div>
            {(searchTerm || filterSpecialization) && (
              <div className="mt-3 pt-2 border-top">
                <small className="text-muted">
                  {t("talk.showingResults", "Showing")} <strong>{filteredProfessionals.length}</strong> {t("talk.of", "of")} <strong>{currentProfessionals.length}</strong> {activeTab === "healthcare" ? t("talk.healthcareProfessionalsTab", "healthcare professionals") : t("talk.therapistsTab", "therapists")}
                </small>
              </div>
            )}
          </div>
        </div>

        
        {currentLoading ? (
          <div className="text-center my-5 py-5">
            <div
              className="spinner-border text-primary mb-3"
              style={{width: "3rem", height: "3rem"}}
              role="status"
            >
              <span className="visually-hidden">
                {t("talk.loading", "Loading healthcare professionals...")}
              </span>
            </div>
            <p className="fs-5 text-muted">
              {activeTab === "healthcare" 
                ? t("talk.loadingHealthcare", "Loading healthcare professionals...")
                : t("talk.loadingTherapists", "Loading therapists...")}
            </p>
          </div>
        ) : filteredProfessionals.length === 0 ? (
          
          <div className="talk-empty text-center my-5 py-5">
            <div className="card shadow-sm border-0">
              <div className="card-body p-5">
                <i className="bi bi-search fs-1 text-muted mb-3 d-block"></i>
                <h3 className="h5 fw-bold mb-3">
                  {searchTerm || filterSpecialization
                    ? (activeTab === "healthcare"
                        ? t("talk.noMatchingHealthcare", "No healthcare professionals match your search criteria.")
                        : t("talk.noMatchingTherapists", "No therapists match your search criteria."))
                    : (activeTab === "healthcare"
                        ? t("talk.noHealthcare", "No healthcare professionals available right now.")
                        : t("talk.noTherapists", "No therapists available right now."))}
                </h3>
                {(searchTerm || filterSpecialization) && (
                  <button
                    className="btn btn-outline-primary mt-2"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterSpecialization("");
                    }}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    {t("talk.clearFilters", "Clear Filters")}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          
          <section className="counselor-grid row g-4 mb-5">
            {filteredProfessionals.map((c) => (
              <div key={c._id} className="col-md-6 col-lg-4">
                <article className="counselor-card card h-100 shadow-sm border-0" style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }} onClick={() => handleViewDetails(c, activeTab)} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,70,67,0.15)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}>
                  <div className="card-body p-4">
                    
                    <div className="d-flex align-items-start justify-content-between mb-3 pb-3 border-bottom">
                      <div className="flex-grow-1">
                        <h5 className="counselor-name h4 fw-bold mb-1" style={{ color: '#004643' }}>
                          {safe(c.fullName || c.name)}
                        </h5>
                        {(c.specialization || c.roleCategories?.[0] || c.specializations?.[0]) && (
                          <span className="badge" style={{ background: 'linear-gradient(135deg, #c0d7d6 0%, rgb(5, 82, 47) 100%)' }}>
                            {safe(c.specialization || c.roleCategories?.[0] || c.specializations?.[0])}
                          </span>
                        )}
                        {c.primaryQualification && (
                          <span className="badge bg-info ms-1">{safe(c.primaryQualification)}</span>
                        )}
                        {c.highestQualification && (
                          <span className="badge bg-info ms-1">{safe(c.highestQualification)}</span>
                        )}
                      </div>
                      {c.profilePhoto ? (
                        <img 
                          src={c.profilePhoto} 
                          alt={c.fullName || c.name} 
                          className="rounded-circle flex-shrink-0" 
                          style={{ width: "60px", height: "60px", objectFit: "cover", border: '3px solid #abd1c6' }} 
                        />
                      ) : (
                        <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: "60px", height: "60px", fontSize: "1.5rem", background: 'linear-gradient(135deg, #c0d7d6 0%, rgb(5, 82, 47) 100%)', color: '#fff' }}>
                          {(c.fullName || c.name)?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                    </div>

                    
                    <div className="counselor-details">
                      {c.shortBio && (
                        <p className="text-muted small mb-3" style={{ lineHeight: '1.5' }}>
                          {c.shortBio.length > 100 ? c.shortBio.substring(0, 100) + '...' : c.shortBio}
                        </p>
                      )}

                      <div className="row g-2 mb-3">
                        {(c.experience || c.yearsOfPractice || c.yearsInDementiaCare) && (
                          <div className="col-6">
                            <div className="bg-light rounded p-2 text-center">
                              <i className="bi bi-briefcase text-primary"></i>
                              <div className="small fw-bold">{c.yearsOfPractice || c.yearsInDementiaCare || c.experience || 0} {t("talk.years", "yrs")}</div>
                              <div className="text-muted" style={{ fontSize: '0.7rem' }}>{t("talk.experience", "Experience")}</div>
                            </div>
                          </div>
                        )}
                        {c.availability && c.availability.length > 0 && (
                          <div className="col-6">
                            <div className="bg-light rounded p-2 text-center">
                              <i className="bi bi-calendar-check text-success"></i>
                              <div className="small fw-bold">{c.availability.length}</div>
                              <div className="text-muted" style={{ fontSize: '0.7rem' }}>{t("talk.availableSlots", "Available Slots")}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {(c.languagesForSession?.length > 0 || c.languagesSpoken?.length > 0) && (
                        <div className="mb-2">
                          <small className="text-muted">
                            <i className="bi bi-translate me-1"></i>
                            {(c.languagesForSession || c.languagesSpoken)?.slice(0, 3).join(', ')}
                          </small>
                        </div>
                      )}
                    </div>

                    
                    <div className="mt-3 pt-3 border-top">
                      {(!c.availability || c.availability.length === 0) && (
                        <div className="alert alert-warning py-2 mb-2 small">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          {t("talk.noAvailabilitySet", "No availability set yet")}
                        </div>
                      )}
                      <div className="d-flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleViewDetails(c, activeTab); }}
                          className="btn btn-outline-primary flex-grow-1"
                        >
                          <i className="bi bi-eye me-1"></i>{t("talk.view", "View")}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleBookAppointment(c, activeTab); }}
                          className="btn btn-primary flex-grow-1"
                          disabled={!c.availability || c.availability.length === 0}
                          style={{ background: c.availability && c.availability.length > 0 ? 'linear-gradient(135deg, #c0d7d6 0%, rgb(5, 82, 47) 100%)' : '#ccc', border: 'none' }}
                        >
                          <i className="bi bi-calendar-plus me-1"></i>{t("talk.book", "Book")}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </section>
        )}
      </main>

      
      {success && (
        <div className="alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3" style={{zIndex: 9999, maxWidth: "90%"}} role="alert">
          <strong>{t("talk.success", "Success")}:</strong> {success}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess("")}
            aria-label="Close"
          ></button>
        </div>
      )}

      
      {showBookingModal && selectedProfessional && (
        <div 
          className="modal show d-block" 
          tabIndex="-1" 
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 10000,
            overflowY: "auto"
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowBookingModal(false);
              setSelectedProfessional(null);
              setSelectedProfessionalType(null);
              setSelectedDate("");
              setSelectedTimeSlot("");
              setAvailableTimeSlots([]);
              setPatientNotes("");
              setError((prev) => ({ ...prev, booking: "" }));
            }
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ marginTop: "2rem", marginBottom: "2rem" }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-calendar-check me-2"></i>
                  {t("talk.bookAppointment", "Book Appointment")} - {selectedProfessional.name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedProfessional(null);
                    setSelectedProfessionalType(null);
                    setSelectedDate("");
                    setSelectedTimeSlot("");
                    setAvailableTimeSlots([]);
                    setPatientNotes("");
                    setError((prev) => ({ ...prev, booking: "" }));
                  }}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {error.booking && (
                  <div className="alert alert-danger mb-3">
                    {error.booking}
                  </div>
                )}

                
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-calendar-event me-2"></i>
                    {t("talk.availableDates", "Available Dates")} *
                  </label>
                  {selectedProfessional.availability && selectedProfessional.availability.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2">
                      {selectedProfessional.availability
                        .filter(avail => new Date(avail.date) >= new Date(new Date().setHours(0,0,0,0)))
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map((avail, idx) => {
                          const dateObj = new Date(avail.date);
                          const dateStr = dateObj.toISOString().split('T')[0];
                          const isSelected = selectedDate === dateStr;
                          return (
                            <button
                              key={idx}
                              type="button"
                              className={`btn ${isSelected ? 'btn-primary' : 'btn-outline-primary'} d-flex flex-column align-items-center p-2`}
                              style={{ minWidth: '90px' }}
                              onClick={() => handleDateChange(dateStr)}
                            >
                              <span className="fw-bold">
                                {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                              </span>
                              <span className="fs-5 fw-bold">
                                {dateObj.getDate()}
                              </span>
                              <small>
                                {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                              </small>
                              <span className="badge bg-light text-dark mt-1">
                                {avail.time_slots?.length || 0} {t("talk.slots", "slots")}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="alert alert-info mb-0">
                      <i className="bi bi-info-circle me-2"></i>
                      {t("talk.noAvailableDates", "No available dates at the moment")}
                    </div>
                  )}
                </div>

                
                {selectedDate && availableTimeSlots.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-clock me-2"></i>
                      {t("talk.selectTime", "Select Time Slot")} *
                    </label>
                    <div className="d-flex flex-wrap gap-2">
                      {availableTimeSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={`btn ${selectedTimeSlot === slot ? 'btn-success' : 'btn-outline-secondary'}`}
                          onClick={() => setSelectedTimeSlot(slot)}
                        >
                          <i className="bi bi-clock me-1"></i>
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDate && availableTimeSlots.length === 0 && (
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {t("talk.noSlotsAvailable", "No time slots available for this date")}
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="patient-notes" className="form-label">
                    {t("talk.notes", "Notes")} ({t("talk.optional", "Optional")})
                  </label>
                  <textarea
                    id="patient-notes"
                    className="form-control"
                    rows="3"
                    value={patientNotes}
                    onChange={(e) => setPatientNotes(e.target.value)}
                    placeholder={t("talk.notesPlaceholder", "Any additional information...")}
                    maxLength={500}
                  ></textarea>
                  <small className="text-muted">
                    {patientNotes.length}/500 {t("talk.characters", "characters")}
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedProfessional(null);
                    setSelectedProfessionalType(null);
                    setSelectedDate("");
                    setSelectedTimeSlot("");
                    setAvailableTimeSlots([]);
                    setPatientNotes("");
                    setError((prev) => ({ ...prev, booking: "" }));
                  }}
                  disabled={bookingLoading}
                >
                  {t("talk.cancel", "Cancel")}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmBooking}
                  disabled={bookingLoading || !selectedDate || !selectedTimeSlot}
                >
                  {bookingLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {t("talk.booking", "Booking...")}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      {t("talk.confirmAppointment", "Confirm Appointment")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedProfessional && (
        <div 
          className="modal show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000, overflowY: "auto" }}
          onClick={() => setShowDetailModal(false)}
        >
          <div className="modal-dialog modal-lg modal-dialog-scrollable" style={{ marginTop: '2rem', marginBottom: '2rem' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #c0d7d6 0%, rgb(5, 82, 47) 100%)', color: '#fff', border: 'none' }}>
                <h5 className="modal-title">
                  <i className="bi bi-person-badge me-2"></i>
                  {selectedProfessionalType === 'healthcare' 
                    ? t("talk.healthcareProfessionalProfile", "Healthcare Professional Profile")
                    : t("talk.therapistProfile", "Therapist Profile")}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row">
                  <div className="col-md-4 text-center mb-4">
                    {selectedProfessional.profilePhoto ? (
                      <img 
                        src={selectedProfessional.profilePhoto} 
                        alt={selectedProfessional.fullName || selectedProfessional.name} 
                        className="rounded-circle mb-3" 
                        style={{ width: '150px', height: '150px', objectFit: 'cover', border: '4px solid #abd1c6' }} 
                      />
                    ) : (
                      <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '150px', height: '150px', background: 'linear-gradient(135deg, #c0d7d6 0%, rgb(5, 82, 47) 100%)', color: '#fff', fontSize: '4rem' }}>
                        {(selectedProfessional.fullName || selectedProfessional.name)?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <h4 className="mb-1" style={{ color: '#004643' }}>{selectedProfessional.fullName || selectedProfessional.name}</h4>
                    {selectedProfessional.preferredName && <p className="text-muted small">"{selectedProfessional.preferredName}"</p>}
                    <span className="badge" style={{ background: 'linear-gradient(135deg, #c0d7d6 0%, rgb(5, 82, 47) 100%)' }}>
                      {selectedProfessional.specialization || selectedProfessional.roleCategories?.[0] || selectedProfessional.specializations?.[0] || 'Professional'}
                    </span>
                  </div>
                  <div className="col-md-8">
                    {selectedProfessional.shortBio && (
                      <div className="mb-4">
                        <h6 className="text-muted mb-2"><i className="bi bi-person-lines-fill me-2"></i>{t("talk.about", "About")}</h6>
                        <p style={{ lineHeight: '1.7' }}>{selectedProfessional.shortBio}</p>
                      </div>
                    )}

                    <div className="row g-3 mb-4">
                      <div className="col-6">
                        <div className="bg-light rounded p-3">
                          <small className="text-muted d-block">{t("talk.experience", "Experience")}</small>
                          <strong>{selectedProfessional.yearsOfPractice || selectedProfessional.yearsInDementiaCare || selectedProfessional.experience || 0} {t("talk.yearsFull", "years")}</strong>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="bg-light rounded p-3">
                          <small className="text-muted d-block">{t("talk.sessionDuration", "Session Duration")}</small>
                          <strong>{selectedProfessional.sessionDuration || 60} {t("talk.mins", "mins")}</strong>
                        </div>
                      </div>
                    </div>

                    {(selectedProfessional.primaryQualification || selectedProfessional.highestQualification) && (
                      <div className="mb-3">
                        <h6 className="text-muted mb-2"><i className="bi bi-award me-2"></i>{t("talk.qualification", "Qualification")}</h6>
                        <p className="mb-0">{selectedProfessional.primaryQualification || selectedProfessional.highestQualification}</p>
                      </div>
                    )}

                    {(selectedProfessional.licensingBody || selectedProfessional.licenseNumber) && (
                      <div className="mb-3">
                        <h6 className="text-muted mb-2"><i className="bi bi-file-earmark-check me-2"></i>{t("talk.license", "License")}</h6>
                        <p className="mb-0">
                          {selectedProfessional.licensingBody || selectedProfessional.licenseNumber}
                          {selectedProfessional.therapistCouncilNumber && ` (${selectedProfessional.therapistCouncilNumber})`}
                        </p>
                      </div>
                    )}

                    {(selectedProfessional.specializations?.length > 0 || selectedProfessional.roleCategories?.length > 0) && (
                      <div className="mb-3">
                        <h6 className="text-muted mb-2"><i className="bi bi-star me-2"></i>{t("talk.specializations", "Specializations")}</h6>
                        <div className="d-flex flex-wrap gap-1">
                          {(selectedProfessional.specializations || selectedProfessional.roleCategories || []).map((s, i) => (
                            <span key={i} className="badge bg-light text-dark border">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedProfessional.approachesUsed?.length > 0 && (
                      <div className="mb-3">
                        <h6 className="text-muted mb-2"><i className="bi bi-lightbulb me-2"></i>{t("talk.therapyApproaches", "Therapy Approaches")}</h6>
                        <div className="d-flex flex-wrap gap-1">
                          {selectedProfessional.approachesUsed.map((a, i) => (
                            <span key={i} className="badge bg-info text-dark">{a}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {(selectedProfessional.languagesForSession?.length > 0 || selectedProfessional.languagesSpoken?.length > 0) && (
                      <div className="mb-3">
                        <h6 className="text-muted mb-2"><i className="bi bi-translate me-2"></i>{t("talk.languages", "Languages")}</h6>
                        <p className="mb-0">{(selectedProfessional.languagesForSession || selectedProfessional.languagesSpoken || []).join(', ')}</p>
                      </div>
                    )}

                    {selectedProfessional.preferredCommunicationMode?.length > 0 && (
                      <div className="mb-3">
                        <h6 className="text-muted mb-2"><i className="bi bi-chat-dots me-2"></i>{t("talk.communicationMode", "Communication Mode")}</h6>
                        <p className="mb-0">{selectedProfessional.preferredCommunicationMode.join(', ')}</p>
                      </div>
                    )}

                    {selectedProfessional.areasComfortableWith?.length > 0 && (
                      <div className="mb-3">
                        <h6 className="text-muted mb-2"><i className="bi bi-check-circle me-2 text-success"></i>{t("talk.comfortableWith", "Comfortable With")}</h6>
                        <div className="d-flex flex-wrap gap-1">
                          {selectedProfessional.areasComfortableWith.map((area, i) => (
                            <span key={i} className="badge bg-success">{area}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedProfessional.areasNotHandled?.length > 0 && (
                      <div className="mb-3">
                        <h6 className="text-muted mb-2"><i className="bi bi-x-circle me-2 text-danger"></i>{t("talk.doesNotHandle", "Does Not Handle")}</h6>
                        <div className="d-flex flex-wrap gap-1">
                          {selectedProfessional.areasNotHandled.map((area, i) => (
                            <span key={i} className="badge bg-danger">{area}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedProfessional.ageGroupsServed?.length > 0 && (
                      <div className="mb-3">
                        <h6 className="text-muted mb-2"><i className="bi bi-people me-2"></i>{t("talk.ageGroupsServed", "Age Groups Served")}</h6>
                        <div className="d-flex flex-wrap gap-1">
                          {selectedProfessional.ageGroupsServed.map((age, i) => (
                            <span key={i} className="badge bg-light text-dark border">{age}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedProfessional.availability?.length > 0 && (
                      <div className="mb-3">
                        <h6 className="text-muted mb-2"><i className="bi bi-calendar-check me-2"></i>{t("talk.availability", "Availability")}</h6>
                        <p className="mb-0 text-success"><strong>{selectedProfessional.availability.length}</strong> {t("talk.dateSlotsAvailable", "date slot(s) available")}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ background: '#f0f7f4' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>{t("talk.close", "Close")}</button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(135deg, #c0d7d6 0%, rgb(5, 82, 47) 100%)', border: 'none' }}
                  disabled={!selectedProfessional.availability || selectedProfessional.availability.length === 0}
                  onClick={() => { setShowDetailModal(false); handleBookAppointment(selectedProfessional, selectedProfessionalType); }}
                >
                  <i className="bi bi-calendar-plus me-2"></i>
                  {t("talk.bookAppointment", "Book Appointment")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
