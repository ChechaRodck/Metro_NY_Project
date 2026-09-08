import { useEffect, useState } from "react";
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

const initialFormData = {
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

function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = true,
  min,
}) {
  return (
    <label className="incident-form-field">
      <span>{label}</span>

      <input
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
}) {
  return (
    <label className="incident-form-field">
      <span>{label}</span>

      <select
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
  return (
    <label className="incident-form-field incident-form-field--full">
      <span>{label}</span>

      <textarea
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

function IncidentFormModal({ onClose, onSave }) {
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
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

  return (
    <div
      className="incident-modal-backdrop"
      onMouseDown={onClose}
    >
      <section
        className="incident-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="incident-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="incident-modal__header">
          <div className="incident-modal__title">
            <span className="incident-modal__icon">
              <Siren />
            </span>

            <div>
              <h2 id="incident-modal-title">
                Reportar incidente
              </h2>

              <p>
                Registra la información inicial para comenzar su
                seguimiento.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="incident-modal__close"
            onClick={onClose}
            aria-label="Cerrar formulario"
          >
            <X />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="incident-form-grid">
            <SelectField
              label="Tipo de incidente"
              name="type"
              value={formData.type}
              onChange={handleChange}
              options={incidentTypes}
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
              label="Persona que reportó"
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
              label="Recurso relacionado"
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
              label="Pasajeros afectados"
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
              placeholder="Describe qué ocurrió y cómo afecta la operación."
            />

            <TextAreaField
              label="Causa identificada"
              name="identifiedCause"
              value={formData.identifiedCause}
              onChange={handleChange}
              placeholder="Indica la causa conocida o escribe: Pendiente de investigación."
              required={false}
            />

            <TextAreaField
              label="Acciones realizadas"
              name="actionsTaken"
              value={formData.actionsTaken}
              onChange={handleChange}
              placeholder="Describe las acciones tomadas por el personal."
              required={false}
            />
          </div>

          <footer className="incident-modal__footer">
            <button
              type="button"
              className="incident-secondary-button"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="incident-primary-button"
            >
              Reportar incidente
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default IncidentFormModal;