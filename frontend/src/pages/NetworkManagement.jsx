import { useMemo, useState } from "react";
import {
  Accessibility,
  ArrowRight,
  Building2,
  CirclePlus,
  Info,
  MapPinned,
  MoreHorizontal,
  Route,
  Search,
  TrainFront,
  X,
} from "lucide-react";
import {
  metroLines,
  metroRoutes,
  metroStations,
} from "../data/networkData";
import "../styles/network.css";

const tabs = [
  {
    id: "lines",
    label: "Líneas",
    count: metroLines.length,
  },
  {
    id: "stations",
    label: "Estaciones",
    count: metroStations.length,
  },
  {
    id: "routes",
    label: "Rutas",
    count: metroRoutes.length,
  },
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

function getLineColor(lineId) {
  return metroLines.find((line) => line.id === lineId)?.color ?? "#475467";
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

function StationsTable({ records }) {
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
                    style={{ "--network-line-color": getLineColor(line) }}
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

function RoutesTable({ records }) {
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
                    "--network-line-color": getLineColor(routeItem.line),
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
  const [showNotice, setShowNotice] = useState(false);

  const filteredRecords = useMemo(() => {
    const source = {
      lines: metroLines,
      stations: metroStations,
      routes: metroRoutes,
    }[activeTab];

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
          onClick={() => setShowNotice(true)}
        >
          <CirclePlus size={18} />
          {actionLabels[activeTab]}
        </button>
      </section>

      {showNotice && (
        <div className="network-notice">
          <Info size={18} />

          <div>
            <strong>Formulario pendiente de conexión</strong>
            <span>
              En el siguiente paso agregaremos el formulario para crear y
              modificar registros.
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

      <section className="network-summary">
        <article>
          <TrainFront size={20} />
          <div>
            <strong>{metroLines.length}</strong>
            <span>Líneas registradas</span>
          </div>
        </article>

        <article>
          <Building2 size={20} />
          <div>
            <strong>{metroStations.length}</strong>
            <span>Estaciones registradas</span>
          </div>
        </article>

        <article>
          <Route size={20} />
          <div>
            <strong>{metroRoutes.length}</strong>
            <span>Rutas configuradas</span>
          </div>
        </article>

        <article>
          <MapPinned size={20} />
          <div>
            <strong>
              {
                metroStations.filter((station) => station.accessible)
                  .length
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
                activeTab === tab.id ? "network-tab network-tab--active" : "network-tab"
              }
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
              <span>{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="network-toolbar">
          <label className="network-search">
            <Search size={18} />

            <input
              type="search"
              value={searchTerm}
              placeholder={`Buscar en ${activeTab === "lines" ? "líneas" : activeTab === "stations" ? "estaciones" : "rutas"}...`}
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
            <StationsTable records={filteredRecords} />
          )}

          {activeTab === "routes" && (
            <RoutesTable records={filteredRecords} />
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
    </div>
  );
}

export default NetworkManagement;