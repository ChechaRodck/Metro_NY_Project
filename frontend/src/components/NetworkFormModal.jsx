import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const formConfigurations = {
  lines: {
    title: "Registrar nueva línea",
    description: "Ingresa la información operativa de la línea.",
    fields: [
      {
        name: "id",
        label: "Código de línea",
        placeholder: "Ejemplo: B",
        required: true,
      },
      {
        name: "name",
        label: "Nombre descriptivo",
        placeholder: "Nombre de la línea",
        required: true,
      },
      {
        name: "color",
        label: "Color del mapa",
        type: "color",
        defaultValue: "#2563eb",
        required: true,
      },
      {
        name: "serviceCode",
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
        name: "originId",
        label: "Terminal de origen",
        type: "station-select",
        required: true,
      },
      {
        name: "destinationId",
        label: "Terminal de destino",
        type: "station-select",
        required: true,
      },
      {
        name: "length",
        label: "Longitud aproximada (km)",
        type: "number",
        defaultValue: "1",
        min: "0.1",
        step: "0.1",
        required: true,
      },
    ],
  },

  stations: {
    title: "Registrar nueva estación",
    description: "Ingresa la información general de la estación.",
    fields: [
      {
        name: "id",
        label: "Código de estación",
        placeholder: "Ejemplo: EST-007",
        required: true,
      },
      {
        name: "name",
        label: "Nombre",
        placeholder: "Nombre de la estación",
        required: true,
      },
      {
        name: "borough",
        label: "Distrito",
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
        name: "address",
        label: "Dirección",
        placeholder: "Dirección registrada",
        required: true,
      },
      {
        name: "stationType",
        label: "Tipo de estación",
        type: "select",
        defaultValue: "SUBTERRANEA",
        options: [
          { value: "SUBTERRANEA", label: "Subterránea" },
          { value: "ELEVADA", label: "Elevada" },
          { value: "SUPERFICIE", label: "Superficie" },
        ],
      },
      {
        name: "platforms",
        label: "Cantidad de plataformas",
        type: "number",
        defaultValue: "1",
        min: "1",
        required: true,
      },
      {
        name: "accesses",
        label: "Cantidad de accesos",
        type: "number",
        defaultValue: "1",
        min: "1",
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
    ],
  },

  routes: {
    title: "Registrar nueva ruta",
    description: "Define el recorrido y las condiciones de servicio.",
    fields: [
      {
        name: "id",
        label: "Código de ruta",
        placeholder: "Ejemplo: RUT-A-02",
        required: true,
      },
      {
        name: "line",
        label: "Línea asociada",
        type: "line-select",
        required: true,
      },
      {
        name: "originId",
        label: "Estación de origen",
        type: "station-select",
        required: true,
      },
      {
        name: "destinationId",
        label: "Estación de destino",
        type: "station-select",
        required: true,
      },
      {
        name: "direction",
        label: "Sentido del recorrido",
        type: "select",
        defaultValue: "NORTE_SUR",
        options: [
          { value: "NORTE_SUR", label: "Norte → Sur" },
          { value: "SUR_NORTE", label: "Sur → Norte" },
          { value: "ESTE_OESTE", label: "Este → Oeste" },
          { value: "OESTE_ESTE", label: "Oeste → Este" },
        ],
      },
      {
        name: "service",
        label: "Tipo de servicio",
        type: "select",
        defaultValue: "Local",
        options: ["Local", "Expreso", "Nocturno", "Especial"],
      },
      {
        name: "distance",
        label: "Distancia total (km)",
        type: "number",
        defaultValue: "1",
        min: "0.1",
        step: "0.1",
        required: true,
      },
      {
        name: "duration",
        label: "Duración estimada (min)",
        type: "number",
        defaultValue: "1",
        min: "1",
        required: true,
      },
    ],
  },
};

function createInitialValues(fields, availableLines, availableStations) {
  return fields.reduce((values, field) => {
    values[field.name] =
      field.type === "line-select"
        ? availableLines[0]?.id ?? ""
        : field.type === "station-select"
          ? String(availableStations[0]?.apiId ?? "")
        : field.defaultValue ?? "";

    return values;
  }, {});
}

function NetworkFormModal({
  type,
  availableLines,
  availableStations = [],
  isSubmitting = false,
  error = "",
  onClose,
  onSubmit,
}) {
  const configuration = formConfigurations[type];
  const dialogRef = useRef(null);
  const initialFocusRef = useRef(null);

  const [formValues, setFormValues] = useState(() =>
    createInitialValues(configuration.fields, availableLines, availableStations),
  );

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement;
    const page = document.querySelector(".network-page");
    const shellBackgroundElements = Array.from(
      document.querySelectorAll(".app-shell > .sidebar, .main-area > .topbar"),
    );
    const pageBackgroundElements = page
      ? Array.from(page.children).filter(
          (element) => !element.classList.contains("network-modal-backdrop"),
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
      } else if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
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

    let newRecord;

    if (type === "lines") {
      newRecord = {
        ...formValues,
        id: formValues.id.toUpperCase(),
        length: Number(formValues.length),
      };
    }

    if (type === "stations") {
      newRecord = {
        ...formValues,
        platforms: Number(formValues.platforms),
        accesses: Number(formValues.accesses),
        accessible: formValues.accessible === "true",
      };
    }

    if (type === "routes") {
      newRecord = {
        ...formValues,
        id: formValues.id.toUpperCase(),
        directionCode: formValues.direction,
        serviceCode: formValues.service.toUpperCase(),
        distance: Number(formValues.distance),
        duration: Number(formValues.duration),
      };
    }

    onSubmit(newRecord);
  }

  function renderField(field, index) {
    const commonProperties = {
      id: field.name,
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

    if (field.type === "line-select") {
      return (
        <select {...commonProperties}>
          {availableLines.map((line) => (
            <option value={line.id} key={line.id}>
              Línea {line.id} - {line.name}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "station-select") {
      return (
        <select {...commonProperties}>
          {availableStations.map((station) => (
            <option value={station.apiId} key={station.apiId}>
              {station.name}
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
        step={field.step}
      />
    );
  }

  return (
    <div
      className="network-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="network-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="network-modal-title"
        aria-describedby="network-modal-description"
        ref={dialogRef}
        tabIndex={-1}
      >
        <header className="network-modal__header">
          <div>
            <h2 id="network-modal-title">{configuration.title}</h2>
            <p id="network-modal-description">{configuration.description}</p>
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
          <div className="network-form-grid">
            {configuration.fields.map((field, index) => (
              <label
                className={
                  field.name === "name" ? "network-field network-field--wide" : "network-field"
                }
                key={field.name}
                htmlFor={field.name}
              >
                <span>
                  {field.label}
                  {field.required && <b aria-hidden="true"> *</b>}
                </span>

                {renderField(field, index)}
              </label>
            ))}
          </div>

          {error && <p className="network-form-error" role="alert">{error}</p>}

          <footer className="network-modal__footer">
            <button
              type="button"
              className="network-modal__cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>

            <button type="submit" className="network-modal__save" disabled={isSubmitting}>
              {isSubmitting ? "Guardando…" : "Guardar registro"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default NetworkFormModal;
