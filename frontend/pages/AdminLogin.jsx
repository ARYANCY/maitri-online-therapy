import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/axiosClient";
import "../css/AdminLogin.css";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // --- Initialize attempts and check session
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      // Load attempts info
      const blocked = localStorage.getItem("adminBlocked") === "true";
      const storedAttempts = parseInt(localStorage.getItem("adminAttempts"), 10);
      if (blocked) setAttemptsLeft(0);
      else if (!isNaN(storedAttempts)) setAttemptsLeft(storedAttempts);

      // Check session
      try {
        const session = await API.auth.checkSession();
        if (isMounted && session?.user?.isAdmin) {
          localStorage.setItem("isAdmin", "true");
          navigate("/admin", { replace: true });
        }
      } catch {
        localStorage.removeItem("isAdmin");
      } finally {
        if (isMounted) {
          setLoading(false);
          inputRef.current?.focus();
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // --- Handle input change
  const handleChange = (e) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  // --- Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || attemptsLeft <= 0) return;

    setLoading(true);
    setError("");

    try {
      const res = await API.auth.adminLogin({ password });

      if (res.success) {
        const session = await API.auth.checkSession();
        if (session?.user?.isAdmin) {
          localStorage.setItem("isAdmin", "true");
          localStorage.removeItem("adminAttempts");
          localStorage.removeItem("adminBlocked");
          navigate("/admin", { replace: true });
          return;
        }
        setError("Session verification failed. Try again.");
      } else {
        const remaining = attemptsLeft - 1;
        setAttemptsLeft(remaining);
        localStorage.setItem("adminAttempts", remaining);

        if (remaining <= 0) {
          localStorage.setItem("adminBlocked", "true");
          setError("You have been blocked from further attempts.");
        } else {
          setError(`Incorrect password. ${remaining} attempt(s) remaining.`);
        }
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setError(err?.response?.data?.message || "Something went wrong. Try again.");
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

      <form
        onSubmit={handleSubmit}
        className="admin-login-form mx-auto"
        style={{ maxWidth: "400px" }}
      >
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

        <button
          type="submit"
          className="btn btn-primary w-100 mt-3"
          disabled={loading || attemptsLeft <= 0}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {attemptsLeft > 0 && !error && (
          <div className="text-muted mt-2 text-center">
            Attempts remaining: {attemptsLeft}
          </div>
        )}

        {error && <div className="text-danger mt-2 text-center">{error}</div>}
      </form>
    </div>
  );
}
