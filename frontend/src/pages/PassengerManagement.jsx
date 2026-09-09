import { useMemo, useRef, useState } from "react";
import {
  CirclePlus,
  CreditCard,
  ReceiptText,
  Search,
  TicketCheck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import PassengerFormModal from "../components/PassengerFormModal";
import {
  availableCardTypes,
  availableFareCategories,
  availablePaymentMethods,
  fares,
  metroCards,
  passengers,
  recharges,
} from "../data/passengerData";
import "../styles/passengers.css";

const tabs = [
  { id: "passengers", label: "Pasajeros" },
  { id: "cards", label: "Tarjetas" },
  { id: "recharges", label: "Recargas" },
  { id: "fares", label: "Tarifas" },
];

const tabInformation = {
  passengers: {
    action: "Nuevo pasajero",
    search: "Buscar por nombre, código o estado",
    singular: "pasajero",
  },
  cards: {
    action: "Nueva tarjeta",
    search: "Buscar por código, pasajero, terminación, tipo o estado",
    singular: "tarjeta",
  },
  recharges: {
    action: "Registrar recarga",
    search: "Buscar por código, referencia, nombre, fecha, método o estado",
    singular: "recarga",
  },
  fares: {
    action: "Nueva tarifa",
    search: "Buscar por código, nombre, categoría, vigencia o estado",
    singular: "tarifa",
  },
};

const statusOptions = {
  passengers: ["Todos", "Activo", "Suspendido", "Inactivo"],
  cards: ["Todos", "Activa", "Por vencer", "Bloqueada", "Vencida"],
  recharges: ["Todos", "Aprobada", "Pendiente", "Rechazada"],
  fares: ["Todos", "Activa", "Inactiva"],
};

const recordPrefixes = {
  passengers: "PAS",
  cards: "CARD",
  recharges: "REC",
  fares: "TAR",
};

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "Sin fecha registrada";

  return new Intl.DateTimeFormat("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function maskCardNumber(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  const ending = digits.slice(-4);

  return ending ? `•••• ${ending}` : "Sin número registrado";
}

function getSearchableText(record, type, records) {
  if (type === "passengers") {
    return [record.id, record.name, record.status].join(" ");
  }

  if (type === "cards") {
    const passenger = records.passengers.find(
      (item) => item.id === record.passengerId,
    );

    return [
      record.id,
      passenger?.name,
      maskCardNumber(record.number),
      String(record.number ?? "").replace(/\D/g, "").slice(-4),
      record.type,
      record.status,
    ].join(" ");
  }

  if (type === "recharges") {
    return [
      record.id,
      record.reference,
      record.passenger,
      maskCardNumber(record.cardNumber),
      record.date,
      record.time,
      record.method,
      record.status,
    ].join(" ");
  }

  return [
    record.id,
    record.name,
    record.category,
    record.validity,
    record.status,
  ].join(" ");
}

function recordMatches(record, type, searchTerm, statusFilter, records) {
  const normalizedSearch = normalizeText(searchTerm.trim());
  const matchesSearch =
    !normalizedSearch ||
    normalizeText(getSearchableText(record, type, records)).includes(
      normalizedSearch,
    );
  const matchesStatus =
    statusFilter === "Todos" || record.status === statusFilter;

  return matchesSearch && matchesStatus;
}

function isStandardRecord(record, type) {
  const standardStatuses = {
    passengers: "Activo",
    cards: "Activa",
    recharges: "Aprobada",
    fares: "Activa",
  };

  return record.status === standardStatuses[type];
}

function getPreferredRecordId(records, type) {
  return (
    records.find((record) => !isStandardRecord(record, type))?.id ??
    records[0]?.id
  );
}

function getStatusTone(type, status) {
  if (type === "passengers") {
    return status === "Activo" ? "steady" : "neutral";
  }

  if (type === "cards") {
    if (status === "Activa") return "steady";
    if (status === "Por vencer") return "review";
    if (status === "Bloqueada") return "restricted";
    if (status === "Vencida") return "expired";
  }

  if (type === "recharges") {
    if (status === "Aprobada") return "steady";
    if (status === "Pendiente") return "review";
    if (status === "Rechazada") return "declined";
  }

  if (type === "fares" && status === "Activa") return "steady";

  return "neutral";
}

function LedgerStatus({ type, status }) {
  return (
    <span
      className={`passenger-status passenger-status--${getStatusTone(
        type,
        status,
      )}`}
    >
      <span aria-hidden="true" />
      {status || "Sin estado registrado"}
    </span>
  );
}

function InstrumentBand({ type, records }) {
  const activeRecords = records[type];
  let readings;

  if (type === "passengers") {
    readings = [
      ["Pasajeros registrados", activeRecords.length],
      ["Estado Activo", activeRecords.filter((record) => record.status === "Activo").length],
      ["Estado Suspendido", activeRecords.filter((record) => record.status === "Suspendido").length],
      ["Estado Inactivo", activeRecords.filter((record) => record.status === "Inactivo").length],
    ];
  } else if (type === "cards") {
    readings = [
      ["Tarjetas registradas", activeRecords.length],
      ["Estado Activa", activeRecords.filter((record) => record.status === "Activa").length],
      ["Estado Por vencer", activeRecords.filter((record) => record.status === "Por vencer").length],
      ["Estado Bloqueada", activeRecords.filter((record) => record.status === "Bloqueada").length],
      ["Estado Vencida", activeRecords.filter((record) => record.status === "Vencida").length],
    ];
  } else if (type === "recharges") {
    const approvedRecords = activeRecords.filter(
      (record) => record.status === "Aprobada",
    );
    const approvedTotal = approvedRecords.reduce(
      (total, record) => total + Number(record.amount || 0),
      0,
    );

    readings = [
      ["Recargas registradas", activeRecords.length],
      ["Estado Aprobada", approvedRecords.length],
      ["Estado Rechazada", activeRecords.filter((record) => record.status === "Rechazada").length],
      ["Estado Pendiente", activeRecords.filter((record) => record.status === "Pendiente").length],
      ["Monto aprobado registrado", formatCurrency(approvedTotal), "Formato USD del demo"],
    ];
  } else {
    const categories = new Set(
      activeRecords.map((record) => record.category).filter(Boolean),
    );

    readings = [
      ["Tarifas registradas", activeRecords.length],
      ["Estado Activa", activeRecords.filter((record) => record.status === "Activa").length],
      ["Estado Inactiva", activeRecords.filter((record) => record.status === "Inactiva").length],
      ["Categorías registradas", categories.size],
    ];
  }

  return (
    <section
      className="passenger-instruments"
      aria-labelledby={`passenger-instruments-title-${type}`}
    >
      <header>
        <h3 id={`passenger-instruments-title-${type}`}>Lecturas del registro</h3>
        <p>Valores directos de los datos de demostración.</p>
      </header>

      <dl
        className={`passenger-readings passenger-readings--${readings.length}`}
      >
        {readings.map(([label, value, note]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
            {note && <small>{note}</small>}
          </div>
        ))}
      </dl>
    </section>
  );
}

function getRegisterTitle(record, type) {
  if (type === "passengers") return record.name;
  if (type === "cards") return `${record.id} · ${maskCardNumber(record.number)}`;
  if (type === "recharges") return `${record.id} · ${record.reference}`;
  return record.name;
}

function getRegisterSecondary(record, type, records) {
  if (type === "passengers") {
    const associationCount = records.cards.filter(
      (card) => card.passengerId === record.id,
    ).length;
    const associationLabel =
      associationCount === 0
        ? "Sin asociación registrada"
        : `${associationCount} ${associationCount === 1 ? "tarjeta asociada" : "tarjetas asociadas"}`;

    return `${record.id} · ${associationLabel}`;
  }

  if (type === "cards") {
    const passenger = records.passengers.find(
      (item) => item.id === record.passengerId,
    );

    return `${passenger?.name ?? "Sin asociación registrada"} · ${record.type}`;
  }

  if (type === "recharges") {
    return `${record.passenger} · ${formatDate(record.date)} ${record.time} · ${record.method}`;
  }

  return `${record.id} · ${record.category} · ${record.validity}`;
}

function getSelectionLabel(record, type) {
  if (type === "cards") {
    const ending = String(record.number ?? "").replace(/\D/g, "").slice(-4);
    return `Inspeccionar tarjeta ${record.id}, terminación ${ending}; estado ${record.status}`;
  }

  return `Inspeccionar ${tabInformation[type].singular} ${record.id}; estado registrado ${record.status}`;
}

function getConditionCopy(type) {
  if (type === "passengers") {
    return {
      title: "Estados de pasajero registrados",
      description: "Condiciones distintas de Activo, sin inferir acceso o conducta.",
    };
  }

  if (type === "cards") {
    return {
      title: "Condiciones de acceso registradas",
      description: "Estados de tarjeta distintos de Activa, sin severidad calculada.",
    };
  }

  if (type === "recharges") {
    return {
      title: "Transacciones no aprobadas",
      description: "El estado pertenece únicamente al registro de recarga.",
    };
  }

  return {
    title: "Estados no activos registrados",
    description: "Tarifas cuyo estado registrado es distinto de Activa.",
  };
}

function RecordGroup({
  title,
  description,
  type,
  records,
  allRecords,
  selectedId,
  onSelect,
}) {
  if (records.length === 0) return null;

  const inspectorId = `passenger-inspector-${type}`;

  return (
    <section className="passenger-record-group" aria-label={title}>
      <header>
        <div>
          <h4>{title}</h4>
          {description && <p>{description}</p>}
        </div>
        <span aria-label={`${records.length} registros`}>{records.length}</span>
      </header>

      <ul>
        {records.map((record) => {
          const isSelected = selectedId === record.id;

          return (
            <li key={record.id}>
              <button
                type="button"
                className={isSelected ? "passenger-record--selected" : undefined}
                aria-controls={inspectorId}
                aria-pressed={isSelected}
                aria-label={getSelectionLabel(record, type)}
                onClick={() => onSelect(record)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(record);
                  }
                }}
              >
                <span className="passenger-record__marker" aria-hidden="true" />
                <span className="passenger-record__copy">
                  <strong>{getRegisterTitle(record, type)}</strong>
                  <small>{getRegisterSecondary(record, type, allRecords)}</small>
                </span>
                {type === "recharges" && (
                  <span className="passenger-record__amount">
                    {formatCurrency(record.amount)}
                  </span>
                )}
                <LedgerStatus type={type} status={record.status} />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function LedgerRegister({
  type,
  allRecords,
  records,
  ledgerRecords,
  filters,
  selectedId,
  onFilterChange,
  onSelect,
  onClear,
}) {
  const information = tabInformation[type];
  const conditions = records.filter((record) => !isStandardRecord(record, type));
  const standardRecords = records.filter((record) => isStandardRecord(record, type));
  const conditionCopy = getConditionCopy(type);
  const hasFilters = filters.search || filters.status !== "Todos";

  return (
    <section
      className="passenger-register"
      aria-labelledby={`passenger-register-title-${type}`}
    >
      <header className="passenger-register__heading">
        <div>
          <h3 id={`passenger-register-title-${type}`}>Registro seleccionable</h3>
          <p>Selecciona una fila para consultar su ficha.</p>
        </div>
        <span
          className="passenger-results"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {records.length} {records.length === 1 ? "resultado" : "resultados"}
        </span>
      </header>

      <div className="passenger-toolbar">
        <label className="passenger-search">
          <span className="passenger-sr-only">{information.search}</span>
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => onFilterChange({ search: event.target.value })}
            placeholder={information.search}
          />
        </label>

        <label className="passenger-filter">
          <span>Estado</span>
          <select
            value={filters.status}
            onChange={(event) => onFilterChange({ status: event.target.value })}
          >
            {statusOptions[type].map((option) => (
              <option value={option} key={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      {records.length > 0 ? (
        <div className="passenger-register__groups" aria-busy="false">
          <RecordGroup
            title={conditionCopy.title}
            description={conditionCopy.description}
            type={type}
            records={conditions}
            allRecords={ledgerRecords}
            selectedId={selectedId}
            onSelect={onSelect}
          />
          <RecordGroup
            title={conditions.length > 0 ? "Registro regular" : "Registro"}
            description={
              conditions.length > 0
                ? `Registros con estado ${
                    type === "passengers"
                      ? "Activo"
                      : type === "recharges"
                        ? "Aprobada"
                        : "Activa"
                  }.`
                : undefined
            }
            type={type}
            records={standardRecords}
            allRecords={ledgerRecords}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        </div>
      ) : (
        <div className="passenger-empty" role="status">
          <Search size={23} aria-hidden="true" />
          <strong>No se encontraron registros</strong>
          <span>
            {allRecords.length === 0
              ? "Los registros creados durante esta sesión aparecerán aquí."
              : "Ajusta la búsqueda o el filtro seleccionado."}
          </span>
          {allRecords.length > 0 && hasFilters && (
            <button type="button" onClick={onClear}>
              Limpiar búsqueda y filtro
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function DetailItem({ label, children, wide = false }) {
  return (
    <div className={wide ? "passenger-detail--wide" : undefined}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function InspectorHeader({ icon: Icon, title, description, type, status }) {
  return (
    <header className="passenger-inspector__header">
      <span className="passenger-inspector__icon" aria-hidden="true">
        <Icon size={23} strokeWidth={1.8} />
      </span>
      <div>
        <h3 id={`passenger-inspector-title-${type}`}>{title}</h3>
        <p>{description}</p>
      </div>
      <LedgerStatus type={type} status={status} />
    </header>
  );
}

function PassengerInspector({ passenger, records }) {
  const associatedCards = records.cards.filter(
    (card) => card.passengerId === passenger.id,
  );

  return (
    <>
      <InspectorHeader
        icon={UserRound}
        title={passenger.name}
        description={`${passenger.id} · Registro de pasajero`}
        type="passengers"
        status={passenger.status}
      />

      <section className="passenger-inspector__section" aria-labelledby="passenger-record-details-title">
        <h4 id="passenger-record-details-title">Condición registrada</h4>
        <dl className="passenger-detail-grid">
          <DetailItem label="Código de pasajero">{passenger.id}</DetailItem>
          <DetailItem label="Estado del pasajero">{passenger.status}</DetailItem>
          <DetailItem label="Fecha de registro">
            <time dateTime={passenger.registrationDate}>{formatDate(passenger.registrationDate)}</time>
          </DetailItem>
          <DetailItem label="Viajes registrados">{passenger.trips}</DetailItem>
        </dl>
        <p className="passenger-inspector__note">
          Viajes registrados es un conteo agregado; no representa historial ni actividad en tiempo real.
        </p>
      </section>

      <section className="passenger-associations" aria-labelledby="passenger-associated-cards-title">
        <header>
          <div>
            <h4 id="passenger-associated-cards-title">Tarjetas asociadas</h4>
            <p>Relación verificada exclusivamente mediante el código de pasajero.</p>
          </div>
          <span aria-label={`${associatedCards.length} tarjetas asociadas`}>{associatedCards.length}</span>
        </header>

        {associatedCards.length > 0 ? (
          <ul>
            {associatedCards.map((card) => (
              <li key={card.id}>
                <span>
                  <strong>{card.id} · {maskCardNumber(card.number)}</strong>
                  <small>{card.type} · Saldo registrado {formatCurrency(card.balance)}</small>
                </span>
                <LedgerStatus type="cards" status={card.status} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="passenger-associations__empty">Sin asociación registrada</p>
        )}
      </section>

      <details className="passenger-sensitive">
        <summary>Mostrar datos administrativos sensibles</summary>
        <p>Información personal incluida únicamente en esta demostración.</p>
        <dl className="passenger-detail-grid">
          <DetailItem label="Documento de identificación">{passenger.document || "Sin registro"}</DetailItem>
          <DetailItem label="Teléfono">{passenger.phone || "Sin registro"}</DetailItem>
          <DetailItem label="Correo electrónico" wide>{passenger.email || "Sin registro"}</DetailItem>
        </dl>
      </details>
    </>
  );
}

function CardInspector({ card, records }) {
  const passenger = records.passengers.find(
    (record) => record.id === card.passengerId,
  );

  return (
    <>
      <InspectorHeader
        icon={CreditCard}
        title={card.id}
        description={`${maskCardNumber(card.number)} · Tarjeta interna del metro`}
        type="cards"
        status={card.status}
      />

      <section className="passenger-inspector__section" aria-labelledby="card-record-details-title">
        <h4 id="card-record-details-title">Ficha tarifaria registrada</h4>
        <dl className="passenger-detail-grid">
          <DetailItem label="Código interno">{card.id}</DetailItem>
          <DetailItem label="Número enmascarado">{maskCardNumber(card.number)}</DetailItem>
          <DetailItem label="Tipo de tarjeta">{card.type}</DetailItem>
          <DetailItem label="Estado de la tarjeta">{card.status}</DetailItem>
          <DetailItem label="Saldo registrado">{formatCurrency(card.balance)}</DetailItem>
          <DetailItem label="Pasajero asociado">
            {passenger ? `${passenger.id} · ${passenger.name}` : "Sin asociación registrada"}
          </DetailItem>
          <DetailItem label="Fecha de emisión">
            <time dateTime={card.issueDate}>{formatDate(card.issueDate)}</time>
          </DetailItem>
          <DetailItem label="Fecha de vencimiento">
            <time dateTime={card.expirationDate}>{formatDate(card.expirationDate)}</time>
          </DetailItem>
        </dl>
      </section>

      <p className="passenger-inspector__note passenger-inspector__note--standalone">
        El saldo usa el formato USD de la interfaz de demostración; la moneda no forma parte del registro. El estado se muestra tal como está almacenado y no se deriva de las fechas.
      </p>
    </>
  );
}

function RechargeInspector({ recharge }) {
  return (
    <>
      <InspectorHeader
        icon={ReceiptText}
        title={recharge.id}
        description={`${recharge.reference} · Recarga registrada`}
        type="recharges"
        status={recharge.status}
      />

      <section className="passenger-inspector__section" aria-labelledby="recharge-record-details-title">
        <h4 id="recharge-record-details-title">Transacción registrada</h4>
        <dl className="passenger-detail-grid">
          <DetailItem label="Código de recarga">{recharge.id}</DetailItem>
          <DetailItem label="Referencia">{recharge.reference}</DetailItem>
          <DetailItem label="Tarjeta registrada">{maskCardNumber(recharge.cardNumber)}</DetailItem>
          <DetailItem label="Nombre registrado">{recharge.passenger}</DetailItem>
          <DetailItem label="Fecha">
            <time dateTime={recharge.date}>{formatDate(recharge.date)}</time>
          </DetailItem>
          <DetailItem label="Hora"><time dateTime={recharge.time}>{recharge.time}</time></DetailItem>
          <DetailItem label="Monto registrado">{formatCurrency(recharge.amount)}</DetailItem>
          <DetailItem label="Método registrado">{recharge.method}</DetailItem>
          <DetailItem label="Estado de la recarga" wide>{recharge.status}</DetailItem>
        </dl>
      </section>

      <p className="passenger-inspector__note passenger-inspector__note--standalone">
        La tarjeta y el nombre pertenecen a este registro de demostración; no se establece una relación por coincidencia de nombre o terminación. El monto usa el formato USD de la interfaz.
      </p>
    </>
  );
}

function FareInspector({ fare }) {
  return (
    <>
      <InspectorHeader
        icon={TicketCheck}
        title={fare.name}
        description={`${fare.id} · Registro tarifario`}
        type="fares"
        status={fare.status}
      />

      <section className="passenger-inspector__section" aria-labelledby="fare-record-details-title">
        <h4 id="fare-record-details-title">Definición registrada</h4>
        <dl className="passenger-detail-grid">
          <DetailItem label="Código de tarifa">{fare.id}</DetailItem>
          <DetailItem label="Estado de la tarifa">{fare.status}</DetailItem>
          <DetailItem label="Categoría">{fare.category}</DetailItem>
          <DetailItem label="Precio registrado">{formatCurrency(fare.price)}</DetailItem>
          <DetailItem label="Vigencia registrada" wide>{fare.validity}</DetailItem>
          <DetailItem label="Descripción" wide>{fare.description || "Sin descripción registrada"}</DetailItem>
        </dl>
      </section>

      <p className="passenger-inspector__note passenger-inspector__note--standalone">
        El precio usa el formato USD de la interfaz de demostración. Esta tarifa no se asocia automáticamente con un tipo de tarjeta.
      </p>
    </>
  );
}

function LedgerInspector({ type, record, records }) {
  return (
    <section
      className="passenger-inspector"
      id={`passenger-inspector-${type}`}
      aria-labelledby={`passenger-inspector-title-${type}`}
    >
      {record ? (
        <>
          {type === "passengers" && <PassengerInspector passenger={record} records={records} />}
          {type === "cards" && <CardInspector card={record} records={records} />}
          {type === "recharges" && <RechargeInspector recharge={record} />}
          {type === "fares" && <FareInspector fare={record} />}
        </>
      ) : (
        <div className="passenger-inspector__empty" role="status">
          <UsersRound size={28} aria-hidden="true" />
          <h3 id={`passenger-inspector-title-${type}`}>Sin registro seleccionado</h3>
          <p>Ajusta la búsqueda o el filtro para seleccionar una ficha.</p>
        </div>
      )}
    </section>
  );
}

export default function PassengerManagement() {
  const [activeTab, setActiveTab] = useState("passengers");
  const [filters, setFilters] = useState({
    passengers: { search: "", status: "Todos" },
    cards: { search: "", status: "Todos" },
    recharges: { search: "", status: "Todos" },
    fares: { search: "", status: "Todos" },
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [selectionAnnouncement, setSelectionAnnouncement] = useState("");
  const [records, setRecords] = useState({ passengers, cards: metroCards, recharges, fares });
  const [selectedIds, setSelectedIds] = useState({
    passengers: getPreferredRecordId(passengers, "passengers"),
    cards: getPreferredRecordId(metroCards, "cards"),
    recharges: getPreferredRecordId(recharges, "recharges"),
    fares: getPreferredRecordId(fares, "fares"),
  });
  const tabRefs = useRef([]);

  const activeFilters = filters[activeTab];
  const activeRecords = records[activeTab];
  const filteredRecords = useMemo(
    () =>
      activeRecords.filter((record) =>
        recordMatches(
          record,
          activeTab,
          activeFilters.search,
          activeFilters.status,
          records,
        ),
      ),
    [activeFilters, activeRecords, activeTab, records],
  );
  const selectedRecord = filteredRecords.find((record) => record.id === selectedIds[activeTab]);

  function updateActiveFilters(nextValues) {
    const nextFilters = { ...activeFilters, ...nextValues };
    const nextVisibleRecords = activeRecords.filter((record) =>
      recordMatches(
        record,
        activeTab,
        nextFilters.search,
        nextFilters.status,
        records,
      ),
    );

    setFilters((currentFilters) => ({ ...currentFilters, [activeTab]: nextFilters }));

    if (nextVisibleRecords.length > 0 && !nextVisibleRecords.some((record) => record.id === selectedIds[activeTab])) {
      const nextRecordId = getPreferredRecordId(nextVisibleRecords, activeTab);
      setSelectedIds((currentIds) => ({ ...currentIds, [activeTab]: nextRecordId }));
      setSelectionAnnouncement(
        `${tabInformation[activeTab].singular} ${nextRecordId} seleccionado como primer resultado visible.`,
      );
    }
  }

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    setIsModalOpen(false);
  }

  function handleTabKeyDown(event, index) {
    let nextIndex;

    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;
    else if (event.key === "Enter" || event.key === " ") nextIndex = index;
    else return;

    event.preventDefault();
    handleTabChange(tabs[nextIndex].id);
    requestAnimationFrame(() => tabRefs.current[nextIndex]?.focus());
  }

  function handleSelect(record) {
    setSelectedIds((currentIds) => ({ ...currentIds, [activeTab]: record.id }));
    setSelectionAnnouncement(
      `${tabInformation[activeTab].singular} ${record.id} seleccionado; estado registrado ${record.status}.`,
    );
  }

  function handleCreate(formData) {
    const generatedId = `${recordPrefixes[activeTab]}-${String(Date.now()).slice(-6)}`;
    const newRecord = { id: generatedId, ...formData };
    const isVisible = recordMatches(
      newRecord,
      activeTab,
      activeFilters.search,
      activeFilters.status,
      records,
    );
    const label = tabInformation[activeTab].singular;

    setRecords((currentRecords) => ({
      ...currentRecords,
      [activeTab]: [...currentRecords[activeTab], newRecord],
    }));

    if (isVisible) {
      setSelectedIds((currentIds) => ({ ...currentIds, [activeTab]: newRecord.id }));
      setSelectionAnnouncement(
        `${label} ${newRecord.id} seleccionado; estado registrado ${newRecord.status}.`,
      );
    }

    setAnnouncement(
      `El ${label} ${newRecord.id} se agregó solo a esta sesión de demostración; no se almacena de forma persistente.${
        isVisible ? "" : " Los filtros actuales no incluyen el nuevo registro."
      }`,
    );
    setIsModalOpen(false);
  }

  return (
    <section className="passengers-page" aria-labelledby="passengers-page-title">
      <header className="passengers-heading">
        <div className="passengers-heading__copy">
          <div className="passengers-context" aria-label="Contexto de los datos">
            <span>Datos de demostración</span>
            <span>Acceso tarifario</span>
          </div>
          <h2 id="passengers-page-title">Pasajeros y tarjetas</h2>
          <p>Consulta registros de pasajeros, tarjetas, recargas y tarifas sin inferir actividad en tiempo real.</p>
        </div>

        <button type="button" className="passengers-primary-button" onClick={() => setIsModalOpen(true)}>
          <CirclePlus size={17} aria-hidden="true" />
          {tabInformation[activeTab].action}
        </button>
      </header>

      {announcement && (
        <div className="passengers-session-notice" role="status" aria-live="polite" aria-atomic="true">
          <span>{announcement}</span>
          <button type="button" aria-label="Cerrar anuncio de sesión" onClick={() => setAnnouncement("")}>
            <X size={17} aria-hidden="true" />
          </button>
        </div>
      )}

      <section className="passenger-ledger" aria-label="Libro de acceso tarifario">
        <div className="passenger-tabs" role="tablist" aria-label="Entidades de acceso tarifario">
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                type="button"
                role="tab"
                id={`passenger-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`passenger-panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                className={`passenger-tab${isActive ? " passenger-tab--active" : ""}`}
                onClick={() => handleTabChange(tab.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                ref={(element) => { tabRefs.current[index] = element; }}
                key={tab.id}
              >
                {tab.label}<span>{records[tab.id].length}</span>
              </button>
            );
          })}
        </div>

        {tabs.map((tab) => (
          <div
            className="passenger-ledger__tabpanel"
            id={`passenger-panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`passenger-tab-${tab.id}`}
            tabIndex={0}
            hidden={activeTab !== tab.id}
            key={tab.id}
          >
            {activeTab === tab.id && (
              <div className="passenger-ledger__panel">
                <InstrumentBand type={activeTab} records={records} />
                <LedgerRegister
                  type={activeTab}
                  allRecords={activeRecords}
                  records={filteredRecords}
                  ledgerRecords={records}
                  filters={activeFilters}
                  selectedId={selectedRecord?.id}
                  onFilterChange={updateActiveFilters}
                  onSelect={handleSelect}
                  onClear={() => updateActiveFilters({ search: "", status: "Todos" })}
                />
                <LedgerInspector type={activeTab} record={selectedRecord} records={records} />
              </div>
            )}
          </div>
        ))}
      </section>

      <p className="passenger-sr-only" role="status" aria-live="polite" aria-atomic="true">
        {selectionAnnouncement}
      </p>

      {isModalOpen && (
        <PassengerFormModal
          type={activeTab}
          availablePassengers={records.passengers}
          availableCards={records.cards}
          cardTypes={availableCardTypes}
          paymentMethods={availablePaymentMethods}
          fareCategories={availableFareCategories}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreate}
        />
      )}
    </section>
  );
}
