import { useMemo, useRef, useState } from "react";
import {
  CirclePlus,
  PackageSearch,
  Search,
  TrainFront,
  Wrench,
  X,
} from "lucide-react";
import {
  equipment,
  maintenanceOrders,
  spareParts,
} from "../data/maintenanceData";
import MaintenanceFormModal from "../components/MaintenanceFormModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import DeleteRecordAction, {
  DeleteRecordNotice,
} from "../components/DeleteRecordAction";
import useDeleteRecord, {
  getSelectionAfterDelete,
} from "../hooks/useDeleteRecord";
import "../styles/maintenance.css";

const tabs = [
  { id: "orders", label: "Órdenes de trabajo" },
  { id: "equipment", label: "Equipos" },
  { id: "parts", label: "Repuestos" },
];

const tabInformation = {
  orders: {
    action: "Nueva orden",
    singular: "orden",
    registerTitle: "Registro de órdenes",
    registerDescription: "Selecciona una orden para revisar sus datos registrados.",
    searchPlaceholder: "Buscar por orden, trabajo, activo, ubicación o persona…",
  },
  equipment: {
    action: "Nuevo equipo",
    singular: "equipo",
    registerTitle: "Registro de equipos",
    registerDescription: "Selecciona un equipo para consultar su ficha registrada.",
    searchPlaceholder: "Buscar por equipo, categoría, serie, fabricante o ubicación…",
  },
  parts: {
    action: "Nuevo repuesto",
    singular: "repuesto",
    registerTitle: "Registro de repuestos",
    registerDescription: "Selecciona un repuesto para consultar sus existencias registradas.",
    searchPlaceholder: "Buscar por repuesto, categoría, ubicación o proveedor…",
  },
};

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

function displayAssociation(value) {
  return hasRecordedValue(value)
    ? String(value)
    : "Sin asociación registrada";
}

function getOrderLocation(order) {
  return order.location ?? order.workshop;
}

function getOrderAssignee(order) {
  return order.assignedTo ?? order.technician;
}

function getOrderCost(order) {
  if (order.cost !== null && order.cost !== undefined) {
    return {
      label: "Costo registrado",
      value: order.cost,
    };
  }

  if (
    order.estimatedCost !== null &&
    order.estimatedCost !== undefined
  ) {
    return {
      label: "Costo estimado registrado",
      value: order.estimatedCost,
    };
  }

  return {
    label: "Costo registrado",
    value: null,
  };
}

function formatCurrency(value) {
  if (!hasRecordedValue(value)) {
    return "Sin registro";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatHours(value) {
  return hasRecordedValue(value) ? String(value) + " h" : "Sin registro";
}

function formatQuantity(value) {
  return hasRecordedValue(value) ? String(value) : "Sin registro";
}

function getStatusTone(status) {
  const normalizedStatus = normalizeText(status);

  if (
    normalizedStatus === "completada" ||
    normalizedStatus === "operativo" ||
    normalizedStatus === "disponible"
  ) {
    return "success";
  }

  if (normalizedStatus === "en progreso") {
    return "info";
  }

  if (
    normalizedStatus === "pendiente" ||
    normalizedStatus === "programada" ||
    normalizedStatus === "mantenimiento" ||
    normalizedStatus === "stock bajo"
  ) {
    return "warning";
  }

  if (
    normalizedStatus === "cancelada" ||
    normalizedStatus === "inactivo" ||
    normalizedStatus === "agotado"
  ) {
    return "danger";
  }

  return "neutral";
}

function getConditionTone(condition) {
  const normalizedCondition = normalizeText(condition);

  if (normalizedCondition === "fuera de servicio") {
    return "danger";
  }

  if (
    normalizedCondition === "requiere revision" ||
    normalizedCondition === "regular" ||
    normalizedCondition === "deficiente"
  ) {
    return "warning";
  }

  return "neutral";
}

function StatusMarker({ status }) {
  return (
    <span
      className="maintenance-status"
      data-tone={getStatusTone(status)}
    >
      <span className="maintenance-status__mark" aria-hidden="true" />
      {displayRecordedValue(status)}
    </span>
  );
}

function PriorityMarker({ priority }) {
  return (
    <span
      className="maintenance-priority"
      data-priority={normalizeText(priority)}
    >
      <span className="maintenance-priority__mark" aria-hidden="true" />
      {displayRecordedValue(priority)}
    </span>
  );
}

function ConditionMarker({ condition }) {
  return (
    <span
      className="maintenance-condition"
      data-tone={getConditionTone(condition)}
    >
      <span className="maintenance-condition__mark" aria-hidden="true" />
      {displayRecordedValue(condition)}
    </span>
  );
}

function createNextId(prefix, records) {
  const highestNumber = records.reduce((highest, record) => {
    const number = Number(String(record.id ?? "").replace(/\D/g, ""));
    return Number.isNaN(number) ? highest : Math.max(highest, number);
  }, 0);

  return prefix + "-" + String(highestNumber + 1).padStart(3, "0");
}

function recordMatchesFilters(record, type, filters) {
  const searchValues = {
    orders: [
      record.id,
      record.title,
      record.asset,
      record.assetType,
      getOrderLocation(record),
      getOrderAssignee(record),
    ],
    equipment: [
      record.id,
      record.name,
      record.category,
      record.serialNumber,
      record.manufacturer,
      record.location,
    ],
    parts: [
      record.id,
      record.name,
      record.category,
      record.location,
      record.supplier,
    ],
  };
  const normalizedSearch = normalizeText(filters.search);
  const matchesSearch =
    normalizedSearch === "" ||
    searchValues[type].some((value) =>
      normalizeText(value).includes(normalizedSearch),
    );
  const matchesStatus =
    filters.status === "Todos" ||
    normalizeText(record.status) === normalizeText(filters.status);

  return matchesSearch && matchesStatus;
}

function getRecordGroups(type, rows) {
  if (type === "orders") {
    const priorityRank = { critica: 0, alta: 1 };
    const highlighted = rows
      .filter((record) =>
        ["alta", "critica"].includes(normalizeText(record.priority)),
      )
      .sort(
        (first, second) =>
          priorityRank[normalizeText(first.priority)] -
          priorityRank[normalizeText(second.priority)],
      );
    const highlightedIds = new Set(highlighted.map((record) => record.id));

    return [
      {
        id: "recorded-priority",
        title: "Prioridad alta o crítica registrada",
        description:
          "La prioridad declarada se muestra por separado del estado de la orden.",
        records: highlighted,
      },
      {
        id: "remaining-orders",
        title: highlighted.length > 0 ? "Registro restante" : "Registro",
        records: rows.filter((record) => !highlightedIds.has(record.id)),
      },
    ];
  }

  if (type === "equipment") {
    const exceptional = rows.filter(
      (record) => normalizeText(record.status) !== "operativo",
    );
    const exceptionalIds = new Set(
      exceptional.map((record) => record.id),
    );

    return [
      {
        id: "non-operational-status",
        title: "Estado distinto de Operativo",
        description:
          "Estado y condición permanecen como lecturas independientes.",
        records: exceptional,
      },
      {
        id: "operational-equipment",
        title: exceptional.length > 0 ? "Registro operativo" : "Registro",
        records: rows.filter((record) => !exceptionalIds.has(record.id)),
      },
    ];
  }

  const availabilityRecords = rows.filter((record) =>
    ["stock bajo", "agotado"].includes(normalizeText(record.status)),
  );
  const availabilityIds = new Set(
    availabilityRecords.map((record) => record.id),
  );

  return [
    {
      id: "recorded-availability",
      title: "Stock bajo o agotado registrado",
      description:
        "La cantidad y el mínimo se conservan como valores separados.",
      records: availabilityRecords,
    },
    {
      id: "available-parts",
      title:
        availabilityRecords.length > 0
          ? "Disponibilidad registrada"
          : "Registro",
      records: rows.filter((record) => !availabilityIds.has(record.id)),
    },
  ];
}

function getOrderedRows(type, rows) {
  return getRecordGroups(type, rows).flatMap((group) => group.records);
}

function getInitialSelection(type, rows) {
  return getOrderedRows(type, rows)[0]?.id ?? null;
}

function getSelectionAnnouncement(type, record) {
  if (type === "orders") {
    return (
      "Orden " +
      record.id +
      " seleccionada; prioridad " +
      record.priority +
      "; estado " +
      record.status +
      "."
    );
  }

  if (type === "equipment") {
    return (
      "Equipo " +
      record.id +
      " seleccionado; condición " +
      record.condition +
      "; estado " +
      record.status +
      "."
    );
  }

  return (
    "Repuesto " +
    record.id +
    " seleccionado; estado " +
    record.status +
    "."
  );
}

function getRecordAccessibleName(type, record) {
  if (type === "orders") {
    return (
      "Seleccionar orden " +
      record.id +
      ", prioridad " +
      record.priority +
      ", estado " +
      record.status
    );
  }

  if (type === "equipment") {
    return (
      "Seleccionar equipo " +
      record.id +
      ", condición " +
      record.condition +
      ", estado " +
      record.status
    );
  }

  return (
    "Seleccionar repuesto " +
    record.id +
    ", estado " +
    record.status
  );
}

function InstrumentBand({ type, records }) {
  const readingDefinitions = {
    orders: [
      ["Registradas", records.length],
      [
        "Pendiente",
        records.filter(
          (record) => normalizeText(record.status) === "pendiente",
        ).length,
      ],
      [
        "Programada",
        records.filter(
          (record) => normalizeText(record.status) === "programada",
        ).length,
      ],
      [
        "En progreso",
        records.filter(
          (record) => normalizeText(record.status) === "en progreso",
        ).length,
      ],
      [
        "Completada",
        records.filter(
          (record) => normalizeText(record.status) === "completada",
        ).length,
      ],
    ],
    equipment: [
      ["Registrados", records.length],
      [
        "Operativo",
        records.filter(
          (record) => normalizeText(record.status) === "operativo",
        ).length,
      ],
      [
        "Mantenimiento",
        records.filter(
          (record) => normalizeText(record.status) === "mantenimiento",
        ).length,
      ],
      [
        "Inactivo",
        records.filter(
          (record) => normalizeText(record.status) === "inactivo",
        ).length,
      ],
    ],
    parts: [
      ["Registrados", records.length],
      [
        "Disponible",
        records.filter(
          (record) => normalizeText(record.status) === "disponible",
        ).length,
      ],
      [
        "Stock bajo",
        records.filter(
          (record) => normalizeText(record.status) === "stock bajo",
        ).length,
      ],
      [
        "Agotado",
        records.filter(
          (record) => normalizeText(record.status) === "agotado",
        ).length,
      ],
    ],
  };

  return (
    <dl
      className="maintenance-service-band"
      aria-label="Lecturas registradas de la sección"
    >
      {readingDefinitions[type].map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function RecordSummary({ type, record }) {
  if (type === "orders") {
    return (
      <>
        <span className="maintenance-record__marker" aria-hidden="true" />
        <span className="maintenance-record__identity">
          <strong>{displayRecordedValue(record.title)}</strong>
          <small>
            {record.id} · {displayAssociation(record.asset)}
          </small>
          <span className="maintenance-record__reading">
            Programación: {displayRecordedValue(record.scheduledDate)}
          </span>
        </span>
        <span className="maintenance-record__signals">
          <PriorityMarker priority={record.priority} />
          <StatusMarker status={record.status} />
        </span>
      </>
    );
  }

  if (type === "equipment") {
    return (
      <>
        <span className="maintenance-record__marker" aria-hidden="true" />
        <span className="maintenance-record__identity">
          <strong>{displayRecordedValue(record.name)}</strong>
          <small>
            {record.id} · {displayRecordedValue(record.location)}
          </small>
          <span className="maintenance-record__reading">
            Próxima revisión registrada:{" "}
            {displayRecordedValue(record.nextMaintenance)}
          </span>
        </span>
        <span className="maintenance-record__signals">
          <ConditionMarker condition={record.condition} />
          <StatusMarker status={record.status} />
        </span>
      </>
    );
  }

  return (
    <>
      <span className="maintenance-record__marker" aria-hidden="true" />
      <span className="maintenance-record__identity">
        <strong>{displayRecordedValue(record.name)}</strong>
        <small>
          {record.id} · {displayRecordedValue(record.location)}
        </small>
        <span className="maintenance-record__reading">
          Existencias: {formatQuantity(record.stock)} · Mínimo:{" "}
          {formatQuantity(record.minimumStock)}
        </span>
      </span>
      <span className="maintenance-record__signals">
        <StatusMarker status={record.status} />
      </span>
    </>
  );
}

function RecordGroup({
  type,
  group,
  selectedId,
  onSelect,
  inspectorId,
}) {
  if (group.records.length === 0) {
    return null;
  }

  return (
    <section
      className="maintenance-record-group"
      aria-labelledby={"maintenance-group-" + type + "-" + group.id}
    >
      <header className="maintenance-record-group__heading">
        <div>
          <h4 id={"maintenance-group-" + type + "-" + group.id}>
            {group.title}
          </h4>
          {group.description && <p>{group.description}</p>}
        </div>
        <span aria-label={group.records.length + " registros"}>
          {group.records.length}
        </span>
      </header>

      <ul className="maintenance-record-list">
        {group.records.map((record) => {
          const isSelected = selectedId === record.id;

          return (
            <li key={record.id}>
              <button
                type="button"
                className={
                  "maintenance-record" +
                  (isSelected ? " maintenance-record--selected" : "")
                }
                aria-controls={inspectorId}
                aria-pressed={isSelected}
                aria-label={getRecordAccessibleName(type, record)}
                onClick={() => onSelect(record)}
              >
                <RecordSummary type={type} record={record} />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function MaintenanceRegister({
  type,
  allRecords,
  filteredRecords,
  filters,
  selectedId,
  onFilterChange,
  onSelect,
  onClear,
}) {
  const information = tabInformation[type];
  const groups = getRecordGroups(type, filteredRecords);
  const inspectorId = "maintenance-inspector-" + type;
  const hasFilters =
    filters.search !== "" || filters.status !== "Todos";

  return (
    <section
      className="maintenance-register"
      aria-labelledby={"maintenance-register-title-" + type}
    >
      <header className="maintenance-register__heading">
        <div>
          <h3 id={"maintenance-register-title-" + type}>
            {information.registerTitle}
          </h3>
          <p>{information.registerDescription}</p>
        </div>
        <span
          className="maintenance-results"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {filteredRecords.length}{" "}
          {filteredRecords.length === 1 ? "resultado" : "resultados"}
        </span>
      </header>

      <div className="maintenance-toolbar">
        <label className="maintenance-search">
          <span className="maintenance-sr-only">
            {information.searchPlaceholder}
          </span>
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            value={filters.search}
            placeholder={information.searchPlaceholder}
            onChange={(event) =>
              onFilterChange({ search: event.target.value })
            }
          />
        </label>

        <label className="maintenance-filter">
          <span>Estado</span>
          <select
            value={filters.status}
            onChange={(event) =>
              onFilterChange({ status: event.target.value })
            }
          >
            {statusOptions[type].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredRecords.length > 0 ? (
        <div className="maintenance-register__groups">
          {groups.map((group) => (
            <RecordGroup
              type={type}
              group={group}
              selectedId={selectedId}
              onSelect={onSelect}
              inspectorId={inspectorId}
              key={group.id}
            />
          ))}
        </div>
      ) : (
        <div className="maintenance-empty" role="status">
          <Search size={24} aria-hidden="true" />
          <strong>
            {allRecords.length === 0
              ? "No hay registros en esta sección"
              : "No se encontraron coincidencias"}
          </strong>
          <p>
            {allRecords.length === 0
              ? "Los registros creados durante esta sesión aparecerán aquí."
              : "Ajusta la búsqueda o el estado seleccionado."}
          </p>
          {hasFilters && (
            <button type="button" onClick={onClear}>
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function DefinitionItem({ label, children }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function OrderInspector({ record }) {
  const cost = getOrderCost(record);

  return (
    <>
      <section
        className="maintenance-inspector__section"
        aria-labelledby="maintenance-order-classification"
      >
        <h4 id="maintenance-order-classification">
          Clasificación registrada
        </h4>
        <dl className="maintenance-definition-grid">
          <DefinitionItem label="Prioridad declarada">
            <PriorityMarker priority={record.priority} />
          </DefinitionItem>
          <DefinitionItem label="Estado registrado">
            <StatusMarker status={record.status} />
          </DefinitionItem>
          <DefinitionItem label="Tipo de activo declarado">
            {displayRecordedValue(record.assetType)}
          </DefinitionItem>
        </dl>
      </section>

      <section
        className="maintenance-inspector__section"
        aria-labelledby="maintenance-order-assignment"
      >
        <h4 id="maintenance-order-assignment">Activo y asignación</h4>
        <dl className="maintenance-definition-grid">
          <DefinitionItem label="Activo registrado — texto">
            {displayAssociation(record.asset)}
          </DefinitionItem>
          <DefinitionItem label="Ubicación o taller registrado">
            {displayRecordedValue(getOrderLocation(record))}
          </DefinitionItem>
          <DefinitionItem label="Personal asignado — texto">
            {displayAssociation(getOrderAssignee(record))}
          </DefinitionItem>
        </dl>
        <p className="maintenance-inspector__note">
          El activo y el personal se conservan como texto registrado; no
          representan relaciones verificadas con otros módulos.
        </p>
      </section>

      <section
        className="maintenance-inspector__section"
        aria-labelledby="maintenance-order-schedule"
      >
        <h4 id="maintenance-order-schedule">Programación y costo</h4>
        <dl className="maintenance-definition-grid">
          <DefinitionItem label="Programación registrada">
            {displayRecordedValue(record.scheduledDate)}
          </DefinitionItem>
          <DefinitionItem label="Duración estimada registrada">
            {formatHours(record.estimatedHours)}
          </DefinitionItem>
          <DefinitionItem label={cost.label}>
            {formatCurrency(cost.value)}
          </DefinitionItem>
        </dl>
        <p className="maintenance-inspector__note">
          USD es una convención de formato de esta interfaz de
          demostración; la moneda no está almacenada en el registro.
        </p>
      </section>
    </>
  );
}

function EquipmentInspector({ record }) {
  return (
    <>
      <section
        className="maintenance-inspector__section"
        aria-labelledby="maintenance-equipment-classification"
      >
        <h4 id="maintenance-equipment-classification">
          Clasificación registrada
        </h4>
        <dl className="maintenance-definition-grid">
          <DefinitionItem label="Estado registrado">
            <StatusMarker status={record.status} />
          </DefinitionItem>
          <DefinitionItem label="Condición registrada">
            <ConditionMarker condition={record.condition} />
          </DefinitionItem>
          <DefinitionItem label="Categoría">
            {displayRecordedValue(record.category)}
          </DefinitionItem>
        </dl>
      </section>

      <section
        className="maintenance-inspector__section"
        aria-labelledby="maintenance-equipment-identification"
      >
        <h4 id="maintenance-equipment-identification">Identificación</h4>
        <dl className="maintenance-definition-grid">
          <DefinitionItem label="Número de serie">
            <span className="maintenance-mono">
              {displayRecordedValue(record.serialNumber)}
            </span>
          </DefinitionItem>
          <DefinitionItem label="Fabricante">
            {displayRecordedValue(record.manufacturer)}
          </DefinitionItem>
          <DefinitionItem label="Ubicación registrada">
            {displayRecordedValue(record.location)}
          </DefinitionItem>
        </dl>
      </section>

      <section
        className="maintenance-inspector__section"
        aria-labelledby="maintenance-equipment-review"
      >
        <h4 id="maintenance-equipment-review">Revisiones registradas</h4>
        <dl className="maintenance-definition-grid">
          <DefinitionItem label="Última revisión registrada">
            {displayRecordedValue(record.lastMaintenance)}
          </DefinitionItem>
          <DefinitionItem label="Próxima revisión registrada">
            {displayRecordedValue(record.nextMaintenance)}
          </DefinitionItem>
        </dl>
        <p className="maintenance-inspector__note">
          Las fechas se muestran como fueron registradas, sin inferir
          vencimiento ni proximidad. Este catálogo no está vinculado a las
          órdenes mediante los datos disponibles.
        </p>
      </section>
    </>
  );
}

function PartInspector({ record }) {
  return (
    <>
      <section
        className="maintenance-inspector__section"
        aria-labelledby="maintenance-part-classification"
      >
        <h4 id="maintenance-part-classification">
          Clasificación registrada
        </h4>
        <dl className="maintenance-definition-grid">
          <DefinitionItem label="Estado registrado">
            <StatusMarker status={record.status} />
          </DefinitionItem>
          <DefinitionItem label="Categoría">
            {displayRecordedValue(record.category)}
          </DefinitionItem>
        </dl>
      </section>

      <section
        className="maintenance-inspector__section"
        aria-labelledby="maintenance-part-inventory"
      >
        <h4 id="maintenance-part-inventory">Existencias registradas</h4>
        <dl className="maintenance-definition-grid">
          <DefinitionItem label="Cantidad registrada">
            {formatQuantity(record.stock)}
          </DefinitionItem>
          <DefinitionItem label="Mínimo registrado">
            {formatQuantity(record.minimumStock)}
          </DefinitionItem>
          <DefinitionItem label="Unidad">
            {displayRecordedValue(record.unit)}
          </DefinitionItem>
        </dl>
      </section>

      <section
        className="maintenance-inspector__section"
        aria-labelledby="maintenance-part-location"
      >
        <h4 id="maintenance-part-location">Registro de almacén</h4>
        <dl className="maintenance-definition-grid">
          <DefinitionItem label="Ubicación registrada">
            {displayRecordedValue(record.location)}
          </DefinitionItem>
          <DefinitionItem label="Proveedor registrado">
            {displayRecordedValue(record.supplier)}
          </DefinitionItem>
        </dl>
        <p className="maintenance-inspector__note">
          Catálogo independiente. No existe una asociación registrada entre
          este repuesto y una orden de mantenimiento.
        </p>
      </section>
    </>
  );
}

function MaintenanceInspector({ type, record, onDelete }) {
  const inspectorId = "maintenance-inspector-" + type;
  const Icon =
    type === "orders"
      ? Wrench
      : type === "equipment"
        ? TrainFront
        : PackageSearch;
  const title = record?.title ?? record?.name;

  return (
    <aside
      className="maintenance-inspector"
      id={inspectorId}
      aria-labelledby={record ? inspectorId + "-title" : undefined}
    >
      {record ? (
        <>
          <header className="maintenance-inspector__heading">
            <span className="maintenance-inspector__icon" aria-hidden="true">
              <Icon size={20} />
            </span>
            <div>
              <span className="maintenance-inspector__id">{record.id}</span>
              <h3 id={inspectorId + "-title"}>
                {displayRecordedValue(title)}
              </h3>
              <p>Ficha técnica registrada · Datos de demostración</p>
            </div>
          </header>

          <div className="record-delete-toolbar">
            <DeleteRecordAction
              id={record.id}
              label={`${tabInformation[type].singular} ${displayRecordedValue(title)}`}
              record={record}
              onRequest={onDelete}
              variant="labeled"
            />
          </div>

          <div className="maintenance-inspector__body">
            {type === "orders" && <OrderInspector record={record} />}
            {type === "equipment" && (
              <EquipmentInspector record={record} />
            )}
            {type === "parts" && <PartInspector record={record} />}
          </div>
        </>
      ) : (
        <div className="maintenance-inspector__empty">
          <Icon size={28} aria-hidden="true" />
          <strong>Sin registro seleccionado</strong>
          <p>
            Ajusta los filtros o selecciona un registro para consultar su
            ficha.
          </p>
        </div>
      )}
    </aside>
  );
}

function MaintenanceManagement() {
  const [activeTab, setActiveTab] = useState("orders");
  const [filters, setFilters] = useState({
    orders: { search: "", status: "Todos" },
    equipment: { search: "", status: "Todos" },
    parts: { search: "", status: "Todos" },
  });
  const [showForm, setShowForm] = useState(false);
  const [creationAnnouncement, setCreationAnnouncement] = useState("");
  const [selectionAnnouncement, setSelectionAnnouncement] = useState("");
  const [orderRows, setOrderRows] = useState(maintenanceOrders);
  const [equipmentRows, setEquipmentRows] = useState(equipment);
  const [partRows, setPartRows] = useState(spareParts);
  const [selectedIds, setSelectedIds] = useState({
    orders: getInitialSelection("orders", maintenanceOrders),
    equipment: getInitialSelection("equipment", equipment),
    parts: getInitialSelection("parts", spareParts),
  });
  const tabRefs = useRef([]);

  const records = useMemo(
    () => ({
      orders: orderRows,
      equipment: equipmentRows,
      parts: partRows,
    }),
    [orderRows, equipmentRows, partRows],
  );
  const activeRecords = records[activeTab];
  const activeFilters = filters[activeTab];
  const filteredRecords = useMemo(
    () =>
      activeRecords.filter((record) =>
        recordMatchesFilters(record, activeTab, activeFilters),
      ),
    [activeRecords, activeTab, activeFilters],
  );
  const orderedRecords = useMemo(
    () => getOrderedRows(activeTab, filteredRecords),
    [activeTab, filteredRecords],
  );
  const selectedRecord =
    orderedRecords.find(
      (record) => record.id === selectedIds[activeTab],
    ) ??
    orderedRecords[0] ??
    null;
  const deletion = useDeleteRecord({
    deleteRecord: handleDeleteRecord,
    recordExists: ({ id }) =>
      records[activeTab].some((record) => record.id === id),
  });

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    setSelectionAnnouncement("");
  }

  function handleTabKeyDown(event, index) {
    let nextIndex = null;

    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleTabChange(tabs[index].id);
      return;
    }

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    handleTabChange(tabs[nextIndex].id);
    window.requestAnimationFrame(() => {
      tabRefs.current[nextIndex]?.focus();
    });
  }

  function updateActiveFilters(patch) {
    const nextFilters = {
      ...activeFilters,
      ...patch,
    };
    const nextVisibleRecords = getOrderedRows(
      activeTab,
      activeRecords.filter((record) =>
        recordMatchesFilters(record, activeTab, nextFilters),
      ),
    );
    const currentSelectionIsVisible = nextVisibleRecords.some(
      (record) => record.id === selectedIds[activeTab],
    );
    const nextSelection = currentSelectionIsVisible
      ? nextVisibleRecords.find(
          (record) => record.id === selectedIds[activeTab],
        )
      : nextVisibleRecords[0] ?? null;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [activeTab]: nextFilters,
    }));

    if (!currentSelectionIsVisible) {
      setSelectedIds((currentIds) => ({
        ...currentIds,
        [activeTab]: nextSelection?.id ?? null,
      }));
      setSelectionAnnouncement(
        nextSelection
          ? "La selección visible cambió. " +
              getSelectionAnnouncement(activeTab, nextSelection)
          : "No hay registros visibles con los filtros actuales.",
      );
    }
  }

  function handleSelect(record) {
    setSelectedIds((currentIds) => ({
      ...currentIds,
      [activeTab]: record.id,
    }));
    setSelectionAnnouncement(
      getSelectionAnnouncement(activeTab, record),
    );
  }

  function handleSave(newRecord) {
    let createdRecord;

    if (activeTab === "orders") {
      createdRecord = {
        ...newRecord,
        id: createNextId("MAN", orderRows),
      };
      setOrderRows((currentRows) => [createdRecord, ...currentRows]);
    } else if (activeTab === "equipment") {
      createdRecord = {
        ...newRecord,
        id: createNextId("EQ", equipmentRows),
      };
      setEquipmentRows((currentRows) => [createdRecord, ...currentRows]);
    } else {
      createdRecord = {
        ...newRecord,
        id: createNextId("REP", partRows),
      };
      setPartRows((currentRows) => [createdRecord, ...currentRows]);
    }

    const isVisible = recordMatchesFilters(
      createdRecord,
      activeTab,
      activeFilters,
    );

    if (isVisible) {
      setSelectedIds((currentIds) => ({
        ...currentIds,
        [activeTab]: createdRecord.id,
      }));
      setSelectionAnnouncement(
        getSelectionAnnouncement(activeTab, createdRecord),
      );
    }

    setCreationAnnouncement(
      "El registro " +
        createdRecord.id +
        " se agregó solo a esta sesión de demostración; no se almacena de forma persistente." +
        (isVisible
          ? ""
          : " Los filtros actuales no incluyen el nuevo registro."),
    );
    setShowForm(false);
  }

  function handleDeleteRecord({ id }) {
    const nextSelection = getSelectionAfterDelete(
      orderedRecords,
      id,
      selectedRecord?.id,
    );

    if (activeTab === "orders") {
      setOrderRows((currentRows) =>
        currentRows.filter((record) => record.id !== id),
      );
    } else if (activeTab === "equipment") {
      setEquipmentRows((currentRows) =>
        currentRows.filter((record) => record.id !== id),
      );
    } else {
      setPartRows((currentRows) =>
        currentRows.filter((record) => record.id !== id),
      );
    }

    setSelectedIds((currentIds) => ({
      ...currentIds,
      [activeTab]: nextSelection,
    }));
    setSelectionAnnouncement(
      nextSelection
        ? `Registro ${nextSelection} seleccionado después de eliminar el registro.`
        : "No quedan registros visibles para seleccionar.",
    );
  }

  return (
    <section
      className="maintenance-page"
      aria-labelledby="maintenance-page-title"
    >
      <header className="maintenance-heading">
        <div className="maintenance-heading__copy">
          <div className="maintenance-context" aria-label="Contexto">
            <span>Banco de servicio</span>
            <span>Datos de demostración</span>
          </div>
          <h2 id="maintenance-page-title">Mantenimiento</h2>
          <p>
            Consulta órdenes, equipos y repuestos registrados sin inferir
            actividad en tiempo real.
          </p>
        </div>

        <button
          type="button"
          className="maintenance-primary-button"
          onClick={() => {
            setCreationAnnouncement("");
            setShowForm(true);
          }}
        >
          <CirclePlus size={18} aria-hidden="true" />
          {tabInformation[activeTab].action}
        </button>
      </header>

      <DeleteRecordNotice
        message={deletion.notice}
        onDismiss={deletion.dismissNotice}
      />

      {creationAnnouncement && (
        <div
          className="maintenance-session-notice"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span>{creationAnnouncement}</span>
          <button
            type="button"
            aria-label="Cerrar anuncio de sesión"
            onClick={() => setCreationAnnouncement("")}
          >
            <X size={17} aria-hidden="true" />
          </button>
        </div>
      )}

      <section
        className="maintenance-workbench"
        aria-label="Banco de servicio de mantenimiento"
      >
        <div
          className="maintenance-tabs"
          role="tablist"
          aria-label="Entidades de mantenimiento"
        >
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                type="button"
                role="tab"
                id={"maintenance-tab-" + tab.id}
                aria-selected={isActive}
                aria-controls={"maintenance-panel-" + tab.id}
                tabIndex={isActive ? 0 : -1}
                className={
                  "maintenance-tab" +
                  (isActive ? " maintenance-tab--active" : "")
                }
                onClick={() => handleTabChange(tab.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                key={tab.id}
              >
                {tab.label}
                <span>{records[tab.id].length}</span>
              </button>
            );
          })}
        </div>

        {tabs.map((tab) => (
          <div
            className="maintenance-workbench__tabpanel"
            id={"maintenance-panel-" + tab.id}
            role="tabpanel"
            aria-labelledby={"maintenance-tab-" + tab.id}
            tabIndex={0}
            hidden={activeTab !== tab.id}
            key={tab.id}
          >
            {activeTab === tab.id && (
              <>
                <InstrumentBand
                  type={activeTab}
                  records={activeRecords}
                />

                <div className="maintenance-desk">
                  <MaintenanceRegister
                    type={activeTab}
                    allRecords={activeRecords}
                    filteredRecords={filteredRecords}
                    filters={activeFilters}
                    selectedId={selectedRecord?.id ?? null}
                    onFilterChange={updateActiveFilters}
                    onSelect={handleSelect}
                    onClear={() =>
                      updateActiveFilters({
                        search: "",
                        status: "Todos",
                      })
                    }
                  />

                  <MaintenanceInspector
                    type={activeTab}
                    record={selectedRecord}
                    onDelete={deletion.requestDelete}
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </section>

      <p
        className="maintenance-sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {selectionAnnouncement}
      </p>

      {showForm && (
        <MaintenanceFormModal
          type={activeTab}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
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

export default MaintenanceManagement;
