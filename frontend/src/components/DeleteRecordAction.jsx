import { CheckCircle2, Info, X } from "lucide-react";
import "../styles/record-deletion.css";

function DeleteRecordAction({
  id,
  label,
  record,
  onRequest,
  variant = "icon",
  disabled = false,
}) {
  const isDisabled = disabled || typeof onRequest !== "function";
  const accessibleName = `Cambiar estado de ${label}`;

  return (
    <button
      type="button"
      className={`record-delete-action record-delete-action--${variant}`}
      aria-label={accessibleName}
      title={variant === "icon" ? accessibleName : undefined}
      data-delete-record-action=""
      data-delete-record-id={id}
      disabled={isDisabled}
      onClick={(event) => {
        if (!isDisabled) onRequest({ id, label, record }, event.currentTarget);
      }}
    >
      <CheckCircle2 aria-hidden="true" />
      {variant === "labeled" && <span>Cambiar estado</span>}
    </button>
  );
}

export function DeleteRecordNotice({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div
      className="record-delete-notice"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <Info aria-hidden="true" />
      <p>{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar aviso de cambio de estado"
      >
        <X aria-hidden="true" />
      </button>
    </div>
  );
}

export default DeleteRecordAction;
