import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/axiosClient";
import "../css/AdminLogin.css";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    const blocked = localStorage.getItem("adminBlocked") === "true";
    const storedAttempts = parseInt(localStorage.getItem("adminAttempts"), 10);

    if (blocked) setAttemptsLeft(0);
    else if (!isNaN(storedAttempts)) setAttemptsLeft(storedAttempts);

    inputRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (attemptsLeft <= 0 || loading) return;

    setLoading(true);
    try {
      const res = await API.auth.adminLogin({ password });

      if (res.success) {
        localStorage.setItem("isAdmin", "true");
        localStorage.removeItem("adminAttempts");
        localStorage.removeItem("adminBlocked");
        navigate("/admin");
      } else {
        const newAttempts = attemptsLeft - 1;
        setAttemptsLeft(newAttempts);
        localStorage.setItem("adminAttempts", newAttempts);

        if (newAttempts <= 0) {
          localStorage.setItem("adminBlocked", "true");
          setError("You have been blocked from further attempts.");
        } else {
          setError(`Incorrect password. ${newAttempts} attempt(s) remaining.`);
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setPassword("");
      inputRef.current?.focus();
    }
  };

  return (
    <div className="admin-login-container container my-5 p-4">
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
        />

        <button
          type="submit"
          className="btn btn-primary w-100 mt-3"
          disabled={loading || attemptsLeft <= 0}
        >
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
