import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Archive, X } from "lucide-react";
import useModalLifecycle from "../hooks/useModalLifecycle";
import {
  reportFormats,
  reportPeriods,
  reportTypes,
} from "../data/reportsData";

function createInitialFormData() {
  return {
    name: "",
    type: reportTypes[0] || "",
    period: reportPeriods[0] || "",
    format: reportFormats[0] || "",
    startDate: "",
    endDate: "",
    generatedBy: "Otto Muñoz",
    description: "",
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
}) {
  const fieldId = `report-registration-${name}`;

  return (
    <label className="report-registration-field" htmlFor={fieldId}>
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
      />
    </label>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  const fieldId = `report-registration-${name}`;

  return (
    <label className="report-registration-field" htmlFor={fieldId}>
      <span>
        {label}
        <b aria-hidden="true"> *</b>
      </span>
      <select id={fieldId} name={name} value={value} onChange={onChange} required>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ReportFormModal({ onClose, onSave }) {
  const [formData, setFormData] = useState(createInitialFormData);
  const backdropRef = useRef(null);
  const dialogRef = useRef(null);
  const initialFocusRef = useRef(null);

  useModalLifecycle({
    backdropRef,
    dialogRef,
    initialFocusRef,
    onRequestClose: onClose,
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    let finalPeriod = formData.period;

    if (
      formData.period === "Personalizado" &&
      formData.startDate &&
      formData.endDate
    ) {
      finalPeriod = `${formData.startDate} - ${formData.endDate}`;
    }

    onSave({
      name: formData.name,
      type: formData.type,
      period: finalPeriod,
      format: formData.format,
      generatedBy: formData.generatedBy,
      description: formData.description,
    });
  }

  function handleBackdropMouseDown(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  const isCustomPeriod = formData.period === "Personalizado";

  return createPortal(
    <div
      ref={backdropRef}
      className="report-registration-backdrop"
      onMouseDown={handleBackdropMouseDown}
    >
      <section
        ref={dialogRef}
        className="report-registration-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-registration-title"
        aria-describedby="report-registration-description"
        tabIndex="-1"
      >
        <header className="report-registration-modal__header">
          <div className="report-registration-modal__title">
            <span className="report-registration-modal__icon" aria-hidden="true">
              <Archive />
            </span>
            <div>
              <h2 id="report-registration-title">Registrar reporte</h2>
              <p id="report-registration-description">
                Agrega un registro local para esta sesión de demostración. No se generará un archivo.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="report-registration-modal__close"
            onClick={onClose}
            aria-label="Cerrar formulario"
          >
            <X aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="report-registration-modal__body">
            <p className="report-registration-required-note">
              Los campos marcados con * son obligatorios. El formato seleccionado será sólo una etiqueta solicitada.
            </p>
            <div className="report-registration-grid">
              <FormField
                label="Nombre del reporte"
                name="name"
                value={formData.name}
                onChange={handleChange}
                inputRef={initialFocusRef}
                placeholder="Ejemplo: Resumen operativo mensual"
              />

              <SelectField
                label="Tipo de reporte"
                name="type"
                value={formData.type}
                onChange={handleChange}
                options={reportTypes}
              />

              <SelectField
                label="Período registrado"
                name="period"
                value={formData.period}
                onChange={handleChange}
                options={reportPeriods}
              />

              <SelectField
                label="Formato solicitado"
                name="format"
                value={formData.format}
                onChange={handleChange}
                options={reportFormats}
              />

              {isCustomPeriod && (
                <>
                  <FormField
                    label="Fecha inicial"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    type="date"
                  />
                  <FormField
                    label="Fecha final"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    type="date"
                  />
                </>
              )}

              <FormField
                label="Responsable"
                name="generatedBy"
                value={formData.generatedBy}
                onChange={handleChange}
                placeholder="Nombre del responsable"
              />

              <label
                className="report-registration-field report-registration-field--wide"
                htmlFor="report-registration-description-field"
              >
                <span>Descripción o propósito</span>
                <textarea
                  id="report-registration-description-field"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe brevemente el propósito registrado."
                  rows="3"
                />
              </label>
            </div>
          </div>

          <footer className="report-registration-modal__footer">
            <button
              type="button"
              className="report-registration-secondary-action"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className="report-registration-primary-action">
              Registrar reporte
            </button>
          </footer>
        </form>
      </section>
    </div>,
    document.body,
  );
}

export default ReportFormModal;
