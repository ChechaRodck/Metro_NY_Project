import { useRef } from "react";
import { createPortal } from "react-dom";
import { TriangleAlert, Trash2, X } from "lucide-react";
import useModalLifecycle from "../hooks/useModalLifecycle";
import "../styles/record-deletion.css";

function ConfirmDeleteModal({
  target,
  isDeleting,
  error,
  onCancel,
  onConfirm,
  restoreFocus,
}) {
  const backdropRef = useRef(null);
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const requestClose = () => {
    if (!isDeleting) onCancel();
  };

  useModalLifecycle({
    backdropRef,
    dialogRef,
    initialFocusRef: cancelRef,
    onRequestClose: requestClose,
    restoreFocus,
  });

  function handleBackdropMouseDown(event) {
    if (event.target === event.currentTarget) requestClose();
  }

  return createPortal(
    <div
      ref={backdropRef}
      className="record-delete-backdrop"
      onMouseDown={handleBackdropMouseDown}
    >
      <section
        ref={dialogRef}
        className="record-delete-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-delete-title"
        aria-describedby="record-delete-description record-delete-consequence record-delete-session-note"
        tabIndex="-1"
      >
        <header className="record-delete-modal__header">
          <span className="record-delete-modal__icon" aria-hidden="true">
            <TriangleAlert />
          </span>
          <div>
            <h2 id="record-delete-title">Eliminar registro</h2>
            <p id="record-delete-description">
              ¿Deseas eliminar <strong>“{target.label}”</strong>?
            </p>
          </div>
          <button
            type="button"
            className="record-delete-modal__close"
            onClick={requestClose}
            aria-label="Cerrar confirmación"
            disabled={isDeleting}
          >
            <X aria-hidden="true" />
          </button>
        </header>

        <div className="record-delete-modal__body">
          <p id="record-delete-consequence">
            Esta acción no se puede deshacer durante esta sesión.
          </p>
          <p id="record-delete-session-note" className="record-delete-modal__note">
            La eliminación es local y temporal. Los datos originales no serán
            modificados y el registro reaparecerá al recargar.
          </p>
          {error && (
            <p className="record-delete-modal__error" role="alert">
              {error}
            </p>
          )}
        </div>

        <footer className="record-delete-modal__footer">
          <button
            ref={cancelRef}
            type="button"
            className="record-delete-modal__cancel"
            onClick={requestClose}
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="record-delete-modal__confirm"
            onClick={onConfirm}
            disabled={isDeleting}
            aria-busy={isDeleting || undefined}
          >
            <Trash2 aria-hidden="true" />
            {isDeleting ? "Eliminando…" : "Eliminar"}
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}

export default ConfirmDeleteModal;
