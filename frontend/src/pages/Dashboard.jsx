import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Route,
  TrainFront,
  TriangleAlert,
  UsersRound,
  Wrench,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  dashboardStats,
  lineStatus,
  passengerFlow,
  recentIncidents,
  upcomingTrips,
} from "../data/dashboardData";
import "../styles/dashboard.css";

function formatPassengers(value) {
  return `${(value / 1000000).toFixed(1)} M`;
}

function getTripStatusClass(status) {
  if (status === "Retrasado") {
    return "dashboard-trip-status dashboard-trip-status--danger";
  }

  if (status === "En abordaje") {
    return "dashboard-trip-status dashboard-trip-status--success";
  }

  return "dashboard-trip-status dashboard-trip-status--neutral";
}

function getSeverityClass(severity) {
  return `dashboard-incident-severity dashboard-incident-severity--${severity.toLowerCase()}`;
}

function getLineStateIcon(status) {
  if (status === "Demoras") {
    return TriangleAlert;
  }

  if (status === "Mantenimiento") {
    return Wrench;
  }

  return CheckCircle2;
}

function getRouteTextColor(hexColor) {
  const channels = hexColor
    .replace("#", "")
    .match(/.{2}/g)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );
  const relativeLuminance =
    channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  const contrastWithWhite = 1.05 / (relativeLuminance + 0.05);

  return contrastWithWhite >= 4.5 ? "#ffffff" : "#050b14";
}

const lineColorByCode = new Map(
  lineStatus.map((line) => [line.code, line.color]),
);

function Dashboard() {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const currentDate = new Intl.DateTimeFormat("es-GT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const linesStat = dashboardStats.find((stat) => stat.icon === "train");
  const tripsStat = dashboardStats.find((stat) => stat.icon === "calendar");
  const passengersStat = dashboardStats.find((stat) => stat.icon === "users");
  const incidentsStat = dashboardStats.find((stat) => stat.icon === "alert");
  const leadIncident =
    recentIncidents.find((incident) => incident.severity === "Alta") ??
    recentIncidents[0];
  const supportingIncidents = recentIncidents
    .filter((incident) => incident.id !== leadIncident?.id)
    .slice(0, 2);
  const incidentTotal = Number.parseInt(incidentsStat?.value ?? "0", 10);
  const remainingIncidentCount = Math.max(
    incidentTotal - (leadIncident ? 1 : 0) - supportingIncidents.length,
    0,
  );
  const orderedLines = [...lineStatus].sort((firstLine, secondLine) => {
    const firstIsOperational = firstLine.status === "Operativa";
    const secondIsOperational = secondLine.status === "Operativa";

    return Number(firstIsOperational) - Number(secondIsOperational);
  });
  const passengerPeak = passengerFlow.reduce((peak, point) =>
    point.passengers > peak.passengers ? point : peak,
  );
  const passengerMinimum = passengerFlow.reduce((minimum, point) =>
    point.passengers < minimum.passengers ? point : minimum,
  );

  function handleRefresh() {
    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);

    window.setTimeout(() => {
      setLastUpdate(new Date());
      setIsRefreshing(false);
    }, 700);
  }

  return (
    <div className="dashboard">
      <section className="dashboard-heading" aria-labelledby="dashboard-title">
        <div className="dashboard-heading__copy">
          <div className="dashboard-heading__title-row">
            <h2 id="dashboard-title">Situación de la red</h2>
            <span className="dashboard-scenario-label">Escenario simulado</span>
          </div>

          <p>
            Una vista priorizada del estado operativo registrado para esta
            demostración académica.
          </p>

          <p className="dashboard-date">{currentDate}</p>
        </div>

        <div className="dashboard-heading__actions">
          <span
            className="dashboard-last-update"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {isRefreshing
              ? "Actualizando vista de demostración…"
              : `Vista actualizada a las ${lastUpdate.toLocaleTimeString(
                  "es-GT",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}`}
          </span>

          <button
            type="button"
            className="dashboard-refresh-button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-busy={isRefreshing}
          >
            <RefreshCw
              size={17}
              aria-hidden="true"
              className={
                isRefreshing ? "dashboard-refresh-button__icon--spin" : ""
              }
            />
            {isRefreshing ? "Actualizando…" : "Actualizar vista"}
          </button>
        </div>
      </section>

      <section
        className="dashboard-situation-board"
        aria-label="Tablero de situación operativa"
      >
        <section
          className="dashboard-attention-zone"
          aria-labelledby="attention-title"
        >
          <svg
            className="dashboard-attention-zone__network"
            viewBox="0 0 520 520"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M-24 104H132L204 176H548" />
            <path d="M56-18V126L142 212V538" />
            <path d="M-12 392H136L244 284H532" />
            <path d="M306-12V126L366 186V532" />
            <circle cx="132" cy="104" r="7" />
            <circle cx="204" cy="176" r="7" />
            <circle cx="142" cy="212" r="7" />
            <circle cx="244" cy="284" r="7" />
            <circle cx="366" cy="186" r="7" />
            <circle cx="366" cy="392" r="7" />
          </svg>

          <div className="dashboard-attention-zone__header">
            <div>
              <h3 id="attention-title">Requiere atención</h3>
              <p>Incidentes registrados en el escenario actual.</p>
            </div>

            <div
              className="dashboard-attention-count"
              aria-label={`${incidentsStat.value} incidentes activos`}
            >
              <TriangleAlert size={18} aria-hidden="true" />
              <strong>{incidentsStat.value}</strong>
              <span>activos</span>
            </div>
          </div>

          <div className="dashboard-attention-zone__content">
            {leadIncident && (
              <article className="dashboard-lead-incident">
                <div className="dashboard-lead-incident__topline">
                  <span className={getSeverityClass(leadIncident.severity)}>
                    Prioridad {leadIncident.severity.toLowerCase()}
                  </span>
                  <span className="dashboard-incident-time">
                    <Clock3 size={14} aria-hidden="true" />
                    {leadIncident.time}
                  </span>
                </div>

                <span className="dashboard-lead-incident__id">
                  {leadIncident.id}
                </span>
                <strong>{leadIncident.title}</strong>
                <span>{leadIncident.location}</span>
              </article>
            )}

            <div className="dashboard-attention-zone__secondary">
              <div className="dashboard-compact-incidents">
                {supportingIncidents.map((incident) => (
                  <article
                    className="dashboard-compact-incident"
                    key={incident.id}
                  >
                    <div className="dashboard-compact-incident__main">
                      <span className={getSeverityClass(incident.severity)}>
                        {incident.severity}
                      </span>
                      <strong>{incident.title}</strong>
                    </div>

                    <div className="dashboard-compact-incident__meta">
                      <span>{incident.location}</span>
                      <span>{incident.time}</span>
                    </div>
                  </article>
                ))}
              </div>

              {remainingIncidentCount > 0 && (
                <p className="dashboard-remaining-incidents">
                  <strong>{remainingIncidentCount}</strong>{" "}
                  {remainingIncidentCount === 1
                    ? "incidente adicional registrado"
                    : "incidentes adicionales registrados"}{" "}
                  en el escenario.
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            className="dashboard-route-action dashboard-route-action--dark"
            onClick={() => navigate("/incidentes")}
          >
            Ver incidentes
            <ArrowUpRight size={16} aria-hidden="true" />
          </button>
        </section>

        <section
          className="dashboard-snapshot-zone"
          aria-labelledby="snapshot-title"
        >
          <div className="dashboard-snapshot-zone__header">
            <div>
              <h3 id="snapshot-title">Estado registrado</h3>
              <p>Instantánea de demostración</p>
            </div>

            <span className="dashboard-condition-label">
              <TriangleAlert size={15} aria-hidden="true" />
              Atención requerida
            </span>
          </div>

          <p className="dashboard-condition-copy">
            El escenario incluye demoras y servicio parcial en la red.
          </p>

          <div
            className="dashboard-instrument-band"
            aria-label="Lecturas operativas registradas"
          >
            <div className="dashboard-instrument">
              <Route size={19} aria-hidden="true" />
              <div>
                <span>{linesStat.label}</span>
                <strong>{linesStat.value}</strong>
                <small>{linesStat.detail}</small>
              </div>
            </div>

            <div className="dashboard-instrument">
              <CalendarClock size={19} aria-hidden="true" />
              <div>
                <span>{tripsStat.label}</span>
                <strong>{tripsStat.value}</strong>
                <small>{tripsStat.detail}</small>
              </div>
            </div>

            <button
              type="button"
              className="dashboard-instrument-action"
              onClick={() => navigate("/flota")}
            >
              <TrainFront size={18} aria-hidden="true" />
              <span>Consultar flota</span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </button>
          </div>

          <div className="dashboard-line-section__header">
            <div>
              <h4>Estado de líneas</h4>
              <p>Las condiciones no operativas aparecen primero.</p>
            </div>

            <button
              type="button"
              className="dashboard-route-action"
              onClick={() => navigate("/red")}
            >
              Ver red
              <ArrowUpRight size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="dashboard-line-list">
            {orderedLines.map((line) => {
              const LineStateIcon = getLineStateIcon(line.status);
              const isOperational = line.status === "Operativa";

              return (
                <div
                  className={`dashboard-line-item ${
                    isOperational ? "" : "dashboard-line-item--degraded"
                  }`}
                  key={line.id}
                >
                  <span
                    className="dashboard-line-item__code"
                    style={{
                      "--line-color": line.color,
                      "--line-text-color": getRouteTextColor(line.color),
                    }}
                    aria-label={`Línea ${line.code}`}
                  >
                    {line.code}
                  </span>

                  <div className="dashboard-line-item__information">
                    <strong>{line.name}</strong>
                    <span>{line.status}</span>
                  </div>

                  <span
                    className={`dashboard-line-item__condition ${
                      isOperational
                        ? "dashboard-line-item__condition--normal"
                        : "dashboard-line-item__condition--attention"
                    }`}
                  >
                    <LineStateIcon size={15} aria-hidden="true" />
                    {line.delay}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </section>

      <section
        className="dashboard-operations-board"
        aria-label="Operaciones y demanda registrada"
      >
        <article
          className="dashboard-trips-panel"
          aria-labelledby="trips-title"
        >
          <div className="dashboard-section-header">
            <div>
              <h3 id="trips-title">Próximos viajes programados</h3>
              <p>Secuencia registrada para el escenario de hoy.</p>
            </div>

            <button
              type="button"
              className="dashboard-route-action"
              onClick={() => navigate("/operaciones")}
            >
              Ver operaciones
              <ArrowUpRight size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="dashboard-table-wrapper">
            <table className="dashboard-trips-table">
              <thead>
                <tr>
                  <th>Viaje</th>
                  <th>Ruta</th>
                  <th>Destino</th>
                  <th>Salida</th>
                  <th>Plataforma</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {upcomingTrips.map((trip) => (
                  <tr key={trip.id}>
                    <td>
                      <strong>{trip.id}</strong>
                    </td>
                    <td>
                      <span
                        className="dashboard-route-code"
                        style={{
                          "--route-color":
                            lineColorByCode.get(trip.route) ?? "#2563eb",
                          "--route-text-color": getRouteTextColor(
                            lineColorByCode.get(trip.route) ?? "#2563eb",
                          ),
                        }}
                        aria-label={`Ruta ${trip.route}`}
                      >
                        {trip.route}
                      </span>
                    </td>
                    <td>{trip.destination}</td>
                    <td>{trip.departure}</td>
                    <td>{trip.platform}</td>
                    <td>
                      <span className={getTripStatusClass(trip.status)}>
                        {trip.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <figure
          className="dashboard-passenger-panel"
          aria-labelledby="passenger-title"
          aria-describedby="passenger-summary"
        >
          <div className="dashboard-section-header">
            <div>
              <h3 id="passenger-title">Flujo estimado de pasajeros</h3>
              <p>Lecturas registradas para esta demostración.</p>
            </div>

            <button
              type="button"
              className="dashboard-route-action"
              onClick={() => navigate("/reportes")}
            >
              Ver reporte
              <ArrowUpRight size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="dashboard-passenger-panel__metric">
            <UsersRound size={20} aria-hidden="true" />
            <strong>{passengersStat.value}</strong>
            <span>{passengersStat.detail}</span>
          </div>

          <p className="dashboard-chart-context">
            Serie registrada de lunes a domingo
          </p>

          <div
            className="dashboard-chart"
            aria-hidden="true"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={passengerFlow}
                margin={{ top: 8, right: 8, left: -17, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="#e4e7ec"
                  strokeDasharray="4 4"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#667085", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatPassengers}
                  tick={{ fill: "#667085", fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value) => [
                    Number(value).toLocaleString("es-GT"),
                    "Pasajeros",
                  ]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #d0d5dd",
                    boxShadow: "0 10px 24px rgb(16 24 40 / 14%)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="passengers"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fill="#2563eb"
                  fillOpacity={0.1}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <figcaption id="passenger-summary">
            En la serie de siete días, el pico registrado es {passengerPeak.day},{" "}
            {formatPassengers(passengerPeak.passengers)}. Mínimo registrado:{" "}
            {passengerMinimum.day},{" "}
            {formatPassengers(passengerMinimum.passengers)}.
          </figcaption>

          <div className="dashboard-sr-only">
            <table>
              <caption>Valores diarios del flujo estimado de pasajeros</caption>
              <thead>
                <tr>
                  <th>Día</th>
                  <th>Pasajeros estimados</th>
                </tr>
              </thead>
              <tbody>
                {passengerFlow.map((point) => (
                  <tr key={point.day}>
                    <td>{point.day}</td>
                    <td>{point.passengers.toLocaleString("es-GT")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </figure>
      </section>
    </div>
  );
}

export default Dashboard;
