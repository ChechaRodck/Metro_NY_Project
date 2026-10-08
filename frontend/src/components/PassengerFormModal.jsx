import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

function createInitialValues(fields) {
  return fields.reduce((values, field) => {
    values[field.name] = field.defaultValue ?? "";
    return values;
  }, {});
}

function getConfigurations(
  passengerOptions,
  fareOptions,
  stationOptions,
) {
  return {
    passengers: {
      title: "Registrar pasajero",
      description:
        "Ingresa los datos administrativos que se guardarán en Oracle.",
      fields: [
        {
          name: "firstNames",
          label: "Nombres",
          required: true,
        },
        {
          name: "lastNames",
          label: "Apellidos",
          required: true,
        },
        {
          name: "birthDate",
          label: "Fecha de nacimiento",
          type: "date",
        },
        {
          name: "phone",
          label: "Teléfono",
          placeholder: "+1 212-555-0000",
          required: true,
        },
        {
          name: "email",
          label: "Correo electrónico",
          type: "email",
          placeholder: "pasajero@email.com",
          required: true,
        },
        {
          name: "passengerType",
          label: "Tipo de pasajero",
          type: "select",
          defaultValue: "REGULAR",
          options: [
            { value: "REGULAR", label: "Regular" },
            { value: "ESTUDIANTE", label: "Estudiante" },
            { value: "ADULTO_MAYOR", label: "Adulto mayor" },
            { value: "DISCAPACIDAD", label: "Discapacidad" },
            { value: "EMPLEADO", label: "Empleado" },
          ],
          required: true,
        },
      ],
    },
    cards: {
      title: "Emitir tarjeta",
      description:
        "Emite una tarjeta mediante el procedimiento seguro de Oracle.",
      fields: [
        {
          name: "passengerId",
          label: "Pasajero",
          type: "select",
          defaultValue: passengerOptions[0]?.value ?? "",
          options: passengerOptions,
          required: true,
        },
        {
          name: "fareCode",
          label: "Tarifa",
          type: "select",
          defaultValue: fareOptions[0]?.value ?? "",
          options: fareOptions,
          required: true,
        },
        {
          name: "balance",
          label: "Saldo inicial registrado",
          type: "number",
          defaultValue: "0",
          min: "0",
          step: "0.01",
          required: true,
        },
        {
          name: "stationId",
          label: "Estación de emisión",
          type: "select",
          defaultValue: stationOptions[0]?.value ?? "",
          options: stationOptions,
        },
      ],
    },
    recharges: {
      title: "Registrar recarga",
      description:
        "Registra una recarga real. El número se usa solo para esta solicitud y no se conserva en el navegador.",
      fields: [
        {
          name: "cardNumber",
          label: "Número completo de tarjeta",
          placeholder: "Número requerido por el procedimiento de recarga",
          required: true,
        },
        {
          name: "amount",
          label: "Monto registrado",
          type: "number",
          min: "0.01",
          step: "0.01",
          required: true,
        },
        {
          name: "paymentMethod",
          label: "Método registrado",
          type: "select",
          defaultValue: "EFECTIVO",
          options: [
            { value: "EFECTIVO", label: "Efectivo" },
            { value: "TARJETA_CREDITO", label: "Tarjeta de crédito" },
            { value: "TARJETA_DEBITO", label: "Tarjeta de débito" },
            { value: "APP_MOVIL", label: "Aplicación móvil" },
          ],
          required: true,
        },
        {
          name: "channel",
          label: "Canal",
          type: "select",
          defaultValue: "TAQUILLA",
          options: [
            { value: "TAQUILLA", label: "Taquilla" },
            { value: "MAQUINA_ESTACION", label: "Máquina de estación" },
            { value: "APP", label: "Aplicación" },
            { value: "WEB", label: "Web" },
          ],
          required: true,
        },
        { name: "stationId", label: "Estación", type: "select", options: stationOptions, required: true },
      ],
    },
    fares: {
      title: "Registrar tarifa",
      description:
        "Agrega una definición tarifaria persistente con los estados oficiales de Oracle.",
      fields: [
        { name: "code", label: "Código", required: true },
        {
          name: "name",
          label: "Nombre de la tarifa",
          placeholder: "Nombre de la tarifa",
          required: true,
        },
        {
          name: "description",
          label: "Descripción",
          type: "textarea",
          placeholder: "Describe las condiciones de la tarifa",
          required: true,
        },
        {
          name: "categoryCode",
          label: "Categoría",
          type: "select",
          defaultValue: "TODOS",
          options: ["TODOS", "REGULAR", "ESTUDIANTE", "ADULTO_MAYOR", "DISCAPACIDAD", "EMPLEADO"],
          required: true,
        },
        {
          name: "price",
          label: "Precio registrado",
          type: "number",
          min: "0",
          step: "0.01",
          required: true,
        },
        {
          name: "productType",
          label: "Tipo de producto",
          type: "select",
          defaultValue: "VIAJE_INDIVIDUAL",
          options: ["VIAJE_INDIVIDUAL", "PASE_DIARIO", "PASE_SEMANAL", "PASE_MENSUAL", "TARIFA_REDUCIDA", "PASE_ESTUDIANTIL"],
          required: true,
        },
        { name: "startDate", label: "Inicio de vigencia", type: "date", required: true },
        { name: "endDate", label: "Fin de vigencia", type: "date" },
        { name: "maxTrips", label: "Máximo de viajes", type: "number", min: "1" },
        { name: "durationDays", label: "Duración en días", type: "number", min: "1" },
      ],
    },
  };
}

export default function PassengerFormModal({
  type,
  availablePassengers,
  availableFares = [],
  availableStations = [],
  isSubmitting = false,
  error = "",
  onClose,
  onSubmit,
}) {
  const passengerOptions = availablePassengers.map((passenger) => ({
    value: passenger.id,
    label: `${passenger.id} · ${passenger.name}`,
  }));
  const fareOptions = availableFares.map((fare) => ({
    value: fare.id,
    label: `${fare.id} · ${fare.name}`,
  }));
  const stationOptions = availableStations.map((station) => ({ value: station.idEstacion, label: station.nombre }));
  const configurations = getConfigurations(
    passengerOptions,
    fareOptions,
    stationOptions,
  );
  const configuration = configurations[type] ?? configurations.passengers;
  const dialogRef = useRef(null);
  const backdropRef = useRef(null);
  const initialFocusRef = useRef(null);
  const [formValues, setFormValues] = useState(() =>
    createInitialValues(configuration.fields),
  );

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
    const focusableSelector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "summary",
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
      ).filter(
        (element) => !element.hidden && element.getClientRects().length > 0,
      );

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
        if (hadInert) element.setAttribute("inert", "");
        else element.removeAttribute("inert");

        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
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
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    let newRecord = { ...formValues };

    if (type === "cards") {
      newRecord = {
        ...formValues,
        balance: Number(formValues.balance),
      };
    }

    if (type === "recharges") {
      newRecord = {
        amount: Number(formValues.amount),
        cardNumber: formValues.cardNumber,
        paymentMethod: formValues.paymentMethod,
        channel: formValues.channel,
        stationId: formValues.stationId,
      };
    }

    if (type === "fares") {
      newRecord = { ...formValues, price: Number(formValues.price) };
    }

    onSubmit(newRecord);
  }

  function renderField(field, index) {
    const fieldId = `passenger-${type}-${field.name}`;
    const commonProperties = {
      id: fieldId,
      name: field.name,
      value: formValues[field.name],
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
          rows="4"
          placeholder={field.placeholder}
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

  return createPortal(
    <div
      className="passenger-modal-backdrop"
      ref={backdropRef}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="passenger-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="passenger-modal-title"
        aria-describedby="passenger-modal-description"
        ref={dialogRef}
        tabIndex={-1}
      >
        <header className="passenger-modal__header">
          <div>
            <h2 id="passenger-modal-title">{configuration.title}</h2>
            <p id="passenger-modal-description">{configuration.description}</p>
          </div>

          <button type="button" aria-label="Cerrar formulario" onClick={onClose}>
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} aria-busy={isSubmitting || undefined}>
          <div className="passenger-form-grid">
            {configuration.fields.map((field, index) => (
              <label
                className={
                  field.type === "textarea"
                    ? "passenger-field passenger-field--wide"
                    : "passenger-field"
                }
                key={field.name}
                htmlFor={`passenger-${type}-${field.name}`}
              >
                <span>
                  {field.label}
                  {field.required && <b aria-hidden="true"> *</b>}
                </span>
                {renderField(field, index)}
              </label>
            ))}
          </div>

          {error && <p className="passenger-form-error" role="alert">{error}</p>}

          <footer className="passenger-modal__footer">
            <button type="button" className="passenger-modal__cancel" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="passenger-modal__save" disabled={isSubmitting}>
              {isSubmitting ? "Guardando…" : "Guardar registro"}
            </button>
          </footer>
        </form>
      </section>
    </div>,
    document.body,
  );
}
