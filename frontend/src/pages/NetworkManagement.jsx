import { useMemo, useState } from "react";
import {
  Accessibility,
  ArrowRight,
  Building2,
  CirclePlus,
  MapPinned,
  MoreHorizontal,
  Route,
  Search,
  TrainFront,
} from "lucide-react";
import NetworkFormModal from "../components/NetworkFormModal";
import {
  metroLines,
  metroRoutes,
  metroStations,
} from "../data/networkData";
import "../styles/network.css";

const tabs = [
  { id: "lines", label: "Líneas" },
  { id: "stations", label: "Estaciones" },
  { id: "routes", label: "Rutas" },
];

const statusOptions = {
  lines: ["Todos", "Operativa", "Con demoras", "Mantenimiento"],
  stations: ["Todos", "Operativa", "Mantenimiento"],
  routes: ["Todos", "Activa", "Con demoras", "Servicio parcial"],
};

const actionLabels = {
  lines: "Nueva línea",
  stations: "Nueva estación",
  routes: "Nueva ruta",
};

function normalizeText(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getStatusClass(status) {
  if (status === "Operativa" || status === "Activa") {
    return "network-status network-status--success";
  }

  if (status === "Mantenimiento" || status === "Servicio parcial") {
    return "network-status network-status--warning";
  }

  return "network-status network-status--danger";
}

function getLineColor(lineId, availableLines) {
  return (
    availableLines.find((line) => line.id === lineId)?.color ?? "#475467"
  );
}

function LinesTable({ records }) {
  return (
    <table className="network-table">
      <thead>
        <tr>
          <th>Línea</th>
          <th>Terminales</th>
          <th>Servicio</th>
          <th>Estaciones</th>
          <th>Longitud</th>
          <th>Estado</th>
          <th aria-label="Acciones" />
        </tr>
      </thead>

      <tbody>
        {records.map((line) => (
          <tr key={line.id}>
            <td>
              <div className="network-identity">
                <span
                  className="network-line-code"
                  style={{ "--network-line-color": line.color }}
                >
                  {line.id}
                </span>

                <div>
                  <strong>{line.name}</strong>
                  <span>Código {line.id}</span>
                </div>
              </div>
            </td>

            <td>
              <div className="terminal-route">
                <span>{line.origin}</span>
                <ArrowRight size={13} />
                <span>{line.destination}</span>
              </div>
            </td>

            <td>
              <span className="service-badge">{line.service}</span>
            </td>

            <td>{line.stations}</td>
            <td>{line.length} km</td>

            <td>
              <span className={getStatusClass(line.status)}>
                {line.status}
              </span>
            </td>

            <td>
              <button
                type="button"
                className="row-action"
                aria-label={`Opciones de la línea ${line.id}`}
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

function StationsTable({ records, availableLines }) {
  return (
    <table className="network-table">
      <thead>
        <tr>
          <th>Estación</th>
          <th>Distrito</th>
          <th>Líneas</th>
          <th>Plataformas</th>
          <th>Accesos</th>
          <th>Accesibilidad</th>
          <th>Estado</th>
          <th aria-label="Acciones" />
        </tr>
      </thead>

      <tbody>
        {records.map((station) => (
          <tr key={station.id}>
            <td>
              <div className="network-identity">
                <span className="station-icon">
                  <Building2 size={18} />
                </span>

                <div>
                  <strong>{station.name}</strong>
                  <span>{station.id}</span>
                </div>
              </div>
            </td>

            <td>{station.borough}</td>

            <td>
              <div className="mini-lines">
                {station.lines.map((line) => (
                  <span
                    key={line}
                    style={{
                      "--network-line-color": getLineColor(
                        line,
                        availableLines,
                      ),
                    }}
                  >
                    {line}
                  </span>
                ))}
              </div>
            </td>

            <td>{station.platforms}</td>
            <td>{station.accesses}</td>

            <td>
              <span
                className={`accessibility-label ${
                  station.accessible
                    ? "accessibility-label--available"
                    : ""
                }`}
              >
                <Accessibility size={15} />
                {station.accessible ? "Disponible" : "No disponible"}
              </span>
            </td>

            <td>
              <span className={getStatusClass(station.status)}>
                {station.status}
              </span>
            </td>

            <td>
              <button
                type="button"
                className="row-action"
                aria-label={`Opciones de ${station.name}`}
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

function RoutesTable({ records, availableLines }) {
  return (
    <table className="network-table">
      <thead>
        <tr>
          <th>Ruta</th>
          <th>Recorrido</th>
          <th>Sentido</th>
          <th>Servicio</th>
          <th>Distancia</th>
          <th>Duración</th>
          <th>Estado</th>
          <th aria-label="Acciones" />
        </tr>
      </thead>

      <tbody>
        {records.map((routeItem) => (
          <tr key={routeItem.id}>
            <td>
              <div className="network-identity">
                <span
                  className="network-line-code"
                  style={{
                    "--network-line-color": getLineColor(
                      routeItem.line,
                      availableLines,
                    ),
                  }}
                >
                  {routeItem.line}
                </span>

                <div>
                  <strong>{routeItem.id}</strong>
                  <span>Línea {routeItem.line}</span>
                </div>
              </div>
            </td>

            <td>
              <div className="terminal-route">
                <span>{routeItem.origin}</span>
                <ArrowRight size={13} />
                <span>{routeItem.destination}</span>
              </div>
            </td>

            <td>{routeItem.direction}</td>

            <td>
              <span className="service-badge">{routeItem.service}</span>
            </td>

            <td>{routeItem.distance} km</td>
            <td>{routeItem.duration} min</td>

            <td>
              <span className={getStatusClass(routeItem.status)}>
                {routeItem.status}
              </span>
            </td>

            <td>
              <button
                type="button"
                className="row-action"
                aria-label={`Opciones de la ruta ${routeItem.id}`}
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

function NetworkManagement() {
  const [activeTab, setActiveTab] = useState("lines");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [networkRecords, setNetworkRecords] = useState({
    lines: metroLines,
    stations: metroStations,
    routes: metroRoutes,
  });

  const filteredRecords = useMemo(() => {
    return networkRecords[activeTab].filter((record) => {
      const matchesSearch = normalizeText(
        Object.values(record).flat().join(" "),
      ).includes(normalizeText(searchTerm));

      const matchesStatus =
        statusFilter === "Todos" || record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [activeTab, networkRecords, searchTerm, statusFilter]);

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    setSearchTerm("");
    setStatusFilter("Todos");
    setIsFormOpen(false);
  }

  function handleCreate(newRecord) {
    setNetworkRecords((currentRecords) => ({
      ...currentRecords,
      [activeTab]: [...currentRecords[activeTab], newRecord],
    }));

    setIsFormOpen(false);
  }

  return (
    <div className="network-page">
      <section className="network-heading">
        <div>
          <span className="network-heading__eyebrow">
            Infraestructura ferroviaria
          </span>

          <h2>Administración de la red</h2>

          <p>
            Consulta y administra las líneas, estaciones y rutas del sistema.
          </p>
        </div>

        <button
          type="button"
          className="network-primary-button"
          onClick={() => setIsFormOpen(true)}
        >
          <CirclePlus size={18} />
          {actionLabels[activeTab]}
        </button>
      </section>

      <section className="network-summary">
        <article>
          <TrainFront size={20} />

          <div>
            <strong>{networkRecords.lines.length}</strong>
            <span>Líneas registradas</span>
          </div>
        </article>

        <article>
          <Building2 size={20} />

          <div>
            <strong>{networkRecords.stations.length}</strong>
            <span>Estaciones registradas</span>
          </div>
        </article>

        <article>
          <Route size={20} />

          <div>
            <strong>{networkRecords.routes.length}</strong>
            <span>Rutas configuradas</span>
          </div>
        </article>

        <article>
          <MapPinned size={20} />

          <div>
            <strong>
              {
                networkRecords.stations.filter(
                  (station) => station.accessible,
                ).length
              }
            </strong>

            <span>Estaciones accesibles</span>
          </div>
        </article>
      </section>

      <section className="network-panel">
        <div className="network-tabs">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              className={
                activeTab === tab.id
                  ? "network-tab network-tab--active"
                  : "network-tab"
              }
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
              <span>{networkRecords[tab.id].length}</span>
            </button>
          ))}
        </div>

        <div className="network-toolbar">
          <label className="network-search">
            <Search size={18} />

            <input
              type="search"
              value={searchTerm}
              placeholder={`Buscar en ${
                activeTab === "lines"
                  ? "líneas"
                  : activeTab === "stations"
                    ? "estaciones"
                    : "rutas"
              }...`}
              aria-label="Buscar registros"
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <label className="network-filter">
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

          <span className="network-results">
            {filteredRecords.length} resultados
          </span>
        </div>

        <div className="network-table-wrapper">
          {activeTab === "lines" && (
            <LinesTable records={filteredRecords} />
          )}

          {activeTab === "stations" && (
            <StationsTable
              records={filteredRecords}
              availableLines={networkRecords.lines}
            />
          )}

          {activeTab === "routes" && (
            <RoutesTable
              records={filteredRecords}
              availableLines={networkRecords.lines}
            />
          )}
        </div>

        {filteredRecords.length === 0 && (
          <div className="network-empty">
            <Search size={25} />
            <strong>No encontramos resultados</strong>
            <span>Prueba con otro texto o cambia el filtro seleccionado.</span>
          </div>
        )}
      </section>

      {isFormOpen && (
        <NetworkFormModal
          type={activeTab}
          availableLines={networkRecords.lines}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
}

export default NetworkManagement;
