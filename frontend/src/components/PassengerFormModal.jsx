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
  cardOptions,
  cardTypes,
  paymentMethods,
  fareCategories,
) {
  return {
    passengers: {
      title: "Registrar pasajero",
      description:
        "Ingresa los datos administrativos para esta sesión de demostración.",
      fields: [
        {
          name: "name",
          label: "Nombre completo",
          placeholder: "Nombre del pasajero",
          required: true,
        },
        {
          name: "document",
          label: "Documento de identificación",
          placeholder: "Ejemplo: NY-123456",
          required: true,
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
          name: "registrationDate",
          label: "Fecha de registro",
          type: "date",
          required: true,
        },
        {
          name: "status",
          label: "Estado del pasajero",
          type: "select",
          defaultValue: "Activo",
          options: ["Activo", "Suspendido", "Inactivo"],
          required: true,
        },
      ],
    },
    cards: {
      title: "Emitir tarjeta",
      description:
        "Asigna una tarjeta interna del metro durante esta sesión de demostración.",
      fields: [
        {
          name: "number",
          label: "Número de tarjeta",
          placeholder: "8041 9203 0000 0000",
          required: true,
        },
        {
          name: "passengerId",
          label: "Pasajero",
          type: "select",
          defaultValue: passengerOptions[0]?.value ?? "",
          options: passengerOptions,
          required: true,
        },
        {
          name: "type",
          label: "Tipo de tarjeta",
          type: "select",
          defaultValue: cardTypes[0] ?? "",
          options: cardTypes,
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
          name: "status",
          label: "Estado de la tarjeta",
          type: "select",
          defaultValue: "Activa",
          options: ["Activa", "Por vencer", "Bloqueada", "Vencida"],
          required: true,
        },
      ],
    },
    recharges: {
      title: "Registrar recarga",
      description:
        "Registra una transacción local sin modificar el saldo de ninguna tarjeta.",
      fields: [
        {
          name: "cardId",
          label: "Tarjeta de referencia",
          type: "select",
          defaultValue: cardOptions[0]?.value ?? "",
          options: cardOptions,
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
          name: "date",
          label: "Fecha",
          type: "date",
          required: true,
        },
        {
          name: "time",
          label: "Hora",
          type: "time",
          required: true,
        },
        {
          name: "method",
          label: "Método registrado",
          type: "select",
          defaultValue: paymentMethods[0] ?? "",
          options: paymentMethods,
          required: true,
        },
        {
          name: "reference",
          label: "Referencia",
          placeholder: "Ejemplo: TRX-895300",
          required: true,
        },
        {
          name: "status",
          label: "Estado de la recarga",
          type: "select",
          defaultValue: "Aprobada",
          options: ["Aprobada", "Pendiente", "Rechazada"],
          required: true,
        },
      ],
    },
    fares: {
      title: "Registrar tarifa",
      description:
        "Agrega una definición tarifaria local para esta sesión de demostración.",
      fields: [
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
          name: "category",
          label: "Categoría",
          type: "select",
          defaultValue: fareCategories[0] ?? "",
          options: fareCategories,
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
          name: "validity",
          label: "Vigencia registrada",
          placeholder: "Ejemplo: 7 días",
          required: true,
        },
        {
          name: "status",
          label: "Estado de la tarifa",
          type: "select",
          defaultValue: "Activa",
          options: ["Activa", "Inactiva"],
          required: true,
        },
      ],
    },
  };
}

export default function PassengerFormModal({
  type,
  availablePassengers,
  availableCards,
  cardTypes,
  paymentMethods,
  fareCategories,
  onClose,
  onSubmit,
}) {
  const passengerOptions = availablePassengers.map((passenger) => ({
    value: passenger.id,
    label: `${passenger.id} · ${passenger.name}`,
  }));
  const cardOptions = availableCards.map((card) => ({
    value: card.id,
    label: `${card.id} · •••• ${String(card.number ?? "").replace(/\D/g, "").slice(-4)}`,
  }));
  const configurations = getConfigurations(
    passengerOptions,
    cardOptions,
    cardTypes,
    paymentMethods,
    fareCategories,
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

    if (type === "passengers") {
      newRecord = { ...formValues, trips: 0 };
    }

    if (type === "cards") {
      const passenger = availablePassengers.find(
        (item) => item.id === formValues.passengerId,
      );

      newRecord = {
        ...formValues,
        balance: Number(formValues.balance),
        passenger: passenger?.name ?? "Sin asociación registrada",
      };
    }

    if (type === "recharges") {
      const selectedCard = availableCards.find(
        (card) => card.id === formValues.cardId,
      );

      newRecord = {
        amount: Number(formValues.amount),
        date: formValues.date,
        time: formValues.time,
        method: formValues.method,
        reference: formValues.reference,
        status: formValues.status,
        cardNumber: selectedCard
          ? `•••• ${String(selectedCard.number ?? "").replace(/\D/g, "").slice(-4)}`
          : "Sin asociación registrada",
        passenger: selectedCard?.passenger ?? "Sin asociación registrada",
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

        <form onSubmit={handleSubmit}>
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

          <footer className="passenger-modal__footer">
            <button type="button" className="passenger-modal__cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="passenger-modal__save">
              Guardar registro
            </button>
          </footer>
        </form>
      </section>
    </div>,
    document.body,
  );
}
