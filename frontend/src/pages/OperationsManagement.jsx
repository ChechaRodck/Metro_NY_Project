import { useMemo, useState } from "react";
import {
  CalendarDays,
  CirclePlus,
  Clock3,
  Info,
  MoreHorizontal,
  Route,
  Search,
  TrainFront,
  TriangleAlert,
  UsersRound,
  X,
} from "lucide-react";
import {
  operationSchedules,
  scheduledTrips,
} from "../data/operationsData";
import "../styles/operations.css";

const tabs = [
  {
    id: "trips",
    label: "Viajes programados",
  },
  {
    id: "schedules",
    label: "Horarios",
  },
];

const statusOptions = {
  trips: [
    "Todos",
    "Programado",
    "En abordaje",
    "En curso",
    "Completado",
    "Retrasado",
    "Cancelado",
  ],
  schedules: ["Todos", "Vigente", "Servicio especial"],
};

const actionLabels = {
  trips: "Programar viaje",
  schedules: "Nuevo horario",
};

const lineColors = {
  A: "#0039a6",
  1: "#ee352e",
  4: "#00933c",
  7: "#b933ad",
  E: "#0039a6",
  L: "#a7a9ac",
};

function normalizeText(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getStatusClass(status) {
  if (
    status === "Programado" ||
    status === "Vigente" ||
    status === "Completado"
  ) {
    return "operation-status operation-status--success";
  }

  if (status === "En abordaje" || status === "En curso") {
    return "operation-status operation-status--info";
  }

  if (status === "Retrasado" || status === "Servicio especial") {
    return "operation-status operation-status--warning";
  }

  return "operation-status operation-status--danger";
}

function TripsTable({ records }) {
  return (
    <table className="operations-table">
      <thead>
        <tr>
          <th>Viaje</th>
          <th>Ruta</th>
          <th>Salida programada</th>
          <th>Llegada programada</th>
          <th>Tren</th>
          <th>Conductor</th>
          <th>Pasajeros</th>
          <th>Estado</th>
          <th aria-label="Acciones" />
        </tr>
      </thead>

      <tbody>
        {records.map((trip) => (
          <tr key={trip.id}>
            <td>
              <div className="operation-identity">
                <strong>{trip.id}</strong>
                <span>{trip.date}</span>
              </div>
            </td>

            <td>
              <div className="operation-route">
                <span
                  style={{
                    "--operation-line-color":
                      lineColors[trip.line] ?? "#475467",
                  }}
                >
                  {trip.line}
                </span>

                <div>
                  <strong>{trip.route}</strong>
                  <small>Línea {trip.line}</small>
                </div>
              </div>
            </td>

            <td>
              <div className="operation-time">
                <Clock3 size={14} />
                <div>
                  <strong>{trip.scheduledDeparture}</strong>
                  <span>
                    Real: {trip.actualDeparture || "Pendiente"}
                  </span>
                </div>
              </div>
            </td>

            <td>
              <div className="operation-time">
                <Clock3 size={14} />
                <div>
                  <strong>{trip.scheduledArrival}</strong>
                  <span>
                    Real: {trip.actualArrival || "Pendiente"}
                  </span>
                </div>
              </div>
            </td>

            <td>
              <span className="train-code">{trip.train}</span>
            </td>

            <td>{trip.driver}</td>

            <td>{trip.passengers.toLocaleString("es-GT")}</td>

            <td>
              <span className={getStatusClass(trip.status)}>
                {trip.status}
              </span>
            </td>

            <td>
              <button
                type="button"
                className="operation-row-action"
                aria-label={`Opciones del viaje ${trip.id}`}
              >
                <MoreHorizontal size={18} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SchedulesTable({ records }) {
  return (
    <table className="operations-table">
      <thead>
        <tr>
          <th>Horario</th>
          <th>Ruta</th>
          <th>Días de operación</th>
          <th>Jornada</th>
          <th>Frecuencia</th>
          <th>Servicio</th>
          <th>Vigencia</th>
          <th>Estado</th>
          <th aria-label="Acciones" />
        </tr>
      </thead>

      <tbody>
        {records.map((schedule) => (
          <tr key={schedule.id}>
            <td>
              <div className="operation-identity">
                <strong>{schedule.id}</strong>
                <span>Programación regular</span>
              </div>
            </td>

            <td>
              <div className="operation-route">
                <span
                  style={{
                    "--operation-line-color":
                      lineColors[schedule.line] ?? "#475467",
                  }}
                >
                  {schedule.line}
                </span>

                <div>
                  <strong>{schedule.route}</strong>
                  <small>Línea {schedule.line}</small>
                </div>
              </div>
            </td>

            <td>{schedule.days}</td>

            <td>
              <div className="schedule-time">
                <strong>
                  {schedule.startTime} - {schedule.endTime}
                </strong>
              </div>
            </td>

            <td>
              <span className="frequency-badge">
                Cada {schedule.frequency} min
              </span>
            </td>

            <td>
              <span className="service-badge">{schedule.service}</span>
            </td>

            <td>
              <div className="operation-validity">
                <strong>{schedule.startDate}</strong>
                <span>hasta {schedule.endDate}</span>
              </div>
            </td>

            <td>
              <span className={getStatusClass(schedule.status)}>
                {schedule.status}
              </span>
            </td>

            <td>
              <button
                type="button"
                className="operation-row-action"
                aria-label={`Opciones del horario ${schedule.id}`}
              >
                <MoreHorizontal size={18} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function OperationsManagement() {
  const [activeTab, setActiveTab] = useState("trips");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [showNotice, setShowNotice] = useState(false);

  const totalPassengers = scheduledTrips.reduce(
    (total, trip) => total + trip.passengers,
    0,
  );

  const activeTrips = scheduledTrips.filter(
    (trip) =>
      trip.status === "En curso" || trip.status === "En abordaje",
  ).length;

  const delayedTrips = scheduledTrips.filter(
    (trip) => trip.status === "Retrasado",
  ).length;

  const filteredRecords = useMemo(() => {
    const source =
      activeTab === "trips" ? scheduledTrips : operationSchedules;

    return source.filter((record) => {
      const matchesSearch = normalizeText(
        Object.values(record).flat().join(" "),
      ).includes(normalizeText(searchTerm));

      const matchesStatus =
        statusFilter === "Todos" || record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [activeTab, searchTerm, statusFilter]);

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    setSearchTerm("");
    setStatusFilter("Todos");
    setShowNotice(false);
  }

  return (
    <div className="operations-page">
      <section className="operations-heading">
        <div>
          <span className="operations-heading__eyebrow">
            Programación del servicio
          </span>

          <h2>Operaciones y horarios</h2>

          <p>
            Supervisa los viajes programados y la frecuencia de las rutas.
          </p>
        </div>

        <button
          type="button"
          className="operations-primary-button"
          onClick={() => setShowNotice(true)}
        >
          <CirclePlus size={18} />
          {actionLabels[activeTab]}
        </button>
      </section>

      {showNotice && (
        <div className="operations-notice">
          <Info size={18} />

          <div>
            <strong>Formulario en preparación</strong>
            <span>
              En el siguiente paso habilitaremos el formulario para crear
              este registro.
            </span>
          </div>

          <button
            type="button"
            aria-label="Cerrar aviso"
            onClick={() => setShowNotice(false)}
          >
            <X size={18} />
          </button>
        </div>
      )}

      <section className="operations-summary">
        <article>
          <CalendarDays size={20} />

          <div>
            <strong>{scheduledTrips.length}</strong>
            <span>Viajes programados</span>
          </div>
        </article>

        <article>
          <TrainFront size={20} />

          <div>
            <strong>{activeTrips}</strong>
            <span>Viajes activos</span>
          </div>
        </article>

        <article>
          <TriangleAlert size={20} />

          <div>
            <strong>{delayedTrips}</strong>
            <span>Viajes retrasados</span>
          </div>
        </article>

        <article>
          <UsersRound size={20} />

          <div>
            <strong>{totalPassengers.toLocaleString("es-GT")}</strong>
            <span>Pasajeros estimados</span>
          </div>
        </article>
      </section>

      <section className="operations-panel">
        <div className="operations-tabs">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              className={
                activeTab === tab.id
                  ? "operations-tab operations-tab--active"
                  : "operations-tab"
              }
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}

              <span>
                {tab.id === "trips"
                  ? scheduledTrips.length
                  : operationSchedules.length}
              </span>
            </button>
          ))}
        </div>

        <div className="operations-toolbar">
          <label className="operations-search">
            <Search size={18} />

            <input
              type="search"
              value={searchTerm}
              placeholder={
                activeTab === "trips"
                  ? "Buscar viaje, ruta, tren o conductor..."
                  : "Buscar horario o ruta..."
              }
              aria-label="Buscar registros"
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <label className="operations-filter">
            <span>Estado:</span>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {statusOptions[activeTab].map((option) => (
                <option value={option} key={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <span className="operations-results">
            {filteredRecords.length} resultados
          </span>
        </div>

        <div className="operations-table-wrapper">
          {activeTab === "trips" && (
            <TripsTable records={filteredRecords} />
          )}

          {activeTab === "schedules" && (
            <SchedulesTable records={filteredRecords} />
          )}
        </div>

        {filteredRecords.length === 0 && (
          <div className="operations-empty">
            <Search size={25} />
            <strong>No encontramos resultados</strong>
            <span>
              Prueba con otro texto o cambia el filtro seleccionado.
            </span>
          </div>
        )}
      </section>
    </div>
  );
}

export default OperationsManagement;