import { useState } from "react";
import {
  ClipboardList,
  PackageSearch,
  TrainFront,
  X,
} from "lucide-react";
import {
  availableAssetTypes,
  availableEquipmentCategories,
  availablePartCategories,
  availablePriorities,
  availableTechnicians,
} from "../data/maintenanceData";

const initialValues = {
  orders: {
    title: "",
    asset: "",
    assetType: availableAssetTypes[0] || "",
    workshop: "",
    technician: availableTechnicians[0] || "",
    priority: availablePriorities[0] || "",
    scheduledDate: "",
    estimatedHours: "",
    estimatedCost: "",
    status: "Pendiente",
  },

  equipment: {
    name: "",
    category: availableEquipmentCategories[0] || "",
    serialNumber: "",
    manufacturer: "",
    location: "",
    lastMaintenance: "",
    nextMaintenance: "",
    condition: "Bueno",
    status: "Operativo",
  },

  parts: {
    name: "",
    category: availablePartCategories[0] || "",
    stock: "",
    minimumStock: "",
    unit: "Unidades",
    location: "",
    supplier: "",
    status: "Disponible",
  },
};

const modalInformation = {
  orders: {
    title: "Nueva orden de trabajo",
    description: "Registra una actividad de mantenimiento.",
    submitText: "Crear orden",
    icon: ClipboardList,
  },

  equipment: {
    title: "Registrar equipo",
    description: "Agrega un nuevo equipo al inventario.",
    submitText: "Registrar equipo",
    icon: TrainFront,
  },

  parts: {
    title: "Registrar repuesto",
    description: "Agrega un nuevo repuesto al inventario.",
    submitText: "Registrar repuesto",
    icon: PackageSearch,
  },
};

function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = true,
  min,
}) {
  return (
    <label className="maintenance-form-field">
      <span>{label}</span>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
      />
    </label>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <label className="maintenance-form-field">
      <span>{label}</span>

      <select name={name} value={value} onChange={onChange} required>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function MaintenanceFormModal({ type = "orders", onClose, onSave }) {
  const information = modalInformation[type] || modalInformation.orders;
  const Icon = information.icon;

  const [formData, setFormData] = useState({
    ...(initialValues[type] || initialValues.orders),
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    onSave({
      ...formData,
      estimatedHours: Number(formData.estimatedHours || 0),
      estimatedCost: Number(formData.estimatedCost || 0),
      stock: Number(formData.stock || 0),
      minimumStock: Number(formData.minimumStock || 0),
    });
  }

  function renderOrderFields() {
    return (
      <>
        <div className="maintenance-form-field maintenance-form-field--full">
          <label htmlFor="maintenance-title">Descripción del trabajo</label>

          <textarea
            id="maintenance-title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ejemplo: Inspección del sistema de frenos"
            rows="3"
            required
          />
        </div>

        <FormField
          label="Activo o unidad"
          name="asset"
          value={formData.asset}
          onChange={handleChange}
          placeholder="Ejemplo: Tren NY-2501"
        />

        <SelectField
          label="Tipo de activo"
          name="assetType"
          value={formData.assetType}
          onChange={handleChange}
          options={availableAssetTypes}
        />

        <FormField
          label="Taller o ubicación"
          name="workshop"
          value={formData.workshop}
          onChange={handleChange}
          placeholder="Ejemplo: Taller Pitkin"
        />

        <SelectField
          label="Técnico responsable"
          name="technician"
          value={formData.technician}
          onChange={handleChange}
          options={availableTechnicians}
        />

        <SelectField
          label="Prioridad"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          options={availablePriorities}
        />

        <SelectField
          label="Estado inicial"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={[
            "Pendiente",
            "Programada",
            "En progreso",
            "Completada",
          ]}
        />

        <FormField
          label="Fecha programada"
          name="scheduledDate"
          value={formData.scheduledDate}
          onChange={handleChange}
          type="date"
        />

        <FormField
          label="Duración estimada"
          name="estimatedHours"
          value={formData.estimatedHours}
          onChange={handleChange}
          type="number"
          placeholder="Horas"
          min="1"
        />

        <FormField
          label="Costo estimado"
          name="estimatedCost"
          value={formData.estimatedCost}
          onChange={handleChange}
          type="number"
          placeholder="USD"
          min="0"
        />
      </>
    );
  }

  function renderEquipmentFields() {
    return (
      <>
        <FormField
          label="Nombre del equipo"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ejemplo: Tren NY-2501"
        />

        <SelectField
          label="Categoría"
          name="category"
          value={formData.category}
          onChange={handleChange}
          options={availableEquipmentCategories}
        />

        <FormField
          label="Número de serie"
          name="serialNumber"
          value={formData.serialNumber}
          onChange={handleChange}
          placeholder="Ejemplo: SN-NY-2501"
        />

        <FormField
          label="Fabricante"
          name="manufacturer"
          value={formData.manufacturer}
          onChange={handleChange}
          placeholder="Nombre del fabricante"
        />

        <FormField
          label="Ubicación"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Ejemplo: Taller Corona"
        />

        <SelectField
          label="Condición"
          name="condition"
          value={formData.condition}
          onChange={handleChange}
          options={["Excelente", "Bueno", "Regular", "Deficiente"]}
        />

        <SelectField
          label="Estado"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={["Operativo", "Mantenimiento", "Inactivo"]}
        />

        <FormField
          label="Último mantenimiento"
          name="lastMaintenance"
          value={formData.lastMaintenance}
          onChange={handleChange}
          type="date"
        />

        <FormField
          label="Próximo mantenimiento"
          name="nextMaintenance"
          value={formData.nextMaintenance}
          onChange={handleChange}
          type="date"
        />
      </>
    );
  }

  function renderPartFields() {
    return (
      <>
        <FormField
          label="Nombre del repuesto"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ejemplo: Pastillas de freno"
        />

        <SelectField
          label="Categoría"
          name="category"
          value={formData.category}
          onChange={handleChange}
          options={availablePartCategories}
        />

        <FormField
          label="Cantidad disponible"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          type="number"
          min="0"
        />

        <FormField
          label="Stock mínimo"
          name="minimumStock"
          value={formData.minimumStock}
          onChange={handleChange}
          type="number"
          min="0"
        />

        <SelectField
          label="Unidad de medida"
          name="unit"
          value={formData.unit}
          onChange={handleChange}
          options={[
            "Unidades",
            "Cajas",
            "Juegos",
            "Metros",
            "Litros",
          ]}
        />

        <FormField
          label="Ubicación"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Ejemplo: Almacén A-04"
        />

        <FormField
          label="Proveedor"
          name="supplier"
          value={formData.supplier}
          onChange={handleChange}
          placeholder="Nombre del proveedor"
        />

        <SelectField
          label="Estado"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={["Disponible", "Stock bajo", "Agotado"]}
        />
      </>
    );
  }

  return (
    <div className="maintenance-modal-backdrop" onMouseDown={onClose}>
      <section
        className="maintenance-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="maintenance-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="maintenance-modal__header">
          <div className="maintenance-modal__title">
            <span className="maintenance-modal__icon">
              <Icon />
            </span>

            <div>
              <h2 id="maintenance-modal-title">{information.title}</h2>
              <p>{information.description}</p>
            </div>
          </div>

          <button
            type="button"
            className="maintenance-modal__close"
            onClick={onClose}
            aria-label="Cerrar formulario"
          >
            <X />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="maintenance-form-grid">
            {type === "orders" && renderOrderFields()}
            {type === "equipment" && renderEquipmentFields()}
            {type === "parts" && renderPartFields()}
          </div>

          <footer className="maintenance-modal__footer">
            <button
              type="button"
              className="maintenance-secondary-button"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button type="submit" className="maintenance-primary-button">
              {information.submitText}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default MaintenanceFormModal;