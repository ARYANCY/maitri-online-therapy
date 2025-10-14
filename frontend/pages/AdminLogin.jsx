import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/axiosClient";
import "../css/AdminLogin.css";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const MAX_ATTEMPTS = 3;
  const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes

  // Check existing session
  useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      try {
        const session = await API.auth.checkSession();
        console.log("Session check response:", session);

        if (isMounted) {
          if (session?.user?.isAdmin) {
            navigate("/admin", { replace: true });
            return;
          }
          setIsCheckingSession(false);
          inputRef.current?.focus();
        }
      } catch (err) {
        console.error("Session check error:", err);
        if (isMounted) {
          setError("Please login with Google first, then return here for admin access.");
          setIsCheckingSession(false);
          setTimeout(() => navigate("/", { replace: true }), 3000);
        }
      }
    };
    checkSession();
    return () => { isMounted = false; };
  }, [navigate]);

  // Lockout handling
  useEffect(() => {
    const lockoutTime = localStorage.getItem("adminLockoutTime");
    if (lockoutTime) {
      const timeLeft = LOCKOUT_DURATION - (Date.now() - parseInt(lockoutTime));
      if (timeLeft > 0) {
        setIsLocked(true);
        setTimeout(() => {
          setIsLocked(false);
          localStorage.removeItem("adminLockoutTime");
          setAttempts(0);
        }, timeLeft);
      } else {
        localStorage.removeItem("adminLockoutTime");
        setAttempts(0);
      }
    }
  }, []);

  const handleChange = (e) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  const getTimeLeft = () => {
    const lockoutTime = localStorage.getItem("adminLockoutTime");
    if (!lockoutTime) return 0;
    const timeLeft = LOCKOUT_DURATION - (Date.now() - parseInt(lockoutTime));
    return Math.max(0, Math.ceil(timeLeft / 1000));
  };

  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    if (isLocked) {
      const interval = setInterval(() => {
        const remaining = getTimeLeft();
        setTimeLeft(remaining);
        if (remaining === 0) {
          setIsLocked(false);
          setAttempts(0);
          localStorage.removeItem("adminLockoutTime");
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isLocked]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || isLocked) return;

    if (!password || password.trim().length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await API.auth.adminLogin({ password: password.trim() });
      console.log("Admin login success response:", res);

      if (res?.success && res.user?.isAdmin) {
        // Save admin session in localStorage
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("adminEmail", res.user.email || "");
        localStorage.setItem("userId", res.user._id || "");
        localStorage.setItem("userName", res.user.name || "");

        // Clear lockout attempts
        setAttempts(0);
        localStorage.removeItem("adminLockoutTime");

        // Redirect immediately to admin panel
        navigate("/admin", { replace: true });
        return;
      }

      // Login failed but no exception
      console.warn("Admin login failed response:", res);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        setIsLocked(true);
        localStorage.setItem("adminLockoutTime", Date.now().toString());
        setError(`Too many failed attempts. Please wait 5 minutes.`);
        setTimeout(() => {
          setIsLocked(false);
          localStorage.removeItem("adminLockoutTime");
          setAttempts(0);
        }, LOCKOUT_DURATION);
      } else {
        setError(res?.message || `Incorrect password. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
      }
    } catch (err) {
      console.error("Admin login error:", err);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        setIsLocked(true);
        localStorage.setItem("adminLockoutTime", Date.now().toString());
        setError(`Too many failed attempts. Please wait 5 minutes.`);
        setTimeout(() => {
          setIsLocked(false);
          localStorage.removeItem("adminLockoutTime");
          setAttempts(0);
        }, LOCKOUT_DURATION);
      } else {
        setError(err?.message || `Login failed. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
      }
    } finally {
      setLoading(false);
      if (!isLocked) {
        setPassword("");
        inputRef.current?.focus();
      }
    }
  };

  if (isCheckingSession) {
    return (
      <div className="admin-login-container container my-5 p-4 shadow-sm rounded">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-container container my-5 p-4 shadow-sm rounded">
      <div className="text-center mb-4">
        <i className="bi bi-shield-lock display-4 text-primary mb-3"></i>
        <h2 className="mb-2">Admin Access</h2>
        <p className="text-muted">
          You must be logged in with Google first. Enter the admin password below to gain admin privileges.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: 400 }}>
        <div className="mb-3">
          <label className="form-label">Admin Password</label>
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Admin Password"
              value={password}
              onChange={handleChange}
              className="form-control"
              ref={inputRef}
              autoFocus
              autoComplete="current-password"
              spellCheck="false"
              disabled={isLocked}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLocked}
            >
              <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 mb-3"
          disabled={loading || !password || isLocked}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Authenticating...
            </>
          ) : isLocked ? (
            `Locked for ${timeLeft}s`
          ) : (
            <>
              <i className="bi bi-unlock me-2"></i>
              Login as Admin
            </>
          )}
        </button>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError("")}></button>
          </div>
        )}

        {attempts > 0 && !isLocked && (
          <div className="alert alert-warning">
            <i className="bi bi-info-circle me-2"></i>
            Failed attempts: {attempts}/{MAX_ATTEMPTS}
          </div>
        )}

        <div className="text-center mt-3">
          <button type="button" className="btn btn-link text-decoration-none" onClick={() => navigate("/")}>
            <i className="bi bi-arrow-left me-1"></i>
            Back to Home
          </button>
        </div>

        <div className="text-center mt-2">
          <small className="text-muted">
            <i className="bi bi-info-circle me-1"></i>
            Admin access is restricted to authorized personnel only.
          </small>
        </div>
      </form>
    </div>
  );
}
