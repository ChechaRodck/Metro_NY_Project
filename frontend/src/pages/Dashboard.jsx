import { useState } from "react";
import {
  ArrowUpRight,
  CalendarClock,
  Clock3,
  RefreshCw,
  TrainFront,
  TriangleAlert,
  UsersRound,
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

const statIcons = {
  train: TrainFront,
  calendar: CalendarClock,
  users: UsersRound,
  alert: TriangleAlert,
};

function formatPassengers(value) {
  return `${(value / 1000000).toFixed(1)} M`;
}

function getTripStatusClass(status) {
  if (status === "Retrasado") {
    return "status-badge status-badge--danger";
  }

  if (status === "En abordaje") {
    return "status-badge status-badge--success";
  }

  return "status-badge status-badge--neutral";
}

function getSeverityClass(severity) {
  return `incident-severity incident-severity--${severity.toLowerCase()}`;
}

function Dashboard() {
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const currentDate = new Intl.DateTimeFormat("es-GT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  function handleRefresh() {
    setLastUpdate(new Date());
  }

  return (
    <div className="dashboard">
      <section className="dashboard-heading">
        <div>
          <div className="dashboard-heading__tag">
            <span className="dashboard-heading__pulse" />
            Datos de demostración
          </div>

          <h2>Resumen operativo</h2>

          <p>
            Supervisa el estado general de la red, los viajes y las incidencias.
          </p>
        </div>

        <div className="dashboard-heading__actions">
          <span className="last-update">
            Actualizado a las{" "}
            {lastUpdate.toLocaleTimeString("es-GT", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          <button
            type="button"
            className="refresh-button"
            onClick={handleRefresh}
          >
            <RefreshCw size={17} />
            Actualizar datos
          </button>
        </div>
      </section>

      <p className="dashboard-date">{currentDate}</p>

      <section className="stats-grid" aria-label="Estadísticas principales">
        {dashboardStats.map((stat) => {
          const Icon = statIcons[stat.icon];

          return (
            <article className="stat-card" key={stat.id}>
              <div className={`stat-card__icon stat-card__icon--${stat.tone}`}>
                <Icon size={22} />
              </div>

              <div className="stat-card__content">
                <span className="stat-card__label">{stat.label}</span>

                <div className="stat-card__value-row">
                  <strong>{stat.value}</strong>

                  <span
                    className={`stat-card__trend ${
                      stat.trend.startsWith("-")
                        ? "stat-card__trend--positive"
                        : ""
                    }`}
                  >
                    {stat.trend}
                  </span>
                </div>

                <span className="stat-card__detail">{stat.detail}</span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="dashboard-grid dashboard-grid--primary">
        <article className="dashboard-card chart-card">
          <div className="dashboard-card__header">
            <div>
              <span className="dashboard-card__eyebrow">Últimos 7 días</span>
              <h3>Flujo de pasajeros</h3>
            </div>

            <button type="button" className="text-button">
              Ver reporte
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={passengerFlow}
                margin={{ top: 10, right: 10, left: -12, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="passengerGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#eaecf0"
                  strokeDasharray="4 4"
                  vertical={false}
                />

                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#667085", fontSize: 12 }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatPassengers}
                  tick={{ fill: "#667085", fontSize: 12 }}
                />

                <Tooltip
                  formatter={(value) => [
                    Number(value).toLocaleString("es-GT"),
                    "Pasajeros",
                  ]}
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #e4e7ec",
                    boxShadow: "0 8px 20px rgb(16 24 40 / 10%)",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="passengers"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fill="url(#passengerGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card__header">
            <div>
              <span className="dashboard-card__eyebrow">Tiempo real</span>
              <h3>Estado de líneas</h3>
            </div>

            <span className="live-indicator">En vivo</span>
          </div>

          <div className="line-list">
            {lineStatus.map((line) => (
              <div className="line-item" key={line.id}>
                <div
                  className="line-item__code"
                  style={{ "--line-color": line.color }}
                >
                  {line.code}
                </div>

                <div className="line-item__information">
                  <strong>{line.name}</strong>
                  <span>{line.status}</span>
                </div>

                <span
                  className={`line-item__delay ${
                    line.delay !== "A tiempo"
                      ? "line-item__delay--warning"
                      : ""
                  }`}
                >
                  {line.delay}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-grid dashboard-grid--secondary">
        <article className="dashboard-card trips-card">
          <div className="dashboard-card__header">
            <div>
              <span className="dashboard-card__eyebrow">
                Próximas operaciones
              </span>
              <h3>Viajes programados</h3>
            </div>

            <button type="button" className="text-button">
              Ver todos
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="table-wrapper">
            <table className="trips-table">
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
                      <span className="route-code">{trip.route}</span>
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

        <article className="dashboard-card">
          <div className="dashboard-card__header">
            <div>
              <span className="dashboard-card__eyebrow">
                Requieren seguimiento
              </span>
              <h3>Incidentes recientes</h3>
            </div>
          </div>

          <div className="incident-list">
            {recentIncidents.map((incident) => (
              <div className="incident-item" key={incident.id}>
                <div className="incident-item__top">
                  <span className={getSeverityClass(incident.severity)}>
                    {incident.severity}
                  </span>

                  <span className="incident-item__time">
                    <Clock3 size={13} />
                    {incident.time}
                  </span>
                </div>

                <strong>{incident.title}</strong>
                <span>{incident.location}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

export default Dashboard;