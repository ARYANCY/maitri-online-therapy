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
        if (isMounted && session?.user?.isAdmin) navigate("/admin", { replace: true });
      } catch {
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("adminEmail");
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
      } finally {
        if (isMounted) inputRef.current?.focus();
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
      <p className="text-muted text-center mb-4">Restricted to authorized administrators only.</p>
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
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <div className="text-danger mt-2 text-center">{error}</div>}
      </form>
    </div>
  );
}
