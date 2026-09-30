import { useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarClock,
  CirclePlus,
  Search,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import PersonnelFormModal from "../components/PersonnelFormModal";
import {
  availableRoles,
  certifications,
  employees,
  roles,
  shifts,
} from "../data/personnelData";
import "../styles/personnel.css";

const tabs = [
  { id: "employees", label: "Empleados" },
  { id: "roles", label: "Puestos" },
  { id: "shifts", label: "Turnos" },
  { id: "certifications", label: "Certificaciones" },
];

const tabInformation = {
  employees: {
    action: "Nuevo empleado",
    search: "Buscar por nombre, código, puesto o estado",
    singular: "empleado",
  },
  roles: {
    action: "Nuevo puesto",
    search: "Buscar por puesto, código, descripción o estado",
    singular: "puesto",
  },
  shifts: {
    action: "Asignar turno",
    search: "Buscar por turno, empleado, fecha, lugar o función",
    singular: "turno",
  },
  certifications: {
    action: "Nueva certificación",
    search: "Buscar por certificación, empleado, institución o estado",
    singular: "certificación",
  },
};

const filterOptions = {
  employees: [
    "Todos",
    "Activo",
    "De vacaciones",
    "Permiso",
    "Suspendido",
    "Inactivo",
  ],
  roles: ["Todos", "Activo", "Inactivo"],
  shifts: ["Todos", "Programado", "Presente", "Ausente", "Tarde"],
  certifications: ["Todos", "Vigente", "Próxima a vencer", "Vencida"],
};

const prefixes = {
  employees: "EMP",
  roles: "CAR",
  shifts: "TUR",
  certifications: "CER",
};

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatDate(date) {
  if (!date) return "Sin fecha registrada";

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

function formatModels(models) {
  if (Array.isArray(models)) {
    return models.filter(Boolean).join(", ") || "No aplica";
  }

  return models || "No aplica";
}

function getRecordStatus(record, type) {
  return type === "shifts" ? record.attendance : record.status;
}

function getSearchableText(record, type) {
  if (type === "employees") {
    return [record.name, record.id, record.role, record.status].join(" ");
  }

  if (type === "roles") {
    return [record.name, record.id, record.description, record.status].join(" ");
  }

  if (type === "shifts") {
    return [
      record.id,
      record.employee,
      record.employeeId,
      record.date,
      record.startTime,
      record.endTime,
      record.workplace,
      record.function,
      record.attendance,
    ].join(" ");
  }

  return [
    record.id,
    record.employee,
    record.employeeId,
    record.type,
    record.issueDate,
    record.expirationDate,
    record.institution,
    formatModels(record.models),
    record.status,
  ].join(" ");
}

function recordMatches(record, type, searchTerm, statusFilter) {
  const normalizedSearch = normalizeText(searchTerm.trim());
  const matchesSearch =
    !normalizedSearch ||
    normalizeText(getSearchableText(record, type)).includes(normalizedSearch);
  const matchesStatus =
    statusFilter === "Todos" ||
    getRecordStatus(record, type) === statusFilter;

  return matchesSearch && matchesStatus;
}

function getStatusTone(type, status) {
  if (type === "certifications") {
    if (status === "Vigente") return "success";
    if (status === "Próxima a vencer") return "review";
    if (status === "Vencida") return "expired";
  }

  if (type === "roles" && status === "Activo") return "success";
  if (type === "employees" && status === "Activo") return "success";
  if (type === "shifts" && status === "Presente") return "recorded";

  return "neutral";
}

function PersonnelStatus({ status, type }) {
  return (
    <span
      className={`personnel-status personnel-status--${getStatusTone(
        type,
        status,
      )}`}
    >
      <span aria-hidden="true" />
      {status || "Sin estado registrado"}
    </span>
  );
}

function PersonnelReadings({ type, personnelRecords }) {
  const records = personnelRecords[type];
  let readings;

  if (type === "employees") {
    readings = [
      ["Empleados registrados", records.length],
      ["Estado Activo", records.filter((record) => record.status === "Activo").length],
      [
        "De vacaciones",
        records.filter((record) => record.status === "De vacaciones").length,
      ],
      ["Permiso", records.filter((record) => record.status === "Permiso").length],
    ];
  } else if (type === "roles") {
    const declaredEmployees = records.reduce(
      (total, role) => total + Number(role.employees ?? role.employeeCount ?? 0),
      0,
    );
    const associatedEmployees = personnelRecords.employees.filter((employee) =>
      records.some((role) => role.name === employee.role),
    ).length;

    readings = [
      ["Puestos registrados", records.length],
      ["Estado Activo", records.filter((record) => record.status === "Activo").length],
      ["Empleados declarados", declaredEmployees],
      ["Registros asociados", associatedEmployees],
    ];
  } else if (type === "shifts") {
    const dates = [...new Set(records.map((record) => record.date).filter(Boolean))];
    const dateReading =
      dates.length === 1 ? formatDate(dates[0]) : `${dates.length} fechas`;

    readings = [
      ["Turnos registrados", records.length],
      [
        "Asistencia Presente",
        records.filter((record) => record.attendance === "Presente").length,
      ],
      [
        "Asistencia Ausente",
        records.filter((record) => record.attendance === "Ausente").length,
      ],
      ["Fecha de los registros", dateReading],
    ];
  } else {
    readings = [
      ["Certificaciones", records.length],
      ["Vigente", records.filter((record) => record.status === "Vigente").length],
      [
        "Próxima a vencer",
        records.filter((record) => record.status === "Próxima a vencer").length,
      ],
      ["Vencida", records.filter((record) => record.status === "Vencida").length],
    ];
  }

  return (
    <section className="personnel-service" aria-labelledby="personnel-service-title">
      <header>
        <h3 id="personnel-service-title">Banda de servicio</h3>
        <p>Lecturas directas de los registros de demostración.</p>
      </header>
      <dl className="personnel-readings">
        {readings.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function getConditionConfiguration(type, records) {
  if (type === "employees") {
    return {
      title: "Situaciones registradas",
      description:
        "Estados laborales distintos de Activo, sin inferir disponibilidad actual.",
      records: records.filter((record) => record.status !== "Activo"),
      primary: (record) => record.name,
      secondary: (record) => record.id,
    };
  }

  if (type === "roles") {
    return {
      title: "Registros para consulta",
      description: "Puestos con un estado registrado distinto de Activo.",
      records: records.filter((record) => record.status !== "Activo"),
      primary: (record) => record.name,
      secondary: (record) => record.id,
    };
  }

  if (type === "shifts") {
    return {
      title: "Asistencia registrada",
      description: "Cada valor pertenece únicamente a la fecha de su turno.",
      records: records.filter((record) => record.attendance !== "Presente"),
      primary: (record) => `${record.id} · ${record.employee}`,
      secondary: (record) => formatDate(record.date),
    };
  }

  const priority = { Vencida: 0, "Próxima a vencer": 1 };

  return {
    title: "Revisión documental",
    description: "Priorización basada únicamente en el estado registrado.",
    records: records
      .filter((record) => Object.hasOwn(priority, record.status))
      .map((record, index) => ({ record, index }))
      .sort(
        (a, b) =>
          priority[a.record.status] - priority[b.record.status] ||
          a.index - b.index,
      )
      .map(({ record }) => record),
    primary: (record) => record.type,
    secondary: (record) => `${record.employee} · ${record.id}`,
  };
}

function RecordedConditions({ type, records }) {
  const configuration = getConditionConfiguration(type, records);

  return (
    <section
      className={`personnel-conditions${
        type === "certifications" ? " personnel-conditions--documentary" : ""
      }`}
      aria-labelledby="personnel-conditions-title"
    >
      <header>
        <div>
          <h3 id="personnel-conditions-title">{configuration.title}</h3>
          <p>{configuration.description}</p>
        </div>
        <span aria-label={`${configuration.records.length} registros`}>
          {configuration.records.length}
        </span>
      </header>

      {configuration.records.length > 0 ? (
        <ul>
          {configuration.records.map((record) => (
            <li key={record.id}>
              <span>
                <strong>{configuration.primary(record)}</strong>
                <small>{configuration.secondary(record)}</small>
              </span>
              <PersonnelStatus
                status={getRecordStatus(record, type)}
                type={type}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="personnel-conditions__empty">
          Sin situaciones adicionales registradas.
        </p>
      )}
    </section>
  );
}

function getRecordTitle(record, type) {
  if (type === "employees") return record.name;
  if (type === "roles") return record.name;
  if (type === "shifts") return record.id;
  return record.type;
}

function getRecordSecondary(record, type) {
  if (type === "employees") return `${record.id} · ${record.role}`;
  if (type === "roles") return `${record.id} · ${record.description}`;
  if (type === "shifts") {
    return `${record.employee} · ${formatDate(record.date)} · ${record.startTime}–${record.endTime}`;
  }

  return `${record.employee} · ${record.id}`;
}

function getSelectionLabel(record, type) {
  const status = getRecordStatus(record, type);

  if (type === "employees") {
    return `Inspeccionar empleado ${record.name}, ${record.id}; puesto ${record.role}; estado laboral ${status}`;
  }

  return `Inspeccionar ${tabInformation[type].singular} ${getRecordTitle(
    record,
    type,
  )}; estado registrado ${status}`;
}

function PersonnelRegister({
  type,
  allRecords,
  records,
  filters,
  selectedId,
  onFilterChange,
  onSelect,
  onClear,
}) {
  const information = tabInformation[type];
  const inspectorId = `personnel-inspector-${type}`;
  const filterLabel = type === "shifts" ? "Asistencia" : "Estado";
  const hasFilters = filters.search || filters.status !== "Todos";

  return (
    <section className="personnel-register" aria-labelledby="personnel-register-title">
      <header className="personnel-register__heading">
        <div>
          <h3 id="personnel-register-title">Registro seleccionable</h3>
          <p>Elige una fila para abrir su ficha completa.</p>
        </div>
        <span
          className="personnel-results"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {records.length} {records.length === 1 ? "resultado" : "resultados"}
        </span>
      </header>

      <div className="personnel-toolbar">
        <label className="personnel-search">
          <span className="personnel-sr-only">{information.search}</span>
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => onFilterChange({ search: event.target.value })}
            placeholder={information.search}
          />
        </label>

        <label className="personnel-filter">
          <span>{filterLabel}</span>
          <select
            value={filters.status}
            onChange={(event) => onFilterChange({ status: event.target.value })}
          >
            {filterOptions[type].map((option) => (
              <option value={option} key={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      {records.length > 0 ? (
        <ul className="personnel-register__list" aria-busy="false">
          {records.map((record) => {
            const isSelected = selectedId === record.id;

            return (
              <li key={record.id}>
                <button
                  type="button"
                  className={isSelected ? "personnel-record--selected" : undefined}
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
                  <span className="personnel-record__marker" aria-hidden="true" />
                  <span className="personnel-record__copy">
                    <strong>{getRecordTitle(record, type)}</strong>
                    <small>{getRecordSecondary(record, type)}</small>
                  </span>
                  <PersonnelStatus
                    status={getRecordStatus(record, type)}
                    type={type}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="personnel-empty" role="status">
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
    <div className={wide ? "personnel-detail--wide" : undefined}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function InspectorHeader({ icon: Icon, title, description, status, type }) {
  return (
    <header className="personnel-inspector__header">
      <span className="personnel-inspector__icon" aria-hidden="true">
        <Icon size={23} strokeWidth={1.8} />
      </span>
      <div>
        <h3 id={`personnel-inspector-title-${type}`}>{title}</h3>
        <p>{description}</p>
      </div>
      <PersonnelStatus status={status} type={type} />
    </header>
  );
}

function EmployeeInspector({ employee, personnelRecords }) {
  const role = personnelRecords.roles.find((record) => record.name === employee.role);
  const relatedShifts = personnelRecords.shifts.filter(
    (record) => record.employeeId === employee.id,
  );
  const relatedCertifications = personnelRecords.certifications.filter(
    (record) => record.employeeId === employee.id,
  );

  return (
    <>
      <InspectorHeader
        icon={UserRound}
        title={employee.name}
        description={`${employee.id} · ${employee.role}`}
        status={employee.status}
        type="employees"
      />

      <section className="personnel-inspector__section" aria-labelledby="employee-work-title">
        <h4 id="employee-work-title">Ficha laboral registrada</h4>
        <dl className="personnel-detail-grid">
          <DetailItem label="Código de empleado">{employee.id}</DetailItem>
          <DetailItem label="Puesto registrado">{employee.role}</DetailItem>
          <DetailItem label="Estado laboral registrado">{employee.status}</DetailItem>
          <DetailItem label="Supervisor registrado">
            {employee.supervisor || "Sin supervisor registrado"}
          </DetailItem>
          <DetailItem label="Fecha de contratación">
            <time dateTime={employee.hireDate}>{formatDate(employee.hireDate)}</time>
          </DetailItem>
          <DetailItem label="Registro de puesto asociado">
            {role ? `${role.id} · ${role.name}` : "Sin registro de puesto asociado"}
          </DetailItem>
        </dl>
      </section>

      <div className="personnel-association-grid">
        <section aria-labelledby="employee-shifts-title">
          <header>
            <h4 id="employee-shifts-title">Turnos asociados</h4>
            <span>{relatedShifts.length}</span>
          </header>
          {relatedShifts.length > 0 ? (
            <ul>
              {relatedShifts.map((shift) => (
                <li key={shift.id}>
                  <span>
                    <strong>{shift.id}</strong>
                    <small>
                      {formatDate(shift.date)} · {shift.startTime}–{shift.endTime}
                    </small>
                  </span>
                  <PersonnelStatus status={shift.attendance} type="shifts" />
                </li>
              ))}
            </ul>
          ) : (
            <p>Sin registros asociados</p>
          )}
        </section>

        <section aria-labelledby="employee-certifications-title">
          <header>
            <h4 id="employee-certifications-title">Certificaciones asociadas</h4>
            <span>{relatedCertifications.length}</span>
          </header>
          {relatedCertifications.length > 0 ? (
            <ul>
              {relatedCertifications.map((certification) => (
                <li key={certification.id}>
                  <span>
                    <strong>{certification.type}</strong>
                    <small>{certification.id}</small>
                  </span>
                  <PersonnelStatus
                    status={certification.status}
                    type="certifications"
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p>Sin registros asociados</p>
          )}
        </section>
      </div>

      <details className="personnel-sensitive">
        <summary>Datos administrativos sensibles</summary>
        <p>
          Información personal y salarial incluida únicamente en esta demostración.
        </p>
        <dl className="personnel-detail-grid">
          <DetailItem label="Fecha de nacimiento">
            <time dateTime={employee.birthDate}>{formatDate(employee.birthDate)}</time>
          </DetailItem>
          <DetailItem label="Teléfono">{employee.phone || "Sin registro"}</DetailItem>
          <DetailItem label="Correo electrónico" wide>
            {employee.email || "Sin registro"}
          </DetailItem>
          <DetailItem label="Salario registrado">
            {formatSalary(employee.salary)}
          </DetailItem>
        </dl>
      </details>
    </>
  );
}

function RoleInspector({ role, employeeRecords }) {
  const associatedEmployees = employeeRecords.filter(
    (employee) => employee.role === role.name,
  );
  const declaredEmployees = Number(role.employees ?? role.employeeCount ?? 0);
  const hasDiscrepancy = declaredEmployees !== associatedEmployees.length;

  return (
    <>
      <InspectorHeader
        icon={BriefcaseBusiness}
        title={role.name}
        description={`${role.id} · Registro de puesto`}
        status={role.status}
        type="roles"
      />

      <section className="personnel-inspector__section" aria-labelledby="role-details-title">
        <h4 id="role-details-title">Definición registrada</h4>
        <dl className="personnel-detail-grid">
          <DetailItem label="Código del puesto">{role.id}</DetailItem>
          <DetailItem label="Estado registrado">{role.status}</DetailItem>
          <DetailItem label="Empleados declarados">{declaredEmployees}</DetailItem>
          <DetailItem label="Registros asociados">
            {associatedEmployees.length}
          </DetailItem>
          <DetailItem label="Descripción" wide>
            {role.description || "Sin descripción registrada"}
          </DetailItem>
        </dl>
      </section>

      <section className="personnel-associations" aria-labelledby="role-employees-title">
        <header>
          <div>
            <h4 id="role-employees-title">Empleados con puesto registrado</h4>
            <p>
              {associatedEmployees.length} registros asociados; el puesto declara {declaredEmployees}.
            </p>
          </div>
        </header>

        {hasDiscrepancy && (
          <p className="personnel-associations__mismatch">
            El conteo declarado y los registros asociados no coinciden en esta sesión.
          </p>
        )}

        {associatedEmployees.length > 0 ? (
          <ul>
            {associatedEmployees.map((employee) => (
              <li key={employee.id}>
                <span>
                  <strong>{employee.name}</strong>
                  <small>{employee.id}</small>
                </span>
                <PersonnelStatus status={employee.status} type="employees" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="personnel-associations__empty">Sin registros asociados</p>
        )}
      </section>
    </>
  );
}

function ShiftInspector({ shift, employeeRecords }) {
  const employee = employeeRecords.find((record) => record.id === shift.employeeId);

  return (
    <>
      <InspectorHeader
        icon={CalendarClock}
        title={shift.id}
        description={`${shift.employee} · Turno registrado`}
        status={shift.attendance}
        type="shifts"
      />

      <section className="personnel-inspector__section" aria-labelledby="shift-details-title">
        <h4 id="shift-details-title">Asignación registrada</h4>
        <dl className="personnel-detail-grid">
          <DetailItem label="Código del turno">{shift.id}</DetailItem>
          <DetailItem label="Empleado registrado">
            {employee
              ? `${employee.id} · ${employee.name}`
              : "Sin registro de empleado asociado"}
          </DetailItem>
          <DetailItem label="Fecha registrada">
            <time dateTime={shift.date}>{formatDate(shift.date)}</time>
          </DetailItem>
          <DetailItem label="Horario registrado">
            <time dateTime={shift.startTime}>{shift.startTime}</time>–
            <time dateTime={shift.endTime}>{shift.endTime}</time>
          </DetailItem>
          <DetailItem label="Lugar de trabajo registrado">
            {shift.workplace || "Sin lugar registrado"}
          </DetailItem>
          <DetailItem label="Asistencia registrada">{shift.attendance}</DetailItem>
          <DetailItem label="Función asignada" wide>
            {shift.function || "Sin función registrada"}
          </DetailItem>
        </dl>
      </section>

      <p className="personnel-inspector__note">
        La asistencia pertenece únicamente a la fecha de este turno y no representa una condición actual.
      </p>
    </>
  );
}

function CertificationInspector({ certification, employeeRecords }) {
  const employee = employeeRecords.find(
    (record) => record.id === certification.employeeId,
  );

  return (
    <>
      <InspectorHeader
        icon={BadgeCheck}
        title={certification.type}
        description={`${certification.id} · ${certification.employee}`}
        status={certification.status}
        type="certifications"
      />

      <section
        className="personnel-inspector__section"
        aria-labelledby="certification-details-title"
      >
        <h4 id="certification-details-title">Documento registrado</h4>
        <dl className="personnel-detail-grid">
          <DetailItem label="Código de certificación">
            {certification.id}
          </DetailItem>
          <DetailItem label="Estado documental registrado">
            {certification.status}
          </DetailItem>
          <DetailItem label="Empleado registrado">
            {employee
              ? `${employee.id} · ${employee.name}`
              : "Sin registro de empleado asociado"}
          </DetailItem>
          <DetailItem label="Institución emisora">
            {certification.institution || "Sin institución registrada"}
          </DetailItem>
          <DetailItem label="Fecha de emisión">
            <time dateTime={certification.issueDate}>
              {formatDate(certification.issueDate)}
            </time>
          </DetailItem>
          <DetailItem label="Fecha de vencimiento">
            <time dateTime={certification.expirationDate}>
              {formatDate(certification.expirationDate)}
            </time>
          </DetailItem>
          <DetailItem label="Modelos autorizados" wide>
            {formatModels(certification.models)}
          </DetailItem>
        </dl>
      </section>

      <p className="personnel-inspector__note">
        El estado se muestra tal como está registrado; no se deriva de las fechas.
      </p>
    </>
  );
}

function PersonnelInspector({ type, record, personnelRecords }) {
  return (
    <section
      className="personnel-inspector"
      id={`personnel-inspector-${type}`}
      aria-labelledby={`personnel-inspector-title-${type}`}
    >
      {record ? (
        <>
          {type === "employees" && (
            <EmployeeInspector employee={record} personnelRecords={personnelRecords} />
          )}
          {type === "roles" && (
            <RoleInspector role={record} employeeRecords={personnelRecords.employees} />
          )}
          {type === "shifts" && (
            <ShiftInspector shift={record} employeeRecords={personnelRecords.employees} />
          )}
          {type === "certifications" && (
            <CertificationInspector
              certification={record}
              employeeRecords={personnelRecords.employees}
            />
          )}
        </>
      ) : (
        <div className="personnel-inspector__empty" role="status">
          <UsersRound size={28} aria-hidden="true" />
          <h3 id={`personnel-inspector-title-${type}`}>Sin registro seleccionado</h3>
          <p>Ajusta la búsqueda o el filtro para seleccionar una ficha.</p>
        </div>
      )}
    </section>
  );
}

export default function PersonnelManagement() {
  const [activeTab, setActiveTab] = useState("employees");
  const [filters, setFilters] = useState({
    employees: { search: "", status: "Todos" },
    roles: { search: "", status: "Todos" },
    shifts: { search: "", status: "Todos" },
    certifications: { search: "", status: "Todos" },
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [selectionAnnouncement, setSelectionAnnouncement] = useState("");
  const [personnelRecords, setPersonnelRecords] = useState({
    employees,
    roles,
    shifts,
    certifications,
  });
  const [selectedIds, setSelectedIds] = useState({
    employees: employees[0]?.id,
    roles: roles[0]?.id,
    shifts: shifts[0]?.id,
    certifications: certifications[0]?.id,
  });
  const tabRefs = useRef([]);

  const activeFilters = filters[activeTab];
  const activeRecords = personnelRecords[activeTab];
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
      !nextVisibleRecords.some((record) => record.id === selectedIds[activeTab])
    ) {
      const nextRecord = nextVisibleRecords[0];

      setSelectedIds((currentIds) => ({
        ...currentIds,
        [activeTab]: nextRecord.id,
      }));
      setSelectionAnnouncement(
        `${tabInformation[activeTab].singular} ${nextRecord.id} seleccionado como primer resultado visible.`,
      );
    }
  }

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    setIsModalOpen(false);

    if (selectedIds[tabId]) {
      setSelectionAnnouncement(
        `${tabInformation[tabId].singular} ${selectedIds[tabId]} seleccionado.`,
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
    } else if (event.key === "Enter" || event.key === " ") {
      nextIndex = index;
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
      `${tabInformation[activeTab].singular} ${record.id} seleccionado; estado registrado ${getRecordStatus(
        record,
        activeTab,
      )}.`,
    );
  }

  function handleCreate(formData) {
    const generatedId = `${prefixes[activeTab]}-${String(Date.now()).slice(-6)}`;
    const newRecord = { id: generatedId, ...formData };
    const isVisible = recordMatches(
      newRecord,
      activeTab,
      activeFilters.search,
      activeFilters.status,
    );
    const label = tabInformation[activeTab].singular;

    setPersonnelRecords((currentRecords) => ({
      ...currentRecords,
      [activeTab]: [...currentRecords[activeTab], newRecord],
    }));

    if (isVisible) {
      setSelectedIds((currentIds) => ({
        ...currentIds,
        [activeTab]: newRecord.id,
      }));
      setSelectionAnnouncement(
        `${label} ${newRecord.id} seleccionado; estado registrado ${getRecordStatus(
          newRecord,
          activeTab,
        )}.`,
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
    <section className="personnel-page" aria-labelledby="personnel-page-title">
      <header className="personnel-heading">
        <div className="personnel-heading__copy">
          <div className="personnel-context" aria-label="Contexto de los datos">
            <span>Datos de demostración</span>
            <span>Registro de servicio</span>
          </div>
          <h2 id="personnel-page-title">Personal</h2>
          <p>
            Consulta puestos, asignaciones y documentación sin inferir condiciones operativas en tiempo real.
          </p>
        </div>

        <button
          type="button"
          className="personnel-primary-button"
          onClick={() => setIsModalOpen(true)}
        >
          <CirclePlus size={17} aria-hidden="true" />
          {tabInformation[activeTab].action}
        </button>
      </header>

      {announcement && (
        <div
          className="personnel-session-notice"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span>{announcement}</span>
          <button
            type="button"
            aria-label="Cerrar anuncio de sesión"
            onClick={() => setAnnouncement("")}
          >
            <X size={17} aria-hidden="true" />
          </button>
        </div>
      )}

      <section className="personnel-desk" aria-label="Registro de personal">
        <div
          className="personnel-tabs"
          role="tablist"
          aria-label="Entidades de personal"
        >
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                type="button"
                role="tab"
                id={`personnel-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`personnel-panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                className={`personnel-tab${
                  isActive ? " personnel-tab--active" : ""
                }`}
                onClick={() => handleTabChange(tab.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                key={tab.id}
              >
                {tab.label}
                <span>{personnelRecords[tab.id].length}</span>
              </button>
            );
          })}
        </div>

        {tabs.map((tab) => (
          <div
            className="personnel-desk__tabpanel"
            id={`personnel-panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`personnel-tab-${tab.id}`}
            tabIndex={0}
            hidden={activeTab !== tab.id}
            key={tab.id}
          >
            {activeTab === tab.id && (
              <div className="personnel-desk__panel">
                <PersonnelReadings
                  type={activeTab}
                  personnelRecords={personnelRecords}
                />

                <RecordedConditions type={activeTab} records={activeRecords} />

                <PersonnelRegister
                  type={activeTab}
                  allRecords={activeRecords}
                  records={filteredRecords}
                  filters={activeFilters}
                  selectedId={selectedRecord?.id}
                  onFilterChange={updateActiveFilters}
                  onSelect={handleSelect}
                  onClear={() =>
                    updateActiveFilters({ search: "", status: "Todos" })
                  }
                />

                <PersonnelInspector
                  type={activeTab}
                  record={selectedRecord}
                  personnelRecords={personnelRecords}
                />
              </div>
            )}
          </div>
        ))}
      </section>

      <p
        className="personnel-sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {selectionAnnouncement}
      </p>

      {isModalOpen && (
        <PersonnelFormModal
          type={activeTab}
          availableEmployees={personnelRecords.employees}
          availableRoles={availableRoles}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreate}
        />
      )}
    </section>
  );
}
