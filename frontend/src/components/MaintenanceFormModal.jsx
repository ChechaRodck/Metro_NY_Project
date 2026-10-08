import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ClipboardList,
  PackageSearch,
  TrainFront,
  X,
} from "lucide-react";
const initialValues = {
  orders: {
    title: "",
    assetId: "",
    maintenanceType: "PREVENTIVO",
    technicianId: "",
    priorityCode: "MEDIA",
    scheduledDate: "",
    estimatedCost: "",
  },
  equipment: {
    id: "",
    name: "",
    typeCode: "VIA",
    serialNumber: "",
    manufacturer: "",
    location: "",
    nextMaintenance: "",
    frequencyDays: "30",
  },
  parts: {
    name: "",
    description: "",
    unitCost: "",
    stock: "",
  },
};

const modalInformation = {
  orders: {
    title: "Nueva orden de trabajo",
    description:
      "Registra una orden persistente y conserva su historial en Oracle.",
    submitText: "Crear orden",
    icon: ClipboardList,
  },
  equipment: {
    title: "Registrar equipo",
    description:
      "Agrega un equipo persistente al catálogo de Oracle.",
    submitText: "Registrar equipo",
    icon: TrainFront,
  },
  parts: {
    title: "Registrar repuesto",
    description:
      "Agrega un repuesto persistente al inventario de Oracle.",
    submitText: "Registrar repuesto",
    icon: PackageSearch,
  },
};

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
  const fieldId = "maintenance-" + name;

  return (
    <label className="maintenance-form-field" htmlFor={fieldId}>
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
  required = true,
}) {
  const fieldId = "maintenance-" + name;

  return (
    <label className="maintenance-form-field" htmlFor={fieldId}>
      <span>
        {label}
        {required && <b aria-hidden="true"> *</b>}
      </span>
      <select
        id={fieldId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
      >
        {options.map((option) => (
          <option key={typeof option === "string" ? option : option.value} value={typeof option === "string" ? option : option.value}>
            {typeof option === "string" ? option : option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function MaintenanceFormModal({
  type = "orders",
  equipmentOptions = [],
  technicianOptions = [],
  isSubmitting = false,
  error = "",
  onClose,
  onSave,
}) {
  const information = modalInformation[type] || modalInformation.orders;
  const Icon = information.icon;
  const dialogRef = useRef(null);
  const backdropRef = useRef(null);
  const initialFocusRef = useRef(null);
  const [formData, setFormData] = useState({
    ...(initialValues[type] || initialValues.orders),
    ...(type === "orders" ? {
      assetId: equipmentOptions[0]?.id ?? "",
      technicianId: String(technicianOptions[0]?.idEmpleado ?? ""),
    } : {}),
  });

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement;
    const backdrop = backdropRef.current;
    const backgroundElements = Array.from(document.body.children).filter(
      (element) =>
        element instanceof HTMLElement &&
        element !== backdrop &&
        element.tagName !== "SCRIPT",
    );
    const backgroundState = backgroundElements.map((element) => ({
      element,
      hadInert: element.hasAttribute("inert"),
      ariaHidden: element.getAttribute("aria-hidden"),
    }));
    const previousOverflow = document.body.style.overflow;
    const focusableSelector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "summary",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const dialog = dialogRef.current;

      if (!dialog) {
        return;
      }

      const focusableElements = Array.from(
        dialog.querySelectorAll(focusableSelector),
      ).filter(
        (element) =>
          !element.hidden && element.getClientRects().length > 0,
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement =
        focusableElements[focusableElements.length - 1];

      if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? lastElement : firstElement).focus();
      } else if (
        event.shiftKey &&
        document.activeElement === firstElement
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.body.style.overflow = "hidden";
    backgroundElements.forEach((element) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });
    document.addEventListener("keydown", handleKeyDown);

    const focusFrame = window.requestAnimationFrame(() => {
      (initialFocusRef.current ?? dialogRef.current)?.focus();
    });

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);

      backgroundState.forEach(({ element, hadInert, ariaHidden }) => {
        if (hadInert) {
          element.setAttribute("inert", "");
        } else {
          element.removeAttribute("inert");
        }

        if (ariaHidden === null) {
          element.removeAttribute("aria-hidden");
        } else {
          element.setAttribute("aria-hidden", ariaHidden);
        }
      });

      if (
        previouslyFocusedElement instanceof HTMLElement &&
        previouslyFocusedElement.isConnected
      ) {
        previouslyFocusedElement.focus();
      }
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
    let submittedRecord = { ...formData };

    if (type === "orders") {
      submittedRecord = {
        ...formData,
        estimatedCost: Number(formData.estimatedCost),
      };
    } else if (type === "parts") {
      submittedRecord = {
        ...formData,
        stock: Number(formData.stock),
        unitCost: Number(formData.unitCost),
      };
    }

    onSave(submittedRecord);
  }

  function renderOrderFields() {
    return (
      <>
        <div className="maintenance-form-field maintenance-form-field--full">
          <label htmlFor="maintenance-title">
            Descripción del trabajo <b aria-hidden="true">*</b>
          </label>
          <textarea
            ref={initialFocusRef}
            id="maintenance-title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ejemplo: Inspección del sistema de frenos"
            rows="3"
            required
          />
        </div>

        <SelectField
          label="Equipo"
          name="assetId"
          value={formData.assetId}
          onChange={handleChange}
          options={equipmentOptions.map((item) => ({ value: item.id, label: `${item.id} · ${item.name}` }))}
        />
        <SelectField
          label="Técnico responsable"
          name="technicianId"
          value={formData.technicianId}
          onChange={handleChange}
          options={technicianOptions.map((item) => ({ value: item.idEmpleado, label: `${item.nombres} ${item.apellidos}` }))}
        />
        <SelectField
          label="Prioridad"
          name="priorityCode"
          value={formData.priorityCode}
          onChange={handleChange}
          options={[
            { value: "BAJA", label: "Baja" }, { value: "MEDIA", label: "Media" },
            { value: "ALTA", label: "Alta" }, { value: "URGENTE", label: "Crítica" },
          ]}
        />
        <SelectField
          label="Tipo de mantenimiento"
          name="maintenanceType"
          value={formData.maintenanceType}
          onChange={handleChange}
          options={[
            { value: "PREVENTIVO", label: "Preventivo" },
            { value: "CORRECTIVO", label: "Correctivo" },
            { value: "PREDICTIVO", label: "Predictivo" },
            { value: "INSPECCION_SEGURIDAD", label: "Inspección de seguridad" },
          ]}
        />
        <FormField
          label="Fecha programada"
          name="scheduledDate"
          value={formData.scheduledDate}
          onChange={handleChange}
          type="date"
        />
        <FormField
          label="Costo estimado"
          name="estimatedCost"
          value={formData.estimatedCost}
          onChange={handleChange}
          type="number"
          placeholder="USD"
          min="0"
        />
      </>
    );
  }

  function renderEquipmentFields() {
    return (
      <>
        <FormField inputRef={initialFocusRef} label="Identificador del equipo" name="id" value={formData.id} onChange={handleChange} placeholder="Ejemplo: EQ-500" />
        <FormField
          label="Nombre del equipo"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ejemplo: Elevador hidráulico H-500"
        />
        <SelectField
          label="Tipo de equipo"
          name="typeCode"
          value={formData.typeCode}
          onChange={handleChange}
          options={[
            { value: "VIA", label: "Vía" },
            { value: "SENAL", label: "Señal" },
          ]}
        />
        <FormField
          label="Número de serie"
          name="serialNumber"
          value={formData.serialNumber}
          onChange={handleChange}
          placeholder="Ejemplo: HYD-500-2042"
        />
        <FormField
          label="Fabricante"
          name="manufacturer"
          value={formData.manufacturer}
          onChange={handleChange}
          placeholder="Nombre del fabricante"
        />
        <FormField
          label="Ubicación"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Ejemplo: Depósito Corona"
        />
        <FormField
          label="Próximo mantenimiento"
          name="nextMaintenance"
          value={formData.nextMaintenance}
          onChange={handleChange}
          type="date"
        />
        <FormField label="Frecuencia de revisión (días)" name="frequencyDays" value={formData.frequencyDays} onChange={handleChange} type="number" min="1" />
      </>
    );
  }

  function renderPartFields() {
    return (
      <>
        <FormField
          inputRef={initialFocusRef}
          label="Nombre del repuesto"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ejemplo: Pastilla de freno"
        />
        <FormField label="Descripción" name="description" value={formData.description} onChange={handleChange} required={false} />
        <FormField label="Costo unitario" name="unitCost" value={formData.unitCost} onChange={handleChange} type="number" min="0" />
        <FormField
          label="Cantidad disponible"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          type="number"
          min="0"
        />
      </>
    );
  }

  return createPortal(
    <div
      className="maintenance-modal-backdrop"
      ref={backdropRef}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="maintenance-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="maintenance-modal-title"
        aria-describedby="maintenance-modal-description"
        ref={dialogRef}
        tabIndex={-1}
      >
        <header className="maintenance-modal__header">
          <div className="maintenance-modal__title">
            <span className="maintenance-modal__icon" aria-hidden="true">
              <Icon size={20} />
            </span>
            <div>
              <h2 id="maintenance-modal-title">{information.title}</h2>
              <p id="maintenance-modal-description">
                {information.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="maintenance-modal__close"
            onClick={onClose}
            aria-label="Cerrar formulario"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} aria-busy={isSubmitting || undefined}>
          <p className="maintenance-form-required">
            Los campos marcados con * son obligatorios.
          </p>
          <div className="maintenance-form-grid">
            {type === "orders" && renderOrderFields()}
            {type === "equipment" && renderEquipmentFields()}
            {type === "parts" && renderPartFields()}
          </div>

          {error && <p className="maintenance-form-error" role="alert">{error}</p>}

          <footer className="maintenance-modal__footer">
            <button
              type="button"
              className="maintenance-secondary-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="maintenance-primary-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando…" : information.submitText}
            </button>
          </footer>
        </form>
      </section>
    </div>,
    document.body,
  );
}

export default MaintenanceFormModal;
