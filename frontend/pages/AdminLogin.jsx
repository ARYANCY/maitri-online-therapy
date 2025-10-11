import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/axiosClient";
import "../css/AdminLogin.css";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(() => {
    const saved = localStorage.getItem("adminAttempts");
    return saved ? parseInt(saved, 10) : 3;
  });

  const inputRef = useRef(null);
  const navigate = useNavigate();

  // -------------------- Check existing admin session --------------------
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const session = await API.auth.checkSession();
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

  // -------------------- Handle input change --------------------
  const handleChange = (e) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  // -------------------- Submit admin password --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || attemptsLeft <= 0) return;

    setLoading(true);
    setError("");

    try {
      // Promote currently logged-in user to admin
      const res = await API.auth.adminLogin({ password });

      if (!res.success) {
        const remaining = attemptsLeft - 1;
        setAttemptsLeft(remaining);
        localStorage.setItem("adminAttempts", remaining);

        if (remaining <= 0) {
          localStorage.setItem("adminBlocked", "true");
          setError("You have been blocked from further attempts.");
        } else {
          setError(`Incorrect password. ${remaining} attempt(s) remaining.`);
        }
        return;
      }

      // Password correct — fetch updated session
      const session = await API.auth.checkSession();
      if (!session?.user?.isAdmin) {
        setError("Session validation failed.");
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("adminEmail");
        return;
      }

      // Store full session info
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("adminEmail", session.user.email || "");
      localStorage.setItem("userId", session.user._id || "");
      localStorage.setItem("userName", session.user.name || "");
      localStorage.removeItem("adminAttempts");
      localStorage.removeItem("adminBlocked");

      navigate("/admin", { replace: true });
    } catch (err) {
      console.error("Admin login error:", err);
      setError(err.message || "Something went wrong. Try again.");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("adminEmail");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
    } finally {
      setLoading(false);
      setPassword("");
      inputRef.current?.focus();
    }
  };

  return (
    <div className="admin-login-container container my-5 p-4 shadow-sm rounded">
      <h2 className="admin-login-title text-center mb-3">Admin Login</h2>
      <p className="admin-login-warning text-center text-muted mb-4">
        Restricted to authorized administrators only. Unauthorized attempts will be blocked.
      </p>

      <form onSubmit={handleSubmit} className="admin-login-form mx-auto" style={{ maxWidth: "400px" }}>
        <input
          type="password"
          placeholder="Enter Admin Password"
          value={password}
          onChange={handleChange}
          className="form-control"
          ref={inputRef}
          disabled={loading || attemptsLeft <= 0}
          autoFocus
        />

        <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading || attemptsLeft <= 0}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {attemptsLeft > 0 && !error && (
          <div className="text-muted mt-2 text-center">Attempts remaining: {attemptsLeft}</div>
        )}

        {error && <div className="text-danger mt-2 text-center">{error}</div>}
      </form>
    </div>
  );
}
