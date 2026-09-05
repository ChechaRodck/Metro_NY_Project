import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  availableDrivers,
  availableRoutes,
  availableTrains,
} from "../data/operationsData";

function getCurrentDate() {
  return new Date().toISOString().slice(0, 10);
}

const configurations = {
  trips: {
    title: "Programar nuevo viaje",
    description:
      "Asigna una ruta, un tren y un conductor para el viaje.",
    fields: [
      {
        name: "id",
        label: "Número de viaje",
        placeholder: "Ejemplo: VJ-2406",
        required: true,
      },
      {
        name: "route",
        label: "Ruta",
        type: "route-select",
        required: true,
      },
      {
        name: "date",
        label: "Fecha",
        type: "date",
        defaultValue: getCurrentDate(),
        required: true,
      },
      {
        name: "scheduledDeparture",
        label: "Hora programada de salida",
        type: "time",
        defaultValue: "08:00",
        required: true,
      },
      {
        name: "scheduledArrival",
        label: "Hora programada de llegada",
        type: "time",
        defaultValue: "09:00",
        required: true,
      },
      {
        name: "train",
        label: "Tren asignado",
        type: "train-select",
        required: true,
      },
      {
        name: "driver",
        label: "Conductor asignado",
        type: "driver-select",
        required: true,
      },
      {
        name: "passengers",
        label: "Pasajeros estimados",
        type: "number",
        defaultValue: "0",
        min: "0",
        required: true,
      },
      {
        name: "status",
        label: "Estado inicial",
        type: "select",
        defaultValue: "Programado",
        options: [
          "Programado",
          "En abordaje",
          "En curso",
          "Retrasado",
          "Cancelado",
        ],
      },
    ],
  },

  schedules: {
    title: "Crear nuevo horario",
    description:
      "Configura los días, la frecuencia y la vigencia del servicio.",
    fields: [
      {
        name: "id",
        label: "Código del horario",
        placeholder: "Ejemplo: HOR-006",
        required: true,
      },
      {
        name: "route",
        label: "Ruta asociada",
        type: "route-select",
        required: true,
      },
      {
        name: "days",
        label: "Días de operación",
        type: "select",
        defaultValue: "Lunes a viernes",
        options: [
          "Lunes a viernes",
          "Fines de semana",
          "Todos los días",
          "Días festivos",
          "Fechas especiales",
        ],
      },
      {
        name: "startTime",
        label: "Hora de inicio",
        type: "time",
        defaultValue: "05:00",
        required: true,
      },
      {
        name: "endTime",
        label: "Hora de finalización",
        type: "time",
        defaultValue: "23:00",
        required: true,
      },
      {
        name: "frequency",
        label: "Frecuencia en minutos",
        type: "number",
        defaultValue: "5",
        min: "1",
        required: true,
      },
      {
        name: "service",
        label: "Tipo de servicio",
        type: "select",
        defaultValue: "Local",
        options: ["Local", "Expreso", "Nocturno", "Especial"],
      },
      {
        name: "startDate",
        label: "Inicio de vigencia",
        type: "date",
        defaultValue: getCurrentDate(),
        required: true,
      },
      {
        name: "endDate",
        label: "Finalización de vigencia",
        type: "date",
        defaultValue: "2026-12-31",
        required: true,
      },
      {
        name: "status",
        label: "Estado",
        type: "select",
        defaultValue: "Vigente",
        options: ["Vigente", "Servicio especial"],
      },
    ],
  },
};

function getInitialValues(fields) {
  return fields.reduce((values, field) => {
    if (field.type === "route-select") {
      values[field.name] = availableRoutes[0]?.id ?? "";
    } else if (field.type === "train-select") {
      values[field.name] = availableTrains[0] ?? "";
    } else if (field.type === "driver-select") {
      values[field.name] = availableDrivers[0] ?? "";
    } else {
      values[field.name] = field.defaultValue ?? "";
    }

    return values;
  }, {});
}

function OperationsFormModal({ type, onClose, onSubmit }) {
  const configuration = configurations[type];

  const [formValues, setFormValues] = useState(() =>
    getInitialValues(configuration.fields),
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

    const selectedRoute = availableRoutes.find(
      (route) => route.id === formValues.route,
    );

    if (type === "trips") {
      onSubmit({
        ...formValues,
        id: formValues.id.toUpperCase(),
        line: selectedRoute?.line ?? "",
        actualDeparture: "",
        actualArrival: "",
        passengers: Number(formValues.passengers),
      });
    }

    if (type === "schedules") {
      onSubmit({
        ...formValues,
        id: formValues.id.toUpperCase(),
        line: selectedRoute?.line ?? "",
        frequency: Number(formValues.frequency),
      });
    }
  }

  function renderField(field) {
    const commonProperties = {
      id: `operation-${field.name}`,
      name: field.name,
      value: formValues[field.name],
      required: field.required,
      onChange: handleChange,
    };

    if (field.type === "select") {
      return (
        <select {...commonProperties}>
          {field.options.map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "route-select") {
      return (
        <select {...commonProperties}>
          {availableRoutes.map((route) => (
            <option value={route.id} key={route.id}>
              {route.id} - Línea {route.line}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "train-select") {
      return (
        <select {...commonProperties}>
          {availableTrains.map((train) => (
            <option value={train} key={train}>
              {train}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "driver-select") {
      return (
        <select {...commonProperties}>
          {availableDrivers.map((driver) => (
            <option value={driver} key={driver}>
              {driver}
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
      className="operations-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="operations-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="operations-modal-title"
      >
        <header className="operations-modal__header">
          <div>
            <h2 id="operations-modal-title">
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
          <div className="operations-form-grid">
            {configuration.fields.map((field) => (
              <label
                className={
                  field.name === "driver"
                    ? "operations-field operations-field--wide"
                    : "operations-field"
                }
                htmlFor={`operation-${field.name}`}
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

          <footer className="operations-modal__footer">
            <button
              type="button"
              className="operations-modal__cancel"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="operations-modal__save"
            >
              Guardar registro
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default OperationsFormModal;