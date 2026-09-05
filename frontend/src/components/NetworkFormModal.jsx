import { useEffect, useState } from "react";
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
        name: "service",
        label: "Tipo de servicio",
        type: "select",
        defaultValue: "Local",
        options: ["Local", "Expreso", "Nocturno", "Especial"],
      },
      {
        name: "origin",
        label: "Terminal de origen",
        placeholder: "Estación de origen",
        required: true,
      },
      {
        name: "destination",
        label: "Terminal de destino",
        placeholder: "Estación de destino",
        required: true,
      },
      {
        name: "stations",
        label: "Cantidad de estaciones",
        type: "number",
        defaultValue: "1",
        min: "1",
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
      {
        name: "status",
        label: "Estado operativo",
        type: "select",
        defaultValue: "Operativa",
        options: ["Operativa", "Con demoras", "Mantenimiento"],
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
        name: "lines",
        label: "Líneas asociadas",
        placeholder: "Ejemplo: A, 1, 7",
        required: true,
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
      {
        name: "status",
        label: "Estado operativo",
        type: "select",
        defaultValue: "Operativa",
        options: ["Operativa", "Mantenimiento"],
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
        name: "origin",
        label: "Estación de origen",
        placeholder: "Estación de origen",
        required: true,
      },
      {
        name: "destination",
        label: "Estación de destino",
        placeholder: "Estación de destino",
        required: true,
      },
      {
        name: "direction",
        label: "Sentido del recorrido",
        type: "select",
        defaultValue: "Norte → Sur",
        options: [
          "Norte → Sur",
          "Sur → Norte",
          "Este → Oeste",
          "Oeste → Este",
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
      {
        name: "status",
        label: "Estado",
        type: "select",
        defaultValue: "Activa",
        options: ["Activa", "Con demoras", "Servicio parcial"],
      },
    ],
  },
};

function createInitialValues(fields, availableLines) {
  return fields.reduce((values, field) => {
    values[field.name] =
      field.type === "line-select"
        ? availableLines[0]?.id ?? ""
        : field.defaultValue ?? "";

    return values;
  }, {});
}

function NetworkFormModal({
  type,
  availableLines,
  onClose,
  onSubmit,
}) {
  const configuration = formConfigurations[type];

  const [formValues, setFormValues] = useState(() =>
    createInitialValues(configuration.fields, availableLines),
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

    if (type === "lines") {
      newRecord = {
        ...formValues,
        id: formValues.id.toUpperCase(),
        stations: Number(formValues.stations),
        length: Number(formValues.length),
      };
    }

    if (type === "stations") {
      newRecord = {
        ...formValues,
        lines: formValues.lines
          .split(",")
          .map((line) => line.trim().toUpperCase())
          .filter(Boolean),
        platforms: Number(formValues.platforms),
        accesses: Number(formValues.accesses),
        accessible: formValues.accessible === "true",
      };
    }

    if (type === "routes") {
      newRecord = {
        ...formValues,
        id: formValues.id.toUpperCase(),
        distance: Number(formValues.distance),
        duration: Number(formValues.duration),
      };
    }

    onSubmit(newRecord);
  }

  function renderField(field) {
    const commonProperties = {
      id: field.name,
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
      >
        <header className="network-modal__header">
          <div>
            <h2 id="network-modal-title">{configuration.title}</h2>
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
          <div className="network-form-grid">
            {configuration.fields.map((field) => (
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

                {renderField(field)}
              </label>
            ))}
          </div>

          <footer className="network-modal__footer">
            <button
              type="button"
              className="network-modal__cancel"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button type="submit" className="network-modal__save">
              Guardar registro
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default NetworkFormModal;