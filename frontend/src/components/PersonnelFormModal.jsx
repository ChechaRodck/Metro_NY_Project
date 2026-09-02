import { useState } from "react";
import { X } from "lucide-react";

export default function PersonnelFormModal({
  type = "employees",
  availableEmployees = [],
  availableRoles = [],
  onClose,
  onSubmit,
}) {
  const employeeOptions = availableEmployees.map((employee) => ({
    value: employee.id,
    label: employee.name,
  }));

  const roleOptions = availableRoles.map((role) => ({
    value: typeof role === "string" ? role : role.name,
    label: typeof role === "string" ? role : role.name,
  }));

  const definitions = {
    employees: {
      title: "Registrar empleado",
      description: "Ingresa la información laboral y personal del empleado.",
      fields: [
        { name: "name", label: "Nombre completo", required: true },
        { name: "birthDate", label: "Fecha de nacimiento", type: "date", required: true },
        { name: "phone", label: "Teléfono", required: true },
        { name: "email", label: "Correo electrónico", type: "email", required: true },
        { name: "hireDate", label: "Fecha de contratación", type: "date", required: true },
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
          label: "Estado",
          type: "select",
          options: ["Activo", "Vacaciones", "Suspendido", "Inactivo"],
          required: true,
        },
        { name: "supervisor", label: "Supervisor" },
      ],
    },

    roles: {
      title: "Registrar puesto",
      description: "Define un nuevo puesto para el personal.",
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
      description: "Programa el horario y lugar de trabajo del empleado.",
      fields: [
        {
          name: "employeeId",
          label: "Empleado",
          type: "select",
          options: employeeOptions,
          required: true,
        },
        { name: "date", label: "Fecha", type: "date", required: true },
        { name: "start", label: "Hora de inicio", type: "time", required: true },
        { name: "end", label: "Hora de finalización", type: "time", required: true },
        { name: "workplace", label: "Lugar de trabajo", required: true },
        { name: "function", label: "Función asignada", required: true },
        {
          name: "attendance",
          label: "Asistencia",
          type: "select",
          options: ["Programado", "Presente", "Ausente", "Tarde"],
          required: true,
        },
      ],
    },

    certifications: {
      title: "Registrar certificación",
      description: "Agrega una certificación profesional del empleado.",
      fields: [
        {
          name: "employeeId",
          label: "Empleado",
          type: "select",
          options: employeeOptions,
          required: true,
        },
        {
          name: "type",
          label: "Tipo de certificación",
          required: true,
        },
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
          label: "Estado",
          type: "select",
          options: ["Vigente", "Por vencer", "Vencida"],
          required: true,
        },
      ],
    },
  };

  const definition = definitions[type] ?? definitions.employees;

  const initialValues = definition.fields.reduce(
    (values, field) => ({
      ...values,
      [field.name]: "",
    }),
    {},
  );

  const [formData, setFormData] = useState(initialValues);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
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

      newRecord.employee = selectedEmployee?.name ?? "Empleado";
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
  };

  return (
    <div
      className="personnel-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="personnel-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="personnel-modal-title"
      >
        <header className="personnel-modal-header">
          <div>
            <h2 id="personnel-modal-title">{definition.title}</h2>
            <p>{definition.description}</p>
          </div>

          <button
            type="button"
            className="personnel-modal-close"
            onClick={onClose}
            aria-label="Cerrar formulario"
          >
            <X size={20} />
          </button>
        </header>

        <form className="personnel-modal-form" onSubmit={handleSubmit}>
          <div className="personnel-modal-fields">
            {definition.fields.map((field) => (
              <label
                className={
                  field.type === "textarea"
                    ? "personnel-form-field personnel-form-field-wide"
                    : "personnel-form-field"
                }
                key={field.name}
              >
                <span>
                  {field.label}
                  {field.required && <strong> *</strong>}
                </span>

                {field.type === "select" ? (
                  <select
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required={field.required}
                  >
                    <option value="">Seleccionar...</option>

                    {field.options.map((option) => {
                      const value =
                        typeof option === "string" ? option : option.value;
                      const label =
                        typeof option === "string" ? option : option.label;

                      return (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required={field.required}
                    rows="4"
                  />
                ) : (
                  <input
                    name={field.name}
                    type={field.type ?? "text"}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required={field.required}
                    min={field.min}
                    step={field.step}
                  />
                )}
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