import { useEffect, useState } from "react";
import { BarChart3, X } from "lucide-react";
import {
  reportFormats,
  reportPeriods,
  reportTypes,
} from "../data/reportsData";

const initialFormData = {
  name: "",
  type: reportTypes[0] || "",
  period: reportPeriods[0] || "",
  format: reportFormats[0] || "",
  startDate: "",
  endDate: "",
  generatedBy: "Otto Muñoz",
  description: "",
};

function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = true,
}) {
  return (
    <label className="reports-form-field">
      <span>{label}</span>

      <input
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

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}) {
  return (
    <label className="reports-form-field">
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

function ReportFormModal({ onClose, onSave }) {
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

  const isCustomPeriod = formData.period === "Personalizado";

  return (
    <div
      className="reports-modal-backdrop"
      onMouseDown={onClose}
    >
      <section
        className="reports-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reports-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="reports-modal__header">
          <div className="reports-modal__title">
            <span className="reports-modal__icon">
              <BarChart3 />
            </span>

            <div>
              <h2 id="reports-modal-title">
                Generar nuevo reporte
              </h2>

              <p>
                Selecciona la información que deseas incluir.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="reports-modal__close"
            onClick={onClose}
            aria-label="Cerrar formulario"
          >
            <X />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="reports-form-grid">
            <FormField
              label="Nombre del reporte"
              name="name"
              value={formData.name}
              onChange={handleChange}
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
              label="Periodo"
              name="period"
              value={formData.period}
              onChange={handleChange}
              options={reportPeriods}
            />

            <SelectField
              label="Formato"
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

            <label className="reports-form-field reports-form-field--full">
              <span>Descripción o propósito</span>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe brevemente el propósito del reporte."
                rows="3"
              />
            </label>
          </div>

          <footer className="reports-modal__footer">
            <button
              type="button"
              className="reports-secondary-button"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="reports-primary-button"
            >
              Generar reporte
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default ReportFormModal;