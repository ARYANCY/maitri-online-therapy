import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/axiosClient";
import "../css/AdminLogin.css";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // --- On mount: check session
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const session = await API.auth.adminCheckSession();
        if (isMounted && session?.user?.isAdmin) {
          localStorage.setItem("isAdmin", "true");
          localStorage.setItem("adminEmail", session.user.email || "");
          navigate("/admin", { replace: true });
        }
      } catch {
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("adminEmail");
      } finally {
        if (isMounted) inputRef.current?.focus();
      }
    };

    checkSession();
    return () => { isMounted = false; };
  }, [navigate]);

  // --- Handle password change
  const handleChange = (e) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  // --- Submit login
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await API.auth.adminLogin({ password });

      if (!res.success) {
        setError(res.message || "Incorrect password");
        return;
      }

      // Fetch session info
      const session = await API.auth.adminCheckSession();
      if (!session?.user?.isAdmin) {
        setError("Session validation failed");
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("adminEmail");
        return;
      }

      // Save session locally
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("adminEmail", session.user.email || "");

      navigate("/admin", { replace: true });
    } catch (err) {
      console.error("Admin login error:", err);
      setError(err.message || "Something went wrong");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("adminEmail");
    } finally {
      setLoading(false);
      setPassword("");
      inputRef.current?.focus();
    }
  };

  return (
    <div className="admin-login-container container my-5 p-4 shadow-sm rounded">
      <h2 className="text-center mb-3">Admin Login</h2>
      <p className="text-center text-muted mb-4">Restricted to authorized administrators only.</p>

      <form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: "400px" }}>
        <input
          type="password"
          placeholder="Enter Admin Password"
          value={password}
          onChange={handleChange}
          className="form-control"
          ref={inputRef}
          autoFocus
        />

        <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && <div className="text-danger mt-2 text-center">{error}</div>}
      </form>
    </div>
  );
}
