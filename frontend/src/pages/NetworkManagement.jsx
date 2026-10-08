import { useEffect, useMemo, useRef, useState } from "react";
import {
  Accessibility,
  ArrowRight,
  Building2,
  CircleCheck,
  CirclePlus,
  Clock3,
  LockKeyhole,
  MapPinned,
  RefreshCw,
  Route as RouteIcon,
  Search,
  TrainFront,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import NetworkFormModal from "../components/NetworkFormModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import DeleteRecordAction, {
  DeleteRecordNotice,
} from "../components/DeleteRecordAction";
import useDeleteRecord from "../hooks/useDeleteRecord";
import { hasAnyRole, useAuthSession } from "../auth";
import { ApiError } from "../services/apiClient";
import {
  createRoute,
  createLine,
  createStation,
  deactivateLine,
  deactivateRoute,
  deactivateStation,
  getLines,
  getRoutes,
  getStations,
} from "../services/lineService";
import "../styles/network.css";

const entityTabs = [
  { id: "lines", label: "Líneas", icon: TrainFront },
  { id: "stations", label: "Estaciones", icon: Building2 },
  { id: "routes", label: "Rutas", icon: RouteIcon },
];

const statusOptions = {
  lines: ["Todos", "Operativa", "Suspendida", "Inactiva"],
  stations: ["Todos", "Operativa", "En mantenimiento", "Cerrada"],
  routes: ["Todos", "Activa", "Suspendida", "Inactiva"],
};

const actionLabels = {
  lines: "Registrar línea",
  stations: "Registrar estación",
  routes: "Registrar ruta",
};

const statusPriority = {
  lines: { Inactiva: 0, Suspendida: 1, Operativa: 2 },
  stations: { Mantenimiento: 0, Operativa: 1 },
  routes: { "Servicio parcial": 0, "Con demoras": 1, Activa: 2 },
};

const statusPresentation = {
  Operativa: { tone: "success", icon: CircleCheck },
  Activa: { tone: "success", icon: CircleCheck },
  "Con demoras": { tone: "warning", icon: TriangleAlert },
  Suspendida: { tone: "warning", icon: TriangleAlert },
  Inactiva: { tone: "danger", icon: Wrench },
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
  if (value === null) return "No registrada";
  return `${value.toLocaleString("es-ES", { maximumFractionDigits: 1 })} km`;
}

function getLinesErrorMessage(error) {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return "Tu sesión está activa, pero no tiene permiso para consultar las líneas.";
    }

    if (error.status === 0) {
      return "No fue posible conectar con el servicio de líneas.";
    }

    return error.message;
  }

  return "El servicio devolvió datos de líneas con un formato no compatible.";
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
  const session = useAuthSession();
  const canWrite = hasAnyRole(session, ["ADMIN", "OPERACIONES"]);
  const [activeTab, setActiveTab] = useState("lines");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLineId, setSelectedLineId] = useState("");
  const [lines, setLines] = useState([]);
  const [lineRequest, setLineRequest] = useState({
    status: "loading",
    error: "",
  });
  const [lineRequestVersion, setLineRequestVersion] = useState(0);
  const [stations, setStations] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const tabRefs = useRef([]);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      getLines({ signal: controller.signal }),
      getStations({ signal: controller.signal }),
      getRoutes({ signal: controller.signal }),
    ])
      .then(([loadedLines, loadedStations, loadedRoutes]) => {
        setLines(loadedLines);
        setStations(loadedStations);
        setRoutes(loadedRoutes);
        setLineRequest({ status: "success", error: "" });
      })
      .catch((requestError) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          return;
        }

        setLines([]);
        setLineRequest({
          status: "error",
          error: getLinesErrorMessage(requestError),
        });
      });

    return () => controller.abort();
  }, [lineRequestVersion]);

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

  const lineAttentionCount = lines.filter(
    (line) => line.hasAttention,
  ).length;
  const accessibleStationCount = stations.filter(
    (station) => station.accessible,
  ).length;
  const routeAttentionCount = routes.filter(
    (route) => route.status !== "Activa",
  ).length;
  const deletion = useDeleteRecord({
    deleteRecord: handleDeleteRecord,
    recordExists: ({ id }) =>
      recordsByType[activeTab].some((record) => record.id === id),
  });

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

  async function handleCreateRecord(newRecord) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setFormError("");
    try {
      if (activeTab === "lines") {
        await createLine({
          idLinea: newRecord.id.toUpperCase(), nombre: newRecord.name,
          colorMapa: newRecord.color, idTerminalOrigen: Number(newRecord.originId),
          idTerminalDestino: Number(newRecord.destinationId), tipoServicio: newRecord.serviceCode,
          fechaInauguracion: null, longitudKm: newRecord.length,
          operadorResponsable: "Metro NY", estadoOperativo: "ACTIVA",
        });
      } else if (activeTab === "stations") {
        await createStation({
          codigoEstacion: newRecord.id.toUpperCase(), nombre: newRecord.name,
          direccion: newRecord.address, distrito: newRecord.borough,
          latitud: null, longitud: null, fechaInauguracion: null,
          cantidadAccesos: newRecord.accesses, cantidadPlataformas: newRecord.platforms,
          tipoEstacion: newRecord.stationType, estadoOperativo: "OPERATIVA",
          horaApertura: "00:00", horaCierre: "23:59", accesibleDiscapacidad: newRecord.accessible,
        });
      } else if (activeTab === "routes") {
        await createRoute({
          codigoRuta: newRecord.id.toUpperCase(), idLinea: newRecord.line,
          idEstacionOrigen: Number(newRecord.originId), idEstacionDestino: Number(newRecord.destinationId),
          sentido: newRecord.directionCode, tipoServicio: newRecord.serviceCode,
          distanciaTotalKm: newRecord.distance, duracionEstimadaMin: newRecord.duration,
          fechaVigenciaInicio: null, fechaVigenciaFin: null,
        });
      }
      setIsFormOpen(false);
      retryLines();
    } catch (error) {
      setFormError(error?.message ?? "No fue posible guardar el registro.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteRecord({ record }) {
    if (activeTab === "lines") {
      await deactivateLine(record.id);
    } else if (activeTab === "stations") {
      await deactivateStation(record.apiId);
    } else if (activeTab === "routes") {
      await deactivateRoute(record.apiId);
    }
    retryLines();
  }

  function lineForId(lineId) {
    return lines.find((line) => line.id === lineId);
  }

  function retryLines() {
    setLineRequest({ status: "loading", error: "" });
    setLineRequestVersion((version) => version + 1);
  }

  return (
    <section className="network-page" aria-labelledby="network-page-title">
      <header className="network-heading">
        <div className="network-heading__copy">
          <div className="network-context" aria-label="Contexto de los datos">
            <span>Fuente: API protegida</span>
            <span>Persistencia Oracle</span>
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
          disabled={!canWrite}
          title={!canWrite ? "Tu rol permite consultar, pero no modificar la red" : undefined}
        >
          <CirclePlus size={17} aria-hidden="true" />
          {actionLabels[activeTab]}
        </button>
      </header>

      <DeleteRecordNotice
        message={deletion.notice}
        onDismiss={deletion.dismissNotice}
      />

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
          aria-busy={lineRequest.status === "loading"}
          tabIndex={0}
        >
          {activeTab === "lines" && lineRequest.status === "loading" && (
            <div className="network-request-state" role="status" aria-live="polite">
              <RefreshCw size={25} aria-hidden="true" />
              <strong>Cargando líneas registradas</strong>
              <span>Consultando la fuente operativa protegida.</span>
            </div>
          )}

          {activeTab === "lines" && lineRequest.status === "error" && (
            <div className="network-request-state network-request-state--error" role="alert">
              <TriangleAlert size={25} aria-hidden="true" />
              <strong>No se pudieron cargar las líneas</strong>
              <span>{lineRequest.error}</span>
              <button type="button" onClick={retryLines}>
                <RefreshCw size={14} aria-hidden="true" />
                Reintentar consulta
              </button>
            </div>
          )}

          {activeTab === "lines" &&
            lineRequest.status === "success" &&
            lines.length === 0 && (
              <div className="network-request-state" role="status">
                <TrainFront size={27} aria-hidden="true" />
                <strong>No hay líneas registradas</strong>
                <span>El servicio respondió correctamente sin registros disponibles.</span>
              </div>
            )}

          {activeTab === "lines" &&
            lineRequest.status === "success" &&
            lines.length > 0 && (
            <div className="network-lines-desk">
            <aside className="network-line-index" aria-labelledby="network-line-index-title">
              <div className="network-line-index__header">
                <div>
                  <span className="network-section-label">Control de servicio</span>
                  <h3 id="network-line-index-title">Índice de líneas</h3>
                </div>
                <p>
                  {lines.length} registradas · {lineAttentionCount}{" "}
                  {lineAttentionCount === 1 ? "requiere" : "requieren"} atención
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

                  <div className="network-read-only-notice" role="note">
                    <LockKeyhole size={15} aria-hidden="true" />
                    <span>Los cambios se validan por rol y se persisten en Oracle.</span>
                    <DeleteRecordAction
                      id={effectiveSelectedLine.id}
                      label={`línea ${effectiveSelectedLine.id}: ${effectiveSelectedLine.name}`}
                      record={effectiveSelectedLine}
                      onRequest={canWrite ? deletion.requestDelete : undefined}
                      variant="labeled"
                    />
                  </div>

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

                  <section className="network-detail-section" aria-labelledby="line-operation-title">
                    <div className="network-section-heading">
                      <div>
                        <span className="network-section-label">Lecturas del servicio</span>
                        <h4 id="line-operation-title">Situación operativa registrada</h4>
                      </div>
                      <span className="network-record-count">Solo lectura</span>
                    </div>

                    <dl className="network-operational-readings">
                      <div>
                        <dt>Rutas activas</dt>
                        <dd>{effectiveSelectedLine.activeRoutes}</dd>
                      </div>
                      <div>
                        <dt>Rutas afectadas</dt>
                        <dd>{effectiveSelectedLine.affectedRoutes}</dd>
                      </div>
                      <div>
                        <dt>Viajes en curso</dt>
                        <dd>{effectiveSelectedLine.tripsInProgress}</dd>
                      </div>
                      <div>
                        <dt>Incidentes abiertos</dt>
                        <dd>{effectiveSelectedLine.openIncidents}</dd>
                      </div>
                    </dl>
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
                        <th scope="col" className="record-delete-cell">Acciones</th>
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
                          <td className="record-delete-cell">
                            <DeleteRecordAction
                              id={station.id}
                              label={`estación ${station.name}`}
                              record={station}
                              onRequest={canWrite ? deletion.requestDelete : undefined}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="network-empty">
                  <Search size={25} aria-hidden="true" />
                  <strong>
                    {stations.length === 0
                      ? "No hay estaciones disponibles"
                      : "Sin estaciones coincidentes"}
                  </strong>
                  <span>
                    {stations.length === 0
                      ? "Oracle no devolvió estaciones registradas."
                      : "Ajusta la búsqueda o el filtro de estado."}
                  </span>
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
                        <th scope="col" className="record-delete-cell">Acciones</th>
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
                            <td className="record-delete-cell">
                              <DeleteRecordAction
                                id={route.id}
                                label={`ruta ${route.id}: ${route.origin} a ${route.destination}`}
                                record={route}
                                onRequest={canWrite ? deletion.requestDelete : undefined}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="network-empty">
                  <Search size={25} aria-hidden="true" />
                  <strong>
                    {routes.length === 0
                      ? "No hay rutas disponibles"
                      : "Sin rutas coincidentes"}
                  </strong>
                  <span>
                    {routes.length === 0
                      ? "Oracle no devolvió rutas registradas."
                      : "Ajusta la búsqueda o el filtro de estado."}
                  </span>
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
          availableStations={stations}
          isSubmitting={isSubmitting}
          error={formError}
          onClose={() => {
            if (!isSubmitting) setIsFormOpen(false);
          }}
          onSubmit={handleCreateRecord}
        />
      )}

      {deletion.pendingDelete && (
        <ConfirmDeleteModal
          target={deletion.pendingDelete}
          isDeleting={deletion.isDeleting}
          error={deletion.error}
          onCancel={deletion.cancelDelete}
          onConfirm={deletion.confirmDelete}
          restoreFocus={deletion.restoreFocus}
        />
      )}
    </section>
  );
}

export default NetworkManagement;
