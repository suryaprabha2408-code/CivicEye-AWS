import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminJobs from './AdminJobs'; 
import LandingPage from './LandingPage';
import Login from './Login';
import Dashboard from './Dashboard';
import Voting from './Voting';
import JobsPage from './JobsPage';
import TransportPage from './TransportPage'; 
import NewsPortal from './NewsPortal'; 
import SuperAdmin from './SuperAdmin';
import About from './About';
import Departments from './Departments';
import PrivacyPolicy from './PrivacyPolicy';
function App() {
  return (
    <Router>
      <Routes>
        {/* Main website link */}
        <Route path="/" element={<LandingPage />} />
        {/* Login Page */}
        <Route path="/login" element={<Login />} />

        {/*  ROADS/ELECTRICITY Admin Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* JOBS Admin Dashboard (NEW) */}
        <Route path="/admin" element={<AdminJobs />} />

        {/* Other Pages */}
        <Route path="/voting" element={<Voting />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/transport" element={<TransportPage />} />
        <Route path="/news" element={<NewsPortal />} />
        <Route path="/super-admin" element={<SuperAdmin />} />
        <Route path="/about" element={<About />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
      </Routes>
    </Router>
  );
}

export default App;
