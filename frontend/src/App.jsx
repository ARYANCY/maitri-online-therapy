import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import AboutMaitri from "../pages/AboutMaitri";
import TalkToCounselor from "../pages/TalkToCounselor";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/about" element={<AboutMaitri />} />
        <Route path="/talk-to-counselor" element={<TalkToCounselor />} />
      </Routes>
    </Router>
  );
}
