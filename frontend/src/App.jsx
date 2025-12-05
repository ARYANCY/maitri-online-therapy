import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Splash from "../pages/Splash";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import AboutMaitri from "../pages/AboutMaitri";
import TalkToCounselor from "../pages/TalkToCounselor";
import DOC from "../pages/DOC";
import DOCTDashboard from "../pages/DOCTDashboard";
import DOCHDashboard from "../pages/DOCHDashboard";
import MyAppointments from "../pages/MyAppointments";
import Admin from "../pages/Admin";
import AdminLogin from "../pages/AdminLogin";
import PrivateAdminRoute from "../components/PrivateAdminRoute";
import CookieTest from "../pages/CookieTest";
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
        <Route path="/doc" element={<DOC />} />
        <Route path="/doct-dashboard" element={<DOCTDashboard />} />
        <Route path="/doch-dashboard" element={<DOCHDashboard />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/cookie-test" element={<CookieTest />} />
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
