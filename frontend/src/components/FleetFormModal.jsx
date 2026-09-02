import { useEffect, useState } from "react";
import { X } from "lucide-react";

function getCurrentDate() {
  return new Date().toISOString().slice(0, 10);
}

const configurations = {
  trains: {
    title: "Registrar nuevo tren",
    description:
      "Ingresa las características y condiciones operativas del tren.",
    fields: [
      {
        name: "id",
        label: "Código interno",
        placeholder: "Ejemplo: TR-120",
        required: true,
      },
      {
        name: "model",
        label: "Modelo",
        placeholder: "Ejemplo: R211A",
        required: true,
      },
      {
        name: "manufacturer",
        label: "Fabricante",
        placeholder: "Nombre del fabricante",
        required: true,
      },
      {
        name: "year",
        label: "Año de fabricación",
        type: "number",
        defaultValue: "2026",
        min: "1900",
        required: true,
      },
      {
        name: "capacity",
        label: "Capacidad total",
        type: "number",
        defaultValue: "1000",
        min: "1",
        required: true,
      },
      {
        name: "wagons",
        label: "Cantidad de vagones",
        type: "number",
        defaultValue: "10",
        min: "1",
        required: true,
      },
      {
        name: "mileage",
        label: "Kilometraje acumulado",
        type: "number",
        defaultValue: "0",
        min: "0",
        required: true,
      },
      {
        name: "deposit",
        label: "Depósito asignado",
        type: "deposit-select",
        required: true,
      },
      {
        name: "lastInspection",
        label: "Última inspección",
        type: "date",
        defaultValue: getCurrentDate(),
        required: true,
      },
      {
        name: "nextInspection",
        label: "Próxima inspección",
        type: "date",
        defaultValue: "2026-10-01",
        required: true,
      },
      {
        name: "status",
        label: "Estado operativo",
        type: "select",
        defaultValue: "Disponible",
        options: [
          "Disponible",
          "En operación",
          "En mantenimiento",
          "Fuera de servicio",
        ],
      },
    ],
  },

  wagons: {
    title: "Registrar nuevo vagón",
    description:
      "Registra su capacidad, posición y tren asignado.",
    fields: [
      {
        name: "id",
        label: "Número de serie",
        placeholder: "Ejemplo: VG-12001",
        required: true,
      },
      {
        name: "type",
        label: "Tipo de vagón",
        type: "select",
        defaultValue: "Motor",
        options: ["Motor", "Intermedio", "Cabina", "Remolque"],
      },
      {
        name: "train",
        label: "Tren asignado",
        type: "train-select",
        required: true,
      },
      {
        name: "position",
        label: "Posición dentro del tren",
        type: "number",
        defaultValue: "1",
        min: "1",
        required: true,
      },
      {
        name: "seats",
        label: "Capacidad sentada",
        type: "number",
        defaultValue: "40",
        min: "0",
        required: true,
      },
      {
        name: "standing",
        label: "Capacidad de pie",
        type: "number",
        defaultValue: "90",
        min: "0",
        required: true,
      },
      {
        name: "year",
        label: "Año de fabricación",
        type: "number",
        defaultValue: "2026",
        min: "1900",
        required: true,
      },
      {
        name: "accessible",
        label: "Accesibilidad",
        type: "select",
        defaultValue: "true",
        options: [
          { value: "true", label: "Disponible" },
          { value: "false", label: "No disponible" },
        ],
      },
      {
        name: "status",
        label: "Estado",
        type: "select",
        defaultValue: "Operativo",
        options: [
          "Operativo",
          "En mantenimiento",
          "Fuera de servicio",
        ],
      },
    ],
  },

  deposits: {
    title: "Registrar nuevo depósito",
    description:
      "Ingresa la ubicación y capacidad operativa del depósito.",
    fields: [
      {
        name: "id",
        label: "Código del depósito",
        placeholder: "Ejemplo: DEP-005",
        required: true,
      },
      {
        name: "name",
        label: "Nombre",
        placeholder: "Nombre del depósito",
        required: true,
      },
      {
        name: "location",
        label: "Ubicación",
        type: "select",
        defaultValue: "Manhattan",
        options: [
          "Manhattan",
          "Brooklyn",
          "Queens",
          "The Bronx",
          "Staten Island",
        ],
      },
      {
        name: "capacity",
        label: "Capacidad de trenes",
        type: "number",
        defaultValue: "20",
        min: "1",
        required: true,
      },
      {
        name: "assignedTrains",
        label: "Trenes asignados",
        type: "number",
        defaultValue: "0",
        min: "0",
        required: true,
      },
      {
        name: "status",
        label: "Estado",
        type: "select",
        defaultValue: "Operativo",
        options: ["Operativo", "Capacidad limitada"],
      },
    ],
  },
};

function createInitialValues(
  fields,
  availableTrains,
  availableDeposits,
) {
  return fields.reduce((values, field) => {
    if (field.type === "train-select") {
      values[field.name] = availableTrains[0]?.id ?? "";
    } else if (field.type === "deposit-select") {
      values[field.name] = availableDeposits[0]?.id ?? "";
    } else {
      values[field.name] = field.defaultValue ?? "";
    }

    return values;
  }, {});
}

function FleetFormModal({
  type,
  availableTrains,
  availableDeposits,
  onClose,
  onSubmit,
}) {
  const configuration = configurations[type];

  const [formValues, setFormValues] = useState(() =>
    createInitialValues(
      configuration.fields,
      availableTrains,
      availableDeposits,
    ),
  );

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    let newRecord;

    if (type === "trains") {
      newRecord = {
        ...formValues,
        id: formValues.id.toUpperCase(),
        year: Number(formValues.year),
        capacity: Number(formValues.capacity),
        wagons: Number(formValues.wagons),
        mileage: Number(formValues.mileage),
      };
    }

    if (type === "wagons") {
      newRecord = {
        ...formValues,
        id: formValues.id.toUpperCase(),
        position: Number(formValues.position),
        seats: Number(formValues.seats),
        standing: Number(formValues.standing),
        year: Number(formValues.year),
        accessible: formValues.accessible === "true",
      };
    }

    if (type === "deposits") {
      newRecord = {
        ...formValues,
        id: formValues.id.toUpperCase(),
        capacity: Number(formValues.capacity),
        assignedTrains: Number(formValues.assignedTrains),
      };
    }

    onSubmit(newRecord);
  }

  function renderField(field) {
    const commonProperties = {
      id: `fleet-${field.name}`,
      name: field.name,
      value: formValues[field.name],
      required: field.required,
      onChange: handleChange,
    };

    if (field.type === "select") {
      return (
        <select {...commonProperties}>
          {field.options.map((option) => {
            const value =
              typeof option === "string" ? option : option.value;

            const label =
              typeof option === "string" ? option : option.label;

            return (
              <option value={value} key={value}>
                {label}
              </option>
            );
          })}
        </select>
      );
    }

    if (field.type === "train-select") {
      return (
        <select {...commonProperties}>
          {availableTrains.map((train) => (
            <option value={train.id} key={train.id}>
              {train.id} - {train.model}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "deposit-select") {
      return (
        <select {...commonProperties}>
          {availableDeposits.map((deposit) => (
            <option value={deposit.id} key={deposit.id}>
              {deposit.id} - {deposit.name}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        {...commonProperties}
        type={field.type ?? "text"}
        placeholder={field.placeholder}
        min={field.min}
      />
    );
  }

  return (
    <div
      className="fleet-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="fleet-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fleet-modal-title"
      >
        <header className="fleet-modal__header">
          <div>
            <h2 id="fleet-modal-title">
              {configuration.title}
            </h2>

            <p>{configuration.description}</p>
          </div>

          <button
            type="button"
            aria-label="Cerrar formulario"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="fleet-form-grid">
            {configuration.fields.map((field) => (
              <label
                className={
                  field.name === "name"
                    ? "fleet-field fleet-field--wide"
                    : "fleet-field"
                }
                htmlFor={`fleet-${field.name}`}
                key={field.name}
              >
                <span>
                  {field.label}
                  {field.required && <b aria-hidden="true"> *</b>}
                </span>

                {renderField(field)}
              </label>
            ))}
          </div>

          <footer className="fleet-modal__footer">
            <button
              type="button"
              className="fleet-modal__cancel"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="fleet-modal__save"
            >
              Guardar registro
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default FleetFormModal;