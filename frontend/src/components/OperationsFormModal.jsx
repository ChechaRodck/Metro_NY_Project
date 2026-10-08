import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

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
        name: "train",
        label: "Tren asignado",
        type: "train-select",
        required: false,
      },
      {
        name: "driver",
        label: "Conductor asignado",
        type: "driver-select",
        required: false,
      },
      {
        name: "passengers",
        label: "Pasajeros estimados",
        type: "number",
        defaultValue: "0",
        min: "0",
        required: true,
      },
    ],
  },

  schedules: {
    title: "Crear nuevo horario",
    description:
      "Configura los días, la frecuencia y la vigencia del servicio.",
    fields: [
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
        defaultValue: "LABORAL",
        options: [
          { value: "LABORAL", label: "Lunes a viernes" },
          { value: "FIN_SEMANA", label: "Fin de semana" },
          { value: "TODOS", label: "Todos los días" },
          { value: "FESTIVO", label: "Días festivos" },
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
        defaultValue: "LOCAL",
        options: [
          { value: "LOCAL", label: "Local" },
          { value: "EXPRESO", label: "Expreso" },
          { value: "NOCTURNO", label: "Nocturno" },
          { value: "ESPECIAL", label: "Especial" },
        ],
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
        defaultValue: "",
        required: false,
      },
    ],
  },
};

function getInitialValues(fields, routes, trains, drivers) {
  return fields.reduce((values, field) => {
    if (field.type === "route-select") {
      values[field.name] = String(routes[0]?.idRuta ?? "");
    } else if (field.type === "train-select") {
      values[field.name] = trains[0]?.codigoTren ?? "";
    } else if (field.type === "driver-select") {
      values[field.name] = String(drivers[0]?.idEmpleado ?? "");
    } else {
      values[field.name] = field.defaultValue ?? "";
    }

    return values;
  }, {});
}

function OperationsFormModal({
  type,
  routes = [],
  trains = [],
  drivers = [],
  isSubmitting = false,
  error = "",
  onClose,
  onSubmit,
}) {
  const configuration = configurations[type];
  const dialogRef = useRef(null);
  const initialFocusRef = useRef(null);

  const [formValues, setFormValues] = useState(() =>
    getInitialValues(configuration.fields, routes, trains, drivers),
  );

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement;
    const page = document.querySelector(".operations-page");
    const shellBackgroundElements = Array.from(
      document.querySelectorAll(".app-shell > .sidebar, .main-area > .topbar"),
    );
    const pageBackgroundElements = page
      ? Array.from(page.children).filter(
          (element) =>
            !element.classList.contains("operations-modal-backdrop"),
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
      ).filter((element) => !element.hidden && element.offsetParent !== null);

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

    const previousOverflow = document.body.style.overflow;

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

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const selectedRoute = routes.find(
      (route) => String(route.idRuta) === formValues.route,
    );

    if (type === "trips") {
      onSubmit({
        ...formValues,
        routeId: Number(formValues.route),
        line: selectedRoute?.idLinea ?? "",
        driverId: formValues.driver ? Number(formValues.driver) : null,
        actualDeparture: "",
        actualArrival: "",
        passengers: Number(formValues.passengers),
      });
    }

    if (type === "schedules") {
      onSubmit({
        ...formValues,
        routeId: Number(formValues.route),
        serviceCode: formValues.service,
        line: selectedRoute?.idLinea ?? "",
        frequency: Number(formValues.frequency),
      });
    }
  }

  function renderField(field, index) {
    const commonProperties = {
      id: `operation-${field.name}`,
      name: field.name,
      value: formValues[field.name],
      required: field.required,
      onChange: handleChange,
      ref: index === 0 ? initialFocusRef : undefined,
    };

    if (field.type === "select") {
      return (
        <select {...commonProperties}>
          {field.options.map((option) => {
            const value = typeof option === "string" ? option : option.value;
            const label = typeof option === "string" ? option : option.label;
            return <option value={value} key={value}>{label}</option>;
          })}
        </select>
      );
    }

    if (field.type === "route-select") {
      return (
        <select {...commonProperties}>
          {routes.map((route) => (
            <option value={route.idRuta} key={route.idRuta}>
              {route.codigoRuta} - Línea {route.idLinea}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "train-select") {
      return (
        <select {...commonProperties}>
          <option value="">Sin asignar</option>
          {trains.map((train) => (
            <option value={train.codigoTren} key={train.codigoTren}>
              {train.codigoTren}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "driver-select") {
      return (
        <select {...commonProperties}>
          <option value="">Sin asignar</option>
          {drivers.map((driver) => (
            <option value={driver.idEmpleado} key={driver.idEmpleado}>
              {driver.nombres} {driver.apellidos}
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
        aria-describedby="operations-modal-description"
        ref={dialogRef}
        tabIndex={-1}
      >
        <header className="operations-modal__header">
          <div>
            <h2 id="operations-modal-title">
              {configuration.title}
            </h2>

            <p id="operations-modal-description">
              {configuration.description}
            </p>
          </div>

          <button
            type="button"
            aria-label="Cerrar formulario"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} aria-busy={isSubmitting || undefined}>
          <div className="operations-form-grid">
            {configuration.fields.map((field, index) => (
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

                {renderField(field, index)}
              </label>
            ))}
          </div>

          {error && <p className="operations-form-error" role="alert">{error}</p>}

          <footer className="operations-modal__footer">
            <button
              type="button"
              className="operations-modal__cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="operations-modal__save"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando…" : "Guardar registro"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default OperationsFormModal;
