import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Siren, X } from "lucide-react";

const incidentTypes = [
  { value: "FALLA_MECANICA", label: "Falla mecánica" },
  { value: "FALLA_ELECTRICA", label: "Falla eléctrica" },
  { value: "FALLA_SENALIZACION", label: "Falla de señalización" },
  { value: "EMERGENCIA_MEDICA", label: "Emergencia médica" },
  { value: "ACCIDENTE", label: "Accidente" },
  { value: "SEGURIDAD", label: "Seguridad" },
  { value: "OBJETO_EN_VIA", label: "Objeto en vía" },
  { value: "INUNDACION", label: "Inundación" },
  { value: "INCENDIO", label: "Incendio" },
  { value: "CONGESTION", label: "Congestión" },
  { value: "MANT_NO_PROGRAMADO", label: "Mantenimiento no programado" },
];

const incidentSeverities = [
  { value: "BAJO", label: "Baja" },
  { value: "MEDIO", label: "Media" },
  { value: "ALTO", label: "Alta" },
  { value: "CRITICO", label: "Crítica" },
];

function createInitialFormData() {
  return {
    typeCode: incidentTypes[0].value,
    description: "",
    startDateTime: "",
    severityCode: "MEDIO",
    reportedBy: "Centro de control",
    identifiedCause: "",
    affectedPassengers: "",
    location: "",
  };
}

function FormField({
  label,
  name,
  value,
  onChange,
  inputRef,
  type = "text",
  placeholder = "",
  required = true,
  min,
}) {
  const fieldId = `incident-${name}`;

  return (
    <label className="incident-form-field" htmlFor={fieldId}>
      <span>
        {label}
        {required && <b aria-hidden="true"> *</b>}
      </span>
      <input
        ref={inputRef}
        id={fieldId}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  inputRef,
}) {
  const fieldId = `incident-${name}`;

  return (
    <label className="incident-form-field" htmlFor={fieldId}>
      <span>
        {label}
        <b aria-hidden="true"> *</b>
      </span>
      <select
        ref={inputRef}
        id={fieldId}
        name={name}
        value={value}
        onChange={onChange}
        required
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = true,
}) {
  const fieldId = `incident-${name}`;

  return (
    <label
      className="incident-form-field incident-form-field--full"
      htmlFor={fieldId}
    >
      <span>
        {label}
        {required && <b aria-hidden="true"> *</b>}
      </span>
      <textarea
        id={fieldId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows="3"
        required={required}
      />
    </label>
  );
}

function getFocusableElements(container) {
  if (!container) {
    return [];
  }

  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(
    (element) =>
      element instanceof HTMLElement &&
      element.getAttribute("aria-hidden") !== "true" &&
      element.offsetParent !== null,
  );
}

function IncidentFormModal({ isSubmitting = false, error = "", onClose, onSave }) {
  const [formData, setFormData] = useState(createInitialFormData);
  const backdropRef = useRef(null);
  const dialogRef = useRef(null);
  const initialFocusRef = useRef(null);

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const backdrop = backdropRef.current;
    const backgroundStates = Array.from(document.body.children)
      .filter(
        (element) =>
          element instanceof HTMLElement && element !== backdrop,
      )
      .map((element) => ({
        element,
        hadInert: element.hasAttribute("inert"),
        hadAriaHidden: element.hasAttribute("aria-hidden"),
        ariaHiddenValue: element.getAttribute("aria-hidden"),
      }));

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements(dialogRef.current);

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (
        event.shiftKey &&
        (document.activeElement === firstElement ||
          !dialogRef.current?.contains(document.activeElement))
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === lastElement ||
          !dialogRef.current?.contains(document.activeElement))
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
      initialFocusRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;

      backgroundStates.forEach(
        ({ element, hadInert, hadAriaHidden, ariaHiddenValue }) => {
          if (hadInert) {
            element.setAttribute("inert", "");
          } else {
            element.removeAttribute("inert");
          }

          if (hadAriaHidden) {
            element.setAttribute("aria-hidden", ariaHiddenValue ?? "");
          } else {
            element.removeAttribute("aria-hidden");
          }
        },
      );

      window.requestAnimationFrame(() => {
        if (
          previouslyFocusedElement instanceof HTMLElement &&
          previouslyFocusedElement.isConnected
        ) {
          previouslyFocusedElement.focus();
        }
      });
    };
  }, [onClose]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSave({
      ...formData,
      affectedPassengers: Number(formData.affectedPassengers || 0),
    });
  }

  function handleBackdropMouseDown(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return createPortal(
    <div
      ref={backdropRef}
      className="incident-modal-backdrop"
      onMouseDown={handleBackdropMouseDown}
    >
      <section
        ref={dialogRef}
        className="incident-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="incident-modal-title"
        aria-describedby="incident-modal-description"
        tabIndex="-1"
      >
        <header className="incident-modal__header">
          <div className="incident-modal__title">
            <span className="incident-modal__icon" aria-hidden="true">
              <Siren />
            </span>
            <div>
              <h2 id="incident-modal-title">Registrar incidente</h2>
              <p id="incident-modal-description">
                Registra el incidente de forma persistente en Oracle.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="incident-modal__close"
            onClick={onClose}
            aria-label="Cerrar formulario"
          >
            <X aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} aria-busy={isSubmitting || undefined}>
          <div className="incident-modal__body">
            <p className="incident-form-required-note">
              Los campos marcados con * son obligatorios.
            </p>

            <div className="incident-form-grid">
              <SelectField
                label="Tipo de incidente"
                name="typeCode"
                value={formData.typeCode}
                onChange={handleChange}
                options={incidentTypes}
                inputRef={initialFocusRef}
              />

              <SelectField
                label="Nivel de severidad"
                name="severityCode"
                value={formData.severityCode}
                onChange={handleChange}
                options={incidentSeverities}
              />

              <FormField
                label="Fecha y hora de inicio"
                name="startDateTime"
                value={formData.startDateTime}
                onChange={handleChange}
                type="datetime-local"
              />

              <FormField
                label="Persona o fuente que reportó"
                name="reportedBy"
                value={formData.reportedBy}
                onChange={handleChange}
                placeholder="Ejemplo: Centro de control"
              />

              <FormField
                label="Ubicación"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ejemplo: Estación Grand Central"
              />

              <FormField
                label="Pasajeros afectados declarados"
                name="affectedPassengers"
                value={formData.affectedPassengers}
                onChange={handleChange}
                type="number"
                placeholder="0"
                min="0"
              />

              <TextAreaField
                label="Descripción del incidente"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe el hecho registrado y su contexto."
              />

              <TextAreaField
                label="Causa identificada"
                name="identifiedCause"
                value={formData.identifiedCause}
                onChange={handleChange}
                placeholder="Indica la causa registrada, si existe."
                required={false}
              />

            </div>
            {error && <p className="incident-form-error" role="alert">{error}</p>}
          </div>

          <footer className="incident-modal__footer">
            <button
              type="button"
              className="incident-secondary-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button type="submit" className="incident-primary-button" disabled={isSubmitting}>
              {isSubmitting ? "Registrando…" : "Registrar incidente"}
            </button>
          </footer>
        </form>
      </section>
    </div>,
    document.body,
  );
}

export default IncidentFormModal;
