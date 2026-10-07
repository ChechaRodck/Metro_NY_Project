import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

function getFocusableElements(container) {
  if (!container) return [];

  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      element instanceof HTMLElement &&
      element.getAttribute("aria-hidden") !== "true" &&
      element.offsetParent !== null,
  );
}

export default function useModalLifecycle({
  backdropRef,
  dialogRef,
  initialFocusRef,
  onRequestClose,
  restoreFocus,
}) {
  const optionsRef = useRef({
    backdropRef,
    dialogRef,
    initialFocusRef,
    onRequestClose,
    restoreFocus,
  });

  useEffect(() => {
    optionsRef.current = {
      backdropRef,
      dialogRef,
      initialFocusRef,
      onRequestClose,
      restoreFocus,
    };
  }, [
    backdropRef,
    dialogRef,
    initialFocusRef,
    onRequestClose,
    restoreFocus,
  ]);

  useEffect(() => {
    const options = optionsRef.current;
    const previouslyFocusedElement = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const backdrop = options.backdropRef.current;
    const backgroundStates = Array.from(document.body.children)
      .filter(
        (element) => element instanceof HTMLElement && element !== backdrop,
      )
      .map((element) => ({
        element,
        hadInert: element.hasAttribute("inert"),
        hadAriaHidden: element.hasAttribute("aria-hidden"),
        ariaHiddenValue: element.getAttribute("aria-hidden"),
      }));

    function handleKeyDown(event) {
      const currentOptions = optionsRef.current;

      if (event.key === "Escape") {
        event.preventDefault();
        currentOptions.onRequestClose();
        return;
      }

      if (event.key !== "Tab") return;

      const dialog = currentOptions.dialogRef.current;
      const focusableElements = getFocusableElements(dialog);

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog?.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (
        event.shiftKey &&
        (document.activeElement === firstElement ||
          !dialog?.contains(document.activeElement))
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === lastElement ||
          !dialog?.contains(document.activeElement))
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.body.style.overflow = "hidden";
    backgroundStates.forEach(({ element }) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });
    document.addEventListener("keydown", handleKeyDown);

    const focusFrame = window.requestAnimationFrame(() => {
      const currentOptions = optionsRef.current;
      (currentOptions.initialFocusRef.current ??
        currentOptions.dialogRef.current)?.focus();
    });

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;

      backgroundStates.forEach(
        ({ element, hadInert, hadAriaHidden, ariaHiddenValue }) => {
          if (hadInert) element.setAttribute("inert", "");
          else element.removeAttribute("inert");

          if (hadAriaHidden) {
            element.setAttribute("aria-hidden", ariaHiddenValue ?? "");
          } else {
            element.removeAttribute("aria-hidden");
          }
        },
      );

      window.requestAnimationFrame(() => {
        const handled = optionsRef.current.restoreFocus?.(
          previouslyFocusedElement,
        );

        if (
          !handled &&
          previouslyFocusedElement instanceof HTMLElement &&
          previouslyFocusedElement.isConnected
        ) {
          previouslyFocusedElement.focus();
        }
      });
    };
  }, []);
}
