import { useCallback, useEffect, useRef, useState } from "react";

export function getSelectionAfterDelete(
  visibleRecords,
  deletedId,
  selectedId,
  getId = (record) => record.id,
) {
  if (selectedId !== deletedId) return selectedId;

  const deletedIndex = visibleRecords.findIndex(
    (record) => getId(record) === deletedId,
  );
  const remainingRecords = visibleRecords.filter(
    (record) => getId(record) !== deletedId,
  );

  if (remainingRecords.length === 0) return null;

  const nextIndex = deletedIndex < 0 ? 0 : deletedIndex;
  return getId(
    remainingRecords[Math.min(nextIndex, remainingRecords.length - 1)],
  );
}

export default function useDeleteRecord({ deleteRecord, recordExists }) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const optionsRef = useRef({ deleteRecord, recordExists });
  const pendingRef = useRef(null);
  const openerRef = useRef(null);
  const actionIndexRef = useRef(0);
  const deletingRef = useRef(false);

  useEffect(() => {
    optionsRef.current = { deleteRecord, recordExists };
  }, [deleteRecord, recordExists]);

  const requestDelete = useCallback((target, triggerElement) => {
    if (!target?.id || !target?.label || deletingRef.current) return;

    const actions = Array.from(
      document.querySelectorAll("[data-delete-record-action]"),
    );

    openerRef.current =
      triggerElement instanceof HTMLElement ? triggerElement : null;
    actionIndexRef.current = Math.max(actions.indexOf(openerRef.current), 0);
    pendingRef.current = target;
    setError("");
    setPendingDelete(target);
  }, []);

  const cancelDelete = useCallback(() => {
    if (deletingRef.current) return;
    pendingRef.current = null;
    setError("");
    setPendingDelete(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deletingRef.current || !pendingRef.current) return;

    const target = pendingRef.current;
    const currentOptions = optionsRef.current;

    if (
      currentOptions.recordExists &&
      !currentOptions.recordExists(target)
    ) {
      pendingRef.current = null;
      setPendingDelete(null);
      setNotice(
        `El registro “${target.label}” ya no está disponible. No se aplicó ningún cambio.`,
      );
      return;
    }

    deletingRef.current = true;
    setIsDeleting(true);
    setError("");

    try {
      await currentOptions.deleteRecord(target);
      pendingRef.current = null;
      setNotice(
        `El cambio de estado de “${target.label}” fue confirmado por Oracle.`,
      );
      setPendingDelete(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error && requestError.message
          ? requestError.message
          : "No se pudo confirmar el cambio. Inténtalo de nuevo.",
      );
    } finally {
      deletingRef.current = false;
      setIsDeleting(false);
    }
  }, []);

  const restoreFocus = useCallback(() => {
    const opener = openerRef.current;

    if (opener?.isConnected) {
      opener.focus();
      return true;
    }

    const actions = Array.from(
      document.querySelectorAll("[data-delete-record-action]"),
    ).filter((element) => element instanceof HTMLElement && !element.disabled);
    const fallbackAction =
      actions[Math.min(actionIndexRef.current, actions.length - 1)];

    if (fallbackAction instanceof HTMLElement) {
      fallbackAction.focus();
      return true;
    }

    const pageHeading = document.querySelector(
      ".page-content h2, main h2, main h1",
    );
    if (pageHeading instanceof HTMLElement) {
      pageHeading.setAttribute("tabindex", "-1");
      pageHeading.focus();
      return true;
    }

    return false;
  }, []);

  return {
    pendingDelete,
    isDeleting,
    error,
    notice,
    requestDelete,
    cancelDelete,
    confirmDelete,
    restoreFocus,
    dismissNotice: () => setNotice(""),
  };
}
