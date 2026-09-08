import { useMemo, useRef, useState } from "react";
import {
  Accessibility,
  CircleCheck,
  CirclePlus,
  CircleX,
  Gauge,
  Search,
  TrainFront,
  TriangleAlert,
  Warehouse,
  Wrench,
} from "lucide-react";
import FleetFormModal from "../components/FleetFormModal";
import { deposits, trains, wagons } from "../data/fleetData";
import "../styles/fleet.css";

const tabs = [
  { id: "trains", label: "Trenes" },
  { id: "wagons", label: "Vagones" },
  { id: "deposits", label: "Depósitos" },
];

const statusOptions = {
  trains: [
    "Todos",
    "Disponible",
    "En operación",
    "En mantenimiento",
    "Fuera de servicio",
  ],
  wagons: ["Todos", "Operativo", "En mantenimiento", "Fuera de servicio"],
  deposits: ["Todos", "Operativo", "Capacidad limitada"],
};

const actionLabels = {
  trains: "Registrar tren",
  wagons: "Registrar vagón",
  deposits: "Nuevo depósito",
};

const recordLabels = {
  trains: { singular: "tren", plural: "trenes" },
  wagons: { singular: "vagón", plural: "vagones" },
  deposits: { singular: "depósito", plural: "depósitos" },
};

const statusPresentation = {
  Disponible: { tone: "success", icon: CircleCheck },
  "En operación": { tone: "info", icon: TrainFront },
  "En mantenimiento": { tone: "warning", icon: Wrench },
  "Fuera de servicio": { tone: "danger", icon: CircleX },
  Operativo: { tone: "success", icon: CircleCheck },
  "Capacidad limitada": { tone: "warning", icon: TriangleAlert },
};

const attentionStatuses = {
  trains: ["Fuera de servicio", "En mantenimiento"],
  wagons: ["Fuera de servicio", "En mantenimiento"],
  deposits: ["Capacidad limitada"],
};

const statusPriority = {
  "Fuera de servicio": 0,
  "En mantenimiento": 1,
  "Capacidad limitada": 1,
  "En operación": 2,
  Disponible: 3,
  Operativo: 3,
};

function normalizeText(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getSearchableText(record, type) {
  if (type === "trains") {
    return [
      record.id,
      record.model,
      record.manufacturer,
      record.year,
      record.capacity,
      record.status,
      record.mileage,
      record.deposit,
      record.lastInspection,
      record.nextInspection,
      record.wagons,
    ].join(" ");
  }

  if (type === "wagons") {
    return [
      record.id,
      record.type,
      record.seats,
      record.standing,
      record.year,
      record.train,
      record.position,
      record.status,
      record.accessible
        ? "accesibilidad disponible sí"
        : "accesibilidad no disponible no",
    ].join(" ");
  }

  return [
    record.id,
    record.name,
    record.location,
    record.capacity,
    record.assignedTrains,
    record.status,
  ].join(" ");
}

function recordMatches(record, type, searchTerm, statusFilter) {
  const normalizedSearch = normalizeText(searchTerm.trim());
  const matchesSearch =
    !normalizedSearch ||
    normalizeText(getSearchableText(record, type)).includes(normalizedSearch);
  const matchesStatus =
    statusFilter === "Todos" || record.status === statusFilter;

  return matchesSearch && matchesStatus;
}

function getPreferredRecordId(records) {
  return records
    .map((record, sourceIndex) => ({ record, sourceIndex }))
    .sort(
      (a, b) =>
        (statusPriority[a.record.status] ?? 9) -
          (statusPriority[b.record.status] ?? 9) ||
        a.sourceIndex - b.sourceIndex,
    )[0]?.record.id;
}

function FleetStatus({ status }) {
  const presentation = statusPresentation[status] ?? {
    tone: "neutral",
    icon: Gauge,
  };
  const StatusIcon = presentation.icon;

  return (
    <span className={`fleet-status fleet-status--${presentation.tone}`}>
      <StatusIcon size={12} strokeWidth={2.2} aria-hidden="true" />
      {status}
    </span>
  );
}

function getRecordSecondary(record, type) {
  if (type === "trains") {
    return `${record.model} · ${record.manufacturer}`;
  }

  if (type === "wagons") {
    return `${record.type} · ${record.train}`;
  }

  return `${record.id} · ${record.location}`;
}

function getRecordTitle(record, type) {
  return type === "deposits" ? record.name : record.id;
}

function getSelectionLabel(record, type) {
  if (type === "deposits") {
    return `Inspeccionar depósito ${record.id}, ${record.name}; condición ${record.status}`;
  }

  return `Inspeccionar ${recordLabels[type].singular} ${record.id}; estado ${record.status}`;
}

function FleetReadings({ type, records }) {
  if (type === "trains") {
    const attentionCount = records.filter((record) =>
      attentionStatuses.trains.includes(record.status),
    ).length;
    const nominalCapacity = records.reduce(
      (total, record) => total + record.capacity,
      0,
    );

    return (
      <>
        <dl className="fleet-readings">
          <div>
            <dt>Trenes registrados</dt>
            <dd>{records.length}</dd>
          </div>
          <div>
            <dt>Estado Disponible</dt>
            <dd>
              {records.filter((record) => record.status === "Disponible").length}
            </dd>
          </div>
          <div>
            <dt>En operación</dt>
            <dd>
              {
                records.filter((record) => record.status === "En operación")
                  .length
              }
            </dd>
          </div>
          <div>
            <dt>Atención registrada</dt>
            <dd>{attentionCount}</dd>
          </div>
        </dl>

        <p className="fleet-capacity-note">
          <span>Capacidad nominal registrada acumulada</span>
          <strong>{nominalCapacity.toLocaleString("es-GT")}</strong>
          <small>
            Suma de la capacidad declarada de todos los trenes, sin excluir
            ningún estado.
          </small>
        </p>
      </>
    );
  }

  if (type === "wagons") {
    return (
      <dl className="fleet-readings">
        <div>
          <dt>Vagones registrados</dt>
          <dd>{records.length}</dd>
        </div>
        <div>
          <dt>Operativos</dt>
          <dd>
            {records.filter((record) => record.status === "Operativo").length}
          </dd>
        </div>
        <div>
          <dt>En mantenimiento</dt>
          <dd>
            {
              records.filter((record) => record.status === "En mantenimiento")
                .length
            }
          </dd>
        </div>
        <div>
          <dt>Fuera de servicio</dt>
          <dd>
            {
              records.filter((record) => record.status === "Fuera de servicio")
                .length
            }
          </dd>
        </div>
      </dl>
    );
  }

  return (
    <dl className="fleet-readings">
      <div>
        <dt>Depósitos registrados</dt>
        <dd>{records.length}</dd>
      </div>
      <div>
        <dt>Operativos</dt>
        <dd>
          {records.filter((record) => record.status === "Operativo").length}
        </dd>
      </div>
      <div>
        <dt>Capacidad limitada</dt>
        <dd>
          {
            records.filter((record) => record.status === "Capacidad limitada")
              .length
          }
        </dd>
      </div>
      <div>
        <dt>Trenes asignados declarados</dt>
        <dd>
          {records.reduce((total, record) => total + record.assignedTrains, 0)}
        </dd>
      </div>
    </dl>
  );
}

function FleetAttention({ type, records }) {
  const attentionRecords = records
    .map((record, sourceIndex) => ({ record, sourceIndex }))
    .filter(({ record }) => attentionStatuses[type].includes(record.status))
    .sort(
      (a, b) =>
        (statusPriority[a.record.status] ?? 9) -
          (statusPriority[b.record.status] ?? 9) ||
        a.sourceIndex - b.sourceIndex,
    )
    .map(({ record }) => record);
  const headingId = `fleet-attention-title-${type}`;

  return (
    <section className="fleet-attention" aria-labelledby={headingId}>
      <header className="fleet-attention__header">
        <div>
          <h3 id={headingId}>Índice del patio</h3>
          <p>Lecturas derivadas del inventario de demostración.</p>
        </div>
      </header>

      <FleetReadings type={type} records={records} />

      <section
        className="fleet-attention__records"
        aria-labelledby={`${headingId}-records`}
      >
        <header>
          <h4 id={`${headingId}-records`}>
            {type === "deposits"
              ? "Condiciones que requieren atención"
              : "Unidades que requieren atención"}
          </h4>
          <span>{attentionRecords.length}</span>
        </header>

        {attentionRecords.length > 0 ? (
          <ul>
            {attentionRecords.map((record) => (
              <li key={record.id}>
                <span>
                  <strong>{getRecordTitle(record, type)}</strong>
                  <small>{getRecordSecondary(record, type)}</small>
                </span>
                <FleetStatus status={record.status} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="fleet-attention__empty">
            No hay condiciones de atención registradas en esta categoría.
          </p>
        )}
      </section>
    </section>
  );
}

function FleetToolbar({
  type,
  searchTerm,
  statusFilter,
  resultCount,
  onSearchChange,
  onStatusChange,
}) {
  return (
    <div className="fleet-toolbar">
      <label className="fleet-search">
        <Search size={16} aria-hidden="true" />
        <span className="fleet-sr-only">
          Buscar {recordLabels[type].plural}
        </span>
        <input
          type="search"
          value={searchTerm}
          placeholder={`Buscar ${recordLabels[type].singular}, estado o asociación`}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>

      <label className="fleet-filter">
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

      <span className="fleet-results" aria-live="polite" aria-atomic="true">
        {resultCount} {resultCount === 1 ? "resultado" : "resultados"}
      </span>
    </div>
  );
}

function FleetRegister({
  type,
  allRecords,
  records,
  selectedId,
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusChange,
  onSelect,
  onClearFilters,
}) {
  const selectedIndex = records.findIndex((record) => record.id === selectedId);
  const hasFilters = searchTerm.trim().length > 0 || statusFilter !== "Todos";
  const inspectorId = `fleet-technical-inspector-${type}`;

  return (
    <section className="fleet-register" aria-labelledby={`fleet-register-${type}`}>
      <header className="fleet-register__heading">
        <div>
          <h3 id={`fleet-register-${type}`}>Registro seleccionable</h3>
          <p>Elige un registro para consultar su ficha técnica.</p>
        </div>
      </header>

      <FleetToolbar
        type={type}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        resultCount={records.length}
        onSearchChange={onSearchChange}
        onStatusChange={onStatusChange}
      />

      {records.length > 0 ? (
        <ul
          className="fleet-register__list"
          style={{
            "--fleet-selection-index": Math.max(selectedIndex, 0),
            "--fleet-selection-visible": selectedIndex >= 0 ? 1 : 0,
          }}
        >
          {records.map((record) => {
            const isSelected = record.id === selectedId;

            return (
              <li key={record.id}>
                <button
                  type="button"
                  aria-controls={inspectorId}
                  aria-pressed={isSelected}
                  aria-label={getSelectionLabel(record, type)}
                  onClick={() => onSelect(record)}
                >
                  <span className="fleet-register__identity">
                    <strong>{getRecordTitle(record, type)}</strong>
                    <small>{getRecordSecondary(record, type)}</small>
                  </span>
                  <FleetStatus status={record.status} />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="fleet-empty" role="status">
          <Search size={24} aria-hidden="true" />
          <strong>
            {allRecords.length === 0
              ? `No hay ${recordLabels[type].plural} registrados`
              : "Sin coincidencias"}
          </strong>
          <span>
            {allRecords.length === 0
              ? "Los registros creados durante esta sesión aparecerán aquí."
              : "Ajusta la búsqueda o el filtro de estado."}
          </span>

          {allRecords.length > 0 && hasFilters && (
            <button type="button" onClick={onClearFilters}>
              Limpiar búsqueda y filtros
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function TechnicalItem({ label, children, wide = false }) {
  return (
    <div className={wide ? "fleet-technical-item--wide" : undefined}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function InspectorHeader({ title, description, status, icon: Icon }) {
  return (
    <header className="fleet-inspector__header">
      <span className="fleet-inspector__icon" aria-hidden="true">
        <Icon size={23} strokeWidth={1.8} />
      </span>
      <div>
        <h3 id="fleet-inspector-title">{title}</h3>
        <p>{description}</p>
      </div>
      <FleetStatus status={status} />
    </header>
  );
}

function AssociatedWagons({ train, wagons: wagonRecords }) {
  const associatedWagons = wagonRecords
    .filter((wagon) => wagon.train === train.id)
    .map((wagon, sourceIndex) => ({ wagon, sourceIndex }))
    .sort(
      (a, b) =>
        a.wagon.position - b.wagon.position || a.sourceIndex - b.sourceIndex,
    )
    .map(({ wagon }) => wagon);
  const recordWord = associatedWagons.length === 1 ? "registro" : "registros";
  const associationWord =
    associatedWagons.length === 1 ? "asociado" : "asociados";

  return (
    <section
      className="fleet-associations"
      aria-labelledby="fleet-associated-wagons-title"
    >
      <header>
        <div>
          <h4 id="fleet-associated-wagons-title">
            Vagones con asociación registrada
          </h4>
          <p>
            {associatedWagons.length} {recordWord} {associationWord}; el tren
            declara {train.wagons} vagones.
          </p>
        </div>
      </header>

      <p className="fleet-associations__model-note">
        La posición pertenece a los datos de demostración del frontend; la
        relación TREN_VAGON de Oracle no registra un orden.
      </p>

      {associatedWagons.length > 0 ? (
        <ol className="fleet-consist">
          {associatedWagons.map((wagon) => (
            <li value={wagon.position} key={wagon.id}>
              <span className="fleet-consist__position">
                Posición {wagon.position}
              </span>
              <strong>{wagon.id}</strong>
              <small>{wagon.type}</small>
              <FleetStatus status={wagon.status} />
            </li>
          ))}
        </ol>
      ) : (
        <p className="fleet-associations__empty">
          Sin asociación registrada para este tren.
        </p>
      )}
    </section>
  );
}

function TrainInspector({ train, wagonRecords, depositRecords }) {
  const assignedDeposit = depositRecords.find(
    (deposit) => deposit.id === train.deposit,
  );

  return (
    <>
      <InspectorHeader
        title={train.id}
        description={`${train.model} · ${train.manufacturer} · ${train.year}`}
        status={train.status}
        icon={TrainFront}
      />

      <div className="fleet-inspector__section">
        <h4>Ficha técnica registrada</h4>
        <dl className="fleet-technical-grid">
          <TechnicalItem label="Modelo">{train.model}</TechnicalItem>
          <TechnicalItem label="Fabricante">{train.manufacturer}</TechnicalItem>
          <TechnicalItem label="Año de fabricación">{train.year}</TechnicalItem>
          <TechnicalItem label="Estado registrado">{train.status}</TechnicalItem>
          <TechnicalItem label="Capacidad nominal registrada">
            {train.capacity.toLocaleString("es-GT")}
          </TechnicalItem>
          <TechnicalItem label="Kilometraje acumulado registrado">
            {train.mileage.toLocaleString("es-GT")} km
          </TechnicalItem>
          <TechnicalItem label="Cantidad declarada de vagones">
            {train.wagons}
          </TechnicalItem>
          <TechnicalItem label="Depósito asignado">
            {assignedDeposit
              ? `${assignedDeposit.id} · ${assignedDeposit.name}`
              : train.deposit || "Sin asociación registrada"}
          </TechnicalItem>
        </dl>
      </div>

      <section
        className="fleet-inspector__section"
        aria-labelledby="fleet-inspections-title"
      >
        <h4 id="fleet-inspections-title">Inspecciones registradas</h4>
        <dl className="fleet-technical-grid fleet-technical-grid--dates">
          <TechnicalItem label="Última inspección">
            <time dateTime={train.lastInspection}>{train.lastInspection}</time>
          </TechnicalItem>
          <TechnicalItem label="Próxima inspección">
            <time dateTime={train.nextInspection}>{train.nextInspection}</time>
          </TechnicalItem>
        </dl>
      </section>

      <AssociatedWagons train={train} wagons={wagonRecords} />
    </>
  );
}

function WagonInspector({ wagon, trainRecords }) {
  const assignedTrain = trainRecords.find((train) => train.id === wagon.train);

  return (
    <>
      <InspectorHeader
        title={wagon.id}
        description={`${wagon.type} · Fabricado en ${wagon.year}`}
        status={wagon.status}
        icon={TrainFront}
      />

      <div className="fleet-inspector__section">
        <h4>Ficha técnica registrada</h4>
        <dl className="fleet-technical-grid">
          <TechnicalItem label="Número de serie">{wagon.id}</TechnicalItem>
          <TechnicalItem label="Tipo de vagón">{wagon.type}</TechnicalItem>
          <TechnicalItem label="Año de fabricación">{wagon.year}</TechnicalItem>
          <TechnicalItem label="Estado registrado">{wagon.status}</TechnicalItem>
          <TechnicalItem label="Capacidad sentada">{wagon.seats}</TechnicalItem>
          <TechnicalItem label="Capacidad de pie">{wagon.standing}</TechnicalItem>
          <TechnicalItem label="Accesibilidad registrada">
            <span className="fleet-accessibility">
              <Accessibility size={15} aria-hidden="true" />
              {wagon.accessible ? "Disponible" : "No disponible"}
            </span>
          </TechnicalItem>
          <TechnicalItem label="Tren asociado">
            {assignedTrain
              ? `${assignedTrain.id} · ${assignedTrain.model}`
              : wagon.train || "Sin asociación registrada"}
          </TechnicalItem>
          <TechnicalItem label="Posición registrada en el demo" wide>
            {wagon.position}
          </TechnicalItem>
        </dl>
      </div>

      <p className="fleet-inspector__schema-note">
        La posición pertenece al inventario de demostración del frontend y no
        está representada en la relación TREN_VAGON del modelo Oracle actual.
      </p>
    </>
  );
}

function DepositInspector({ deposit, trainRecords }) {
  const associatedTrains = trainRecords.filter(
    (train) => train.deposit === deposit.id,
  );
  const declaredRatio =
    deposit.capacity > 0
      ? Math.round((deposit.assignedTrains / deposit.capacity) * 100)
      : null;
  const countMismatch = associatedTrains.length !== deposit.assignedTrains;

  return (
    <>
      <InspectorHeader
        title={deposit.name}
        description={`${deposit.id} · ${deposit.location}`}
        status={deposit.status}
        icon={Warehouse}
      />

      <div className="fleet-inspector__section">
        <h4>Ficha técnica registrada</h4>
        <dl className="fleet-technical-grid">
          <TechnicalItem label="Código del depósito">{deposit.id}</TechnicalItem>
          <TechnicalItem label="Ubicación registrada">
            {deposit.location}
          </TechnicalItem>
          <TechnicalItem label="Capacidad registrada">
            {deposit.capacity} trenes
          </TechnicalItem>
          <TechnicalItem label="Trenes asignados declarados">
            {deposit.assignedTrains}
          </TechnicalItem>
          <TechnicalItem label="Condición registrada">
            {deposit.status}
          </TechnicalItem>
          <TechnicalItem label="Relación declarada del demo">
            {declaredRatio === null
              ? "Dato no disponible en este escenario"
              : `${deposit.assignedTrains} de ${deposit.capacity} (${declaredRatio}%)`}
          </TechnicalItem>
        </dl>
      </div>

      <section
        className="fleet-associations fleet-associations--trains"
        aria-labelledby="fleet-associated-trains-title"
      >
        <header>
          <div>
            <h4 id="fleet-associated-trains-title">
              Trenes con asignación registrada
            </h4>
            <p>
              {associatedTrains.length}{" "}
              {associatedTrains.length === 1
                ? "registro asociado"
                : "registros asociados"}
              ; el depósito declara {deposit.assignedTrains}.
            </p>
          </div>
        </header>

        <p className="fleet-associations__model-note">
          La relación declarada compara datos de demostración; no representa
          ocupación actual ni utilización en tiempo real.
        </p>

        {countMismatch && (
          <p className="fleet-associations__mismatch" role="status">
            El conteo declarado y los registros asociados no coinciden en esta
            sesión.
          </p>
        )}

        {associatedTrains.length > 0 ? (
          <ul className="fleet-associated-trains">
            {associatedTrains.map((train) => (
              <li key={train.id}>
                <span>
                  <strong>{train.id}</strong>
                  <small>{train.model}</small>
                </span>
                <FleetStatus status={train.status} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="fleet-associations__empty">
            Sin asociaciones de tren registradas.
          </p>
        )}
      </section>
    </>
  );
}

function FleetInspector({ type, record, fleetRecords }) {
  const inspectorId = `fleet-technical-inspector-${type}`;

  return (
    <section
      className="fleet-inspector"
      id={inspectorId}
      aria-labelledby="fleet-inspector-title"
    >
      {record ? (
        <>
          {type === "trains" && (
            <TrainInspector
              train={record}
              wagonRecords={fleetRecords.wagons}
              depositRecords={fleetRecords.deposits}
            />
          )}
          {type === "wagons" && (
            <WagonInspector wagon={record} trainRecords={fleetRecords.trains} />
          )}
          {type === "deposits" && (
            <DepositInspector
              deposit={record}
              trainRecords={fleetRecords.trains}
            />
          )}
        </>
      ) : (
        <div className="fleet-inspector__empty" role="status">
          <TrainFront size={28} aria-hidden="true" />
          <h3 id="fleet-inspector-title">Sin registro seleccionado</h3>
          <p>
            Ajusta la búsqueda o el filtro para seleccionar una ficha técnica.
          </p>
        </div>
      )}
    </section>
  );
}

function FleetManagement() {
  const [activeTab, setActiveTab] = useState("trains");
  const [filters, setFilters] = useState({
    trains: { search: "", status: "Todos" },
    wagons: { search: "", status: "Todos" },
    deposits: { search: "", status: "Todos" },
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [selectionAnnouncement, setSelectionAnnouncement] = useState("");
  const [fleetRecords, setFleetRecords] = useState({ trains, wagons, deposits });
  const [selectedIds, setSelectedIds] = useState({
    trains: getPreferredRecordId(trains),
    wagons: getPreferredRecordId(wagons),
    deposits: getPreferredRecordId(deposits),
  });
  const tabRefs = useRef([]);

  const activeFilters = filters[activeTab];
  const activeRecords = fleetRecords[activeTab];
  const filteredRecords = useMemo(
    () =>
      activeRecords.filter((record) =>
        recordMatches(
          record,
          activeTab,
          activeFilters.search,
          activeFilters.status,
        ),
      ),
    [activeFilters, activeRecords, activeTab],
  );
  const selectedRecord = filteredRecords.find(
    (record) => record.id === selectedIds[activeTab],
  );

  function updateActiveFilters(nextValues) {
    const nextFilters = { ...activeFilters, ...nextValues };
    const nextVisibleRecords = activeRecords.filter((record) =>
      recordMatches(
        record,
        activeTab,
        nextFilters.search,
        nextFilters.status,
      ),
    );

    setFilters((currentFilters) => ({
      ...currentFilters,
      [activeTab]: nextFilters,
    }));

    if (
      nextVisibleRecords.length > 0 &&
      !nextVisibleRecords.some(
        (record) => record.id === selectedIds[activeTab],
      )
    ) {
      const nextRecord = nextVisibleRecords[0];

      setSelectedIds((currentIds) => ({
        ...currentIds,
        [activeTab]: nextRecord.id,
      }));
      setSelectionAnnouncement(
        `${recordLabels[activeTab].singular} ${nextRecord.id} seleccionado como primer resultado visible.`,
      );
    }
  }

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    setIsFormOpen(false);
    const selectedId = selectedIds[tabId];

    if (selectedId) {
      setSelectionAnnouncement(
        `${recordLabels[tabId].singular} ${selectedId} seleccionado.`,
      );
    }
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

  function handleSelect(record) {
    setSelectedIds((currentIds) => ({
      ...currentIds,
      [activeTab]: record.id,
    }));
    setSelectionAnnouncement(
      `${recordLabels[activeTab].singular} ${record.id} seleccionado; estado ${record.status}.`,
    );
  }

  function handleCreate(newRecord) {
    const isVisible = recordMatches(
      newRecord,
      activeTab,
      activeFilters.search,
      activeFilters.status,
    );
    const label = recordLabels[activeTab].singular;

    setFleetRecords((currentRecords) => ({
      ...currentRecords,
      [activeTab]: [...currentRecords[activeTab], newRecord],
    }));

    if (isVisible) {
      setSelectedIds((currentIds) => ({
        ...currentIds,
        [activeTab]: newRecord.id,
      }));
      setSelectionAnnouncement(
        `${label} ${newRecord.id} seleccionado; estado ${newRecord.status}.`,
      );
    }

    setAnnouncement(
      `El ${label} ${newRecord.id} se agregó a esta sesión de demostración; no se almacena de forma persistente.${
        isVisible ? "" : " Los filtros actuales no incluyen el nuevo registro."
      }`,
    );
    setIsFormOpen(false);
  }

  return (
    <section className="fleet-page" aria-labelledby="fleet-page-title">
      <header className="fleet-heading">
        <div className="fleet-heading__copy">
          <div className="fleet-context" aria-label="Contexto de los datos">
            <span>Inventario de demostración</span>
            <span>Material rodante</span>
          </div>
          <h2 id="fleet-page-title">Trenes y vagones</h2>
          <p>
            Inspecciona unidades, asociaciones y condiciones registradas en el
            sistema.
          </p>
        </div>

        <button
          type="button"
          className="fleet-primary-button"
          onClick={() => setIsFormOpen(true)}
        >
          <CirclePlus size={17} aria-hidden="true" />
          {actionLabels[activeTab]}
        </button>
      </header>

      <section className="fleet-yard" aria-label="Patio técnico de material rodante">
        <div
          className="fleet-tabs"
          role="tablist"
          aria-label="Categorías del inventario"
        >
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                type="button"
                role="tab"
                id={`fleet-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`fleet-panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                className={`fleet-tab${isActive ? " fleet-tab--active" : ""}`}
                onClick={() => handleTabChange(tab.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                key={tab.id}
              >
                {tab.label}
                <span>{fleetRecords[tab.id].length}</span>
              </button>
            );
          })}
        </div>

        {tabs.map((tab) => (
          <div
            className="fleet-yard__tabpanel"
            id={`fleet-panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`fleet-tab-${tab.id}`}
            tabIndex={0}
            hidden={activeTab !== tab.id}
            key={tab.id}
          >
            {activeTab === tab.id && (
              <div className="fleet-yard__panel">
                <FleetAttention type={activeTab} records={activeRecords} />

                <FleetRegister
                  type={activeTab}
                  allRecords={activeRecords}
                  records={filteredRecords}
                  selectedId={selectedRecord?.id}
                  searchTerm={activeFilters.search}
                  statusFilter={activeFilters.status}
                  onSearchChange={(search) => updateActiveFilters({ search })}
                  onStatusChange={(status) => updateActiveFilters({ status })}
                  onSelect={handleSelect}
                  onClearFilters={() =>
                    updateActiveFilters({ search: "", status: "Todos" })
                  }
                />

                <FleetInspector
                  type={activeTab}
                  record={selectedRecord}
                  fleetRecords={fleetRecords}
                />
              </div>
            )}
          </div>
        ))}
      </section>

      <p
        className="fleet-sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {selectionAnnouncement}
      </p>
      <p
        className="fleet-sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </p>

      {isFormOpen && (
        <FleetFormModal
          type={activeTab}
          availableTrains={fleetRecords.trains}
          availableDeposits={fleetRecords.deposits}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleCreate}
        />
      )}
    </section>
  );
}

export default FleetManagement;
