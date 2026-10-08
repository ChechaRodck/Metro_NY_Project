export default function ApiState({ status, error, onRetry, empty = false, emptyMessage = "No hay registros disponibles." }) {
  if (status === "loading") {
    return <div className="api-state" role="status" aria-live="polite">Cargando datos desde Metro NY…</div>;
  }
  if (status === "error") {
    return (
      <div className="api-state api-state--error" role="alert">
        <p>{error?.status === 403 ? "No tienes permisos para consultar este módulo." : error?.message ?? "No fue posible cargar los datos."}</p>
        {error?.status !== 403 && <button type="button" onClick={onRetry}>Reintentar</button>}
      </div>
    );
  }
  if (empty) return <div className="api-state" role="status">{emptyMessage}</div>;
  return null;
}
