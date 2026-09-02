import { Navigate, Route, Routes } from "react-router";
import { Construction } from "lucide-react";
import DashboardLayout from "./layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import NetworkManagement from "./pages/NetworkManagement";
import OperationsManagement from "./pages/OperationsManagement";
import FleetManagement from "./pages/FleetManagement";
import PersonnelManagement from "./pages/PersonnelManagement";
import PassengerManagement from "./pages/PassengerManagement";
import MaintenanceManagement from "./pages/MaintenanceManagement";
import IncidentManagement from "./pages/IncidentManagement";

function ModulePlaceholder({ title, description }) {
  return (
    <section
      style={{
        display: "grid",
        minHeight: "420px",
        placeItems: "center",
        padding: "30px",
        textAlign: "center",
        background: "#ffffff",
        border: "1px solid #e4e7ec",
        borderRadius: "13px",
      }}
    >
      <div>
        <div
          style={{
            display: "grid",
            width: "58px",
            height: "58px",
            margin: "0 auto 18px",
            placeItems: "center",
            color: "#2563eb",
            background: "#eff6ff",
            borderRadius: "14px",
          }}
        >
          <Construction size={27} />
        </div>

        <h2
          style={{
            margin: "0 0 8px",
            color: "#172033",
            fontSize: "23px",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            maxWidth: "470px",
            margin: "0",
            color: "#667085",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          {description}
        </p>
      </div>
    </section>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
      
        <Route index element={<Dashboard />} />

        <Route path="red" element={<NetworkManagement />} />

        <Route path="operaciones" element={<OperationsManagement />} />

        <Route path="flota" element={<FleetManagement />} />

        <Route path="personal" element={<PersonnelManagement />} />

       <Route path="pasajeros" element={<PassengerManagement />} />
       
        <Route
          path="mantenimiento"
           element={<MaintenanceManagement />}
        />

        <Route
          path="incidentes"
          element={<IncidentManagement />}
        />

        <Route
          path="reportes"
          element={
            <ModulePlaceholder
              title="Reportes y estadísticas"
              description="Aquí se presentarán indicadores operativos, financieros y de utilización del servicio."
            />
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;