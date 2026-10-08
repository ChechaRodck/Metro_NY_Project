import { apiRequest } from "./apiClient";
import { labelCode, numberValue, requireList } from "./serviceUtils";

const orderStates = { SOLICITADA: "Pendiente", PROGRAMADA: "Programada", EN_EJECUCION: "En progreso", SUSPENDIDA: "Suspendida", COMPLETADA: "Completada", CANCELADA: "Cancelada" };
const priorities = { URGENTE: "Crítica", ALTA: "Alta", MEDIA: "Media", BAJA: "Baja" };
const equipmentStates = { OPERATIVO: "Operativo", EN_MANTENIMIENTO: "Mantenimiento", FUERA_SERVICIO: "Inactivo", RETIRADO: "Retirado" };

export async function getMaintenance({ signal, includeRestricted = true } = {}) {
  const [orders, equipment, parts, employees] = await Promise.all([
    includeRestricted ? apiRequest("/api/ordenes", { signal }) : Promise.resolve([]),
    apiRequest("/api/equipos", { signal }),
    includeRestricted ? apiRequest("/api/repuestos", { signal }) : Promise.resolve([]),
    includeRestricted ? apiRequest("/api/empleados/opciones", { signal }) : Promise.resolve([]),
  ]);
  return {
    orders: requireList(orders, "órdenes").map((row) => ({
      id: String(row.numeroOrden), apiId: Number(row.numeroOrden), title: row.descripcion,
      asset: row.idEquipo, assetType: row.tipoEquipo, location: row.descripcionUbicacion,
      assignedTo: row.responsable, priority: labelCode(row.prioridad, priorities).label,
      priorityCode: row.prioridad, scheduledDate: row.fechaProgramada ?? row.fechaSolicitud,
      estimatedHours: null, cost: row.costoTotal == null ? null : numberValue(row.costoTotal),
      status: labelCode(row.estado, orderStates).label, statusCode: row.estado,
    })),
    equipment: requireList(equipment, "equipos").map((row) => ({
      id: row.idEquipo, name: row.modelo ?? row.idEquipo, category: labelCode(row.tipoEquipo).label,
      typeCode: row.tipoEquipo, serialNumber: row.numeroSerie ?? "—", manufacturer: row.fabricante ?? "—",
      location: row.estacion ?? row.descripcionUbicacion, lastMaintenance: row.fechaUltimaRevision ?? "",
      nextMaintenance: row.fechaProximaRevision ?? "", condition: labelCode(row.estado, equipmentStates).label,
      status: labelCode(row.estado, equipmentStates).label, statusCode: row.estado,
      stationId: row.idEstacion, platformId: row.idPlataforma, trainCode: row.codigoTren,
      wagonSerial: row.numeroSerieVagon, frequencyDays: numberValue(row.frecuenciaRevisionDias),
    })),
    parts: requireList(parts, "repuestos").map((row) => ({
      id: String(row.idRepuesto), apiId: Number(row.idRepuesto), name: row.nombre,
      category: row.descripcion ?? "Repuesto", stock: numberValue(row.stock), minimumStock: null,
      unit: null, location: null, supplier: null,
      unitCost: numberValue(row.costoUnitario), status: numberValue(row.stock) > 0 ? "Disponible" : "Agotado",
    })),
    employees: requireList(employees, "opciones de empleados").map((row) => ({
      idEmpleado: row.idEmpleado, nombres: row.nombre, apellidos: "", codigoCargo: row.codigoCargo,
    })).filter((employee) => employee.codigoCargo === "TECNICO_MANT"),
  };
}

export function createOrder(form) {
  return apiRequest("/api/ordenes", { method: "POST", body: {
    idEquipo: form.assetId, tipoMantenimiento: form.maintenanceType,
    descripcion: form.title, fechaProgramada: form.scheduledDate || null,
    prioridad: form.priorityCode, idTecnico: Number(form.technicianId),
    costoManoObra: Number(form.estimatedCost || 0),
  } });
}

export function createEquipment(form) {
  return apiRequest("/api/equipos", { method: "POST", body: {
    idEquipo: form.id, tipoEquipo: form.typeCode, descripcionUbicacion: form.location,
    idEstacion: form.stationId ? Number(form.stationId) : null,
    idPlataforma: form.platformId ? Number(form.platformId) : null,
    codigoTren: form.trainCode || null, numeroSerieVagon: form.wagonSerial || null,
    fabricante: form.manufacturer || null, modelo: form.name || null, numeroSerie: form.serialNumber || null,
    fechaInstalacion: form.installationDate || null, frecuenciaRevisionDias: Number(form.frequencyDays),
    fechaProximaRevision: form.nextMaintenance || null,
  } });
}

export function createPart(form) {
  return apiRequest("/api/repuestos", { method: "POST", body: {
    nombre: form.name, descripcion: form.description || form.category || null,
    costoUnitario: Number(form.unitCost || 0), stock: Number(form.stock || 0),
  } });
}

export function cancelOrder(id) {
  return apiRequest(`/api/ordenes/${id}/estado`, { method: "PATCH", body: { estado: "CANCELADA" } });
}

export function retireEquipment(id) {
  return apiRequest(`/api/equipos/${encodeURIComponent(id)}/estado`, { method: "PATCH", body: { estado: "RETIRADO" } });
}
