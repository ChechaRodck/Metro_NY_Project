import { useMemo, useState } from "react";
import {
  CirclePlus,
  Clock3,
  Info,
  MapPin,
  MoreHorizontal,
  Search,
  Siren,
  TriangleAlert,
  UsersRound,
  X,
} from "lucide-react";
import {
  incidents,
  incidentSeverities,
  incidentStatuses,
} from "../data/incidentsData";
import IncidentFormModal from "../components/IncidentFormModal";
import "../styles/incidents.css";

const tabs = [
  { id: "all", label: "Todos" },
  { id: "active", label: "Activos" },
  { id: "resolved", label: "Resueltos" },
];

function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isResolved(status) {
  const normalizedStatus = normalizeText(status);

  return (
    normalizedStatus === "resuelto" ||
    normalizedStatus === "cerrado"
  );
}

function formatDateTime(value) {
  if (!value) {
    return "En curso";
  }

  return new Intl.DateTimeFormat("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatNumber(value) {
  return new Intl.NumberFormat("es-GT").format(Number(value || 0));
}

function getSeverityClass(severity) {
  return `incident-severity incident-severity--${normalizeText(severity)}`;
}

function getStatusClass(status) {
  const normalizedStatus = normalizeText(status);

  if (
    normalizedStatus === "resuelto" ||
    normalizedStatus === "cerrado"
  ) {
    return "incident-status incident-status--success";
  }

  if (
    normalizedStatus === "en atencion" ||
    normalizedStatus === "monitoreando"
  ) {
    return "incident-status incident-status--info";
  }

  if (normalizedStatus === "en investigacion") {
    return "incident-status incident-status--warning";
  }

  return "incident-status incident-status--danger";
}

function IncidentManagement() {
  const [incidentRows, setIncidentRows] = useState(incidents);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("Todas");
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);

  const activeIncidents = incidentRows.filter(
    (incident) => !isResolved(incident.status),
  );

  const resolvedIncidents = incidentRows.filter((incident) =>
    isResolved(incident.status),
  );

  const highSeverityIncidents = incidentRows.filter((incident) => {
    const severity = normalizeText(incident.severity);

    return severity === "critica" || severity === "alta";
  });

  const affectedPassengers = incidentRows.reduce(
    (total, incident) =>
      total + Number(incident.affectedPassengers || 0),
    0,
  );

  const filteredIncidents = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);

    return incidentRows.filter((incident) => {
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "active" && !isResolved(incident.status)) ||
        (activeTab === "resolved" && isResolved(incident.status));

      const matchesSearch =
        normalizedSearch === "" ||
        Object.values(incident).some((value) =>
          normalizeText(value).includes(normalizedSearch),
        );

      const matchesSeverity =
        selectedSeverity === "Todas" ||
        normalizeText(incident.severity) ===
          normalizeText(selectedSeverity);

      const matchesStatus =
        selectedStatus === "Todos" ||
        normalizeText(incident.status) ===
          normalizeText(selectedStatus);

      return (
        matchesTab &&
        matchesSearch &&
        matchesSeverity &&
        matchesStatus
      );
    });
  }, [
    incidentRows,
    activeTab,
    searchTerm,
    selectedSeverity,
    selectedStatus,
  ]);

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    setSearchTerm("");
    setSelectedSeverity("Todas");
    setSelectedStatus("Todos");
  }

  function handleSave(newIncident) {
    const highestNumber = incidentRows.reduce(
      (highest, incident) =>
        Math.max(highest, Number(incident.incidentNumber || 0)),
      0,
    );

    const createdIncident = {
      ...newIncident,
      incidentNumber: highestNumber + 1,
    };

    setIncidentRows((currentIncidents) => [
      createdIncident,
      ...currentIncidents,
    ]);

    setShowForm(false);
    setActiveTab("all");
    setSearchTerm("");
    setSelectedSeverity("Todas");
    setSelectedStatus("Todos");
    setNotice(
      `El incidente #${createdIncident.incidentNumber} fue reportado correctamente.`,
    );
  }

  return (
    <div className="incident-page">
      <header className="incident-heading">
        <div>
          <span className="incident-heading__eyebrow">
            Seguridad y operación
          </span>

          <h2>Gestión de incidentes</h2>

          <p>
            Registra, supervisa y da seguimiento a los incidentes de la
            red.
          </p>
        </div>

        <button
          type="button"
          className="incident-primary-button"
          onClick={() => {
            setNotice("");
            setShowForm(true);
          }}
        >
          <CirclePlus />
          Reportar incidente
        </button>
      </header>

      {notice && (
        <div className="incident-notice">
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

      <section className="incident-summary">
        <article>
          <Siren />

          <div>
            <strong>{incidentRows.length}</strong>
            <span>Incidentes registrados</span>
          </div>
        </article>

        <article>
          <Clock3 />

          <div>
            <strong>{activeIncidents.length}</strong>
            <span>Incidentes activos</span>
          </div>
        </article>

        <article>
          <TriangleAlert />

          <div>
            <strong>{highSeverityIncidents.length}</strong>
            <span>Prioridad alta o crítica</span>
          </div>
        </article>

        <article>
          <UsersRound />

          <div>
            <strong>{formatNumber(affectedPassengers)}</strong>
            <span>Pasajeros afectados</span>
          </div>
        </article>
      </section>

      <section className="incident-panel">
        <nav
          className="incident-tabs"
          aria-label="Tipos de incidentes"
        >
          {tabs.map((tab) => {
            const count =
              tab.id === "all"
                ? incidentRows.length
                : tab.id === "active"
                  ? activeIncidents.length
                  : resolvedIncidents.length;

            return (
              <button
                type="button"
                key={tab.id}
                className={
                  activeTab === tab.id
                    ? "incident-tab incident-tab--active"
                    : "incident-tab"
                }
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label}
                <span>{count}</span>
              </button>
            );
          })}
        </nav>

        <div className="incident-toolbar">
          <label className="incident-search">
            <Search />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar incidentes..."
            />
          </label>

          <label className="incident-filter">
            Severidad:

            <select
              value={selectedSeverity}
              onChange={(event) =>
                setSelectedSeverity(event.target.value)
              }
            >
              <option value="Todas">Todas</option>

              {incidentSeverities.map((severity) => (
                <option key={severity} value={severity}>
                  {severity}
                </option>
              ))}
            </select>
          </label>

          <label className="incident-filter">
            Estado:

            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value)
              }
            >
              <option value="Todos">Todos</option>

              {incidentStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <span className="incident-results">
            {filteredIncidents.length} resultados
          </span>
        </div>

        {filteredIncidents.length > 0 ? (
          <div className="incident-table-wrapper">
            <table className="incident-table">
              <thead>
                <tr>
                  <th>Incidente</th>
                  <th>Recurso relacionado</th>
                  <th>Ubicación</th>
                  <th>Fecha y hora</th>
                  <th>Severidad</th>
                  <th>Afectados</th>
                  <th>Estado</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>

              <tbody>
                {filteredIncidents.map((incident) => (
                  <tr key={incident.incidentNumber}>
                    <td>
                      <div className="incident-identity">
                        <span className="incident-identity__icon">
                          <Siren />
                        </span>

                        <div>
                          <strong>{incident.type}</strong>
                          <span>#{incident.incidentNumber}</span>
                          <small>{incident.description}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="incident-related">
                        <span>{incident.relatedType}</span>
                        <strong>{incident.relatedResource}</strong>
                      </div>
                    </td>

                    <td>
                      <div className="incident-location">
                        <MapPin />
                        <span>{incident.location}</span>
                      </div>
                    </td>

                    <td>
                      <div className="incident-date">
                        <strong>
                          {formatDateTime(incident.startDateTime)}
                        </strong>

                        <span>
                          {incident.endDateTime
                            ? `Finalizó: ${formatDateTime(
                                incident.endDateTime,
                              )}`
                            : "Incidente en curso"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={getSeverityClass(
                          incident.severity,
                        )}
                      >
                        {incident.severity}
                      </span>
                    </td>

                    <td>
                      <span className="incident-affected">
                        <UsersRound />
                        {formatNumber(incident.affectedPassengers)}
                      </span>
                    </td>

                    <td>
                      <span
                        className={getStatusClass(incident.status)}
                      >
                        {incident.status}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="incident-row-action"
                        aria-label={`Opciones del incidente ${incident.incidentNumber}`}
                      >
                        <MoreHorizontal />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="incident-empty">
            <Search />
            <strong>No se encontraron incidentes</strong>

            <p>
              Prueba con otra búsqueda o modifica los filtros
              seleccionados.
            </p>
          </div>
        )}
      </section>

      {showForm && (
        <IncidentFormModal
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default IncidentManagement;