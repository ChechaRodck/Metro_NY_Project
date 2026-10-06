import { useMemo, useState } from "react";
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  CirclePlus,
  Clock3,
  EyeOff,
  FileText,
  FileX,
  Info,
  Search,
  Tag,
  UserRound,
  X,
} from "lucide-react";
import { generatedReports } from "../data/reportsData";
import ReportFormModal from "../components/ReportFormModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import DeleteRecordAction, {
  DeleteRecordNotice,
} from "../components/DeleteRecordAction";
import useDeleteRecord, {
  getSelectionAfterDelete,
} from "../hooks/useDeleteRecord";
import "../styles/reports.css";

const ALL_FILTERS = "Todos";

function normalizeSearchValue(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
}

function matchesReportFilters(report, searchQuery, filters) {
  const normalizedQuery = normalizeSearchValue(searchQuery.trim());
  const searchableValues = [
    report.id,
    report.name,
    report.type,
    report.period,
    report.status,
    report.format,
  ];
  const matchesSearch =
    normalizedQuery.length === 0 ||
    searchableValues.some((value) =>
      normalizeSearchValue(value).includes(normalizedQuery),
    );

  return (
    matchesSearch &&
    (filters.type === ALL_FILTERS || report.type === filters.type) &&
    (filters.status === ALL_FILTERS || report.status === filters.status) &&
    (filters.format === ALL_FILTERS || report.format === filters.format)
  );
}

function formatRecordedDateTime(value) {
  const recordedLocalValue = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(
    String(value ?? ""),
  );

  if (recordedLocalValue) {
    const [, year, month, day, hour, minute] = recordedLocalValue;
    return `${day}/${month}/${year} · ${hour}:${minute}`;
  }

  const parsedValue = new Date(value);

  if (Number.isNaN(parsedValue.getTime())) {
    return String(value ?? "Sin registro");
  }

  return new Intl.DateTimeFormat("es-GT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedValue);
}

function getUniqueValues(rows, field) {
  return [...new Set(rows.map((row) => row[field]).filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b), "es"),
  );
}

function DefinitionItem({ label, children, wide = false }) {
  return (
    <div className={wide ? "briefing-definition briefing-definition--wide" : "briefing-definition"}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function StatusBadge({ status }) {
  const isAvailable = status === "Disponible";
  const Icon = isAvailable ? CheckCircle2 : Clock3;

  return (
    <span
      className={
        isAvailable
          ? "briefing-badge briefing-badge--available"
          : "briefing-badge briefing-badge--processing"
      }
    >
      <Icon aria-hidden="true" />
      {status}
    </span>
  );
}

function FormatBadge({ format }) {
  return (
    <span className="briefing-format-badge">
      <FileText aria-hidden="true" />
      {format}
    </span>
  );
}

function ReportInspector({ report, isLocalSession, onDelete }) {
  if (!report) {
    return (
      <article
        id="report-briefing-inspector"
        className="briefing-inspector briefing-inspector--empty"
        aria-labelledby="report-briefing-empty-title"
      >
        <Archive aria-hidden="true" />
        <h3 id="report-briefing-empty-title">Sin reporte visible</h3>
        <p>
          Ajusta la búsqueda o los filtros para consultar una ficha registrada.
        </p>
      </article>
    );
  }

  return (
    <article
      id="report-briefing-inspector"
      className="briefing-inspector"
      aria-labelledby="report-briefing-inspector-title"
    >
      <header className="briefing-inspector__heading">
        <span className="briefing-inspector__icon" aria-hidden="true">
          <Archive />
        </span>
        <div>
          <span className="briefing-inspector__id">{report.id}</span>
          <h3 id="report-briefing-inspector-title">{report.name}</h3>
          <p>
            Ficha de metadatos registrada; no representa un documento adjunto.
          </p>
        </div>
      </header>

      <div className="record-delete-toolbar">
        <DeleteRecordAction
          id={report.id}
          label={`reporte ${report.name}`}
          record={report}
          onRequest={onDelete}
          variant="labeled"
        />
      </div>

      <div className="briefing-inspector__body">
        <section className="briefing-inspector__section" aria-labelledby="briefing-identification-title">
          <h4 id="briefing-identification-title">Identificación registrada</h4>
          <dl className="briefing-definition-grid">
            <DefinitionItem label="Identificador interno">{report.id}</DefinitionItem>
            <DefinitionItem label="Nombre del reporte">{report.name}</DefinitionItem>
            <DefinitionItem label="Tipo">{report.type}</DefinitionItem>
            <DefinitionItem label="Período registrado">{report.period}</DefinitionItem>
          </dl>
          <p className="briefing-inspector__note">
            El tipo y el período son texto registrado; no crean relaciones ni ejecutan filtros de fecha.
          </p>
        </section>

        <section className="briefing-inspector__section" aria-labelledby="briefing-state-title">
          <h4 id="briefing-state-title">Estado y formato registrados</h4>
          <dl className="briefing-definition-grid">
            <DefinitionItem label="Estado">
              <StatusBadge status={report.status} />
            </DefinitionItem>
            <DefinitionItem label={isLocalSession ? "Formato solicitado" : "Formato declarado"}>
              <FormatBadge format={report.format} />
            </DefinitionItem>
            <DefinitionItem label="Generado">
              {formatRecordedDateTime(report.generatedAt)}
            </DefinitionItem>
            <DefinitionItem label="Responsable registrado">
              <span className="briefing-person-value">
                <UserRound aria-hidden="true" />
                {report.generatedBy}
              </span>
            </DefinitionItem>
          </dl>
          <p className="briefing-inspector__note">
            {isLocalSession
              ? "La marca de tiempo corresponde al registro local de esta sesión y no al escenario estático ni a un backend."
              : "La fuente no declara una zona horaria para esta marca de tiempo."}
          </p>
        </section>

        <section className="briefing-inspector__section" aria-labelledby="briefing-purpose-title">
          <h4 id="briefing-purpose-title">Descripción o propósito</h4>
          <dl className="briefing-definition-grid">
            <DefinitionItem label="Descripción registrada" wide>
              {report.description?.trim() || "Sin descripción registrada"}
            </DefinitionItem>
          </dl>
        </section>

        <section className="briefing-inspector__section briefing-inspector__section--availability" aria-labelledby="briefing-availability-title">
          <h4 id="briefing-availability-title">Disponibilidad del artefacto</h4>
          <dl className="briefing-definition-grid">
            <DefinitionItem label="Documento adjunto">
              <span className="briefing-missing-value">
                <FileX aria-hidden="true" />
                Sin archivo adjunto
              </span>
            </DefinitionItem>
            <DefinitionItem label="Vista previa">
              <span className="briefing-missing-value">
                <EyeOff aria-hidden="true" />
                Sin contenido de vista previa
              </span>
            </DefinitionItem>
          </dl>
          <div className="briefing-limitation">
            <Info aria-hidden="true" />
            <p>
              Este registro contiene únicamente metadatos de demostración. El estado y el formato no prueban que exista un archivo PDF, XLSX o CSV descargable.
            </p>
          </div>
        </section>
      </div>
    </article>
  );
}

function ReportsManagement() {
  const [reportRows, setReportRows] = useState(generatedReports);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    type: ALL_FILTERS,
    status: ALL_FILTERS,
    format: ALL_FILTERS,
  });
  const [selectedReportId, setSelectedReportId] = useState(
    generatedReports[0]?.id ?? "",
  );
  const [localReportIds, setLocalReportIds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [resultsAnnouncement, setResultsAnnouncement] = useState("");
  const [selectionAnnouncement, setSelectionAnnouncement] = useState("");
  const [creationAnnouncement, setCreationAnnouncement] = useState("");

  const typeOptions = useMemo(() => getUniqueValues(reportRows, "type"), [reportRows]);
  const statusOptions = useMemo(() => getUniqueValues(reportRows, "status"), [reportRows]);
  const formatOptions = useMemo(() => getUniqueValues(reportRows, "format"), [reportRows]);

  const visibleReports = useMemo(
    () => reportRows.filter((report) => matchesReportFilters(report, searchQuery, filters)),
    [filters, reportRows, searchQuery],
  );

  const effectiveSelectedReport =
    visibleReports.find((report) => report.id === selectedReportId) ??
    visibleReports[0] ??
    null;
  const deletion = useDeleteRecord({
    deleteRecord: handleDeleteReport,
    recordExists: ({ id }) =>
      reportRows.some((report) => report.id === id),
  });

  const coverage = useMemo(
    () => ({
      registered: reportRows.length,
      available: reportRows.filter((report) => report.status === "Disponible").length,
      processing: reportRows.filter((report) => report.status === "Procesando").length,
      formats: new Set(reportRows.map((report) => report.format)).size,
    }),
    [reportRows],
  );

  function announceResultCount(count) {
    setResultsAnnouncement(
      count === 1 ? "1 reporte visible." : `${count} reportes visibles.`,
    );
  }

  function keepSelectionVisible(nextVisibleReports) {
    if (nextVisibleReports.some((report) => report.id === selectedReportId)) {
      return;
    }

    const nextSelection = nextVisibleReports[0] ?? null;
    setSelectedReportId(nextSelection?.id ?? "");
    setSelectionAnnouncement(
      nextSelection
        ? `Reporte ${nextSelection.id} seleccionado.`
        : "No hay un reporte visible seleccionado.",
    );
  }

  function handleSearchChange(value) {
    const nextVisibleReports = reportRows.filter((report) =>
      matchesReportFilters(report, value, filters),
    );
    setSearchQuery(value);
    keepSelectionVisible(nextVisibleReports);
    announceResultCount(nextVisibleReports.length);
  }

  function handleFilterChange(field, value) {
    const nextFilters = {
      ...filters,
      [field]: value,
    };
    const nextVisibleReports = reportRows.filter((report) =>
      matchesReportFilters(report, searchQuery, nextFilters),
    );
    setFilters(nextFilters);
    keepSelectionVisible(nextVisibleReports);
    announceResultCount(nextVisibleReports.length);
  }

  function handleSelectReport(report) {
    setSelectedReportId(report.id);
    setSelectionAnnouncement(`Reporte ${report.id} seleccionado.`);
  }

  function handleSave(newReport) {
    const highestNumber = reportRows.reduce((highest, report) => {
      const reportNumber = Number(String(report.id).split("-").pop());
      return Number.isNaN(reportNumber) ? highest : Math.max(highest, reportNumber);
    }, 0);
    const createdReport = {
      ...newReport,
      id: `REP-2026-${String(highestNumber + 1).padStart(3, "0")}`,
      generatedAt: new Date().toISOString(),
      status: "Disponible",
    };
    const isVisible = matchesReportFilters(createdReport, searchQuery, filters);

    setReportRows((currentReports) => [createdReport, ...currentReports]);
    setLocalReportIds((currentIds) => [...currentIds, createdReport.id]);
    setShowForm(false);
    setCreationAnnouncement(
      `El registro ${createdReport.id} existe sólo durante esta sesión. No se creó ningún archivo PDF, XLSX o CSV.`,
    );
    announceResultCount(visibleReports.length + (isVisible ? 1 : 0));

    if (isVisible) {
      setSelectedReportId(createdReport.id);
      setSelectionAnnouncement(`Reporte ${createdReport.id} seleccionado.`);
    }
  }

  function handleDeleteReport({ id }) {
    const nextSelection = getSelectionAfterDelete(
      visibleReports,
      id,
      effectiveSelectedReport?.id,
    );
    const nextVisibleCount = visibleReports.some((report) => report.id === id)
      ? visibleReports.length - 1
      : visibleReports.length;

    setReportRows((currentReports) =>
      currentReports.filter((report) => report.id !== id),
    );
    setLocalReportIds((currentIds) =>
      currentIds.filter((reportId) => reportId !== id),
    );
    setSelectedReportId(nextSelection ?? "");
    setSelectionAnnouncement(
      nextSelection
        ? `Reporte ${nextSelection} seleccionado después de eliminar el registro.`
        : "No hay un reporte visible seleccionado.",
    );
    announceResultCount(nextVisibleCount);
  }

  const hasAnyFilters =
    searchQuery.trim().length > 0 ||
    filters.type !== ALL_FILTERS ||
    filters.status !== ALL_FILTERS ||
    filters.format !== ALL_FILTERS;

  return (
    <div className="reports-page briefing-archive">
      <header className="briefing-archive__heading">
        <div className="briefing-archive__heading-copy">
          <h2>Archivo de reportes operativos</h2>
          <p>
            Consulta los metadatos de los reportes tal como fueron registrados en los datos de demostración.
          </p>
          <span className="briefing-archive__session-note">
            Los registros locales desaparecen al recargar y no se almacenan en un backend.
          </span>
        </div>
        <button
          type="button"
          className="briefing-primary-action"
          onClick={() => {
            setCreationAnnouncement("");
            setShowForm(true);
          }}
        >
          <CirclePlus aria-hidden="true" />
          Registrar reporte
        </button>
      </header>

      <DeleteRecordNotice
        message={deletion.notice}
        onDismiss={deletion.dismissNotice}
      />

      {creationAnnouncement && (
        <div className="briefing-archive__notice">
          <Info aria-hidden="true" />
          <p>{creationAnnouncement}</p>
          <button
            type="button"
            onClick={() => setCreationAnnouncement("")}
            aria-label="Cerrar aviso de registro"
          >
            <X aria-hidden="true" />
          </button>
        </div>
      )}

      <section className="briefing-coverage" aria-labelledby="briefing-coverage-title">
        <h3 id="briefing-coverage-title" className="briefing-visually-hidden">
          Cobertura registrada del archivo
        </h3>
        <dl className="briefing-coverage__readings">
          <div><dt>Reportes registrados</dt><dd>{coverage.registered}</dd></div>
          <div><dt>Marcados Disponible</dt><dd>{coverage.available}</dd></div>
          <div><dt>Marcados Procesando</dt><dd>{coverage.processing}</dd></div>
          <div><dt>Formatos declarados</dt><dd>{coverage.formats}</dd></div>
        </dl>
        <p className="briefing-coverage__explanation">
          <Info aria-hidden="true" />
          <span>
            Los estados y formatos son etiquetas registradas. Ningún registro contiene un documento adjunto.
          </span>
        </p>
      </section>

      <section className="briefing-desk" aria-label="Archivo y ficha de reportes">
        <div className="briefing-toolbar">
          <label className="briefing-search" htmlFor="briefing-report-search">
            <span className="briefing-visually-hidden">Buscar reportes</span>
            <Search aria-hidden="true" />
            <input
              id="briefing-report-search"
              type="search"
              value={searchQuery}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Buscar por ID, nombre, tipo, período, estado o formato..."
              autoComplete="off"
            />
          </label>

          <label className="briefing-filter">
            <span>Tipo</span>
            <select
              value={filters.type}
              onChange={(event) => handleFilterChange("type", event.target.value)}
              aria-label="Filtrar reportes por tipo"
            >
              <option value={ALL_FILTERS}>Todos</option>
              {typeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>

          <label className="briefing-filter">
            <span>Estado</span>
            <select
              value={filters.status}
              onChange={(event) => handleFilterChange("status", event.target.value)}
              aria-label="Filtrar reportes por estado registrado"
            >
              <option value={ALL_FILTERS}>Todos</option>
              {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>

          <label className="briefing-filter">
            <span>Formato</span>
            <select
              value={filters.format}
              onChange={(event) => handleFilterChange("format", event.target.value)}
              aria-label="Filtrar reportes por formato declarado"
            >
              <option value={ALL_FILTERS}>Todos</option>
              {formatOptions.map((format) => <option key={format} value={format}>{format}</option>)}
            </select>
          </label>

          <span className="briefing-results" aria-hidden="true">
            {visibleReports.length} {visibleReports.length === 1 ? "resultado" : "resultados"}
          </span>
        </div>

        <div className="briefing-desk__body">
          <section className="briefing-registry" aria-labelledby="briefing-registry-title">
            <header className="briefing-registry__heading">
              <div>
                <h3 id="briefing-registry-title">Registro de reportes</h3>
                <p>Selecciona un registro para consultar su ficha.</p>
              </div>
              <span>{visibleReports.length}</span>
            </header>

            {reportRows.length === 0 ? (
              <div className="briefing-empty-state">
                <Archive aria-hidden="true" />
                <h4>No hay reportes registrados</h4>
                <p>Los registros que agregues durante esta sesión aparecerán aquí.</p>
              </div>
            ) : visibleReports.length === 0 ? (
              <div className="briefing-empty-state">
                <Search aria-hidden="true" />
                <h4>No hay coincidencias</h4>
                <p>
                  {hasAnyFilters
                    ? "Ajusta la búsqueda o los filtros para mostrar otros reportes."
                    : "No hay reportes visibles."}
                </p>
              </div>
            ) : (
              <div className="briefing-registry__list">
                {visibleReports.map((report) => {
                  const isSelected = effectiveSelectedReport?.id === report.id;

                  return (
                    <button
                      key={report.id}
                      type="button"
                      className={
                        isSelected
                          ? "briefing-record briefing-record--selected"
                          : "briefing-record"
                      }
                      onClick={() => handleSelectReport(report)}
                      aria-pressed={isSelected}
                      aria-controls="report-briefing-inspector"
                      aria-label={`${report.name}, ${report.id}, tipo ${report.type}, período ${report.period}, estado registrado ${report.status}, formato declarado ${report.format}`}
                    >
                      <span className="briefing-record__identity">
                        <span className="briefing-record__id">{report.id}</span>
                        <strong>{report.name}</strong>
                      </span>
                      <span className="briefing-record__metadata">
                        <span><Tag aria-hidden="true" />{report.type}</span>
                        <span><CalendarDays aria-hidden="true" />{report.period}</span>
                      </span>
                      <span className="briefing-record__badges">
                        <StatusBadge status={report.status} />
                        <FormatBadge format={report.format} />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <ReportInspector
            report={effectiveSelectedReport}
            isLocalSession={
              effectiveSelectedReport
                ? localReportIds.includes(effectiveSelectedReport.id)
                : false
            }
            onDelete={deletion.requestDelete}
          />
        </div>
      </section>

      <p className="briefing-visually-hidden" aria-live="polite" aria-atomic="true">
        {resultsAnnouncement}
      </p>
      <p className="briefing-visually-hidden" aria-live="polite" aria-atomic="true">
        {selectionAnnouncement}
      </p>
      <p className="briefing-visually-hidden" aria-live="polite" aria-atomic="true">
        {creationAnnouncement}
      </p>

      {showForm && (
        <ReportFormModal onClose={() => setShowForm(false)} onSave={handleSave} />
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
    </div>
  );
}

export default ReportsManagement;
