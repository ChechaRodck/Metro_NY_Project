import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Siren, X } from "lucide-react";
import {
  incidentReporters,
  incidentSeverities,
  incidentStatuses,
  incidentTypes,
  relatedResourceTypes,
} from "../data/incidentsData";

function getCurrentDateTime() {
  const currentDate = new Date();
  currentDate.setMinutes(
    currentDate.getMinutes() - currentDate.getTimezoneOffset(),
  );
  return currentDate.toISOString().slice(0, 16);
}

function createInitialFormData() {
  return {
    type: incidentTypes[0] || "",
    description: "",
    startDateTime: getCurrentDateTime(),
    endDateTime: "",
    severity: "Media",
    reportedBy: incidentReporters[0] || "",
    status: "Reportado",
    identifiedCause: "",
    actionsTaken: "",
    affectedPassengers: "",
    relatedType: relatedResourceTypes[0] || "",
    relatedResource: "",
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
          <option key={option} value={option}>
            {option}
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

function IncidentFormModal({ onClose, onSave }) {
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
                Agrega un registro local para esta sesión de demostración.
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

        <form onSubmit={handleSubmit}>
          <div className="incident-modal__body">
            <p className="incident-form-required-note">
              Los campos marcados con * son obligatorios.
            </p>

            <div className="incident-form-grid">
              <SelectField
                label="Tipo de incidente"
                name="type"
                value={formData.type}
                onChange={handleChange}
                options={incidentTypes}
                inputRef={initialFocusRef}
              />

              <SelectField
                label="Nivel de severidad"
                name="severity"
                value={formData.severity}
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
                label="Fecha y hora de finalización"
                name="endDateTime"
                value={formData.endDateTime}
                onChange={handleChange}
                type="datetime-local"
                required={false}
              />

              <SelectField
                label="Persona o fuente que reportó"
                name="reportedBy"
                value={formData.reportedBy}
                onChange={handleChange}
                options={incidentReporters}
              />

              <SelectField
                label="Estado inicial"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={incidentStatuses}
              />

              <SelectField
                label="Tipo de recurso relacionado"
                name="relatedType"
                value={formData.relatedType}
                onChange={handleChange}
                options={relatedResourceTypes}
              />

              <FormField
                label="Código o nombre del recurso"
                name="relatedResource"
                value={formData.relatedResource}
                onChange={handleChange}
                placeholder="Ejemplo: Tren NY-2501"
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

              <TextAreaField
                label="Acciones realizadas"
                name="actionsTaken"
                value={formData.actionsTaken}
                onChange={handleChange}
                placeholder="Describe únicamente las acciones registradas."
                required={false}
              />
            </div>
          </div>

          <footer className="incident-modal__footer">
            <button
              type="button"
              className="incident-secondary-button"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className="incident-primary-button">
              Registrar incidente
            </button>
          </footer>
        </form>
      </section>
    </div>,
    document.body,
  );
}

export default IncidentFormModal;
