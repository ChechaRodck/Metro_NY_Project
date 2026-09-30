import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  CalendarDays,
  CirclePlus,
  Download,
  FileSpreadsheet,
  FileText,
  Gauge,
  Info,
  TrainFront,
  TriangleAlert,
  UsersRound,
  Wrench,
  X,
} from "lucide-react";
import {
  generatedReports,
  incidentDistributionData,
  linePerformanceData,
  maintenanceCostData,
  passengerFlowData,
  reportPeriods,
  reportSummary,
} from "../data/reportsData";
import ReportFormModal from "../components/ReportFormModal";
import "../styles/reports.css";

function formatCompactNumber(value) {
  return new Intl.NumberFormat("es-GT", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
}

function formatNumber(value) {
  return new Intl.NumberFormat("es-GT").format(Number(value || 0));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function ReportsManagement() {
  const [selectedPeriod, setSelectedPeriod] =
    useState("Últimos 7 días");
  const [notice, setNotice] = useState("");
  const [reportRows, setReportRows] = useState(generatedReports);
  const [showForm, setShowForm] = useState(false);

  function handleSave(newReport) {
    const highestNumber = reportRows.reduce((highest, report) => {
      const reportNumber = Number(
        String(report.id).split("-").pop(),
      );

      return Number.isNaN(reportNumber)
        ? highest
        : Math.max(highest, reportNumber);
    }, 0);

    const createdReport = {
      ...newReport,
      id: `REP-2026-${String(highestNumber + 1).padStart(3, "0")}`,
      generatedAt: new Date().toISOString(),
      status: "Disponible",
    };

    setReportRows((currentReports) => [
      createdReport,
      ...currentReports,
    ]);

    setShowForm(false);
    setNotice(
      `El reporte ${createdReport.id} fue generado correctamente.`,
    );
  }

  function handleDownload(report) {
    setNotice(
      `La descarga de ${report.id} se conectará al servicio de reportes del backend.`,
    );
  }

  return (
    <div className="reports-page">
      <header className="reports-heading">
        <div>
          <span className="reports-heading__eyebrow">
            Análisis del sistema
          </span>

          <h2>Reportes e indicadores</h2>

          <p>
            Analiza el rendimiento de la red y consulta los reportes
            generados.
          </p>
        </div>

        <div className="reports-heading__actions">
          <label className="reports-period-select">
            <CalendarDays />

            <select
              value={selectedPeriod}
              onChange={(event) =>
                setSelectedPeriod(event.target.value)
              }
            >
              {reportPeriods.map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="reports-primary-button"
            onClick={() => {
              setNotice("");
              setShowForm(true);
            }}
          >
            <CirclePlus />
            Generar reporte
          </button>
        </div>
      </header>

      {notice && (
        <div className="reports-notice">
          <Info />
          <span>{notice}</span>

          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Cerrar aviso"
          >
            <X />
          </button>
        </div>
      )}

      <section className="reports-summary">
        <article>
          <UsersRound />

          <div>
            <span>Pasajeros estimados</span>

            <strong>
              {formatCompactNumber(
                reportSummary.estimatedPassengers,
              )}
            </strong>

            <small>
              +{reportSummary.passengerChange}% en el periodo
            </small>
          </div>
        </article>

        <article>
          <TrainFront />

          <div>
            <span>Viajes completados</span>

            <strong>
              {formatNumber(reportSummary.completedTrips)}
            </strong>

            <small>
              {reportSummary.tripCompletionRate}% de cumplimiento
            </small>
          </div>
        </article>

        <article>
          <TriangleAlert />

          <div>
            <span>Incidentes activos</span>
            <strong>{reportSummary.activeIncidents}</strong>
            <small>Requieren seguimiento operativo</small>
          </div>
        </article>

        <article>
          <Gauge />

          <div>
            <span>Disponibilidad operativa</span>

            <strong>
              {reportSummary.operationalAvailability}%
            </strong>

            <small>Promedio general de la red</small>
          </div>
        </article>
      </section>

      <section className="reports-chart-grid">
        <article className="reports-chart-card reports-chart-card--wide">
          <header className="reports-chart-card__header">
            <div>
              <span>Demanda de servicio</span>
              <h3>Flujo de pasajeros</h3>
            </div>

            <span className="reports-chart-card__period">
              {selectedPeriod}
            </span>
          </header>

          <div className="reports-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={passengerFlowData}
                margin={{
                  top: 15,
                  right: 20,
                  left: 0,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="passengerReportGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#2563eb"
                      stopOpacity={0.28}
                    />

                    <stop
                      offset="95%"
                      stopColor="#2563eb"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#e7ebf1"
                  strokeDasharray="4 4"
                  vertical={false}
                />

                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#667085",
                    fontSize: 12,
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={55}
                  tick={{
                    fill: "#667085",
                    fontSize: 12,
                  }}
                  tickFormatter={formatCompactNumber}
                />

                <Tooltip
                  formatter={(value) => [
                    formatNumber(value),
                    "Pasajeros",
                  ]}
                  contentStyle={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    boxShadow:
                      "0 10px 25px rgba(15, 23, 42, 0.1)",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="passengers"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fill="url(#passengerReportGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="reports-chart-card">
          <header className="reports-chart-card__header">
            <div>
              <span>Servicio programado</span>
              <h3>Puntualidad por línea</h3>
            </div>

            <BarChart3 />
          </header>

          <div className="reports-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={linePerformanceData}
                margin={{
                  top: 15,
                  right: 10,
                  left: -15,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  stroke="#e7ebf1"
                  strokeDasharray="4 4"
                  vertical={false}
                />

                <XAxis
                  dataKey="line"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#667085",
                    fontSize: 12,
                  }}
                />

                <YAxis
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#667085",
                    fontSize: 12,
                  }}
                  tickFormatter={(value) => `${value}%`}
                />

                <Tooltip
                  formatter={(value) => [
                    `${value}%`,
                    "Puntualidad",
                  ]}
                  contentStyle={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                  }}
                />

                <Bar
                  dataKey="punctuality"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={38}
                >
                  {linePerformanceData.map((entry) => (
                    <Cell
                      key={entry.line}
                      fill={entry.color}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="reports-chart-card">
          <header className="reports-chart-card__header">
            <div>
              <span>Seguridad operacional</span>
              <h3>Incidentes por severidad</h3>
            </div>

            <TriangleAlert />
          </header>

          <div className="reports-pie-content">
            <div className="reports-pie-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(value) => [
                      value,
                      "Incidentes",
                    ]}
                    contentStyle={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                    }}
                  />

                  <Pie
                    data={incidentDistributionData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={54}
                    outerRadius={82}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {incidentDistributionData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="reports-pie-legend">
              {incidentDistributionData.map((item) => (
                <div key={item.name}>
                  <span
                    style={{
                      backgroundColor: item.color,
                    }}
                  />

                  <small>{item.name}</small>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="reports-chart-card">
          <header className="reports-chart-card__header">
            <div>
              <span>Gestión técnica</span>
              <h3>Costos de mantenimiento</h3>
            </div>

            <Wrench />
          </header>

          <div className="reports-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={maintenanceCostData}
                margin={{
                  top: 15,
                  right: 10,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  stroke="#e7ebf1"
                  strokeDasharray="4 4"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#667085",
                    fontSize: 12,
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={55}
                  tick={{
                    fill: "#667085",
                    fontSize: 12,
                  }}
                  tickFormatter={formatCompactNumber}
                />

                <Tooltip
                  formatter={(value) => [
                    formatCurrency(value),
                    "Costo",
                  ]}
                  contentStyle={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                  }}
                />

                <Bar
                  dataKey="cost"
                  fill="#7c3aed"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="reports-history">
        <header className="reports-history__header">
          <div>
            <span>Documentos recientes</span>
            <h3>Reportes generados</h3>
          </div>

          <span>{reportRows.length} reportes</span>
        </header>

        <div className="reports-table-wrapper">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Reporte</th>
                <th>Tipo</th>
                <th>Periodo</th>
                <th>Generado</th>
                <th>Responsable</th>
                <th>Estado</th>
                <th>Formato</th>
                <th aria-label="Descargar" />
              </tr>
            </thead>

            <tbody>
              {reportRows.map((report) => (
                <tr key={report.id}>
                  <td>
                    <div className="reports-file">
                      {report.format === "PDF" ? (
                        <FileText />
                      ) : (
                        <FileSpreadsheet />
                      )}

                      <div>
                        <strong>{report.name}</strong>
                        <span>{report.id}</span>
                      </div>
                    </div>
                  </td>

                  <td>{report.type}</td>
                  <td>{report.period}</td>
                  <td>{formatDateTime(report.generatedAt)}</td>
                  <td>{report.generatedBy}</td>

                  <td>
                    <span
                      className={
                        report.status === "Disponible"
                          ? "reports-status reports-status--ready"
                          : "reports-status reports-status--processing"
                      }
                    >
                      {report.status}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`reports-format reports-format--${report.format.toLowerCase()}`}
                    >
                      {report.format}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="reports-download-button"
                      onClick={() => handleDownload(report)}
                      aria-label={`Descargar ${report.name}`}
                      disabled={report.status !== "Disponible"}
                    >
                      <Download />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showForm && (
        <ReportFormModal
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default ReportsManagement;