import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../utils/axiosClient";

export default function PrivateAdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        setError(null);
        const response = await API.auth.checkSession();
        if (response?.success && response?.user?.isAdmin) {
          setIsAdmin(true);
          setLoading(false);
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      } catch (err) {
        const msg = err.message || "Failed to verify admin privileges";
        setError(msg);
        if (retryCount < MAX_RETRIES && msg.includes("Network")) {
          setTimeout(() => setRetryCount(prev => prev + 1), RETRY_DELAY * (retryCount + 1));
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    };

    checkAdmin();
  }, [retryCount]);

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <h5 className="text-muted mb-2">Verifying Admin Access</h5>
        <p className="text-muted text-center">
          {retryCount > 0 && retryCount < MAX_RETRIES ? `Retrying... (${retryCount}/${MAX_RETRIES})` : "Checking admin privileges..."}
        </p>
        {retryCount >= MAX_RETRIES && (
          <div className="alert alert-warning mt-3" style={{ maxWidth: "400px" }}>
            <i className="bi bi-exclamation-triangle me-2"></i>
            Unable to verify admin access. Please check your connection and try again.
          </div>
        )}
      </div>
    );
  }

  if (error && retryCount >= MAX_RETRIES) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100">
        <div className="text-center">
          <i className="bi bi-shield-exclamation display-1 text-danger mb-3"></i>
          <h4 className="text-danger mb-3">Access Verification Failed</h4>
          <p className="text-muted mb-4">{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setRetryCount(0);
              setLoading(true);
              setError(null);
            }}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return isAdmin ? children : <Navigate to="/admin-login" replace />;
}
