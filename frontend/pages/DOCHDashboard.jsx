import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../utils/axiosClient";
import "bootstrap/dist/css/bootstrap.min.css";

const themeStyles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0f7f4 0%, #abd1c6 50%, #f0f7f4 100%)',
  },
  cardHeader: {
    background: 'linear-gradient(135deg, #c0d7d6 0%, rgb(5, 82, 47) 100%)',
    color: '#fffffe',
    borderRadius: '15px 15px 0 0',
  },
  card: {
    border: '2px solid #abd1c6',
    borderRadius: '15px',
    boxShadow: '0 8px 30px rgba(0, 70, 67, 0.12)',
    background: '#fffffe',
  },
  badge: {
    background: 'linear-gradient(135deg, #c0d7d6 0%, rgb(5, 82, 47) 100%)',
    border: 'none',
  },
  infoAlert: {
    background: '#f0f7f4',
    borderLeft: '4px solid #3d9970',
    color: '#004643',
  },
  successAlert: {
    background: '#f0f7f4',
    borderLeft: '4px solid #3d9970',
    color: '#004643',
  },
  dangerAlert: {
    background: '#fef2f2',
    borderLeft: '4px solid #dc3545',
    color: '#991b1b',
  },
};

export default function DOCHDashboard() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [doch, setDoch] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState({ user: true, doch: true, appointments: true });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [selectedPresetMessage, setSelectedPresetMessage] = useState("");

  const presetMessages = {
    accepted: [
      "Your appointment is confirmed. Please arrive 10 minutes early with any relevant medical records.",
      "Confirmed! I've reviewed your case and am ready to assist. See you at the scheduled time.",
      "Appointment accepted. Please ensure you have a list of your current medications ready.",
      "Looking forward to your visit. Don't hesitate to call if you have questions beforehand.",
    ],
    rejected: [
      "I apologize, but I'm not available at this time. Please try booking another slot.",
      "Unfortunately, I have a scheduling conflict. Please reschedule for another time.",
      "I'm sorry, but I cannot accommodate this appointment. Please book with another professional.",
      "Due to unforeseen circumstances, I must decline this appointment. Please reschedule.",
    ],
    completed: [
      "Thank you for your visit! Follow up if you have any concerns.",
      "Session completed. Please follow the care plan we discussed. Take care!",
    ],
    cancelled: [
      "This appointment has been cancelled. Please book again when convenient.",
      "Appointment cancelled. I apologize for any inconvenience caused.",
    ]
  };

  const fetchUser = useCallback(async () => {
    try {
      const res = await API.auth.checkSession();
      if (!res?.success || !res?.user) {
        navigate("/");
        return;
      }
      setUser(res.user);
    } catch (err) {
      console.error("Session check failed:", err);
      navigate("/");
    } finally {
      setLoading((prev) => ({ ...prev, user: false }));
    }
  }, [navigate]);

  const fetchDOCHProfile = useCallback(async () => {
    setLoading((prev) => ({ ...prev, doch: true }));
    setError("");
    try {
      const res = await API.doch.getMyProfile();
      if (!res?.success) throw new Error(res?.message || "Failed to fetch profile");
      setDoch(res.doch);
    } catch (err) {
      console.error("Failed to fetch DOCH profile:", err);
      setError(err?.message || "Failed to load profile. Please ensure your email matches a DOCH application.");
    } finally {
      setLoading((prev) => ({ ...prev, doch: false }));
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    setLoading((prev) => ({ ...prev, appointments: true }));
    setError("");
    try {
      const res = await API.doch.getAppointments();
      if (!res?.success) throw new Error(res?.message || "Failed to fetch appointments");
      setAppointments(res.appointments || []);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      setError(err?.message || "Failed to load appointments.");
    } finally {
      setLoading((prev) => ({ ...prev, appointments: false }));
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchUser();
      await fetchDOCHProfile();
      await fetchAppointments();
    })();
  }, [fetchUser, fetchDOCHProfile, fetchAppointments]);

  const openMessageModal = useCallback((appointment, action) => {
    setSelectedAppointment(appointment);
    setSelectedAction(action);
    setActionMessage("");
    setSelectedPresetMessage("");
    setShowMessageModal(true);
  }, []);

  const handleAppointmentAction = useCallback(async () => {
    if (!selectedAppointment || !selectedAction) return;
    
    const finalMessage = actionMessage.trim() || selectedPresetMessage;
    
    setActionLoading(selectedAppointment._id);
    setError("");
    setSuccess("");
    setShowMessageModal(false);
    
    try {
      const res = await API.doch.updateAppointmentStatus(selectedAppointment._id, selectedAction, finalMessage);
      if (!res?.success) throw new Error(res?.message || `Failed to ${selectedAction} appointment`);
      setSuccess(`Appointment ${selectedAction} successfully! The patient has been notified.`);
      fetchAppointments();
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      console.error(`Failed to ${selectedAction} appointment:`, err);
      setError(err?.message || `Failed to ${selectedAction} appointment`);
    } finally {
      setActionLoading(null);
      setSelectedAppointment(null);
      setSelectedAction(null);
      setActionMessage("");
      setSelectedPresetMessage("");
    }
  }, [selectedAppointment, selectedAction, actionMessage, selectedPresetMessage, fetchAppointments]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "accepted":
      case "confirmed":
        return "badge bg-success";
      case "pending":
        return "badge bg-warning text-dark";
      case "rejected":
      case "cancelled":
        return "badge bg-danger";
      case "completed":
        return "badge bg-info";
      default:
        return "badge bg-secondary";
    }
  };

  if (loading.user) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={themeStyles.page}>
      <Navbar user={user} />
      <div className="navbar-spacer" style={{ height: "160px" }}></div>
      <div className="container flex-grow-1 py-4">
        <div className="card mb-4" style={themeStyles.card}>
          <div className="card-header" style={themeStyles.cardHeader}>
            <h2 className="mb-0">
              <i className="bi bi-person-badge me-2"></i>
              Healthcare Professional Dashboard
            </h2>
          </div>
          <div className="card-body">
            {error && (
              <div className="alert alert-danger alert-dismissible fade show">
                <i className="bi bi-exclamation-circle me-2"></i>
                {error}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError("")}
                ></button>
              </div>
            )}

            {success && (
              <div className="alert alert-success alert-dismissible fade show">
                <i className="bi bi-check-circle me-2"></i>
                {success}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSuccess("")}
                ></button>
              </div>
            )}

            {loading.doch ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading profile...</span>
                </div>
              </div>
            ) : doch ? (
              <div>
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h4>Application Status</h4>
                    <p>
                      <span className={getStatusBadgeClass(doch.status)} style={{ fontSize: "1rem" }}>
                        {doch.status.toUpperCase()}
                      </span>
                    </p>
                    {doch.lastStatusUpdate && (
                      <small className="text-muted">
                        Last updated: {new Date(doch.lastStatusUpdate).toLocaleString()}
                      </small>
                    )}
                  </div>
                </div>

                <hr />

                <h4>Profile Information</h4>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <strong>Name:</strong> {doch.name}
                  </div>
                  <div className="col-md-6 mb-3">
                    <strong>Email:</strong> {doch.email}
                  </div>
                  <div className="col-md-6 mb-3">
                    <strong>Specialization:</strong> {doch.specialization}
                  </div>
                  <div className="col-md-6 mb-3">
                    <strong>Experience:</strong> {doch.experience} years
                  </div>
                  <div className="col-md-6 mb-3">
                    <strong>Priority:</strong> {doch.priority || 5}
                  </div>
                  {doch.availability && doch.availability.length > 0 && (
                    <div className="col-md-6 mb-3">
                      <strong>Availability:</strong> {doch.availability.length} date(s) configured
                    </div>
                  )}
                </div>

                {doch.status === "pending" && (
                  <div className="alert mt-4" style={themeStyles.infoAlert}>
                    <i className="bi bi-info-circle me-2"></i>
                    Your application is under review. You will be notified once a decision is made.
                  </div>
                )}

                {doch.status === "accepted" && (
                  <div className="alert mt-4" style={themeStyles.successAlert}>
                    <i className="bi bi-check-circle me-2"></i>
                    Congratulations! Your application has been accepted. You can now start receiving appointments.
                  </div>
                )}

                {doch.status === "rejected" && (
                  <div className="alert mt-4" style={themeStyles.dangerAlert}>
                    <i className="bi bi-x-circle me-2"></i>
                    Unfortunately, your application has been rejected. Please contact support for more information.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-person-x display-1 text-muted"></i>
                <p className="text-muted mt-3">No DOCH profile found.</p>
              </div>
            )}
          </div>
        </div>

        
        <div className="card" style={themeStyles.card}>
          <div className="card-header" style={themeStyles.cardHeader}>
            <h3 className="mb-0">
              <i className="bi bi-calendar-check me-2"></i>
              Your Appointments
            </h3>
          </div>
          <div className="card-body">
            {loading.appointments ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading appointments...</span>
                </div>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-calendar-x display-1 text-muted"></i>
                <p className="text-muted mt-3">No appointments booked yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Patient Name</th>
                      <th>Patient Email</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Patient Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((apt) => (
                      <tr key={apt._id || apt.id}>
                        <td>
                          <strong>{apt.userId?.name || "N/A"}</strong>
                        </td>
                        <td>{apt.userId?.email || "N/A"}</td>
                        <td>{new Date(apt.appointmentDate).toLocaleDateString()}</td>
                        <td>
                          <span className="badge bg-primary">{apt.timeSlot}</span>
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(apt.status)}>
                            {apt.status}
                          </span>
                        </td>
                        <td>
                          <small>{apt.patientNotes || "-"}</small>
                        </td>
                        <td>
                          {apt.status === "pending" && (
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-success"
                                onClick={() => openMessageModal(apt, "accepted")}
                                disabled={actionLoading === apt._id}
                                title="Accept Appointment"
                              >
                                {actionLoading === apt._id ? (
                                  <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                  <><i className="bi bi-check-lg me-1"></i>Accept</>
                                )}
                              </button>
                              <button
                                className="btn btn-danger"
                                onClick={() => openMessageModal(apt, "rejected")}
                                disabled={actionLoading === apt._id}
                                title="Reject Appointment"
                              >
                                {actionLoading === apt._id ? (
                                  <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                  <><i className="bi bi-x-lg me-1"></i>Reject</>
                                )}
                              </button>
                            </div>
                          )}
                          {apt.status === "accepted" && (
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-info"
                                onClick={() => openMessageModal(apt, "completed")}
                                disabled={actionLoading === apt._id}
                                title="Mark as Completed"
                              >
                                {actionLoading === apt._id ? (
                                  <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                  <><i className="bi bi-check-circle me-1"></i>Complete</>
                                )}
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => openMessageModal(apt, "cancelled")}
                                disabled={actionLoading === apt._id}
                                title="Cancel Appointment"
                              >
                                {actionLoading === apt._id ? (
                                  <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                  <><i className="bi bi-x-circle me-1"></i>Cancel</>
                                )}
                              </button>
                            </div>
                          )}
                          {(apt.status === "rejected" || apt.status === "cancelled" || apt.status === "completed") && (
                            <span className="text-muted small">No actions available</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showMessageModal && selectedAppointment && (
        <div 
          className="modal show d-block" 
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999 }}
          onClick={() => setShowMessageModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header" style={themeStyles.cardHeader}>
                <h5 className="modal-title">
                  <i className={`bi ${selectedAction === 'accepted' ? 'bi-check-circle' : selectedAction === 'rejected' ? 'bi-x-circle' : 'bi-chat-dots'} me-2`}></i>
                  {selectedAction === 'accepted' ? 'Accept Appointment' : 
                   selectedAction === 'rejected' ? 'Reject Appointment' :
                   selectedAction === 'completed' ? 'Complete Appointment' : 'Cancel Appointment'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowMessageModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <p className="text-muted mb-2">
                    <strong>Patient:</strong> {selectedAppointment.userId?.name || "N/A"}<br/>
                    <strong>Date:</strong> {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}<br/>
                    <strong>Time:</strong> {selectedAppointment.timeSlot}
                  </p>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-chat-square-text me-2"></i>
                    Select a pre-written message (optional)
                  </label>
                  <div className="d-flex flex-column gap-2">
                    {(presetMessages[selectedAction] || []).map((msg, idx) => (
                      <div 
                        key={idx}
                        className={`p-2 border rounded cursor-pointer ${selectedPresetMessage === msg ? 'border-primary bg-light' : ''}`}
                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                        onClick={() => {
                          setSelectedPresetMessage(msg);
                          setActionMessage("");
                        }}
                      >
                        <div className="form-check mb-0">
                          <input 
                            className="form-check-input" 
                            type="radio" 
                            name="presetMessage"
                            checked={selectedPresetMessage === msg}
                            onChange={() => {
                              setSelectedPresetMessage(msg);
                              setActionMessage("");
                            }}
                          />
                          <label className="form-check-label small">{msg}</label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-pencil me-2"></i>
                    Or write a custom message
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Type your message here..."
                    value={actionMessage}
                    onChange={(e) => {
                      setActionMessage(e.target.value);
                      if (e.target.value.trim()) {
                        setSelectedPresetMessage("");
                      }
                    }}
                    maxLength={500}
                  ></textarea>
                  <small className="text-muted">{actionMessage.length}/500 characters</small>
                </div>

                {(actionMessage || selectedPresetMessage) && (
                  <div className="alert alert-info py-2">
                    <small>
                      <strong>Message Preview:</strong><br/>
                      {actionMessage || selectedPresetMessage}
                    </small>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowMessageModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className={`btn ${selectedAction === 'accepted' ? 'btn-success' : selectedAction === 'rejected' ? 'btn-danger' : 'btn-primary'}`}
                  onClick={handleAppointmentAction}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    <i className={`bi ${selectedAction === 'accepted' ? 'bi-check-lg' : selectedAction === 'rejected' ? 'bi-x-lg' : 'bi-send'} me-2`}></i>
                  )}
                  {selectedAction === 'accepted' ? 'Accept' : 
                   selectedAction === 'rejected' ? 'Reject' :
                   selectedAction === 'completed' ? 'Complete' : 'Cancel'} Appointment
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
