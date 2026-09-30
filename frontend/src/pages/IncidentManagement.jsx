import { useMemo, useRef, useState } from "react";
import {
  CirclePlus,
  Info,
  MapPin,
  Search,
  ShieldAlert,
  Siren,
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
  { id: "non-final", label: "No finalizados" },
  { id: "final", label: "Finalizados" },
];

const initialFilters = {
  search: "",
  severity: "Todas",
  status: "Todos",
};

function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function hasRecordedValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function displayRecordedValue(value) {
  return hasRecordedValue(value) ? String(value) : "Sin registro";
}

function isFinalStatus(status) {
  const normalizedStatus = normalizeText(status);
  return normalizedStatus === "resuelto" || normalizedStatus === "cerrado";
}

function requiresPriorityReview(incident) {
  const severity = normalizeText(incident.severity);
  return (
    (severity === "critica" || severity === "alta") &&
    !isFinalStatus(incident.status)
  );
}

function formatRecordedDateTime(value) {
  if (!hasRecordedValue(value)) {
    return "Sin registro";
  }
  const [date, time] = String(value).split("T");
  return time ? `${date} · ${time}` : String(value);
}

function formatPassengers(value) {
  if (!hasRecordedValue(value)) {
    return "Sin registro";
  }
  return new Intl.NumberFormat("es-GT").format(Number(value));
}

function getSeverityTone(severity) {
  const normalizedSeverity = normalizeText(severity);
  if (normalizedSeverity === "critica") return "danger";
  if (normalizedSeverity === "alta") return "warning";
  if (normalizedSeverity === "media") return "neutral";
  return "info";
}

function getStatusTone(status) {
  const normalizedStatus = normalizeText(status);
  if (normalizedStatus === "resuelto") return "success";
  if (normalizedStatus === "cerrado") return "closed";
  if (normalizedStatus === "en investigacion") return "warning";
  if (
    normalizedStatus === "en atencion" ||
    normalizedStatus === "monitoreando"
  ) {
    return "info";
  }
  return "neutral";
}

function StatusBadge({ kind, value }) {
  const tone =
    kind === "severity" ? getSeverityTone(value) : getStatusTone(value);
  return (
    <span
      className={`incident-badge incident-badge--${kind} incident-badge--${tone}`}
    >
      <span className="incident-badge__mark" aria-hidden="true" />
      {displayRecordedValue(value)}
    </span>
  );
}

function incidentMatchesTab(incident, tabId) {
  if (tabId === "non-final") return !isFinalStatus(incident.status);
  if (tabId === "final") return isFinalStatus(incident.status);
  return true;
}

function incidentMatchesFilters(incident, filters) {
  const searchableValues = [
    incident.incidentNumber,
    incident.type,
    incident.description,
    incident.relatedType,
    incident.relatedResource,
    incident.location,
    incident.identifiedCause,
    incident.actionsTaken,
  ];
  const normalizedSearch = normalizeText(filters.search);
  const matchesSearch =
    normalizedSearch === "" ||
    searchableValues.some((value) =>
      normalizeText(value).includes(normalizedSearch),
    );
  const matchesSeverity =
    filters.severity === "Todas" ||
    normalizeText(incident.severity) === normalizeText(filters.severity);
  const matchesStatus =
    filters.status === "Todos" ||
    normalizeText(incident.status) === normalizeText(filters.status);
  return matchesSearch && matchesSeverity && matchesStatus;
}

function getVisibleIncidents(rows, tabId, filters) {
  return rows.filter(
    (incident) =>
      incidentMatchesTab(incident, tabId) &&
      incidentMatchesFilters(incident, filters),
  );
}

function getInitialSelection(tabId) {
  return incidents.find((incident) => incidentMatchesTab(incident, tabId))
    ?.incidentNumber;
}

function getIncidentGroups(tabId, rows) {
  if (tabId === "final") {
    return [
      {
        id: "resolved",
        title: "Resueltos",
        description: "Estado final registrado como Resuelto.",
        records: rows.filter(
          (incident) => normalizeText(incident.status) === "resuelto",
        ),
      },
      {
        id: "closed",
        title: "Cerrados",
        description: "Estado final registrado como Cerrado.",
        records: rows.filter(
          (incident) => normalizeText(incident.status) === "cerrado",
        ),
      },
    ].filter((group) => group.records.length > 0);
  }

  const priorityRecords = rows.filter(requiresPriorityReview);
  const priorityIds = new Set(
    priorityRecords.map((incident) => incident.incidentNumber),
  );
  return [
    {
      id: "priority-review",
      title: "Revisión prioritaria registrada",
      description: "Severidad Crítica o Alta y estado no finalizado.",
      records: priorityRecords,
    },
    {
      id: "remaining",
      title:
        tabId === "non-final"
          ? "Otros no finalizados"
          : "Otros incidentes registrados",
      records: rows.filter(
        (incident) => !priorityIds.has(incident.incidentNumber),
      ),
    },
  ].filter((group) => group.records.length > 0);
}

function getNextIncidentNumber(rows) {
  return (
    rows.reduce(
      (highest, incident) =>
        Math.max(highest, Number(incident.incidentNumber || 0)),
      0,
    ) + 1
  );
}

function getIncidentAccessibleName(incident) {
  return [
    `Seleccionar incidente ${incident.incidentNumber}`,
    incident.type,
    `severidad ${incident.severity}`,
    `estado ${incident.status}`,
    `${incident.relatedType} ${incident.relatedResource}`,
    `ubicación ${incident.location}`,
  ].join(", ");
}

function DefinitionItem({ label, children, wide = false }) {
  return (
    <div
      className={
        wide
          ? "incident-definition incident-definition--wide"
          : "incident-definition"
      }
    >
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function IncidentInspector({ incident }) {
  if (!incident) {
    return (
      <aside
        id="incident-inspector"
        className="incident-inspector incident-inspector--empty"
        aria-label="Inspector de incidente"
      >
        <ShieldAlert aria-hidden="true" />
        <strong>Sin incidente seleccionado</strong>
        <p>Selecciona un registro visible para consultar sus datos.</p>
      </aside>
    );
  }

  return (
    <aside
      id="incident-inspector"
      className="incident-inspector"
      aria-labelledby="incident-inspector-title"
    >
      <header className="incident-inspector__heading">
        <span className="incident-inspector__icon" aria-hidden="true">
          <Siren />
        </span>
        <div>
          <span className="incident-inspector__id">
            INC-{incident.incidentNumber}
          </span>
          <h3 id="incident-inspector-title">{incident.type}</h3>
          <p>{incident.description}</p>
        </div>
      </header>

      <div className="incident-inspector__body">
        <section className="incident-inspector__section">
          <h4>Clasificación registrada</h4>
          <dl className="incident-definitions incident-definitions--three">
            <DefinitionItem label="Categoría">
              {displayRecordedValue(incident.type)}
            </DefinitionItem>
            <DefinitionItem label="Severidad">
              <StatusBadge kind="severity" value={incident.severity} />
            </DefinitionItem>
            <DefinitionItem label="Estado">
              <StatusBadge kind="status" value={incident.status} />
            </DefinitionItem>
          </dl>
        </section>

        <section className="incident-inspector__section">
          <h4>Afectación registrada</h4>
          <dl className="incident-definitions incident-definitions--three">
            <DefinitionItem label="Tipo de recurso declarado">
              {displayRecordedValue(incident.relatedType)}
            </DefinitionItem>
            <DefinitionItem label="Recurso registrado · Texto">
              {displayRecordedValue(incident.relatedResource)}
            </DefinitionItem>
            <DefinitionItem label="Ubicación registrada · Texto">
              {displayRecordedValue(incident.location)}
            </DefinitionItem>
            <DefinitionItem label="Pasajeros afectados declarados">
              {formatPassengers(incident.affectedPassengers)}
            </DefinitionItem>
            <DefinitionItem label="Impacto de servicio">
              Sin registro
            </DefinitionItem>
          </dl>
          <p className="incident-inspector__note">
            El recurso y la ubicación se conservan como texto registrado; no
            representan relaciones verificadas con otros módulos.
          </p>
        </section>

        <section className="incident-inspector__section">
          <h4>Cronología registrada</h4>
          <dl className="incident-definitions">
            <DefinitionItem label="Inicio registrado">
              {formatRecordedDateTime(incident.startDateTime)}
            </DefinitionItem>
            <DefinitionItem label="Finalización registrada">
              {formatRecordedDateTime(incident.endDateTime)}
            </DefinitionItem>
          </dl>
          <p className="incident-inspector__note">
            No se calcula duración, antigüedad ni estado temporal. El ciclo de
            vida procede únicamente del estado registrado.
          </p>
        </section>

        <section className="incident-inspector__section">
          <h4>Responsabilidad registrada</h4>
          <dl className="incident-definitions">
            <DefinitionItem label="Persona o fuente que reportó">
              {displayRecordedValue(incident.reportedBy)}
            </DefinitionItem>
            <DefinitionItem label="Asignación">Sin registro</DefinitionItem>
          </dl>
        </section>

        <section className="incident-inspector__section">
          <h4>Investigación y respuesta registradas</h4>
          <dl className="incident-definitions">
            <DefinitionItem label="Causa identificada" wide>
              {displayRecordedValue(incident.identifiedCause)}
            </DefinitionItem>
            <DefinitionItem label="Acciones realizadas" wide>
              {displayRecordedValue(incident.actionsTaken)}
            </DefinitionItem>
          </dl>
        </section>

        <section className="incident-inspector__section">
          <h4>Resolución estructurada</h4>
          <dl className="incident-definitions">
            <DefinitionItem label="Resolución registrada" wide>
              Sin resolución registrada
            </DefinitionItem>
          </dl>
          <p className="incident-inspector__note">
            La causa y las acciones no se reinterpretan como una resolución.
          </p>
        </section>
      </div>
    </aside>
  );
}

function IncidentRegister({
  rows,
  selectedIncidentNumber,
  onSelect,
  hasRecords,
  hasActiveFilters,
  onClearFilters,
  tabId,
}) {
  const groups = getIncidentGroups(tabId, rows);

  if (!hasRecords) {
    return (
      <section className="incident-register" aria-labelledby="incident-register-title">
        <div className="incident-register__heading">
          <div>
            <h3 id="incident-register-title">Registro de incidentes</h3>
            <p>No existen incidentes registrados en esta sesión.</p>
          </div>
        </div>
        <div className="incident-empty">
          <Siren aria-hidden="true" />
          <strong>Sin incidentes registrados</strong>
          <p>Utiliza “Registrar incidente” para crear un registro local.</p>
        </div>
      </section>
    );
  }

  if (rows.length === 0) {
    return (
      <section className="incident-register" aria-labelledby="incident-register-title">
        <div className="incident-register__heading">
          <div>
            <h3 id="incident-register-title">Registro de incidentes</h3>
            <p>No hay registros visibles bajo los criterios actuales.</p>
          </div>
        </div>
        <div className="incident-empty">
          <Search aria-hidden="true" />
          <strong>Sin coincidencias</strong>
          <p>Modifica la búsqueda, la severidad, el estado o la vista.</p>
          {hasActiveFilters && (
            <button type="button" onClick={onClearFilters}>
              Limpiar filtros
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="incident-register" aria-labelledby="incident-register-title">
      <div className="incident-register__heading">
        <div>
          <h3 id="incident-register-title">Registro de incidentes</h3>
          <p>Selecciona un incidente para consultar su ficha registrada.</p>
        </div>
        <span>{rows.length} resultados</span>
      </div>

      <div className="incident-register__groups">
        {groups.map((group) => (
          <section className="incident-register__group" key={group.id}>
            <header>
              <div>
                <h4>{group.title}</h4>
                {group.description && <p>{group.description}</p>}
              </div>
              <span>{group.records.length}</span>
            </header>

            <div className="incident-register__rows">
              {group.records.map((incident) => {
                const isSelected =
                  incident.incidentNumber === selectedIncidentNumber;
                return (
                  <button
                    type="button"
                    className={
                      isSelected
                        ? "incident-record incident-record--selected"
                        : "incident-record"
                    }
                    key={incident.incidentNumber}
                    aria-pressed={isSelected}
                    aria-controls="incident-inspector"
                    aria-label={getIncidentAccessibleName(incident)}
                    onClick={() => onSelect(incident)}
                  >
                    <span className="incident-record__topline">
                      <span className="incident-record__number">
                        #{incident.incidentNumber}
                      </span>
                      <span className="incident-record__time">
                        {formatRecordedDateTime(incident.startDateTime)}
                      </span>
                    </span>
                    <strong>{incident.type}</strong>
                    <span className="incident-record__description">
                      {incident.description}
                    </span>
                    <span className="incident-record__badges">
                      <StatusBadge kind="severity" value={incident.severity} />
                      <StatusBadge kind="status" value={incident.status} />
                    </span>
                    <span className="incident-record__context">
                      <span>
                        <MapPin aria-hidden="true" />
                        {incident.relatedType}: {incident.relatedResource}
                      </span>
                      <span>{incident.location}</span>
                    </span>
                    <span className="incident-record__impact">
                      <UsersRound aria-hidden="true" />
                      {formatPassengers(incident.affectedPassengers)} pasajeros
                      afectados declarados
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function IncidentManagement() {
  const [incidentRows, setIncidentRows] = useState(incidents);
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState(initialFilters);
  const [selectedByTab, setSelectedByTab] = useState({
    all: getInitialSelection("all"),
    "non-final": getInitialSelection("non-final"),
    final: getInitialSelection("final"),
  });
  const [notice, setNotice] = useState("");
  const [selectionAnnouncement, setSelectionAnnouncement] = useState("");
  const [creationAnnouncement, setCreationAnnouncement] = useState("");
  const [showForm, setShowForm] = useState(false);
  const tabRefs = useRef([]);

  const finalIncidents = incidentRows.filter((incident) =>
    isFinalStatus(incident.status),
  );
  const nonFinalIncidents = incidentRows.filter(
    (incident) => !isFinalStatus(incident.status),
  );
  const priorityReviewIncidents = incidentRows.filter(requiresPriorityReview);
  const declaredAffectedPassengers = incidentRows.reduce(
    (total, incident) =>
      total +
      (hasRecordedValue(incident.affectedPassengers)
        ? Number(incident.affectedPassengers)
        : 0),
    0,
  );

  const visibleIncidents = useMemo(
    () => getVisibleIncidents(incidentRows, activeTab, filters),
    [incidentRows, activeTab, filters],
  );
  const selectedIncidentNumber = selectedByTab[activeTab];
  const selectedIncident =
    visibleIncidents.find(
      (incident) => incident.incidentNumber === selectedIncidentNumber,
    ) ?? null;
  const hasActiveFilters =
    filters.search !== "" ||
    filters.severity !== "Todas" ||
    filters.status !== "Todos";
  const activeTabLabel =
    tabs.find((tab) => tab.id === activeTab)?.label ?? "Todos";

  function updateSelectionForVisibleRows(nextRows, tabId) {
    const currentSelection = selectedByTab[tabId];
    const nextSelectedIncident =
      nextRows.find(
        (incident) => incident.incidentNumber === currentSelection,
      ) ?? nextRows[0];
    const nextSelection = nextSelectedIncident?.incidentNumber;

    setSelectedByTab((currentSelections) => {
      if (currentSelections[tabId] === nextSelection) {
        return currentSelections;
      }

      return {
        ...currentSelections,
        [tabId]: nextSelection,
      };
    });

    if (currentSelection === nextSelection) {
      return;
    }

    if (nextSelectedIncident) {
      setSelectionAnnouncement(
        `Incidente ${nextSelectedIncident.incidentNumber} seleccionado: ${nextSelectedIncident.type}.`,
      );
    } else {
      setSelectionAnnouncement("Sin incidentes visibles para seleccionar.");
    }
  }

  function handleFilterChange(name, value) {
    const nextFilters = { ...filters, [name]: value };
    const nextRows = getVisibleIncidents(
      incidentRows,
      activeTab,
      nextFilters,
    );
    setFilters(nextFilters);
    updateSelectionForVisibleRows(nextRows, activeTab);
  }

  function handleClearFilters() {
    const nextRows = getVisibleIncidents(
      incidentRows,
      activeTab,
      initialFilters,
    );
    setFilters(initialFilters);
    updateSelectionForVisibleRows(nextRows, activeTab);
  }

  function handleTabChange(tabId, focusTab = false) {
    const nextRows = getVisibleIncidents(incidentRows, tabId, filters);
    setActiveTab(tabId);
    updateSelectionForVisibleRows(nextRows, tabId);
    if (focusTab) {
      const nextIndex = tabs.findIndex((tab) => tab.id === tabId);
      tabRefs.current[nextIndex]?.focus();
    }
  }

  function handleTabKeyDown(event, tabIndex) {
    let nextIndex;
    if (event.key === "ArrowRight") {
      nextIndex = (tabIndex + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (tabIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleTabChange(tabs[tabIndex].id);
      return;
    } else {
      return;
    }
    event.preventDefault();
    handleTabChange(tabs[nextIndex].id, true);
  }

  function handleIncidentSelection(incident) {
    setSelectedByTab((currentSelections) => ({
      ...currentSelections,
      [activeTab]: incident.incidentNumber,
    }));
    setSelectionAnnouncement(
      `Incidente ${incident.incidentNumber} seleccionado: ${incident.type}.`,
    );
  }

  function handleSave(newIncident) {
    const createdIncident = {
      ...newIncident,
      incidentNumber: getNextIncidentNumber(incidentRows),
    };
    const nextRows = [createdIncident, ...incidentRows];
    const createdIncidentIsVisible =
      incidentMatchesTab(createdIncident, activeTab) &&
      incidentMatchesFilters(createdIncident, filters);
    setIncidentRows(nextRows);
    if (createdIncidentIsVisible) {
      setSelectedByTab((currentSelections) => ({
        ...currentSelections,
        [activeTab]: createdIncident.incidentNumber,
      }));
      setSelectionAnnouncement(
        `Incidente ${createdIncident.incidentNumber} seleccionado: ${createdIncident.type}.`,
      );
    } else {
      updateSelectionForVisibleRows(
        getVisibleIncidents(nextRows, activeTab, filters),
        activeTab,
      );
    }
    const creationMessage = `El incidente #${createdIncident.incidentNumber} se agregó solo a esta sesión de demostración.`;
    setShowForm(false);
    setNotice(creationMessage);
    setCreationAnnouncement(creationMessage);
  }

  return (
    <div className="incident-page">
      <header className="incident-heading">
        <div className="incident-heading__copy">
          <h2>Incidentes</h2>
          <p>
            Consulta clasificación, afectación, cronología y respuesta tal como
            fueron registradas en los datos de demostración.
          </p>
          <span className="incident-heading__context">
            Datos de demostración · Las altas nuevas existen solo durante esta
            sesión.
          </span>
        </div>
        <button
          type="button"
          className="incident-primary-button"
          onClick={() => {
            setNotice("");
            setCreationAnnouncement("");
            setShowForm(true);
          }}
        >
          <CirclePlus aria-hidden="true" />
          Registrar incidente
        </button>
      </header>

      {notice && (
        <div className="incident-session-notice">
          <Info aria-hidden="true" />
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Cerrar aviso de creación local"
          >
            <X aria-hidden="true" />
          </button>
        </div>
      )}

      <section
        className="incident-situation"
        aria-labelledby="incident-situation-title"
      >
        <h3 id="incident-situation-title" className="incident-visually-hidden">
          Situación de incidentes registrada
        </h3>
        <dl className="incident-situation__readings">
          <div><dt>Registrados</dt><dd>{incidentRows.length}</dd></div>
          <div><dt>Revisión prioritaria registrada</dt><dd>{priorityReviewIncidents.length}</dd></div>
          <div><dt>No finalizados</dt><dd>{nonFinalIncidents.length}</dd></div>
          <div><dt>Finalizados</dt><dd>{finalIncidents.length}</dd></div>
          <div><dt>Pasajeros afectados declarados</dt><dd>{formatPassengers(declaredAffectedPassengers)}</dd></div>
        </dl>
        <p className="incident-situation__criterion">
          <ShieldAlert aria-hidden="true" />
          <span>
            <strong>Criterio de revisión prioritaria registrada:</strong>{" "}
            severidad Crítica o Alta y estado distinto de Resuelto o Cerrado.
          </span>
        </p>
      </section>

      <section className="incident-desk" aria-label="Mesa de respuesta">
        <div className="incident-desk__tabs" role="tablist" aria-label="Vistas de incidentes">
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            const count = tab.id === "all" ? incidentRows.length : tab.id === "non-final" ? nonFinalIncidents.length : finalIncidents.length;
            return (
              <button
                type="button"
                role="tab"
                id={`incident-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`incident-panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                className={isActive ? "incident-desk__tab incident-desk__tab--active" : "incident-desk__tab"}
                key={tab.id}
                ref={(element) => { tabRefs.current[index] = element; }}
                onClick={() => handleTabChange(tab.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              >
                {tab.label}<span>{count}</span>
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`incident-panel-${activeTab}`}
          aria-labelledby={`incident-tab-${activeTab}`}
          className="incident-desk__panel"
          tabIndex="0"
        >
          <div className="incident-desk__toolbar">
            <label className="incident-search-control">
              <span className="incident-visually-hidden">Buscar incidentes</span>
              <Search aria-hidden="true" />
              <input
                type="search"
                value={filters.search}
                onChange={(event) => handleFilterChange("search", event.target.value)}
                placeholder="Buscar por número, tipo, recurso, ubicación, causa o acciones…"
              />
            </label>
            <label className="incident-filter-control">
              <span>Severidad</span>
              <select value={filters.severity} onChange={(event) => handleFilterChange("severity", event.target.value)}>
                <option value="Todas">Todas</option>
                {incidentSeverities.map((severity) => <option key={severity} value={severity}>{severity}</option>)}
              </select>
            </label>
            <label className="incident-filter-control">
              <span>Estado</span>
              <select value={filters.status} onChange={(event) => handleFilterChange("status", event.target.value)}>
                <option value="Todos">Todos</option>
                {incidentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
            <span className="incident-result-count">{visibleIncidents.length} resultados</span>
          </div>

          <div className="incident-desk__body">
            <IncidentRegister
              rows={visibleIncidents}
              selectedIncidentNumber={selectedIncidentNumber}
              onSelect={handleIncidentSelection}
              hasRecords={incidentRows.length > 0}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
              tabId={activeTab}
            />
            <IncidentInspector incident={selectedIncident} />
          </div>
        </div>
      </section>

      <p className="incident-live-region" aria-live="polite" aria-atomic="true">
        {visibleIncidents.length} resultados en la vista {activeTabLabel}.
      </p>
      <p className="incident-live-region" aria-live="polite" aria-atomic="true">{selectionAnnouncement}</p>
      <p className="incident-live-region" aria-live="polite" aria-atomic="true">{creationAnnouncement}</p>

      {showForm && <IncidentFormModal onClose={() => setShowForm(false)} onSave={handleSave} />}
    </div>
  );
}

export default IncidentManagement;
