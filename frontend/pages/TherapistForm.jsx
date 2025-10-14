import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/axiosClient";
import Navbar from "../components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import { useTranslation } from "react-i18next";

export default function TherapistForm() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    qualifications: "",
    availability: "",
    bio: ""
  });

  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.auth.checkSession();
      if (!response?.success || !response?.user) {
        navigate("/login");
        return;
      }
      setUser(response.user);
      setFormData(prev => ({
        ...prev,
        name: response.user.name || "",
        email: response.user.email || "",
      }));
    } catch (err) {
      console.error("Session check failed:", err);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);
  
  useEffect(() => { fetchUser(); }, [fetchUser]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);

    const form = e.currentTarget;
    if (form.checkValidity() === false || !/^\d{10}$/.test(formData.phone)) {
      e.stopPropagation();
      setValidated(true);
      if (!/^\d{10}$/.test(formData.phone)) setError("Phone number must be 10 digits.");
      setSubmitting(false);
      return;
    }

    setValidated(true);

    try {
      const response = await API.therapist.apply(formData);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to submit application");
      }
      setMessage("Form submitted successfully! We will review your application soon.");
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        phone: "",
        specialization: "",
        experience: "",
        qualifications: "",
        availability: "",
        bio: ""
      });
      setValidated(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error submitting form");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center mt-5">Loading...</p>;
  
  return (
    <div className="therapist-form-container">
      <Navbar />
      <div className="container mt-5">
        <div className="text-center mb-4">
          <h1 className="display-6 text-primary">Make a Difference, Save Lives</h1>
          <p className="lead text-secondary">
            Join our network of mental health professionals. Fill out the form to apply as a therapist.
          </p>
        </div>

        <div
          className="p-4 rounded shadow-lg"
          style={{
            width: "100%",
            maxWidth: "600px",
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(10px)",
            borderRadius: "15px",
            fontFamily: "Arial, sans-serif",
            marginBottom: "40px",
          }}
        >
          <h2 className="text-center mb-4 text-primary">Therapist Application Form</h2>

          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <form noValidate className={validated ? "was-validated" : ""} onSubmit={handleSubmit}>
            {[
              { label: "Name", type: "text", name: "name" },
              { label: "Email", type: "email", name: "email" },
              { label: "Phone", type: "text", name: "phone" },
              { label: "Specialization", type: "text", name: "specialization" },
              { label: "Experience (Years)", type: "number", name: "experience" },
              { label: "Qualifications", type: "text", name: "qualifications" },
              { label: "Availability", type: "text", name: "availability", placeholder: "E.g., Weekdays 9AM-5PM, Weekends" },
              { label: "Bio", type: "textarea", name: "bio", placeholder: "Brief description about yourself and your approach" },
            ].map((field) => (
              <div className="mb-3" key={field.name}>
                <label className="form-label">{field.label}{!["qualifications", "bio", "availability"].includes(field.name) && " *"}</label>
                {field.type === "textarea" ? (
                  <textarea
                    className="form-control"
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    rows="3"
                    required={!["qualifications", "bio", "availability"].includes(field.name)}
                  />
                ) : (
                  <input
                    type={field.type}
                    className="form-control"
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required={!["qualifications", "bio", "availability"].includes(field.name)}
                  />
                )}
                <div className="invalid-feedback">
                  {field.name === "phone"
                    ? "Please enter a valid 10-digit phone number."
                    : `Please provide your ${field.label.toLowerCase()}.`}
                </div>
              </div>
            ))}

            <button type="submit" className="btn btn-primary w-100 py-2" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </button>
          </form>

          <footer className="text-center mt-4">
            <hr />
            <Link to="/admin" className="me-3 btn btn-link">Admin Dashboard</Link>
            <Link to="/talk-to-counselor" className="btn btn-link">Talk to Counselor</Link>
          </footer>
        </div>
      </div>
    </div>
  );
}
