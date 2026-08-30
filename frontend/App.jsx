import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Invites from "./pages/Invites";
import Dashboard from "./pages/Dashboard";
import EnergyMonitoring from "./pages/EnergyMonitoring";
import AIPredictions from "./pages/AIPredictions";
import Battery from "./pages/Battery";
import Renewable from "./pages/Renewable";
import LoadManagement from "./pages/LoadManagement";
import EmergencyCenter from "./pages/EmergencyCenter";
import DigitalTwin from "./pages/DigitalTwin";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup/:code" element={<Signup />} />

          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/invites" element={<Invites />} />
            <Route path="/energy" element={<EnergyMonitoring />} />
            <Route path="/predictions" element={<AIPredictions />} />
            <Route path="/battery" element={<Battery />} />
            <Route path="/renewable" element={<Renewable />} />
            <Route path="/loads" element={<LoadManagement />} />
            <Route path="/emergency" element={<EmergencyCenter />} />
            <Route path="/twin" element={<DigitalTwin />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
