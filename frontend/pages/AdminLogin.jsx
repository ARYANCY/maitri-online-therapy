import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/axiosClient";
import "../css/AdminLogin.css";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      try {
        const session = await API.auth.checkSession();
        if (isMounted) {
          if (session?.user?.isAdmin) {
            navigate("/admin", { replace: true });
            return;
          }
          // User is logged in but not admin - allow admin login
          inputRef.current?.focus();
        }
      } catch (err) {
        // User is not logged in - redirect to home for Google login
        if (isMounted) {
          setError("Please login with Google first, then return here for admin access.");
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 3000);
        }
      }
    };
    checkSession();
    return () => { isMounted = false; };
  }, [navigate]);

  const handleChange = (e) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !password) return;
    setLoading(true);
    setError("");
    try {
      const res = await API.auth.adminLogin({ password });
      if (!res?.success) {
        setError(res?.message || "Admin login failed.");
        return;
      }
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("adminEmail", res.user.email || "");
      localStorage.setItem("userId", res.user._id || "");
      localStorage.setItem("userName", res.user.name || "");
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
      setPassword("");
      inputRef.current?.focus();
    }
  };

  return (
    <div className="admin-login-container container my-5 p-4 shadow-sm rounded">
      <h2 className="text-center mb-3">Admin Login</h2>
      <p className="text-muted text-center mb-4">
        You must be logged in with Google first. Enter the admin password below to gain admin privileges.
      </p>
      <form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: 400 }}>
        <input
          type="password"
          placeholder="Enter Admin Password"
          value={password}
          onChange={handleChange}
          className="form-control"
          ref={inputRef}
          autoFocus
          autoComplete="current-password"
          spellCheck="false"
          inputMode="text"
        />
        <button
          type="submit"
          className="btn btn-primary w-100 mt-3"
          disabled={loading || !password}
        >
          {loading ? "Logging in..." : "Login as Admin"}
        </button>
        {error && <div className="text-danger mt-2 text-center">{error}</div>}
        <div className="text-center mt-3">
          <button 
            type="button" 
            className="btn btn-link" 
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>
        </div>
      </form>
    </div>
  );
}
