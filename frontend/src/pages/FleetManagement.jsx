import { useMemo, useState } from "react";
import {
  Accessibility,
  CirclePlus,
  Gauge,
  MoreHorizontal,
  Search,
  TrainFront,
  Warehouse,
  Wrench,
} from "lucide-react";
import FleetFormModal from "../components/FleetFormModal";
import {
  deposits,
  trains,
  wagons,
} from "../data/fleetData";
import "../styles/fleet.css";

const tabs = [
  {
    id: "trains",
    label: "Trenes",
  },
  {
    id: "wagons",
    label: "Vagones",
  },
  {
    id: "deposits",
    label: "Depósitos",
  },
];

const statusOptions = {
  trains: [
    "Todos",
    "Disponible",
    "En operación",
    "En mantenimiento",
    "Fuera de servicio",
  ],
  wagons: [
    "Todos",
    "Operativo",
    "En mantenimiento",
    "Fuera de servicio",
  ],
  deposits: [
    "Todos",
    "Operativo",
    "Capacidad limitada",
  ],
};

const actionLabels = {
  trains: "Registrar tren",
  wagons: "Registrar vagón",
  deposits: "Nuevo depósito",
};

function normalizeText(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getStatusClass(status) {
  if (
    status === "Disponible" ||
    status === "Operativo" ||
    status === "En operación"
  ) {
    return "fleet-status fleet-status--success";
  }

  if (
    status === "En mantenimiento" ||
    status === "Capacidad limitada"
  ) {
    return "fleet-status fleet-status--warning";
  }

  return "fleet-status fleet-status--danger";
}

function TrainsTable({ records }) {
  return (
    <table className="fleet-table">
      <thead>
        <tr>
          <th>Tren</th>
          <th>Modelo</th>
          <th>Fabricante</th>
          <th>Capacidad</th>
          <th>Composición</th>
          <th>Kilometraje</th>
          <th>Depósito</th>
          <th>Próxima inspección</th>
          <th>Estado</th>
          <th aria-label="Acciones" />
        </tr>
      </thead>

      <tbody>
        {records.map((train) => (
          <tr key={train.id}>
            <td>
              <div className="fleet-identity">
                <span className="fleet-icon">
                  <TrainFront size={18} />
                </span>

                <div>
                  <strong>{train.id}</strong>
                  <span>Fabricado en {train.year}</span>
                </div>
              </div>
            </td>

            <td>{train.model}</td>
            <td>{train.manufacturer}</td>

            <td>
              {train.capacity.toLocaleString("es-GT")}
            </td>

            <td>
              <span className="wagon-count">
                {train.wagons} vagones
              </span>
            </td>

            <td>
              {train.mileage.toLocaleString("es-GT")} km
            </td>

            <td>
              <span className="deposit-code">
                {train.deposit}
              </span>
            </td>

            <td>
              <div className="inspection-date">
                <strong>{train.nextInspection}</strong>
                <span>Última: {train.lastInspection}</span>
              </div>
            </td>

            <td>
              <span className={getStatusClass(train.status)}>
                {train.status}
              </span>
            </td>

            <td>
              <button
                type="button"
                className="fleet-row-action"
                aria-label={`Opciones del tren ${train.id}`}
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

function WagonsTable({ records }) {
  return (
    <table className="fleet-table">
      <thead>
        <tr>
          <th>Vagón</th>
          <th>Tipo</th>
          <th>Tren asignado</th>
          <th>Posición</th>
          <th>Capacidad sentada</th>
          <th>Capacidad de pie</th>
          <th>Año</th>
          <th>Accesibilidad</th>
          <th>Estado</th>
          <th aria-label="Acciones" />
        </tr>
      </thead>

      <tbody>
        {records.map((wagon) => (
          <tr key={wagon.id}>
            <td>
              <div className="fleet-identity">
                <span className="wagon-icon">
                  <TrainFront size={17} />
                </span>

                <div>
                  <strong>{wagon.id}</strong>
                  <span>Número de serie</span>
                </div>
              </div>
            </td>

            <td>
              <span className="wagon-type">
                {wagon.type}
              </span>
            </td>

            <td>
              <span className="train-assignment">
                {wagon.train}
              </span>
            </td>

            <td>Posición {wagon.position}</td>
            <td>{wagon.seats}</td>
            <td>{wagon.standing}</td>
            <td>{wagon.year}</td>

            <td>
              <span
                className={`fleet-accessibility ${
                  wagon.accessible
                    ? "fleet-accessibility--available"
                    : ""
                }`}
              >
                <Accessibility size={15} />

                {wagon.accessible
                  ? "Disponible"
                  : "No disponible"}
              </span>
            </td>

            <td>
              <span className={getStatusClass(wagon.status)}>
                {wagon.status}
              </span>
            </td>

            <td>
              <button
                type="button"
                className="fleet-row-action"
                aria-label={`Opciones del vagón ${wagon.id}`}
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

function DepositsTable({ records }) {
  return (
    <table className="fleet-table">
      <thead>
        <tr>
          <th>Depósito</th>
          <th>Ubicación</th>
          <th>Capacidad total</th>
          <th>Trenes asignados</th>
          <th>Ocupación</th>
          <th>Estado</th>
          <th aria-label="Acciones" />
        </tr>
      </thead>

      <tbody>
        {records.map((deposit) => {
          const occupation =
            (deposit.assignedTrains / deposit.capacity) * 100;

          return (
            <tr key={deposit.id}>
              <td>
                <div className="fleet-identity">
                  <span className="deposit-icon">
                    <Warehouse size={18} />
                  </span>

                  <div>
                    <strong>{deposit.name}</strong>
                    <span>{deposit.id}</span>
                  </div>
                </div>
              </td>

              <td>{deposit.location}</td>
              <td>{deposit.capacity} trenes</td>
              <td>{deposit.assignedTrains}</td>

              <td>
                <div className="occupation">
                  <div className="occupation__track">
                    <span
                      style={{
                        width: `${Math.min(
                          occupation,
                          100,
                        )}%`,
                      }}
                    />
                  </div>

                  <small>{occupation.toFixed(0)}%</small>
                </div>
              </td>

              <td>
                <span className={getStatusClass(deposit.status)}>
                  {deposit.status}
                </span>
              </td>

              <td>
                <button
                  type="button"
                  className="fleet-row-action"
                  aria-label={`Opciones de ${deposit.name}`}
                >
                  <MoreHorizontal size={18} />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function FleetManagement() {
  const [activeTab, setActiveTab] = useState("trains");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [fleetRecords, setFleetRecords] = useState({
    trains,
    wagons,
    deposits,
  });

  const availableTrainCount = fleetRecords.trains.filter(
    (train) => train.status === "Disponible",
  ).length;

  const maintenanceTrainCount = fleetRecords.trains.filter(
    (train) => train.status === "En mantenimiento",
  ).length;

  const totalCapacity = fleetRecords.trains.reduce(
    (total, train) => total + train.capacity,
    0,
  );

  const filteredRecords = useMemo(() => {
    return fleetRecords[activeTab].filter((record) => {
      const matchesSearch = normalizeText(
        Object.values(record).flat().join(" "),
      ).includes(normalizeText(searchTerm));

      const matchesStatus =
        statusFilter === "Todos" ||
        record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [activeTab, fleetRecords, searchTerm, statusFilter]);

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    setSearchTerm("");
    setStatusFilter("Todos");
    setIsFormOpen(false);
  }

  function handleCreate(newRecord) {
    setFleetRecords((currentRecords) => ({
      ...currentRecords,
      [activeTab]: [
        ...currentRecords[activeTab],
        newRecord,
      ],
    }));

    setIsFormOpen(false);
  }

  return (
    <div className="fleet-page">
      <section className="fleet-heading">
        <div>
          <span className="fleet-heading__eyebrow">
            Material rodante
          </span>

          <h2>Trenes y vagones</h2>

          <p>
            Consulta la disponibilidad, composición y mantenimiento de la
            flota.
          </p>
        </div>

        <button
          type="button"
          className="fleet-primary-button"
          onClick={() => setIsFormOpen(true)}
        >
          <CirclePlus size={18} />
          {actionLabels[activeTab]}
        </button>
      </section>

      <section className="fleet-summary">
        <article>
          <TrainFront size={20} />

          <div>
            <strong>{fleetRecords.trains.length}</strong>
            <span>Trenes registrados</span>
          </div>
        </article>

        <article>
          <Gauge size={20} />

          <div>
            <strong>{availableTrainCount}</strong>
            <span>Trenes disponibles</span>
          </div>
        </article>

        <article>
          <Wrench size={20} />

          <div>
            <strong>{maintenanceTrainCount}</strong>
            <span>En mantenimiento</span>
          </div>
        </article>

        <article>
          <Accessibility size={20} />

          <div>
            <strong>
              {totalCapacity.toLocaleString("es-GT")}
            </strong>

            <span>Capacidad total</span>
          </div>
        </article>
      </section>

      <section className="fleet-panel">
        <div className="fleet-tabs">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              className={
                activeTab === tab.id
                  ? "fleet-tab fleet-tab--active"
                  : "fleet-tab"
              }
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
              <span>{fleetRecords[tab.id].length}</span>
            </button>
          ))}
        </div>

        <div className="fleet-toolbar">
          <label className="fleet-search">
            <Search size={18} />

            <input
              type="search"
              value={searchTerm}
              placeholder={`Buscar en ${
                activeTab === "trains"
                  ? "trenes"
                  : activeTab === "wagons"
                    ? "vagones"
                    : "depósitos"
              }...`}
              aria-label="Buscar registros"
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </label>

          <label className="fleet-filter">
            <span>Estado:</span>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              {statusOptions[activeTab].map((option) => (
                <option value={option} key={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <span className="fleet-results">
            {filteredRecords.length} resultados
          </span>
        </div>

        <div className="fleet-table-wrapper">
          {activeTab === "trains" && (
            <TrainsTable records={filteredRecords} />
          )}

          {activeTab === "wagons" && (
            <WagonsTable records={filteredRecords} />
          )}

          {activeTab === "deposits" && (
            <DepositsTable records={filteredRecords} />
          )}
        </div>

        {filteredRecords.length === 0 && (
          <div className="fleet-empty">
            <Search size={25} />
            <strong>No encontramos resultados</strong>

            <span>
              Prueba con otro texto o cambia el filtro seleccionado.
            </span>
          </div>
        )}
      </section>

      {isFormOpen && (
        <FleetFormModal
          type={activeTab}
          availableTrains={fleetRecords.trains}
          availableDeposits={fleetRecords.deposits}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
}

export default FleetManagement;