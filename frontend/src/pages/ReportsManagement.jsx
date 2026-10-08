import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  CheckCircle2,
  Database,
  FileText,
  Info,
  Search,
  Tag,
} from "lucide-react";
import { useAuthSession } from "../auth";
import ApiState from "../components/ApiState";
import { getReports } from "../services/reportService";
import "../styles/reports.css";

const ALL_FILTERS = "Todos";

function normalizeSearchValue(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
}

function displayValue(value) {
  if (value === null || value === undefined || value === "") return "Sin registro";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  return String(value).replace("T", " ");
}

function humanizeKey(value) {
  return String(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toLocaleUpperCase("es"));
}

function matchesReportFilters(report, searchQuery, typeFilter) {
  const query = normalizeSearchValue(searchQuery.trim());
  const matchesSearch = !query || [report.id, report.name, report.type, report.source]
    .some((value) => normalizeSearchValue(value).includes(query));
  return matchesSearch && (typeFilter === ALL_FILTERS || report.type === typeFilter);
}

function StatusBadge() {
  return (
    <span className="briefing-badge briefing-badge--available">
      <CheckCircle2 aria-hidden="true" />
      Disponible
    </span>
  );
}

function FormatBadge() {
  return (
    <span className="briefing-format-badge">
      <FileText aria-hidden="true" />
      Datos
    </span>
  );
}

function ReportTable({ report }) {
  const columns = useMemo(() => {
    const keys = [];
    report.rows.forEach((row) => {
      Object.keys(row ?? {}).forEach((key) => {
        if (!keys.includes(key)) keys.push(key);
      });
    });
    return keys;
  }, [report]);

  if (report.rows.length === 0) {
    return (
      <div className="briefing-empty-state" role="status">
        <Database aria-hidden="true" />
        <h4>Sin resultados</h4>
        <p>Oracle respondió correctamente, pero la consulta no contiene registros.</p>
      </div>
    );
  }

  return (
    <div className="briefing-report-table-wrap">
      <table className="briefing-report-table">
        <caption>Resultados de {report.name}</caption>
        <thead>
          <tr>{columns.map((column) => <th key={column}>{humanizeKey(column)}</th>)}</tr>
        </thead>
        <tbody>
          {report.rows.map((row, index) => (
            <tr key={`${report.id}-${index}`}>
              {columns.map((column) => <td key={column}>{displayValue(row[column])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReportInspector({ report }) {
  if (!report) {
    return (
      <article id="report-briefing-inspector" className="briefing-inspector briefing-inspector--empty">
        <Archive aria-hidden="true" />
        <h3>Sin reporte visible</h3>
        <p>Ajusta la búsqueda o el filtro para consultar datos autorizados.</p>
      </article>
    );
  }

  return (
    <article id="report-briefing-inspector" className="briefing-inspector" aria-labelledby="report-briefing-inspector-title">
      <header className="briefing-inspector__heading">
        <span className="briefing-inspector__icon" aria-hidden="true"><Archive /></span>
        <div>
          <span className="briefing-inspector__id">{report.id}</span>
          <h3 id="report-briefing-inspector-title">{report.name}</h3>
          <p>Consulta calculada por el backend con los permisos de la sesión actual.</p>
        </div>
      </header>

      <div className="briefing-inspector__body">
        <section className="briefing-inspector__section">
          <h4>Contrato de consulta</h4>
          <dl className="briefing-definition-grid">
            <div className="briefing-definition"><dt>Tipo</dt><dd>{report.type}</dd></div>
            <div className="briefing-definition"><dt>Estado</dt><dd><StatusBadge /></dd></div>
            <div className="briefing-definition"><dt>Formato</dt><dd><FormatBadge /></dd></div>
            <div className="briefing-definition"><dt>Registros</dt><dd>{report.count}</dd></div>
            <div className="briefing-definition briefing-definition--wide"><dt>Fuente</dt><dd>{report.source}</dd></div>
          </dl>
          <p className="briefing-inspector__note">
            La API no ofrece generación ni archivo persistente de documentos; por eso no se simulan altas, descargas ni eliminaciones.
          </p>
        </section>
        <section className="briefing-inspector__section briefing-inspector__section--availability">
          <h4>Resultados actuales</h4>
          <ReportTable report={report} />
        </section>
      </div>
    </article>
  );
}

function ReportsManagement() {
  const session = useAuthSession();
  const rolesKey = (session?.user.roles ?? []).join("|");
  const [reportRows, setReportRows] = useState([]);
  const [request, setRequest] = useState({ status: "loading", error: null });
  const [reloadVersion, setReloadVersion] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState(ALL_FILTERS);
  const [selectedReportId, setSelectedReportId] = useState("");
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getReports(rolesKey ? rolesKey.split("|") : [], { signal: controller.signal })
      .then((reports) => {
        setReportRows(reports);
        setSelectedReportId((current) => reports.some((report) => report.id === current) ? current : reports[0]?.id ?? "");
        setRequest({ status: "success", error: null });
      })
      .catch((error) => {
        if (error?.name !== "AbortError") setRequest({ status: "error", error });
      });
    return () => controller.abort();
  }, [reloadVersion, rolesKey]);

  const typeOptions = useMemo(
    () => [...new Set(reportRows.map((report) => report.type))].sort((a, b) => a.localeCompare(b, "es")),
    [reportRows],
  );
  const visibleReports = useMemo(
    () => reportRows.filter((report) => matchesReportFilters(report, searchQuery, typeFilter)),
    [reportRows, searchQuery, typeFilter],
  );
  const selectedReport = visibleReports.find((report) => report.id === selectedReportId) ?? visibleReports[0] ?? null;

  function retry() {
    setRequest({ status: "loading", error: null });
    setReloadVersion((version) => version + 1);
  }

  function updateFilters(search, type) {
    const next = reportRows.filter((report) => matchesReportFilters(report, search, type));
    if (!next.some((report) => report.id === selectedReportId)) setSelectedReportId(next[0]?.id ?? "");
    setAnnouncement(`${next.length} ${next.length === 1 ? "reporte visible" : "reportes visibles"}.`);
  }

  return (
    <div className="reports-page briefing-archive">
      <header className="briefing-archive__heading">
        <div className="briefing-archive__heading-copy">
          <h2>Reportes operativos</h2>
          <p>Consulta resultados calculados directamente desde Oracle según tu rol.</p>
          <span className="briefing-archive__session-note">Modo de consulta · No existe un contrato persistente para generar archivos.</span>
        </div>
      </header>

      <ApiState status={request.status} error={request.error} onRetry={retry} />

      <section className="briefing-coverage" aria-labelledby="briefing-coverage-title" hidden={request.status !== "success"}>
        <h3 id="briefing-coverage-title" className="briefing-visually-hidden">Cobertura autorizada</h3>
        <dl className="briefing-coverage__readings">
          <div><dt>Consultas autorizadas</dt><dd>{reportRows.length}</dd></div>
          <div><dt>Consultas disponibles</dt><dd>{reportRows.length}</dd></div>
          <div><dt>Filas recibidas</dt><dd>{reportRows.reduce((total, report) => total + report.count, 0)}</dd></div>
          <div><dt>Tipos de reporte</dt><dd>{typeOptions.length}</dd></div>
        </dl>
        <p className="briefing-coverage__explanation"><Info aria-hidden="true" /><span>La autorización del backend determina qué consultas aparecen.</span></p>
      </section>

      <section className="briefing-desk" aria-label="Consultas y resultados" hidden={request.status !== "success"}>
        <div className="briefing-toolbar">
          <label className="briefing-search" htmlFor="briefing-report-search">
            <span className="briefing-visually-hidden">Buscar reportes</span>
            <Search aria-hidden="true" />
            <input
              id="briefing-report-search"
              type="search"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                updateFilters(event.target.value, typeFilter);
              }}
              placeholder="Buscar por nombre, tipo o endpoint…"
              autoComplete="off"
            />
          </label>
          <label className="briefing-filter">
            <span>Tipo</span>
            <select value={typeFilter} onChange={(event) => {
              setTypeFilter(event.target.value);
              updateFilters(searchQuery, event.target.value);
            }}>
              <option value={ALL_FILTERS}>Todos</option>
              {typeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <span className="briefing-results">{visibleReports.length} resultados</span>
        </div>

        <div className="briefing-desk__body">
          <section className="briefing-registry" aria-labelledby="briefing-registry-title">
            <header className="briefing-registry__heading">
              <div><h3 id="briefing-registry-title">Consultas disponibles</h3><p>Selecciona una fuente para revisar sus filas actuales.</p></div>
              <span>{visibleReports.length}</span>
            </header>
            {reportRows.length === 0 ? (
              <div className="briefing-empty-state"><Archive aria-hidden="true" /><h4>Sin consultas autorizadas</h4><p>El rol actual no tiene reportes disponibles.</p></div>
            ) : visibleReports.length === 0 ? (
              <div className="briefing-empty-state"><Search aria-hidden="true" /><h4>Sin coincidencias</h4><p>Ajusta la búsqueda o el filtro.</p></div>
            ) : (
              <div className="briefing-registry__list">
                {visibleReports.map((report) => {
                  const selected = selectedReport?.id === report.id;
                  return (
                    <button
                      key={report.id}
                      type="button"
                      className={selected ? "briefing-record briefing-record--selected" : "briefing-record"}
                      onClick={() => {
                        setSelectedReportId(report.id);
                        setAnnouncement(`Reporte ${report.name} seleccionado.`);
                      }}
                      aria-pressed={selected}
                      aria-controls="report-briefing-inspector"
                    >
                      <span className="briefing-record__identity"><span className="briefing-record__id">{report.id}</span><strong>{report.name}</strong></span>
                      <span className="briefing-record__metadata"><span><Tag aria-hidden="true" />{report.type}</span><span><Database aria-hidden="true" />{report.count} filas</span></span>
                      <span className="briefing-record__badges"><StatusBadge /><FormatBadge /></span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
          <ReportInspector report={selectedReport} />
        </div>
      </section>
      <p className="briefing-visually-hidden" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
    </div>
  );
}

export default ReportsManagement;
