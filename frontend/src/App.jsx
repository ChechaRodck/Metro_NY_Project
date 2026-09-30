import { Navigate, Route, Routes } from "react-router";
import DashboardLayout from "./layout/DashboardLayout";
import { isAuthenticated } from "./auth";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import NetworkManagement from "./pages/NetworkManagement";
import OperationsManagement from "./pages/OperationsManagement";
import FleetManagement from "./pages/FleetManagement";
import PersonnelManagement from "./pages/PersonnelManagement";
import PassengerManagement from "./pages/PassengerManagement";
import MaintenanceManagement from "./pages/MaintenanceManagement";
import IncidentManagement from "./pages/IncidentManagement";
import ReportsManagement from "./pages/ReportsManagement";

function ProtectedLayout() {
  return isAuthenticated() ? (
    <DashboardLayout />
  ) : (
    <Navigate to="/login" replace />
  );
}

function LoginRoute() {
  return isAuthenticated() ? <Navigate to="/" replace /> : <Login />;
}

function App() {
  return (
    <Routes>
      <Route path="login" element={<LoginRoute />} />

      <Route element={<ProtectedLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="red" element={<NetworkManagement />} />
        <Route path="operaciones" element={<OperationsManagement />} />
        <Route path="flota" element={<FleetManagement />} />
        <Route path="personal" element={<PersonnelManagement />} />
        <Route path="pasajeros" element={<PassengerManagement />} />
        <Route path="mantenimiento" element={<MaintenanceManagement />} />
        <Route path="incidentes" element={<IncidentManagement />} />
        <Route path="reportes" element={<ReportsManagement />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
