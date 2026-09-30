import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

function getDefinitions(employeeOptions, roleOptions) {
  return {
    employees: {
      title: "Registrar empleado",
      description:
        "Ingresa la información laboral y administrativa del empleado para esta sesión de demostración.",
      fields: [
        { name: "name", label: "Nombre completo", required: true },
        {
          name: "birthDate",
          label: "Fecha de nacimiento",
          type: "date",
          required: true,
        },
        { name: "phone", label: "Teléfono", required: true },
        {
          name: "email",
          label: "Correo electrónico",
          type: "email",
          required: true,
        },
        {
          name: "hireDate",
          label: "Fecha de contratación",
          type: "date",
          required: true,
        },
        {
          name: "role",
          label: "Puesto",
          type: "select",
          options: roleOptions,
          required: true,
        },
        {
          name: "salary",
          label: "Salario",
          type: "number",
          min: "0",
          step: "0.01",
          required: true,
        },
        {
          name: "status",
          label: "Estado laboral",
          type: "select",
          options: [
            "Activo",
            "De vacaciones",
            "Permiso",
            "Suspendido",
            "Inactivo",
          ],
          required: true,
        },
        { name: "supervisor", label: "Supervisor" },
      ],
    },
    roles: {
      title: "Registrar puesto",
      description:
        "Define un puesto local sin alterar los registros de empleados existentes.",
      fields: [
        { name: "name", label: "Nombre del puesto", required: true },
        {
          name: "description",
          label: "Descripción",
          type: "textarea",
          required: true,
        },
        {
          name: "status",
          label: "Estado",
          type: "select",
          options: ["Activo", "Inactivo"],
          required: true,
        },
      ],
    },
    shifts: {
      title: "Asignar turno",
      description:
        "Registra una asignación fechada; la asistencia no representa una condición actual.",
      fields: [
        {
          name: "employeeId",
          label: "Empleado",
          type: "select",
          options: employeeOptions,
          required: true,
        },
        { name: "date", label: "Fecha", type: "date", required: true },
        {
          name: "startTime",
          label: "Hora de inicio",
          type: "time",
          required: true,
        },
        {
          name: "endTime",
          label: "Hora de finalización",
          type: "time",
          required: true,
        },
        { name: "workplace", label: "Lugar de trabajo", required: true },
        { name: "function", label: "Función asignada", required: true },
        {
          name: "attendance",
          label: "Asistencia registrada",
          type: "select",
          options: ["Programado", "Presente", "Ausente", "Tarde"],
          required: true,
        },
      ],
    },
    certifications: {
      title: "Registrar certificación",
      description:
        "Agrega un documento con el estado indicado, sin derivarlo de sus fechas.",
      fields: [
        {
          name: "employeeId",
          label: "Empleado",
          type: "select",
          options: employeeOptions,
          required: true,
        },
        { name: "type", label: "Tipo de certificación", required: true },
        {
          name: "issueDate",
          label: "Fecha de emisión",
          type: "date",
          required: true,
        },
        {
          name: "expirationDate",
          label: "Fecha de vencimiento",
          type: "date",
          required: true,
        },
        {
          name: "institution",
          label: "Institución emisora",
          required: true,
        },
        {
          name: "models",
          label: "Modelos autorizados",
          placeholder: "Ejemplo: R160, R179",
        },
        {
          name: "status",
          label: "Estado documental",
          type: "select",
          options: ["Vigente", "Próxima a vencer", "Vencida"],
          required: true,
        },
      ],
    },
  };
}

function createInitialValues(fields) {
  return fields.reduce((values, field) => {
    values[field.name] = "";
    return values;
  }, {});
}

export default function PersonnelFormModal({
  type = "employees",
  availableEmployees = [],
  availableRoles = [],
  onClose,
  onSubmit,
}) {
  const employeeOptions = availableEmployees.map((employee) => ({
    value: employee.id,
    label: `${employee.id} · ${employee.name}`,
  }));
  const roleOptions = availableRoles.map((role) => ({
    value: typeof role === "string" ? role : role.name,
    label: typeof role === "string" ? role : role.name,
  }));
  const definitions = getDefinitions(employeeOptions, roleOptions);
  const definition = definitions[type] ?? definitions.employees;
  const dialogRef = useRef(null);
  const initialFocusRef = useRef(null);
  const [formData, setFormData] = useState(() =>
    createInitialValues(definition.fields),
  );

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement;
    const page = document.querySelector(".personnel-page");
    const shellBackgroundElements = Array.from(
      document.querySelectorAll(".app-shell > .sidebar, .main-area > .topbar"),
    );
    const pageBackgroundElements = page
      ? Array.from(page.children).filter(
          (element) =>
            !element.classList.contains("personnel-modal-backdrop"),
        )
      : [];
    const backgroundElements = [
      ...shellBackgroundElements,
      ...pageBackgroundElements,
    ];
    const backgroundState = backgroundElements.map((element) => ({
      element,
      hadInert: element.hasAttribute("inert"),
      ariaHidden: element.getAttribute("aria-hidden"),
    }));
    const focusableSelector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");
    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusableElements = Array.from(
        dialog.querySelectorAll(focusableSelector),
      ).filter((element) => !element.hidden && element.getClientRects().length > 0);

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? lastElement : firstElement).focus();
      } else if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
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
    const focusFrame = requestAnimationFrame(() => {
      (initialFocusRef.current ?? dialogRef.current)?.focus();
    });

    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      backgroundState.forEach(({ element, hadInert, ariaHidden }) => {
        if (!hadInert) {
          element.inert = false;
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
    let newRecord = { ...formData };

    if (type === "employees") {
      newRecord.salary = Number(formData.salary);
    }

    if (type === "roles") {
      newRecord.employees = 0;
    }

    if (type === "shifts" || type === "certifications") {
      const selectedEmployee = availableEmployees.find(
        (employee) => String(employee.id) === String(formData.employeeId),
      );

      newRecord.employee = selectedEmployee?.name ?? "Empleado sin registro asociado";
    }

    if (type === "certifications") {
      newRecord.models = formData.models
        ? formData.models
            .split(",")
            .map((model) => model.trim())
            .filter(Boolean)
        : [];
    }

    onSubmit(newRecord);
  }

  function renderField(field, index) {
    const fieldId = `personnel-${type}-${field.name}`;
    const commonProperties = {
      id: fieldId,
      name: field.name,
      value: formData[field.name],
      required: field.required,
      onChange: handleChange,
      ref: index === 0 ? initialFocusRef : undefined,
    };

    if (field.type === "select") {
      return (
        <select {...commonProperties}>
          <option value="">Seleccionar…</option>
          {field.options.map((option) => {
            const value = typeof option === "string" ? option : option.value;
            const label = typeof option === "string" ? option : option.label;

            return (
              <option value={value} key={value}>
                {label}
              </option>
            );
          })}
        </select>
      );
    }

    if (field.type === "textarea") {
      return (
        <textarea
          {...commonProperties}
          placeholder={field.placeholder}
          rows="4"
        />
      );
    }

    return (
      <input
        {...commonProperties}
        type={field.type ?? "text"}
        placeholder={field.placeholder}
        min={field.min}
        step={field.step}
      />
    );
  }

  return (
    <div
      className="personnel-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="personnel-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="personnel-modal-title"
        aria-describedby="personnel-modal-description"
        ref={dialogRef}
        tabIndex={-1}
      >
        <header className="personnel-modal-header">
          <div>
            <h2 id="personnel-modal-title">{definition.title}</h2>
            <p id="personnel-modal-description">{definition.description}</p>
          </div>

          <button
            type="button"
            className="personnel-modal-close"
            onClick={onClose}
            aria-label="Cerrar formulario"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <form className="personnel-modal-form" onSubmit={handleSubmit}>
          <div className="personnel-modal-fields">
            {definition.fields.map((field, index) => (
              <label
                className={
                  field.type === "textarea"
                    ? "personnel-form-field personnel-form-field--wide"
                    : "personnel-form-field"
                }
                htmlFor={`personnel-${type}-${field.name}`}
                key={field.name}
              >
                <span>
                  {field.label}
                  {field.required && <b aria-hidden="true"> *</b>}
                </span>
                {renderField(field, index)}
              </label>
            ))}
          </div>

          <footer className="personnel-modal-actions">
            <button
              type="button"
              className="personnel-secondary-button"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className="personnel-primary-button">
              Guardar registro
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
