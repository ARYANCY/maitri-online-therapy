import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../utils/axiosClient";

export default function PrivateAdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await API.auth.checkSession(); // should return { isAdmin: true/false }
        if (user?.isAdmin) setIsAdmin(true);
      } catch (err) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, []);

  if (loading) return <div className="text-center py-5">Checking admin privileges...</div>;

  return isAdmin ? children : <Navigate to="/admin-login" replace />;
}
