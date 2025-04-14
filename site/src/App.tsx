import React, { useEffect } from "react";
import { Layout } from "./components/Layout";
import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import { ProfileHeader } from "./components/ProfileHeader";
import { CurrentFlight } from "./components/CurrentFlight";
import { CrewList } from "./components/CrewList";
import { FlightEligibility } from "./components/FlightEligibility";
import { Training } from "./pages/Training";
import { Feedback } from "./pages/Feedback";
import { Schedule } from "./pages/Schedule";
import { Tests } from "./pages/Tests";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { FatigueAnalysis } from "./pages/FatigueAnalysis";
import TestSession from "./components/TestSession";
import TestResults from "./components/TestResults";
import axios from 'axios';

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


const Dashboard = () => {
  return <>
      <ProfileHeader />
      <CurrentFlight />
      <CrewList />
      <FlightEligibility />
    </>;
};
export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/fatigue-analysis" element={<Layout><FatigueAnalysis /></Layout>} />
          <Route path="/schedule" element={<Layout><Schedule /></Layout>} />
          <Route path="/tests" element={<Layout><Tests /></Layout>}>
            <Route path="session/:type" element={<TestSession />} />
            <Route path="results/:testId" element={<TestResults />} />
          </Route>
          <Route path="/feedback" element={<Layout><Feedback /></Layout>} />
          <Route path="/training" element={<Layout><Training /></Layout>} />
          <Route path="/settings" element={<Layout><Settings /></Layout>} />
        </Route>
      </Routes>
    </Router>
  );
}