import { useMemo, useState } from "react";
import {
  CirclePlus,
  CreditCard,
  DollarSign,
  Info,
  MoreHorizontal,
  Search,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import {
  availableCardTypes,
  availableFareCategories,
  availablePaymentMethods,
  fares,
  metroCards,
  passengers,
  recharges,
} from "../data/passengerData";
import PassengerFormModal from "../components/PassengerFormModal";
import "../styles/passengers.css";

const tabs = [
  { id: "passengers", label: "Pasajeros" },
  { id: "cards", label: "Tarjetas" },
  { id: "recharges", label: "Recargas" },
  { id: "fares", label: "Tarifas" },
];

const statusOptions = {
  passengers: ["Todos", "Activo", "Suspendido", "Inactivo"],
  cards: ["Todos", "Activa", "Por vencer", "Bloqueada", "Vencida"],
  recharges: ["Todos", "Aprobada", "Pendiente", "Rechazada"],
  fares: ["Todos", "Activa", "Inactiva"],
};

const actionLabels = {
  passengers: "Nuevo pasajero",
  cards: "Nueva tarjeta",
  recharges: "Registrar recarga",
  fares: "Nueva tarifa",
};

const successMessages = {
  passengers: "Pasajero registrado correctamente.",
  cards: "Tarjeta emitida correctamente.",
  recharges: "Recarga registrada correctamente.",
  fares: "Tarifa registrada correctamente.",
};

const recordPrefixes = {
  passengers: "PAS",
  cards: "CARD",
  recharges: "REC",
  fares: "TAR",
};

function normalizeText(value) {
  return String(value)
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
  if (!value) return "—";

  return new Intl.DateTimeFormat("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

function getStatusClass(status) {
  if (
    status === "Activo" ||
    status === "Activa" ||
    status === "Aprobada"
  ) {
    return "passenger-status passenger-status--success";
  }

  if (status === "Por vencer" || status === "Pendiente") {
    return "passenger-status passenger-status--warning";
  }

  return "passenger-status passenger-status--danger";
}

function PassengersTable({ records }) {
  return (
    <table className="passengers-table">
      <thead>
        <tr>
          <th>Pasajero</th>
          <th>Documento</th>
          <th>Contacto</th>
          <th>Registro</th>
          <th>Viajes</th>
          <th>Estado</th>
          <th aria-label="Acciones" />
        </tr>
      </thead>

      <tbody>
        {records.map((passenger) => (
          <tr key={passenger.id}>
            <td>
              <div className="passenger-identity">
                <span className="passenger-avatar">
                  {getInitials(passenger.name)}
                </span>

                <div>
                  <strong>{passenger.name}</strong>
                  <small>{passenger.id}</small>
                </div>
              </div>
            </td>

            <td>
              <span className="passenger-document">
                {passenger.document}
              </span>
            </td>

            <td>
              <div className="passenger-contact">
                <strong>{passenger.email}</strong>
                <span>{passenger.phone}</span>
              </div>
            </td>

            <td>{formatDate(passenger.registrationDate)}</td>

            <td>
              <span className="passenger-trip-count">
                {passenger.trips}
              </span>
            </td>

            <td>
              <span className={getStatusClass(passenger.status)}>
                {passenger.status}
              </span>
            </td>

            <td>
              <button
                type="button"
                className="passenger-row-action"
                aria-label={`Opciones de ${passenger.name}`}
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

function CardsTable({ records }) {
  return (
    <table className="passengers-table">
      <thead>
        <tr>
          <th>Tarjeta</th>
          <th>Pasajero</th>
          <th>Tipo</th>
          <th>Saldo</th>
          <th>Emisión</th>
          <th>Vencimiento</th>
          <th>Estado</th>
          <th aria-label="Acciones" />
        </tr>
      </thead>

      <tbody>
        {records.map((card) => (
          <tr key={card.id}>
            <td>
              <div className="metro-card-identity">
                <span>
                  <CreditCard size={17} />
                </span>

                <div>
                  <strong>
                    •••• •••• •••• {card.number.slice(-4)}
                  </strong>
                  <small>{card.id}</small>
                </div>
              </div>
            </td>

            <td>
              <div className="passenger-contact">
                <strong>{card.passenger}</strong>
                <span>{card.passengerId}</span>
              </div>
            </td>

            <td>
              <span className="card-type-badge">{card.type}</span>
            </td>

            <td>
              <strong className="card-balance">
                {formatCurrency(card.balance)}
              </strong>
            </td>

            <td>{formatDate(card.issueDate)}</td>
            <td>{formatDate(card.expirationDate)}</td>

            <td>
              <span className={getStatusClass(card.status)}>
                {card.status}
              </span>
            </td>

            <td>
              <button
                type="button"
                className="passenger-row-action"
                aria-label={`Opciones de la tarjeta ${card.id}`}
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

function RechargesTable({ records }) {
  return (
    <table className="passengers-table">
      <thead>
        <tr>
          <th>Transacción</th>
          <th>Tarjeta</th>
          <th>Pasajero</th>
          <th>Fecha y hora</th>
          <th>Monto</th>
          <th>Método</th>
          <th>Estado</th>
          <th aria-label="Acciones" />
        </tr>
      </thead>

      <tbody>
        {records.map((recharge) => (
          <tr key={recharge.id}>
            <td>
              <div className="recharge-identity">
                <strong>{recharge.id}</strong>
                <span>{recharge.reference}</span>
              </div>
            </td>

            <td>
              <span className="recharge-card">
                {recharge.cardNumber}
              </span>
            </td>

            <td>{recharge.passenger}</td>

            <td>
              <div className="recharge-date">
                <strong>{formatDate(recharge.date)}</strong>
                <span>{recharge.time}</span>
              </div>
            </td>

            <td>
              <strong className="recharge-amount">
                +{formatCurrency(recharge.amount)}
              </strong>
            </td>

            <td>
              <span className="payment-method">
                {recharge.method}
              </span>
            </td>

            <td>
              <span className={getStatusClass(recharge.status)}>
                {recharge.status}
              </span>
            </td>

            <td>
              <button
                type="button"
                className="passenger-row-action"
                aria-label={`Opciones de la recarga ${recharge.id}`}
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

function FaresTable({ records }) {
  return (
    <table className="passengers-table">
      <thead>
        <tr>
          <th>Tarifa</th>
          <th>Descripción</th>
          <th>Categoría</th>
          <th>Precio</th>
          <th>Vigencia</th>
          <th>Estado</th>
          <th aria-label="Acciones" />
        </tr>
      </thead>

      <tbody>
        {records.map((fare) => (
          <tr key={fare.id}>
            <td>
              <div className="fare-identity">
                <strong>{fare.name}</strong>
                <span>{fare.id}</span>
              </div>
            </td>

            <td>
              <p className="fare-description">{fare.description}</p>
            </td>

            <td>
              <span className="fare-category">{fare.category}</span>
            </td>

            <td>
              <strong className="fare-price">
                {formatCurrency(fare.price)}
              </strong>
            </td>

            <td>{fare.validity}</td>

            <td>
              <span className={getStatusClass(fare.status)}>
                {fare.status}
              </span>
            </td>

            <td>
              <button
                type="button"
                className="passenger-row-action"
                aria-label={`Opciones de ${fare.name}`}
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

function PassengerManagement() {
  const [activeTab, setActiveTab] = useState("passengers");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const [records, setRecords] = useState({
    passengers,
    cards: metroCards,
    recharges,
    fares,
  });

  const activeCards = records.cards.filter(
    (card) => card.status === "Activa",
  ).length;

  const approvedRechargeTotal = records.recharges
    .filter((recharge) => recharge.status === "Aprobada")
    .reduce((total, recharge) => total + recharge.amount, 0);

  const activeFares = records.fares.filter(
    (fare) => fare.status === "Activa",
  ).length;

  const filteredRecords = useMemo(() => {
    return records[activeTab].filter((record) => {
      const matchesSearch = normalizeText(
        Object.values(record).flat().join(" "),
      ).includes(normalizeText(searchTerm));

      const matchesStatus =
        statusFilter === "Todos" || record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [records, activeTab, searchTerm, statusFilter]);

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    setSearchTerm("");
    setStatusFilter("Todos");
    setNotice("");
    setIsModalOpen(false);
  }

  function handleCreate(formData) {
    const generatedId = `${recordPrefixes[activeTab]}-${String(
      Date.now(),
    ).slice(-6)}`;

    const newRecord = {
      id: generatedId,
      ...formData,
    };

    setRecords((currentRecords) => ({
      ...currentRecords,
      [activeTab]: [...currentRecords[activeTab], newRecord],
    }));

    setSearchTerm("");
    setStatusFilter("Todos");
    setIsModalOpen(false);
    setNotice(successMessages[activeTab]);
  }

  function renderActiveTable() {
    if (activeTab === "passengers") {
      return <PassengersTable records={filteredRecords} />;
    }

    if (activeTab === "cards") {
      return <CardsTable records={filteredRecords} />;
    }

    if (activeTab === "recharges") {
      return <RechargesTable records={filteredRecords} />;
    }

    return <FaresTable records={filteredRecords} />;
  }

  return (
    <div className="passengers-page">
      <section className="passengers-heading">
        <div>
          <span className="passengers-heading__eyebrow">
            Gestión de usuarios y pagos
          </span>

          <h2>Pasajeros y tarjetas</h2>

          <p>
            Administra pasajeros, tarjetas del metro, recargas y tarifas.
          </p>
        </div>

        <button
          type="button"
          className="passengers-primary-button"
          onClick={() => {
            setNotice("");
            setIsModalOpen(true);
          }}
        >
          <CirclePlus size={18} />
          {actionLabels[activeTab]}
        </button>
      </section>

      {notice && (
        <div className="passengers-notice" role="status">
          <Info size={18} />

          <div>
            <strong>Registro guardado</strong>
            <span>{notice}</span>
          </div>

          <button
            type="button"
            aria-label="Cerrar aviso"
            onClick={() => setNotice("")}
          >
            <X size={18} />
          </button>
        </div>
      )}

      <section className="passengers-summary">
        <article>
          <UsersRound size={20} />

          <div>
            <strong>{records.passengers.length}</strong>
            <span>Pasajeros registrados</span>
          </div>
        </article>

        <article>
          <CreditCard size={20} />

          <div>
            <strong>{activeCards}</strong>
            <span>Tarjetas activas</span>
          </div>
        </article>

        <article>
          <DollarSign size={20} />

          <div>
            <strong>{formatCurrency(approvedRechargeTotal)}</strong>
            <span>Recargas aprobadas</span>
          </div>
        </article>

        <article>
          <WalletCards size={20} />

          <div>
            <strong>{activeFares}</strong>
            <span>Tarifas disponibles</span>
          </div>
        </article>
      </section>

      <section className="passengers-panel">
        <div className="passengers-tabs">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              className={
                activeTab === tab.id
                  ? "passengers-tab passengers-tab--active"
                  : "passengers-tab"
              }
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
              <span>{records[tab.id].length}</span>
            </button>
          ))}
        </div>

        <div className="passengers-toolbar">
          <label className="passengers-search">
            <Search size={18} />

            <input
              type="search"
              value={searchTerm}
              placeholder={`Buscar en ${tabs
                .find((tab) => tab.id === activeTab)
                .label.toLowerCase()}...`}
              aria-label="Buscar registros"
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <label className="passengers-filter">
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

          <span className="passengers-results">
            {filteredRecords.length} resultados
          </span>
        </div>

        <div className="passengers-table-wrapper">
          {renderActiveTable()}
        </div>

        {filteredRecords.length === 0 && (
          <div className="passengers-empty">
            <Search size={25} />
            <strong>No encontramos resultados</strong>
            <span>
              Prueba con otro texto o cambia el filtro seleccionado.
            </span>
          </div>
        )}
      </section>

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
    </div>
  );
}

export default PassengerManagement;