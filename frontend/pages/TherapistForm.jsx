import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/axiosClient";
import Navbar from "../components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

export default function TherapistForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    qualifications: "",
  });

  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const data = await API.auth.checkSession();
      if (!data?.user) {
        navigate("/login");
        return;
      }
      setUser(data.user);
      setFormData(prev => ({
        ...prev,
        name: data.user.name || "",
        email: data.user.email || "",
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

    const form = e.currentTarget;
    if (form.checkValidity() === false || !/^\d{10}$/.test(formData.phone)) {
      e.stopPropagation();
      setValidated(true);
      if (!/^\d{10}$/.test(formData.phone)) setError("Phone number must be 10 digits.");
      return;
    }

    setValidated(true);

    try {
      await API.therapist.apply(formData);
      setMessage("Form submitted successfully!");
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        phone: "",
        specialization: "",
        experience: "",
        qualifications: "",
      });
      setValidated(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error submitting form");
    }
  };

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <>
      <Navbar user={user} />
      <div className="bg-light min-vh-100 d-flex flex-column align-items-center">
        <div className="text-center p-4 my-4" style={{ maxWidth: "800px" }}>
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
            ].map((field) => (
              <div className="mb-3" key={field.name}>
                <label className="form-label">{field.label}{field.name !== "qualifications" && " *"}</label>
                <input
                  type={field.type}
                  className="form-control"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required={field.name !== "qualifications"}
                />
                <div className="invalid-feedback">
                  {field.name === "phone"
                    ? "Please enter a valid 10-digit phone number."
                    : `Please provide your ${field.label.toLowerCase()}.`}
                </div>
              </div>
            ))}

            <button type="submit" className="btn btn-primary w-100 py-2">
              Submit
            </button>
          </form>

          <footer className="text-center mt-4">
            <hr />
            <Link to="/admin" className="me-3 btn btn-link">Admin Dashboard</Link>
            <Link to="/talk-to-counselor" className="btn btn-link">Talk to Counselor</Link>
          </footer>
        </div>
      </div>
    </>
  );
}
