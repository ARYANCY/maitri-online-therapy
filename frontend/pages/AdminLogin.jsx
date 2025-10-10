import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/axiosClient";
import "../css/AdminLogin.css";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const navigate = useNavigate();

  // Check localStorage for previous failed attempts
  useEffect(() => {
    const blocked = localStorage.getItem("adminBlocked");
    if (blocked === "true") setAttemptsLeft(0);

    const storedAttempts = parseInt(localStorage.getItem("adminAttempts"), 10);
    if (!isNaN(storedAttempts)) setAttemptsLeft(storedAttempts);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (attemptsLeft <= 0) return;

    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/admin-login", { password });
      if (res.success) {
        localStorage.setItem("isAdmin", "true");
        localStorage.removeItem("adminAttempts");
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
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
      setPassword("");
    }
  };

  return (
    <div className="admin-login-container">
      <h2 className="admin-login-title">Admin Login</h2>
      <p className="admin-login-warning">
        This section is restricted to authorized administrators only. If you are not an admin, please refrain from attempting access. Focus on positive intentions and let us carry out our administrative duties responsibly.
      </p>

      <form onSubmit={handleSubmit} className="admin-login-form">
        <input
          type="password"
          placeholder="Enter Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="form-control"
          disabled={attemptsLeft <= 0}
        />
        <button type="submit" className="btn btn-primary mt-3" disabled={loading || attemptsLeft <= 0}>
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <div className="text-danger mt-2">{error}</div>}
      </form>
    </div>
  );
}
