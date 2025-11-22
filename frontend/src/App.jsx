import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Splash from "../pages/Splash";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import AboutMaitri from "../pages/AboutMaitri";
import TalkToCounselor from "../pages/TalkToCounselor";
import TherapistForm from "../pages/TherapistForm";
import Admin from "../pages/Admin";
import AdminLogin from "../pages/AdminLogin";
import PrivateAdminRoute from "../components/PrivateAdminRoute";
import "./i18n";
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/splash" element={<Splash />} />
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/about-maitri" element={<AboutMaitri />} />
        <Route path="/talk-to-counselor" element={<TalkToCounselor />} />
        <Route path="/therapist-form" element={<TherapistForm />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <PrivateAdminRoute>
              <Admin />
            </PrivateAdminRoute>
          }
        />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}
