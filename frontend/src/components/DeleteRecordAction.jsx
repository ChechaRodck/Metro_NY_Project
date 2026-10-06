import { Info, Trash2, X } from "lucide-react";
import "../styles/record-deletion.css";

function DeleteRecordAction({
  id,
  label,
  record,
  onRequest,
  variant = "icon",
  disabled = false,
}) {
  const accessibleName = `Eliminar ${label}`;

  return (
    <button
      type="button"
      className={`record-delete-action record-delete-action--${variant}`}
      aria-label={accessibleName}
      title={variant === "icon" ? accessibleName : undefined}
      data-delete-record-action=""
      data-delete-record-id={id}
      disabled={disabled}
      onClick={(event) =>
        onRequest({ id, label, record }, event.currentTarget)
      }
    >
      <Trash2 aria-hidden="true" />
      {variant === "labeled" && <span>Eliminar registro</span>}
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
        aria-label="Cerrar aviso de eliminación"
      >
        <X aria-hidden="true" />
      </button>
    </div>
  );
}

export default DeleteRecordAction;
