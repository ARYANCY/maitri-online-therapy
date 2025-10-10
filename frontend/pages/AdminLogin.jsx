import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/axiosClient";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {

      const res = await API.post("/auth/admin-login", { password });
      if (res.success) {
        localStorage.setItem("isAdmin", "true");
        navigate("/admin");
      } else {
        setError("Incorrect password");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit} className="admin-login-form">
        <input
          type="password"
          placeholder="Enter Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="form-control"
        />
        <button type="submit" className="btn btn-primary mt-3" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <div className="text-danger mt-2">{error}</div>}
      </form>
    </div>
  );
}
