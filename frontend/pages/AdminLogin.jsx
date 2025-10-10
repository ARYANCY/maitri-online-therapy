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

  // --- Initialize attempts and verify session
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      // Load attempts info
      const blocked = localStorage.getItem("adminBlocked") === "true";
      const storedAttempts = parseInt(localStorage.getItem("adminAttempts"), 10);
      if (blocked) setAttemptsLeft(0);
      else if (!isNaN(storedAttempts)) setAttemptsLeft(storedAttempts);

      // Verify session
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

    init();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // --- Handle input
  const handleChange = (e) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  // --- Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || attemptsLeft <= 0) return;

    setLoading(true);
    setError("");

    try {
      const res = await API.auth.adminLogin({ password });

      if (res.success) {
        const session = await API.auth.adminCheckSession();
        if (session?.user?.isAdmin) {
          localStorage.setItem("isAdmin", "true");
          localStorage.removeItem("adminAttempts");
          localStorage.removeItem("adminBlocked");
          navigate("/admin", { replace: true });
          return;
        }
        setError("Session verification failed. Please try again.");
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
      const msg = err?.response?.data?.message || err?.message || "Something went wrong. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
      setPassword("");
      inputRef.current?.focus();
    }
  };

  return (
    <div className="admin-login-container container my-5 p-5 shadow rounded border border-light">
      <h2 className="text-center mb-3">Admin Login</h2>
      <p className="text-center text-muted mb-4">
        Restricted to authorized administrators. Unauthorized attempts will be blocked.
      </p>

      <form
        onSubmit={handleSubmit}
        className="admin-login-form mx-auto"
        style={{ maxWidth: 400 }}
      >
        <input
          type="password"
          placeholder="Enter Admin Password"
          value={password}
          onChange={handleChange}
          ref={inputRef}
          className="form-control form-control-lg"
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

        {error && (
          <div className="alert alert-danger mt-3 text-center p-2">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
