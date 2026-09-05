import { useMemo, useState } from "react";
import {
  CirclePlus,
  ClipboardList,
  Info,
  MoreHorizontal,
  PackageSearch,
  Search,
  TrainFront,
  TriangleAlert,
  Wrench,
  X,
} from "lucide-react";
import {
  equipment,
  maintenanceOrders,
  spareParts,
} from "../data/maintenanceData";
import MaintenanceFormModal from "../components/MaintenanceFormModal";
import "../styles/maintenance.css";

const tabs = [
  { id: "orders", label: "Órdenes de trabajo" },
  { id: "equipment", label: "Equipos" },
  { id: "parts", label: "Repuestos" },
];

const statusOptions = {
  orders: [
    "Todos",
    "Pendiente",
    "Programada",
    "En progreso",
    "Completada",
    "Cancelada",
  ],
  equipment: ["Todos", "Operativo", "Mantenimiento", "Inactivo"],
  parts: ["Todos", "Disponible", "Stock bajo", "Agotado"],
};

const actionLabels = {
  orders: "Nueva orden",
  equipment: "Nuevo equipo",
  parts: "Nuevo repuesto",
};

function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function getStatusClass(status) {
  const normalizedStatus = normalizeText(status);

  if (
    normalizedStatus === "completada" ||
    normalizedStatus === "operativo" ||
    normalizedStatus === "disponible"
  ) {
    return "maintenance-status maintenance-status--success";
  }

  if (normalizedStatus === "en progreso") {
    return "maintenance-status maintenance-status--info";
  }

  if (
    normalizedStatus === "pendiente" ||
    normalizedStatus === "programada" ||
    normalizedStatus === "mantenimiento" ||
    normalizedStatus === "stock bajo"
  ) {
    return "maintenance-status maintenance-status--warning";
  }

  return "maintenance-status maintenance-status--danger";
}

function getPriorityClass(priority) {
  return `maintenance-priority maintenance-priority--${normalizeText(
    priority,
  )}`;
}

function createNextId(prefix, records) {
  const highestNumber = records.reduce((highest, record) => {
    const number = Number(String(record.id || "").replace(/\D/g, ""));
    return Number.isNaN(number) ? highest : Math.max(highest, number);
  }, 0);

  return `${prefix}-${String(highestNumber + 1).padStart(3, "0")}`;
}

function MaintenanceManagement() {
  const [activeTab, setActiveTab] = useState("orders");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [orderRows, setOrderRows] = useState(maintenanceOrders);
  const [equipmentRows, setEquipmentRows] = useState(equipment);
  const [partRows, setPartRows] = useState(spareParts);

  const currentRows = useMemo(() => {
    if (activeTab === "equipment") {
      return equipmentRows;
    }

    if (activeTab === "parts") {
      return partRows;
    }

    return orderRows;
  }, [activeTab, orderRows, equipmentRows, partRows]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);

    return currentRows.filter((record) => {
      const matchesSearch =
        normalizedSearch === "" ||
        Object.values(record).some((value) =>
          normalizeText(value).includes(normalizedSearch),
        );

      const matchesStatus =
        selectedStatus === "Todos" ||
        normalizeText(record.status) === normalizeText(selectedStatus);

      return matchesSearch && matchesStatus;
    });
  }, [currentRows, searchTerm, selectedStatus]);

  const activeOrders = orderRows.filter(
    (order) =>
      normalizeText(order.status) !== "completada" &&
      normalizeText(order.status) !== "cancelada",
  ).length;

  const criticalOrders = orderRows.filter(
    (order) => normalizeText(order.priority) === "critica",
  ).length;

  const lowStockParts = partRows.filter(
    (part) =>
      normalizeText(part.status) === "stock bajo" ||
      Number(part.stock) <= Number(part.minimumStock),
  ).length;

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    setSearchTerm("");
    setSelectedStatus("Todos");
    setSuccessMessage("");
  }

  function handleSave(newRecord) {
    if (activeTab === "orders") {
      const createdOrder = {
        ...newRecord,
        id: createNextId("MAN", orderRows),
      };

      setOrderRows((currentRowsValue) => [
        createdOrder,
        ...currentRowsValue,
      ]);

      setSuccessMessage(
        `La orden ${createdOrder.id} fue creada correctamente.`,
      );
    }

    if (activeTab === "equipment") {
      const createdEquipment = {
        ...newRecord,
        id: createNextId("EQ", equipmentRows),
      };

      setEquipmentRows((currentRowsValue) => [
        createdEquipment,
        ...currentRowsValue,
      ]);

      setSuccessMessage(
        `El equipo ${createdEquipment.id} fue registrado correctamente.`,
      );
    }

    if (activeTab === "parts") {
      const createdPart = {
        ...newRecord,
        id: createNextId("REP", partRows),
      };

      setPartRows((currentRowsValue) => [
        createdPart,
        ...currentRowsValue,
      ]);

      setSuccessMessage(
        `El repuesto ${createdPart.id} fue registrado correctamente.`,
      );
    }

    setShowForm(false);
    setSearchTerm("");
    setSelectedStatus("Todos");
  }

  function renderOrdersTable() {
    return (
      <table className="maintenance-table">
        <thead>
          <tr>
            <th>Orden</th>
            <th>Activo</th>
            <th>Taller</th>
            <th>Técnico</th>
            <th>Prioridad</th>
            <th>Fecha</th>
            <th>Duración</th>
            <th>Costo</th>
            <th>Estado</th>
            <th aria-label="Acciones" />
          </tr>
        </thead>

        <tbody>
          {filteredRows.map((order) => (
            <tr key={order.id}>
              <td>
                <div className="maintenance-identity">
                  <strong>{order.title}</strong>
                  <span>{order.id}</span>
                </div>
              </td>

              <td>
                <div className="maintenance-asset">
                  <strong>{order.asset}</strong>
                  <span>{order.assetType}</span>
                </div>
              </td>

              <td>{order.workshop}</td>
              <td>{order.technician}</td>

              <td>
                <span className={getPriorityClass(order.priority)}>
                  {order.priority}
                </span>
              </td>

              <td>{formatDate(order.scheduledDate)}</td>

              <td>
                <span className="maintenance-hours">
                  {order.estimatedHours} h
                </span>
              </td>

              <td>
                <span className="maintenance-cost">
                  {formatCurrency(order.estimatedCost)}
                </span>
              </td>

              <td>
                <span className={getStatusClass(order.status)}>
                  {order.status}
                </span>
              </td>

              <td>
                <button
                  type="button"
                  className="maintenance-row-action"
                  aria-label={`Opciones de ${order.id}`}
                >
                  <MoreHorizontal />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  function renderEquipmentTable() {
    return (
      <table className="maintenance-table">
        <thead>
          <tr>
            <th>Equipo</th>
            <th>Categoría</th>
            <th>Número de serie</th>
            <th>Fabricante</th>
            <th>Ubicación</th>
            <th>Último mantenimiento</th>
            <th>Próximo mantenimiento</th>
            <th>Condición</th>
            <th>Estado</th>
            <th aria-label="Acciones" />
          </tr>
        </thead>

        <tbody>
          {filteredRows.map((item) => (
            <tr key={item.id}>
              <td>
                <div className="equipment-identity">
                  <TrainFront />

                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.id}</span>
                  </div>
                </div>
              </td>

              <td>
                <span className="equipment-category">{item.category}</span>
              </td>

              <td>
                <span className="serial-number">{item.serialNumber}</span>
              </td>

              <td>{item.manufacturer}</td>
              <td>{item.location}</td>
              <td>{formatDate(item.lastMaintenance)}</td>
              <td>{formatDate(item.nextMaintenance)}</td>

              <td>
                <span className="equipment-condition">
                  {item.condition}
                </span>
              </td>

              <td>
                <span className={getStatusClass(item.status)}>
                  {item.status}
                </span>
              </td>

              <td>
                <button
                  type="button"
                  className="maintenance-row-action"
                  aria-label={`Opciones de ${item.id}`}
                >
                  <MoreHorizontal />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  function renderPartsTable() {
    return (
      <table className="maintenance-table">
        <thead>
          <tr>
            <th>Repuesto</th>
            <th>Categoría</th>
            <th>Existencias</th>
            <th>Stock mínimo</th>
            <th>Unidad</th>
            <th>Ubicación</th>
            <th>Proveedor</th>
            <th>Estado</th>
            <th aria-label="Acciones" />
          </tr>
        </thead>

        <tbody>
          {filteredRows.map((part) => {
            const hasLowStock =
              Number(part.stock) <= Number(part.minimumStock);

            return (
              <tr key={part.id}>
                <td>
                  <div className="part-identity">
                    <PackageSearch />

                    <div>
                      <strong>{part.name}</strong>
                      <span>{part.id}</span>
                    </div>
                  </div>
                </td>

                <td>
                  <span className="part-category">{part.category}</span>
                </td>

                <td>
                  <span
                    className={
                      hasLowStock
                        ? "stock-value stock-value--low"
                        : "stock-value"
                    }
                  >
                    {part.stock}
                  </span>
                </td>

                <td>{part.minimumStock}</td>
                <td>{part.unit}</td>
                <td>{part.location}</td>
                <td>{part.supplier}</td>

                <td>
                  <span className={getStatusClass(part.status)}>
                    {part.status}
                  </span>
                </td>

                <td>
                  <button
                    type="button"
                    className="maintenance-row-action"
                    aria-label={`Opciones de ${part.id}`}
                  >
                    <MoreHorizontal />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  function renderCurrentTable() {
    if (filteredRows.length === 0) {
      return (
        <div className="maintenance-empty">
          <Search />
          <strong>No se encontraron resultados</strong>
          <p>Prueba con otra búsqueda o cambia el filtro seleccionado.</p>
        </div>
      );
    }

    if (activeTab === "equipment") {
      return renderEquipmentTable();
    }

    if (activeTab === "parts") {
      return renderPartsTable();
    }

    return renderOrdersTable();
  }

  return (
    <div className="maintenance-page">
      <header className="maintenance-heading">
        <div>
          <span className="maintenance-heading__eyebrow">
            Gestión técnica
          </span>

          <h2>Mantenimiento</h2>

          <p>
            Administra las órdenes de trabajo, equipos y repuestos del
            sistema.
          </p>
        </div>

        <button
          type="button"
          className="maintenance-primary-button"
          onClick={() => {
            setSuccessMessage("");
            setShowForm(true);
          }}
        >
          <CirclePlus />
          {actionLabels[activeTab]}
        </button>
      </header>

      {successMessage && (
        <div className="maintenance-notice">
          <Info />
          <span>{successMessage}</span>

          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            aria-label="Cerrar mensaje"
          >
            <X />
          </button>
        </div>
      )}

      <section className="maintenance-summary">
        <article>
          <ClipboardList />

          <div>
            <strong>{orderRows.length}</strong>
            <span>Órdenes registradas</span>
          </div>
        </article>

        <article>
          <Wrench />

          <div>
            <strong>{activeOrders}</strong>
            <span>Trabajos pendientes</span>
          </div>
        </article>

        <article>
          <TriangleAlert />

          <div>
            <strong>{criticalOrders}</strong>
            <span>Órdenes críticas</span>
          </div>
        </article>

        <article>
          <PackageSearch />

          <div>
            <strong>{lowStockParts}</strong>
            <span>Repuestos con stock bajo</span>
          </div>
        </article>
      </section>

      <section className="maintenance-panel">
        <nav className="maintenance-tabs" aria-label="Secciones">
          {tabs.map((tab) => {
            const count =
              tab.id === "orders"
                ? orderRows.length
                : tab.id === "equipment"
                  ? equipmentRows.length
                  : partRows.length;

            return (
              <button
                type="button"
                key={tab.id}
                className={
                  activeTab === tab.id
                    ? "maintenance-tab maintenance-tab--active"
                    : "maintenance-tab"
                }
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label}
                <span>{count}</span>
              </button>
            );
          })}
        </nav>

        <div className="maintenance-toolbar">
          <label className="maintenance-search">
            <Search />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={`Buscar en ${
                activeTab === "orders"
                  ? "órdenes"
                  : activeTab === "equipment"
                    ? "equipos"
                    : "repuestos"
              }...`}
            />
          </label>

          <label className="maintenance-filter">
            Estado:

            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
            >
              {statusOptions[activeTab].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <span className="maintenance-results">
            {filteredRows.length} resultados
          </span>
        </div>

        <div className="maintenance-table-wrapper">
          {renderCurrentTable()}
        </div>
      </section>

      {showForm && (
        <MaintenanceFormModal
          type={activeTab}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default MaintenanceManagement;