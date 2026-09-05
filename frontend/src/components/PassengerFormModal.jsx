import { useEffect, useState } from "react";
import { X } from "lucide-react";

function createInitialValues(fields) {
  return fields.reduce((values, field) => {
    values[field.name] = field.defaultValue ?? "";
    return values;
  }, {});
}

function PassengerFormModal({
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
    label: `${passenger.name} — ${passenger.id}`,
  }));

  const cardOptions = availableCards.map((card) => ({
    value: card.id,
    label: `•••• ${card.number.slice(-4)} — ${card.passenger}`,
  }));

  const configurations = {
    passengers: {
      title: "Registrar pasajero",
      description: "Ingresa los datos generales y de contacto del pasajero.",
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
          label: "Estado",
          type: "select",
          defaultValue: "Activo",
          options: ["Activo", "Suspendido", "Inactivo"],
          required: true,
        },
      ],
    },

    cards: {
      title: "Emitir tarjeta",
      description: "Asigna una nueva tarjeta del metro a un pasajero.",
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
          label: "Saldo inicial",
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
          label: "Estado",
          type: "select",
          defaultValue: "Activa",
          options: ["Activa", "Por vencer", "Bloqueada", "Vencida"],
          required: true,
        },
      ],
    },

    recharges: {
      title: "Registrar recarga",
      description: "Registra una nueva transacción para una tarjeta.",
      fields: [
        {
          name: "cardId",
          label: "Tarjeta",
          type: "select",
          defaultValue: cardOptions[0]?.value ?? "",
          options: cardOptions,
          required: true,
        },
        {
          name: "amount",
          label: "Monto de recarga",
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
          label: "Método de pago",
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
          label: "Estado",
          type: "select",
          defaultValue: "Aprobada",
          options: ["Aprobada", "Pendiente", "Rechazada"],
          required: true,
        },
      ],
    },

    fares: {
      title: "Registrar tarifa",
      description: "Configura una nueva tarifa para el sistema.",
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
          label: "Precio",
          type: "number",
          min: "0",
          step: "0.01",
          required: true,
        },
        {
          name: "validity",
          label: "Vigencia",
          placeholder: "Ejemplo: 7 días",
          required: true,
        },
        {
          name: "status",
          label: "Estado",
          type: "select",
          defaultValue: "Activa",
          options: ["Activa", "Inactiva"],
          required: true,
        },
      ],
    },
  };

  const configuration = configurations[type];

  const [formValues, setFormValues] = useState(() =>
    createInitialValues(configuration.fields),
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

    let newRecord = { ...formValues };

    if (type === "passengers") {
      newRecord = {
        ...formValues,
        trips: 0,
      };
    }

    if (type === "cards") {
      const passenger = availablePassengers.find(
        (item) => item.id === formValues.passengerId,
      );

      newRecord = {
        ...formValues,
        balance: Number(formValues.balance),
        passenger: passenger?.name ?? "Pasajero",
      };
    }

    if (type === "recharges") {
      const selectedCard = availableCards.find(
        (card) => card.id === formValues.cardId,
      );

      const { cardId, ...rechargeValues } = formValues;

      newRecord = {
        ...rechargeValues,
        amount: Number(formValues.amount),
        cardNumber: selectedCard
          ? `•••• ${selectedCard.number.slice(-4)}`
          : "Sin tarjeta",
        passenger: selectedCard?.passenger ?? "Pasajero",
      };
    }

    if (type === "fares") {
      newRecord = {
        ...formValues,
        price: Number(formValues.price),
      };
    }

    onSubmit(newRecord);
  }

  function renderField(field) {
    const commonProperties = {
      id: `passenger-${field.name}`,
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

  return (
    <div
      className="passenger-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="passenger-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="passenger-modal-title"
      >
        <header className="passenger-modal__header">
          <div>
            <h2 id="passenger-modal-title">
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
          <div className="passenger-form-grid">
            {configuration.fields.map((field) => (
              <label
                className={
                  field.type === "textarea"
                    ? "passenger-field passenger-field--wide"
                    : "passenger-field"
                }
                key={field.name}
                htmlFor={`passenger-${field.name}`}
              >
                <span>
                  {field.label}
                  {field.required && <b aria-hidden="true"> *</b>}
                </span>

                {renderField(field)}
              </label>
            ))}
          </div>

          <footer className="passenger-modal__footer">
            <button
              type="button"
              className="passenger-modal__cancel"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="passenger-modal__save"
            >
              Guardar registro
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default PassengerFormModal;