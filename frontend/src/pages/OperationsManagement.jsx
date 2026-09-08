import { useMemo, useRef, useState } from "react";
import {
  CalendarClock,
  CircleCheck,
  CirclePlus,
  CircleX,
  Clock3,
  Search,
  TrainFront,
  TriangleAlert,
  UsersRound,
} from "lucide-react";
import OperationsFormModal from "../components/OperationsFormModal";
import {
  operationSchedules,
  scheduledTrips,
} from "../data/operationsData";
import { metroLines } from "../data/networkData";
import "../styles/operations.css";

const tabs = [
  { id: "trips", label: "Viajes programados" },
  { id: "schedules", label: "Horarios" },
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

const statusPresentation = {
  Programado: { tone: "neutral", icon: Clock3 },
  "En abordaje": { tone: "info", icon: UsersRound },
  "En curso": { tone: "info", icon: TrainFront },
  Completado: { tone: "success", icon: CircleCheck },
  Retrasado: { tone: "warning", icon: TriangleAlert },
  Cancelado: { tone: "danger", icon: CircleX },
  Vigente: { tone: "success", icon: CircleCheck },
  "Servicio especial": { tone: "special", icon: CalendarClock },
};

const searchableFields = {
  trips: [
    "id",
    "route",
    "line",
    "date",
    "scheduledDeparture",
    "actualDeparture",
    "scheduledArrival",
    "actualArrival",
    "train",
    "driver",
    "status",
    "passengers",
  ],
  schedules: [
    "id",
    "route",
    "line",
    "days",
    "startTime",
    "endTime",
    "frequency",
    "service",
    "startDate",
    "endDate",
    "status",
  ],
};

const lineColorById = Object.fromEntries(
  metroLines.map((line) => [line.id, line.color]),
);

function normalizeText(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getRelativeLuminance(hexColor) {
  const channels = hexColor
    .replace("#", "")
    .match(/.{2}/g)
    ?.map((channel) => Number.parseInt(channel, 16) / 255);

  if (!channels) {
    return null;
  }

  return channels
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    )
    .reduce(
      (total, channel, index) =>
        total + channel * [0.2126, 0.7152, 0.0722][index],
      0,
    );
}

function getLineTextColor(hexColor) {
  const backgroundLuminance = getRelativeLuminance(hexColor);

  if (backgroundLuminance === null) {
    return "#ffffff";
  }

  const lightContrast = 1.05 / (backgroundLuminance + 0.05);
  const darkLuminance = getRelativeLuminance("#050b14");
  const darkContrast =
    (backgroundLuminance + 0.05) / (darkLuminance + 0.05);

  return lightContrast >= darkContrast ? "#ffffff" : "#050b14";
}

function getLineStyle(lineId) {
  const lineColor = lineColorById[lineId] ?? "#536b89";

  return {
    "--operation-line-color": lineColor,
    "--operation-line-text": getLineTextColor(lineColor),
  };
}

function recordMatches(record, type, searchTerm, statusFilter) {
  const normalizedTerm = normalizeText(searchTerm.trim());
  const searchableRecord = searchableFields[type]
    .map((field) => record[field])
    .join(" ");
  const matchesSearch =
    !normalizedTerm || normalizeText(searchableRecord).includes(normalizedTerm);
  const matchesStatus =
    statusFilter === "Todos" || record.status === statusFilter;

  return matchesSearch && matchesStatus;
}

function sortChronologically(records, type) {
  return records
    .map((record, sourceIndex) => ({ record, sourceIndex }))
    .sort((a, b) => {
      const aKey =
        type === "trips"
          ? `${a.record.date} ${a.record.scheduledDeparture}`
          : `${a.record.startTime} ${a.record.id}`;
      const bKey =
        type === "trips"
          ? `${b.record.date} ${b.record.scheduledDeparture}`
          : `${b.record.startTime} ${b.record.id}`;

      return aKey.localeCompare(bKey) || a.sourceIndex - b.sourceIndex;
    })
    .map(({ record }) => record);
}

function OperationStatus({ status }) {
  const presentation = statusPresentation[status] ?? {
    tone: "neutral",
    icon: Clock3,
  };
  const StatusIcon = presentation.icon;

  return (
    <span
      className={`operation-status operation-status--${presentation.tone}`}
    >
      <StatusIcon size={12} strokeWidth={2.2} aria-hidden="true" />
      {status}
    </span>
  );
}

function OperationRoute({ line, route }) {
  return (
    <span className="operation-route">
      <span
        className="operation-line-code"
        style={getLineStyle(line)}
        aria-label={`Línea ${line}`}
      >
        {line}
      </span>

      <span className="operation-route__identity">
        <strong>{route}</strong>
        <small>Línea {line}</small>
      </span>
    </span>
  );
}

function RecordedTime({ scheduled, actual }) {
  return (
    <span className="operation-time">
      <strong>{scheduled}</strong>
      <span>Real: {actual || "Sin registro"}</span>
    </span>
  );
}

function TripsTable({ records }) {
  return (
    <table className="operations-table operations-table--trips">
      <caption className="operations-sr-only">
        Movimientos registrados, ordenados por fecha y hora programada de salida
      </caption>
      <thead>
        <tr>
          <th scope="col">Salida</th>
          <th scope="col">Viaje</th>
          <th scope="col">Ruta</th>
          <th scope="col">Tren</th>
          <th scope="col">Estado</th>
          <th scope="col">Llegada</th>
          <th scope="col">Conductor</th>
          <th scope="col">Estimación de pasajeros</th>
        </tr>
      </thead>

      <tbody>
        {records.map((trip) => (
          <tr key={trip.id}>
            <td>
              <RecordedTime
                scheduled={trip.scheduledDeparture}
                actual={trip.actualDeparture}
              />
            </td>

            <th scope="row">
              <span className="operation-identity">
                <strong>{trip.id}</strong>
                <small>{trip.date}</small>
              </span>
            </th>

            <td>
              <OperationRoute line={trip.line} route={trip.route} />
            </td>

            <td>
              <span className="operation-train-code">{trip.train}</span>
            </td>

            <td>
              <OperationStatus status={trip.status} />
            </td>

            <td>
              <RecordedTime
                scheduled={trip.scheduledArrival}
                actual={trip.actualArrival}
              />
            </td>

            <td>{trip.driver}</td>

            <td className="operations-table__number">
              {trip.passengers.toLocaleString("es-GT")}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SchedulesTable({ records }) {
  return (
    <table className="operations-table operations-table--schedules">
      <caption className="operations-sr-only">
        Horarios registrados, ordenados por hora de inicio de jornada
      </caption>
      <thead>
        <tr>
          <th scope="col">Inicio</th>
          <th scope="col">Horario</th>
          <th scope="col">Ruta</th>
          <th scope="col">Estado</th>
          <th scope="col">Días de operación</th>
          <th scope="col">Finalización</th>
          <th scope="col">Frecuencia</th>
          <th scope="col">Servicio</th>
          <th scope="col">Vigencia</th>
        </tr>
      </thead>

      <tbody>
        {records.map((schedule) => (
          <tr key={schedule.id}>
            <td className="operations-table__time">{schedule.startTime}</td>

            <th scope="row">
              <span className="operation-identity">
                <strong>{schedule.id}</strong>
                <small>Programación registrada</small>
              </span>
            </th>

            <td>
              <OperationRoute line={schedule.line} route={schedule.route} />
            </td>

            <td>
              <OperationStatus status={schedule.status} />
            </td>

            <td>{schedule.days}</td>
            <td className="operations-table__time">{schedule.endTime}</td>

            <td>
              <span className="operation-frequency">
                Cada {schedule.frequency} min
              </span>
            </td>

            <td>
              <span className="operation-service">{schedule.service}</span>
            </td>

            <td>
              <span className="operation-validity">
                <strong>{schedule.startDate}</strong>
                <small>hasta {schedule.endDate}</small>
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function OperationsToolbar({
  type,
  searchTerm,
  statusFilter,
  resultCount,
  onSearchChange,
  onStatusChange,
}) {
  const entityLabel = type === "trips" ? "movimientos" : "horarios";

  return (
    <div className="operations-toolbar">
      <label className="operations-search">
        <Search size={16} aria-hidden="true" />
        <span className="operations-sr-only">Buscar {entityLabel}</span>
        <input
          type="search"
          value={searchTerm}
          placeholder={
            type === "trips"
              ? "Buscar viaje, ruta, tren o conductor"
              : "Buscar horario, ruta o servicio"
          }
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>

      <label className="operations-filter">
        <span>Estado</span>
        <select
          value={statusFilter}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          {statusOptions[type].map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <span className="operations-results" aria-live="polite" aria-atomic="true">
        {resultCount} {resultCount === 1 ? "resultado" : "resultados"}
      </span>
    </div>
  );
}

function OperationsIndex({
  activeTab,
  trips,
  schedules,
  passengerEstimate,
  activeTripCount,
  tripExceptionCount,
  scheduleFrequencyRange,
}) {
  const exceptionTrips = sortChronologically(
    trips.filter(
      (trip) => trip.status === "Retrasado" || trip.status === "Cancelado",
    ),
    "trips",
  );
  const specialSchedules = sortChronologically(
    schedules.filter((schedule) => schedule.status === "Servicio especial"),
    "schedules",
  );
  const isTripsView = activeTab === "trips";
  const attentionRecords = isTripsView ? exceptionTrips : specialSchedules;
  const headingId = `operations-index-title-${activeTab}`;
  const exceptionsHeadingId = `operations-exceptions-title-${activeTab}`;

  return (
    <aside className="operations-index" aria-labelledby={headingId}>
      <header className="operations-index__header">
        <h3 id={headingId}>
          {isTripsView ? "Índice de movimientos" : "Índice de horarios"}
        </h3>
        <p>
          {isTripsView
            ? "Lecturas derivadas de todos los viajes de demostración."
            : "Lecturas derivadas de los horarios registrados."}
        </p>
      </header>

      <dl className="operations-readings">
        {isTripsView ? (
          <>
            <div>
              <dt>Movimientos registrados</dt>
              <dd>{trips.length}</dd>
            </div>
            <div>
              <dt>En operación</dt>
              <dd>{activeTripCount}</dd>
            </div>
            <div>
              <dt>Atención operativa</dt>
              <dd>{tripExceptionCount}</dd>
            </div>
            <div>
              <dt>Estimación acumulada en los registros</dt>
              <dd aria-describedby="operations-passenger-estimate-note">
                {passengerEstimate.toLocaleString("es-GT")}
              </dd>
            </div>
          </>
        ) : (
          <>
            <div>
              <dt>Horarios registrados</dt>
              <dd>{schedules.length}</dd>
            </div>
            <div>
              <dt>Vigentes</dt>
              <dd>
                {
                  schedules.filter((schedule) => schedule.status === "Vigente")
                    .length
                }
              </dd>
            </div>
            <div>
              <dt>Condición especial</dt>
              <dd>{specialSchedules.length}</dd>
            </div>
            <div>
              <dt>Frecuencia registrada</dt>
              <dd>{scheduleFrequencyRange}</dd>
            </div>
          </>
        )}
      </dl>

      {isTripsView && (
        <p
          className="operations-estimate-note"
          id="operations-passenger-estimate-note"
        >
          Suma de los pasajeros estimados de todos los viajes de demostración,
          incluidos registros programados, retrasados, cancelados o no
          completados.
        </p>
      )}

      <section
        className={`operations-exceptions${
          isTripsView ? "" : " operations-exceptions--special"
        }`}
        aria-labelledby={exceptionsHeadingId}
      >
        <header>
          <h4 id={exceptionsHeadingId}>
            {isTripsView
              ? "Excepciones operativas"
              : "Condiciones programadas"}
          </h4>
          <span>{attentionRecords.length}</span>
        </header>

        <p>
          {isTripsView
            ? "Viajes retrasados y cancelados, sin alterar el orden del libro."
            : "Servicio especial registrado; no representa una falla."}
        </p>

        {attentionRecords.length > 0 ? (
          <ul className="operations-exception-list">
            {attentionRecords.map((record) => (
              <li key={record.id}>
                <span className="operations-exception-list__time">
                  {isTripsView ? record.scheduledDeparture : record.startTime}
                </span>

                <span className="operations-exception-list__identity">
                  <strong>{record.id}</strong>
                  <small>{record.route}</small>
                </span>

                <OperationStatus status={record.status} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="operations-exceptions__empty">
            {isTripsView
              ? "No hay viajes retrasados o cancelados registrados."
              : "No hay condiciones especiales registradas."}
          </p>
        )}
      </section>
    </aside>
  );
}

function OperationsManagement() {
  const [activeTab, setActiveTab] = useState("trips");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const tabRefs = useRef([]);

  const [operationRecords, setOperationRecords] = useState({
    trips: scheduledTrips,
    schedules: operationSchedules,
  });

  const passengerEstimate = operationRecords.trips.reduce(
    (total, trip) => total + trip.passengers,
    0,
  );
  const activeTripCount = operationRecords.trips.filter(
    (trip) => trip.status === "En curso" || trip.status === "En abordaje",
  ).length;
  const tripExceptionCount = operationRecords.trips.filter(
    (trip) => trip.status === "Retrasado" || trip.status === "Cancelado",
  ).length;
  const scheduleFrequencies = operationRecords.schedules.map(
    (schedule) => schedule.frequency,
  );
  const scheduleFrequencyRange = scheduleFrequencies.length
    ? `${Math.min(...scheduleFrequencies)}–${Math.max(...scheduleFrequencies)} min`
    : "Sin registro";

  const filteredRecords = useMemo(() => {
    const matchingRecords = operationRecords[activeTab].filter((record) =>
      recordMatches(record, activeTab, searchTerm, statusFilter),
    );

    return sortChronologically(matchingRecords, activeTab);
  }, [activeTab, operationRecords, searchTerm, statusFilter]);

  const activeRecords = operationRecords[activeTab];
  const hasActiveFilters =
    searchTerm.trim().length > 0 || statusFilter !== "Todos";

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    setSearchTerm("");
    setStatusFilter("Todos");
    setIsFormOpen(false);
  }

  function handleTabKeyDown(event, index) {
    let nextIndex;

    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    handleTabChange(tabs[nextIndex].id);
    requestAnimationFrame(() => tabRefs.current[nextIndex]?.focus());
  }

  function handleCreate(newRecord) {
    const recordType = activeTab;
    const recordLabel = recordType === "trips" ? "El viaje" : "El horario";
    const isVisibleWithCurrentFilters = recordMatches(
      newRecord,
      recordType,
      searchTerm,
      statusFilter,
    );

    setOperationRecords((currentRecords) => ({
      ...currentRecords,
      [recordType]: [...currentRecords[recordType], newRecord],
    }));
    setAnnouncement(
      `${recordLabel} ${newRecord.id} se agregó a esta sesión de demostración; no se almacena de forma persistente.${
        isVisibleWithCurrentFilters
          ? ""
          : " El filtro actual no incluye el nuevo registro."
      }`,
    );
    setIsFormOpen(false);
  }

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("Todos");
  }

  return (
    <section className="operations-page" aria-labelledby="operations-page-title">
      <header className="operations-heading">
        <div className="operations-heading__copy">
          <div className="operations-context" aria-label="Contexto de los datos">
            <span>Escenario simulado</span>
            <span>Datos de demostración</span>
          </div>

          <h2 id="operations-page-title">Operaciones y horarios</h2>
          <p>
            Consulta movimientos, asignaciones y horarios registrados en el
            sistema.
          </p>
        </div>

        <button
          type="button"
          className="operations-primary-button"
          onClick={() => setIsFormOpen(true)}
        >
          <CirclePlus size={17} aria-hidden="true" />
          {actionLabels[activeTab]}
        </button>
      </header>

      <div className="operations-board">
        <OperationsIndex
          activeTab={activeTab}
          trips={operationRecords.trips}
          schedules={operationRecords.schedules}
          passengerEstimate={passengerEstimate}
          activeTripCount={activeTripCount}
          tripExceptionCount={tripExceptionCount}
          scheduleFrequencyRange={scheduleFrequencyRange}
        />

        <section className="operations-ledger" aria-label="Libro operativo">
          <div
            className="operations-tabs"
            role="tablist"
            aria-label="Registros de operaciones"
          >
            {tabs.map((tab, index) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  type="button"
                  role="tab"
                  id={`operations-tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`operations-panel-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  className={`operations-tab${
                    isActive ? " operations-tab--active" : ""
                  }`}
                  onClick={() => handleTabChange(tab.id)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  key={tab.id}
                >
                  {tab.label}
                  <span>{operationRecords[tab.id].length}</span>
                </button>
              );
            })}
          </div>

          {tabs.map((tab) => (
            <div
              id={`operations-panel-${tab.id}`}
              role="tabpanel"
              aria-labelledby={`operations-tab-${tab.id}`}
              tabIndex={0}
              hidden={activeTab !== tab.id}
              key={tab.id}
            >
              {activeTab === tab.id && (
                <>
                  <header className="operations-ledger__heading">
                    <div>
                      <h3>
                        {activeTab === "trips"
                          ? "Movimientos registrados"
                          : "Horarios registrados"}
                      </h3>
                      <p>
                        {activeTab === "trips"
                          ? "Orden cronológico por fecha y salida programada."
                          : "Orden cronológico por inicio de jornada."}
                      </p>
                    </div>
                  </header>

                  <OperationsToolbar
                    type={activeTab}
                    searchTerm={searchTerm}
                    statusFilter={statusFilter}
                    resultCount={filteredRecords.length}
                    onSearchChange={setSearchTerm}
                    onStatusChange={setStatusFilter}
                  />

                  {filteredRecords.length > 0 ? (
                    <div
                      className="operations-table-region"
                      role="region"
                      aria-label={
                        activeTab === "trips"
                          ? "Tabla desplazable de movimientos registrados"
                          : "Tabla desplazable de horarios registrados"
                      }
                      tabIndex={0}
                    >
                      {activeTab === "trips" ? (
                        <TripsTable records={filteredRecords} />
                      ) : (
                        <SchedulesTable records={filteredRecords} />
                      )}
                    </div>
                  ) : (
                    <div className="operations-empty" role="status">
                      <Search size={24} aria-hidden="true" />
                      <strong>
                        {activeRecords.length === 0
                          ? activeTab === "trips"
                            ? "No hay movimientos registrados"
                            : "No hay horarios registrados"
                          : "Sin coincidencias"}
                      </strong>
                      <span>
                        {activeRecords.length === 0
                          ? "Los registros creados durante esta sesión aparecerán aquí."
                          : "Ajusta la búsqueda o el filtro de estado."}
                      </span>

                      {activeRecords.length > 0 && hasActiveFilters && (
                        <button type="button" onClick={clearFilters}>
                          Limpiar búsqueda y filtros
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </section>
      </div>

      <p
        className="operations-sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </p>

      {isFormOpen && (
        <OperationsFormModal
          type={activeTab}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleCreate}
        />
      )}
    </section>
  );
}

export default OperationsManagement;
