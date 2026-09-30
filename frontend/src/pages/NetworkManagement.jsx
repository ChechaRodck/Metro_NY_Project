import { useMemo, useRef, useState } from "react";
import {
  Accessibility,
  ArrowRight,
  Building2,
  CircleCheck,
  CirclePlus,
  Clock3,
  MapPinned,
  Route as RouteIcon,
  Search,
  TrainFront,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import NetworkFormModal from "../components/NetworkFormModal";
import {
  metroLines,
  metroRoutes,
  metroStations,
} from "../data/networkData";
import "../styles/network.css";

const entityTabs = [
  { id: "lines", label: "Líneas", icon: TrainFront },
  { id: "stations", label: "Estaciones", icon: Building2 },
  { id: "routes", label: "Rutas", icon: RouteIcon },
];

const statusOptions = {
  lines: ["Todos", "Operativa", "Con demoras", "Mantenimiento"],
  stations: ["Todos", "Operativa", "Mantenimiento"],
  routes: ["Todos", "Activa", "Con demoras", "Servicio parcial"],
};

const actionLabels = {
  lines: "Registrar línea",
  stations: "Registrar estación",
  routes: "Registrar ruta",
};

const statusPriority = {
  lines: { Mantenimiento: 0, "Con demoras": 1, Operativa: 2 },
  stations: { Mantenimiento: 0, Operativa: 1 },
  routes: { "Servicio parcial": 0, "Con demoras": 1, Activa: 2 },
};

const statusPresentation = {
  Operativa: { tone: "success", icon: CircleCheck },
  Activa: { tone: "success", icon: CircleCheck },
  "Con demoras": { tone: "warning", icon: TriangleAlert },
  Mantenimiento: { tone: "danger", icon: Wrench },
  "Servicio parcial": { tone: "danger", icon: Wrench },
};

function normalizeSearchValue(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function recordMatches(record, searchTerm, statusFilter) {
  const searchableRecord = normalizeSearchValue(Object.values(record).join(" "));
  const normalizedTerm = normalizeSearchValue(searchTerm.trim());
  const matchesSearch = !normalizedTerm || searchableRecord.includes(normalizedTerm);
  const matchesStatus = statusFilter === "Todos" || record.status === statusFilter;

  return matchesSearch && matchesStatus;
}

function sortByOperationalPriority(records, type) {
  return records
    .map((record, index) => ({ record, index }))
    .sort((a, b) => {
      const aPriority = statusPriority[type][a.record.status] ?? 99;
      const bPriority = statusPriority[type][b.record.status] ?? 99;

      return aPriority - bPriority || a.index - b.index;
    })
    .map(({ record }) => record);
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
      (total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index],
      0,
    );
}

function getLineTextColor(hexColor) {
  const backgroundLuminance = getRelativeLuminance(hexColor);

  if (backgroundLuminance === null) {
    return "#ffffff";
  }

  const lightLuminance = 1;
  const darkLuminance = getRelativeLuminance("#050b14");
  const lightContrast =
    (lightLuminance + 0.05) / (backgroundLuminance + 0.05);
  const darkContrast =
    (backgroundLuminance + 0.05) / (darkLuminance + 0.05);

  return lightContrast >= darkContrast ? "#ffffff" : "#050b14";
}

function getLineStyle(line) {
  return {
    "--network-line-color": line.color,
    "--network-line-text": getLineTextColor(line.color),
  };
}

function formatDistance(value) {
  return `${value.toLocaleString("es-ES", { maximumFractionDigits: 1 })} km`;
}

function NetworkStatus({ status }) {
  const presentation = statusPresentation[status] ?? {
    tone: "neutral",
    icon: CircleCheck,
  };
  const StatusIcon = presentation.icon;

  return (
    <span className={`network-status network-status--${presentation.tone}`}>
      <StatusIcon size={12} strokeWidth={2.2} aria-hidden="true" />
      {status}
    </span>
  );
}

function NetworkToolbar({
  type,
  searchTerm,
  statusFilter,
  resultCount,
  onSearchChange,
  onStatusChange,
}) {
  const entityLabel =
    type === "lines" ? "líneas" : type === "stations" ? "estaciones" : "rutas";

  return (
    <div className="network-toolbar">
      <label className="network-search">
        <Search size={15} aria-hidden="true" />
        <span className="network-sr-only">Buscar {entityLabel}</span>
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={`Buscar ${entityLabel}`}
        />
      </label>

      <label className="network-filter">
        <span>Estado</span>
        <select
          value={statusFilter}
          onChange={(event) => onStatusChange(event.target.value)}
          aria-label={`Filtrar ${entityLabel} por estado`}
        >
          {statusOptions[type].map((status) => (
            <option value={status} key={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <span className="network-results" aria-live="polite">
        {resultCount} {resultCount === 1 ? "resultado" : "resultados"}
      </span>
    </div>
  );
}

function NetworkManagement() {
  const [activeTab, setActiveTab] = useState("lines");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLineId, setSelectedLineId] = useState("L");
  const [lines, setLines] = useState(metroLines);
  const [stations, setStations] = useState(metroStations);
  const [routes, setRoutes] = useState(metroRoutes);
  const tabRefs = useRef([]);

  const recordsByType = {
    lines,
    stations,
    routes,
  };

  const filteredRecords = useMemo(
    () => {
      const activeRecords =
        activeTab === "lines"
          ? lines
          : activeTab === "stations"
            ? stations
            : routes;

      return activeRecords.filter((record) =>
        recordMatches(record, searchTerm, statusFilter),
      );
    },
    [activeTab, lines, routes, searchTerm, stations, statusFilter],
  );

  const orderedRecords = useMemo(
    () => sortByOperationalPriority(filteredRecords, activeTab),
    [activeTab, filteredRecords],
  );

  const effectiveSelectedLine =
    activeTab === "lines"
      ? orderedRecords.find((line) => line.id === selectedLineId) ?? orderedRecords[0]
      : null;
  const selectedLineIndex = effectiveSelectedLine
    ? orderedRecords.findIndex((line) => line.id === effectiveSelectedLine.id)
    : -1;

  const selectedRoutes = effectiveSelectedLine
    ? routes.filter((route) => route.line === effectiveSelectedLine.id)
    : [];
  const selectedStations = effectiveSelectedLine
    ? stations.filter((station) => station.lines.includes(effectiveSelectedLine.id))
    : [];

  const lineAttentionCount = lines.filter(
    (line) => line.status !== "Operativa",
  ).length;
  const accessibleStationCount = stations.filter(
    (station) => station.accessible,
  ).length;
  const routeAttentionCount = routes.filter(
    (route) => route.status !== "Activa",
  ).length;

  function handleTabChange(nextTab) {
    setActiveTab(nextTab);
    setSearchTerm("");
    setStatusFilter("Todos");
    setIsFormOpen(false);
  }

  function handleTabKeyDown(event, index) {
    let nextIndex;

    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % entityTabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + entityTabs.length) % entityTabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = entityTabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    handleTabChange(entityTabs[nextIndex].id);
    requestAnimationFrame(() => tabRefs.current[nextIndex]?.focus());
  }

  function handleCreateRecord(newRecord) {
    if (activeTab === "lines") {
      setLines((currentLines) => [...currentLines, newRecord]);

      if (recordMatches(newRecord, searchTerm, statusFilter)) {
        setSelectedLineId(newRecord.id);
      }
    }

    if (activeTab === "stations") {
      setStations((currentStations) => [...currentStations, newRecord]);
    }

    if (activeTab === "routes") {
      setRoutes((currentRoutes) => [...currentRoutes, newRecord]);
    }

    setIsFormOpen(false);
  }

  function lineForId(lineId) {
    return lines.find((line) => line.id === lineId);
  }

  return (
    <section className="network-page" aria-labelledby="network-page-title">
      <header className="network-heading">
        <div className="network-heading__copy">
          <div className="network-context" aria-label="Contexto de los datos">
            <span>Escenario simulado</span>
            <span>Datos de demostración</span>
          </div>
          <p className="network-heading__eyebrow">Mesa de topología de rutas</p>
          <h2 id="network-page-title">Red y topología registrada</h2>
          <p>
            Consulta líneas, terminales, rutas y estaciones asociadas registradas en el sistema.
          </p>
        </div>

        <button
          type="button"
          className="network-primary-button"
          onClick={() => setIsFormOpen(true)}
        >
          <CirclePlus size={17} aria-hidden="true" />
          {actionLabels[activeTab]}
        </button>
      </header>

      <div className="network-panel">
        <div className="network-tabs" role="tablist" aria-label="Registros de red">
          {entityTabs.map((tab, index) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                type="button"
                role="tab"
                id={`network-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`network-panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                className={`network-tab${isActive ? " network-tab--active" : ""}`}
                onClick={() => handleTabChange(tab.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                key={tab.id}
              >
                <TabIcon size={15} aria-hidden="true" />
                {tab.label}
                <span>{recordsByType[tab.id].length}</span>
              </button>
            );
          })}
        </div>

        <div
          id="network-panel-lines"
          role="tabpanel"
          aria-labelledby="network-tab-lines"
          hidden={activeTab !== "lines"}
          tabIndex={0}
        >
          {activeTab === "lines" && (
            <div className="network-lines-desk">
            <aside className="network-line-index" aria-labelledby="network-line-index-title">
              <div className="network-line-index__header">
                <div>
                  <span className="network-section-label">Control de servicio</span>
                  <h3 id="network-line-index-title">Índice de líneas</h3>
                </div>
                <p>
                  {lines.length} registradas · {lineAttentionCount} requieren atención
                </p>
              </div>

              <NetworkToolbar
                type="lines"
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                resultCount={orderedRecords.length}
                onSearchChange={setSearchTerm}
                onStatusChange={setStatusFilter}
              />

              {orderedRecords.length > 0 ? (
                <div
                  className="network-line-list"
                  style={{ "--network-selected-index": selectedLineIndex }}
                >
                  <span className="network-line-indicator" aria-hidden="true" />
                  {orderedRecords.map((line) => (
                    <button
                      type="button"
                      className="network-line-row"
                      style={getLineStyle(line)}
                      aria-pressed={effectiveSelectedLine?.id === line.id}
                      aria-controls="network-line-inspector"
                      aria-label={`Línea ${line.id}, ${line.name}, ${line.status}`}
                      onClick={() => setSelectedLineId(line.id)}
                      key={line.id}
                    >
                      <span className="network-line-code">{line.id}</span>
                      <span className="network-line-row__identity">
                        <strong>{line.name}</strong>
                        <span>{line.service}</span>
                      </span>
                      <NetworkStatus status={line.status} />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="network-empty network-empty--compact">
                  <Search size={22} aria-hidden="true" />
                  <strong>Sin líneas coincidentes</strong>
                  <span>Ajusta la búsqueda o el filtro de estado.</span>
                </div>
              )}
            </aside>

            <article
              className="network-line-inspector"
              id="network-line-inspector"
              aria-labelledby="network-inspector-title"
            >
              {effectiveSelectedLine ? (
                <>
                  <p className="network-sr-only" aria-live="polite">
                    Línea seleccionada: {effectiveSelectedLine.id}, {effectiveSelectedLine.name}.
                  </p>

                  <header className="network-inspector__header">
                    <div
                      className="network-line-code network-line-code--large"
                      style={getLineStyle(effectiveSelectedLine)}
                      aria-label={`Línea ${effectiveSelectedLine.id}`}
                    >
                      {effectiveSelectedLine.id}
                    </div>
                    <div className="network-inspector__identity">
                      <span className="network-section-label">Línea seleccionada</span>
                      <h3 id="network-inspector-title">{effectiveSelectedLine.name}</h3>
                      <span>{effectiveSelectedLine.service}</span>
                    </div>
                    <NetworkStatus status={effectiveSelectedLine.status} />
                  </header>

                  <section className="network-terminal-section" aria-labelledby="terminal-section-title">
                    <div className="network-section-heading">
                      <div>
                        <span className="network-section-label">Tramo registrado</span>
                        <h4 id="terminal-section-title">Terminal a terminal</h4>
                      </div>
                      <MapPinned size={18} aria-hidden="true" />
                    </div>

                    <div
                      className="network-terminal-segment"
                      style={getLineStyle(effectiveSelectedLine)}
                    >
                      <div className="network-terminal">
                        <span>Origen</span>
                        <strong>{effectiveSelectedLine.origin}</strong>
                      </div>
                      <div className="network-terminal-connector" aria-hidden="true">
                        <span />
                        <i />
                        <span />
                      </div>
                      <div className="network-terminal network-terminal--destination">
                        <span>Destino</span>
                        <strong>{effectiveSelectedLine.destination}</strong>
                      </div>
                    </div>
                  </section>

                  <dl className="network-readings">
                    <div>
                      <dt>Estaciones declaradas</dt>
                      <dd>{effectiveSelectedLine.stations}</dd>
                    </div>
                    <div>
                      <dt>Longitud aproximada</dt>
                      <dd>{formatDistance(effectiveSelectedLine.length)}</dd>
                    </div>
                    <div>
                      <dt>Tipo de servicio</dt>
                      <dd>{effectiveSelectedLine.service}</dd>
                    </div>
                  </dl>

                  <section className="network-detail-section" aria-labelledby="route-section-title">
                    <div className="network-section-heading">
                      <div>
                        <span className="network-section-label">Configuración operativa</span>
                        <h4 id="route-section-title">Rutas configuradas</h4>
                      </div>
                      <span className="network-record-count">
                        {selectedRoutes.length} {selectedRoutes.length === 1 ? "registro" : "registros"}
                      </span>
                    </div>

                    {selectedRoutes.length > 0 ? (
                      <ul className="network-route-list">
                        {selectedRoutes.map((route) => (
                          <li key={route.id}>
                            <div className="network-route-list__identity">
                              <strong>{route.id}</strong>
                              <span>{route.direction}</span>
                            </div>
                            <dl>
                              <div>
                                <dt>Distancia</dt>
                                <dd>{formatDistance(route.distance)}</dd>
                              </div>
                              <div>
                                <dt>Duración estimada</dt>
                                <dd>{route.duration} min</dd>
                              </div>
                            </dl>
                            <NetworkStatus status={route.status} />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="network-missing-route">
                        <RouteIcon size={18} aria-hidden="true" />
                        <div>
                          <strong>Sin ruta configurada</strong>
                          <span>No existe una ruta registrada para esta línea en los datos de demostración.</span>
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="network-detail-section" aria-labelledby="station-section-title">
                    <div className="network-section-heading">
                      <div>
                        <span className="network-section-label">Muestra de registros asociados</span>
                        <h4 id="station-section-title">Estaciones vinculadas</h4>
                      </div>
                      <span className="network-record-count">
                        {selectedStations.length} {selectedStations.length === 1 ? "registro" : "registros"}
                      </span>
                    </div>
                    <p className="network-association-note">
                      Esta muestra no representa el orden ni el recorrido completo de la línea.
                    </p>

                    {selectedStations.length > 0 ? (
                      <ul className="network-station-list">
                        {selectedStations.map((station) => (
                          <li key={station.id}>
                            <div className="network-station-list__identity">
                              <span className="station-icon">
                                <Building2 size={16} aria-hidden="true" />
                              </span>
                              <div>
                                <strong>{station.name}</strong>
                                <span>{station.id} · {station.borough}</span>
                              </div>
                            </div>
                            <span>{station.platforms} plataformas</span>
                            <span>{station.accesses} accesos</span>
                            <span className={station.accessible ? "accessibility-label accessibility-label--available" : "accessibility-label"}>
                              <Accessibility size={14} aria-hidden="true" />
                              {station.accessible ? "Accesible" : "Sin accesibilidad"}
                            </span>
                            <NetworkStatus status={station.status} />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="network-empty-association">
                        No hay estaciones asociadas a esta línea en la muestra de datos.
                      </p>
                    )}
                  </section>
                </>
              ) : (
                <div className="network-empty">
                  <TrainFront size={27} aria-hidden="true" />
                  <strong>No hay una línea para inspeccionar</strong>
                  <span>Ajusta los criterios del índice para recuperar registros.</span>
                </div>
              )}
            </article>
            </div>
          )}
        </div>

        <div
          id="network-panel-stations"
          role="tabpanel"
          aria-labelledby="network-tab-stations"
          hidden={activeTab !== "stations"}
          tabIndex={0}
        >
          {activeTab === "stations" && (
            <>
              <div className="network-registry-heading">
                <div>
                  <span className="network-section-label">Directorio operativo</span>
                  <h3>Registro de estaciones</h3>
                </div>
                <p>{stations.length} registradas · {accessibleStationCount} con accesibilidad disponible</p>
              </div>

              <NetworkToolbar
                type="stations"
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                resultCount={orderedRecords.length}
                onSearchChange={setSearchTerm}
                onStatusChange={setStatusFilter}
              />

              {orderedRecords.length > 0 ? (
                <div className="network-table-wrapper">
                  <table className="network-table network-table--stations">
                    <thead>
                      <tr>
                        <th scope="col">Estación</th>
                        <th scope="col">Distrito</th>
                        <th scope="col">Líneas</th>
                        <th scope="col">Plataformas</th>
                        <th scope="col">Accesos</th>
                        <th scope="col">Accesibilidad</th>
                        <th scope="col">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderedRecords.map((station) => (
                        <tr key={station.id}>
                          <th scope="row">
                            <span className="network-table-identity">
                              <span className="station-icon">
                                <Building2 size={16} aria-hidden="true" />
                              </span>
                              <span>
                                <strong>{station.name}</strong>
                                <small>{station.id}</small>
                              </span>
                            </span>
                          </th>
                          <td>{station.borough}</td>
                          <td>
                            <span className="mini-lines">
                              {station.lines.map((lineId) => {
                                const line = lineForId(lineId);

                                return (
                                  <span
                                    style={line ? getLineStyle(line) : undefined}
                                    aria-label={`Línea ${lineId}`}
                                    key={lineId}
                                  >
                                    {lineId}
                                  </span>
                                );
                              })}
                            </span>
                          </td>
                          <td>{station.platforms}</td>
                          <td>{station.accesses}</td>
                          <td>
                            <span className={station.accessible ? "accessibility-label accessibility-label--available" : "accessibility-label"}>
                              <Accessibility size={14} aria-hidden="true" />
                              {station.accessible ? "Disponible" : "No disponible"}
                            </span>
                          </td>
                          <td><NetworkStatus status={station.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="network-empty">
                  <Search size={25} aria-hidden="true" />
                  <strong>Sin estaciones coincidentes</strong>
                  <span>Ajusta la búsqueda o el filtro de estado.</span>
                </div>
              )}
            </>
          )}
        </div>

        <div
          id="network-panel-routes"
          role="tabpanel"
          aria-labelledby="network-tab-routes"
          hidden={activeTab !== "routes"}
          tabIndex={0}
        >
          {activeTab === "routes" && (
            <>
              <div className="network-registry-heading">
                <div>
                  <span className="network-section-label">Configuración declarada</span>
                  <h3>Registro de rutas</h3>
                </div>
                <p>{routes.length} configuradas · {routeAttentionCount} requieren atención</p>
              </div>

              <NetworkToolbar
                type="routes"
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                resultCount={orderedRecords.length}
                onSearchChange={setSearchTerm}
                onStatusChange={setStatusFilter}
              />

              {orderedRecords.length > 0 ? (
                <div className="network-table-wrapper">
                  <table className="network-table network-table--routes">
                    <thead>
                      <tr>
                        <th scope="col">Ruta</th>
                        <th scope="col">Línea</th>
                        <th scope="col">Terminales registradas</th>
                        <th scope="col">Sentido</th>
                        <th scope="col">Servicio</th>
                        <th scope="col">Distancia</th>
                        <th scope="col">Duración</th>
                        <th scope="col">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderedRecords.map((route) => {
                        const line = lineForId(route.line);

                        return (
                          <tr key={route.id}>
                            <th scope="row">
                              <span className="network-table-identity network-table-identity--route">
                                <RouteIcon size={17} aria-hidden="true" />
                                <strong>{route.id}</strong>
                              </span>
                            </th>
                            <td>
                              <span
                                className="network-line-code network-line-code--small"
                                style={line ? getLineStyle(line) : undefined}
                                aria-label={`Línea ${route.line}`}
                              >
                                {route.line}
                              </span>
                            </td>
                            <td>
                              <span className="network-table-terminal">
                                <span>{route.origin}</span>
                                <ArrowRight size={13} aria-hidden="true" />
                                <span>{route.destination}</span>
                              </span>
                            </td>
                            <td>{route.direction}</td>
                            <td><span className="service-badge">{route.service}</span></td>
                            <td>{formatDistance(route.distance)}</td>
                            <td>
                              <span className="network-duration">
                                <Clock3 size={13} aria-hidden="true" />
                                {route.duration} min
                              </span>
                            </td>
                            <td><NetworkStatus status={route.status} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="network-empty">
                  <Search size={25} aria-hidden="true" />
                  <strong>Sin rutas coincidentes</strong>
                  <span>Ajusta la búsqueda o el filtro de estado.</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {isFormOpen && (
        <NetworkFormModal
          type={activeTab}
          availableLines={lines}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleCreateRecord}
        />
      )}
    </section>
  );
}

export default NetworkManagement;
