import { useMemo, useState } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarClock,
  CirclePlus,
  Info,
  MoreHorizontal,
  Search,
  UsersRound,
  X,
} from "lucide-react";
import {
  availableRoles,
  certifications,
  employees,
  roles,
  shifts,
} from "../data/personnelData";
import PersonnelFormModal from "../components/PersonnelFormModal";
import "../styles/personnel.css";

const tabInformation = {
  employees: {
    label: "Empleados",
    button: "Nuevo empleado",
    search: "Buscar empleados...",
    success: "Empleado registrado correctamente.",
  },
  roles: {
    label: "Puestos",
    button: "Nuevo puesto",
    search: "Buscar puestos...",
    success: "Puesto registrado correctamente.",
  },
  shifts: {
    label: "Turnos",
    button: "Asignar turno",
    search: "Buscar turnos...",
    success: "Turno asignado correctamente.",
  },
  certifications: {
    label: "Certificaciones",
    button: "Nueva certificación",
    search: "Buscar certificaciones...",
    success: "Certificación registrada correctamente.",
  },
};

const filterOptions = {
  employees: ["Todos", "Activo", "Vacaciones", "Suspendido", "Inactivo"],
  roles: ["Todos", "Activo", "Inactivo"],
  shifts: ["Todos", "Programado", "Presente", "Ausente", "Tarde"],
  certifications: ["Todos", "Vigente", "Por vencer", "Vencida"],
};

const prefixes = {
  employees: "EMP",
  roles: "ROL",
  shifts: "TUR",
  certifications: "CER",
};

function formatDate(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatSalary(salary) {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(salary || 0));
}

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

function getStatusClass(status = "") {
  const normalizedStatus = status.toLowerCase();

  if (
    ["activo", "vigente", "presente"].includes(normalizedStatus)
  ) {
    return "success";
  }

  if (
    ["vacaciones", "por vencer", "programado", "tarde"].includes(
      normalizedStatus,
    )
  ) {
    return "warning";
  }

  if (
    ["suspendido", "inactivo", "vencida", "ausente"].includes(
      normalizedStatus,
    )
  ) {
    return "danger";
  }

  return "neutral";
}

function StatusBadge({ status }) {
  return (
    <span className={`personnel-status ${getStatusClass(status)}`}>
      <span />
      {status || "Sin estado"}
    </span>
  );
}

export default function PersonnelManagement() {
  const [activeTab, setActiveTab] = useState("employees");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const [personnelRecords, setPersonnelRecords] = useState({
    employees,
    roles,
    shifts,
    certifications,
  });

  const tabs = [
    {
      id: "employees",
      label: "Empleados",
      count: personnelRecords.employees.length,
    },
    {
      id: "roles",
      label: "Puestos",
      count: personnelRecords.roles.length,
    },
    {
      id: "shifts",
      label: "Turnos",
      count: personnelRecords.shifts.length,
    },
    {
      id: "certifications",
      label: "Certificaciones",
      count: personnelRecords.certifications.length,
    },
  ];

  const activeRecords = personnelRecords[activeTab];

  const filteredRecords = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return activeRecords.filter((record) => {
      const searchableText = Object.values(record)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .join(" ")
        .toLowerCase();

      const recordStatus =
        activeTab === "shifts" ? record.attendance : record.status;

      const matchesSearch =
        !normalizedSearch || searchableText.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "Todos" || recordStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [activeRecords, activeTab, search, statusFilter]);

  const activeEmployees = personnelRecords.employees.filter(
    (employee) => employee.status === "Activo",
  ).length;

  const activeRoles = personnelRecords.roles.filter(
    (role) => role.status === "Activo",
  ).length;

  const validCertifications = personnelRecords.certifications.filter(
    (certification) => certification.status === "Vigente",
  ).length;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearch("");
    setStatusFilter("Todos");
    setNotice("");
  };

  const handleCreate = (formData) => {
    const generatedId = `${prefixes[activeTab]}-${String(Date.now()).slice(
      -6,
    )}`;

    const newRecord = {
      id: generatedId,
      ...formData,
    };

    setPersonnelRecords((currentRecords) => ({
      ...currentRecords,
      [activeTab]: [...currentRecords[activeTab], newRecord],
    }));

    setSearch("");
    setStatusFilter("Todos");
    setIsModalOpen(false);
    setNotice(tabInformation[activeTab].success);
  };

  const renderEmptyRow = (columns) => (
    <tr>
      <td colSpan={columns}>
        <div className="personnel-empty">
          <Search size={22} />
          <strong>No se encontraron resultados</strong>
          <span>Prueba cambiando la búsqueda o el filtro seleccionado.</span>
        </div>
      </td>
    </tr>
  );

  const renderEmployeesTable = () => (
    <table className="personnel-table">
      <thead>
        <tr>
          <th>Empleado</th>
          <th>Contacto</th>
          <th>Puesto</th>
          <th>Contratación</th>
          <th>Salario</th>
          <th>Estado</th>
          <th aria-label="Acciones" />
        </tr>
      </thead>

      <tbody>
        {filteredRecords.length === 0
          ? renderEmptyRow(7)
          : filteredRecords.map((employee) => (
              <tr key={employee.id}>
                <td>
                  <div className="personnel-identity">
                    <div className="employee-avatar">
                      {getInitials(employee.name)}
                    </div>

                    <div>
                      <strong>{employee.name}</strong>
                      <span>{employee.id}</span>
                    </div>
                  </div>
                </td>

                <td>
                  <div className="contact-information">
                    <strong>{employee.email}</strong>
                    <span>{employee.phone}</span>
                  </div>
                </td>

                <td>
                  <span className="role-badge">{employee.role}</span>
                </td>

                <td>{formatDate(employee.hireDate)}</td>
                <td>{formatSalary(employee.salary)}</td>

                <td>
                  <StatusBadge status={employee.status} />
                </td>

                <td>
                  <button
                    type="button"
                    className="personnel-row-action"
                    aria-label={`Opciones de ${employee.name}`}
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
      </tbody>
    </table>
  );

  const renderRolesTable = () => (
    <table className="personnel-table">
      <thead>
        <tr>
          <th>Puesto</th>
          <th>Descripción</th>
          <th>Empleados</th>
          <th>Estado</th>
          <th aria-label="Acciones" />
        </tr>
      </thead>

      <tbody>
        {filteredRecords.length === 0
          ? renderEmptyRow(5)
          : filteredRecords.map((role) => (
              <tr key={role.id}>
                <td>
                  <div className="personnel-identity">
                    <div className="role-icon">
                      <BriefcaseBusiness size={18} />
                    </div>

                    <div>
                      <strong>{role.name}</strong>
                      <span>{role.id}</span>
                    </div>
                  </div>
                </td>

                <td>
                  <p className="role-description">{role.description}</p>
                </td>

                <td>
                  <span className="employee-count">
                    <UsersRound size={16} />
                    {role.employees ?? role.employeeCount ?? 0}
                  </span>
                </td>

                <td>
                  <StatusBadge status={role.status} />
                </td>

                <td>
                  <button
                    type="button"
                    className="personnel-row-action"
                    aria-label={`Opciones de ${role.name}`}
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
      </tbody>
    </table>
  );

  const renderShiftsTable = () => (
    <table className="personnel-table">
      <thead>
        <tr>
          <th>Turno</th>
          <th>Empleado</th>
          <th>Fecha</th>
          <th>Horario</th>
          <th>Lugar</th>
          <th>Función</th>
          <th>Asistencia</th>
          <th aria-label="Acciones" />
        </tr>
      </thead>

      <tbody>
        {filteredRecords.length === 0
          ? renderEmptyRow(8)
          : filteredRecords.map((shift) => (
              <tr key={shift.id}>
                <td>
                  <span className="shift-code">{shift.id}</span>
                </td>

                <td>
                  <div className="personnel-identity">
                    <div className="employee-avatar">
                      {getInitials(shift.employee)}
                    </div>

                    <div>
                      <strong>{shift.employee}</strong>
                      <span>{shift.employeeId}</span>
                    </div>
                  </div>
                </td>

                <td>{formatDate(shift.date)}</td>

                <td>
                  <span className="shift-hours">
                    {shift.start} – {shift.end}
                  </span>
                </td>

                <td>{shift.workplace}</td>
                <td>{shift.function}</td>

                <td>
                  <StatusBadge status={shift.attendance} />
                </td>

                <td>
                  <button
                    type="button"
                    className="personnel-row-action"
                    aria-label={`Opciones del turno ${shift.id}`}
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
      </tbody>
    </table>
  );

  const renderCertificationsTable = () => (
    <table className="personnel-table">
      <thead>
        <tr>
          <th>Certificación</th>
          <th>Empleado</th>
          <th>Vigencia</th>
          <th>Institución</th>
          <th>Modelos</th>
          <th>Estado</th>
          <th aria-label="Acciones" />
        </tr>
      </thead>

      <tbody>
        {filteredRecords.length === 0
          ? renderEmptyRow(7)
          : filteredRecords.map((certification) => (
              <tr key={certification.id}>
                <td>
                  <div>
                    <strong>{certification.type}</strong>
                    <span className="certification-code">
                      {certification.id}
                    </span>
                  </div>
                </td>

                <td>
                  <div className="personnel-identity">
                    <div className="employee-avatar">
                      {getInitials(certification.employee)}
                    </div>

                    <div>
                      <strong>{certification.employee}</strong>
                      <span>{certification.employeeId}</span>
                    </div>
                  </div>
                </td>

                <td>
                  <div className="contact-information">
                    <strong>{formatDate(certification.issueDate)}</strong>
                    <span>
                      Vence: {formatDate(certification.expirationDate)}
                    </span>
                  </div>
                </td>

                <td>{certification.institution}</td>

                <td>
                  <span className="models-label">
                    {Array.isArray(certification.models)
                      ? certification.models.join(", ") || "No aplica"
                      : certification.models || "No aplica"}
                  </span>
                </td>

                <td>
                  <StatusBadge status={certification.status} />
                </td>

                <td>
                  <button
                    type="button"
                    className="personnel-row-action"
                    aria-label={`Opciones de ${certification.type}`}
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
      </tbody>
    </table>
  );

  const renderActiveTable = () => {
    if (activeTab === "employees") return renderEmployeesTable();
    if (activeTab === "roles") return renderRolesTable();
    if (activeTab === "shifts") return renderShiftsTable();

    return renderCertificationsTable();
  };

  return (
    <main className="personnel-page">
      <header className="personnel-heading">
        <div>
          <span className="personnel-eyebrow">
            GESTIÓN DEL TALENTO HUMANO
          </span>

          <h1>Administración de personal</h1>

          <p>
            Gestiona empleados, puestos, turnos y certificaciones del sistema.
          </p>
        </div>

        <button
          type="button"
          className="personnel-primary-button"
          onClick={() => {
            setNotice("");
            setIsModalOpen(true);
          }}
        >
          <CirclePlus size={19} />
          {tabInformation[activeTab].button}
        </button>
      </header>

      {notice && (
        <div className="personnel-notice" role="status">
          <Info size={18} />

          <span>{notice}</span>

          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Cerrar mensaje"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <section className="personnel-summary">
        <article>
          <div className="personnel-summary-icon employees">
            <UsersRound size={21} />
          </div>

          <div>
            <strong>{personnelRecords.employees.length}</strong>
            <span>Empleados registrados</span>
          </div>
        </article>

        <article>
          <div className="personnel-summary-icon active">
            <BadgeCheck size={21} />
          </div>

          <div>
            <strong>{activeEmployees}</strong>
            <span>Empleados activos</span>
          </div>
        </article>

        <article>
          <div className="personnel-summary-icon roles">
            <BriefcaseBusiness size={21} />
          </div>

          <div>
            <strong>{activeRoles}</strong>
            <span>Puestos activos</span>
          </div>
        </article>

        <article>
          <div className="personnel-summary-icon certifications">
            <CalendarClock size={21} />
          </div>

          <div>
            <strong>{validCertifications}</strong>
            <span>Certificaciones vigentes</span>
          </div>
        </article>
      </section>

      <section className="personnel-panel">
        <nav className="personnel-tabs" aria-label="Secciones de personal">
          {tabs.map((tab) => (
            <button
          type="button"
              key={tab.id}
              className={`personnel-tab ${
              activeTab === tab.id ? "active" : ""
             }`}
              onClick={() => handleTabChange(tab.id)}
              >
             {tab.label}
              <span className="personnel-tab-count">{tab.count}</span>
              </button>
          ))}
        </nav>

        <div className="personnel-toolbar">
          <label className="personnel-search">
            <Search size={19} />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={tabInformation[activeTab].search}
            />
          </label>

          <label className="personnel-filter">
            <span>Estado:</span>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {filterOptions[activeTab].map((option) => (
                <option value={option} key={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <span className="personnel-results">
            {filteredRecords.length}{" "}
            {filteredRecords.length === 1 ? "resultado" : "resultados"}
          </span>
        </div>

        <div className="personnel-table-container">
          {renderActiveTable()}
        </div>
      </section>

      {isModalOpen && (
        <PersonnelFormModal
          type={activeTab}
          availableEmployees={personnelRecords.employees}
          availableRoles={availableRoles}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreate}
        />
      )}
    </main>
  );
}