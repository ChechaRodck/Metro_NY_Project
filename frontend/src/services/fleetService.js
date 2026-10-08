import { apiRequest } from "./apiClient";
import { labelCode, numberValue, requireList } from "./serviceUtils";

const trainStates = { DISPONIBLE: "Disponible", EN_OPERACION: "En operación", EN_MANTENIMIENTO: "En mantenimiento", FUERA_SERVICIO: "Fuera de servicio", RETIRADO: "Retirado" };
const wagonStates = { OPERATIVO: "Operativo", EN_MANTENIMIENTO: "En mantenimiento", FUERA_SERVICIO: "Fuera de servicio", RETIRADO: "Retirado" };

export async function getFleet({ signal } = {}) {
  const [trains, wagons, deposits, models] = await Promise.all([
    apiRequest("/api/trenes", { signal }), apiRequest("/api/vagones", { signal }),
    apiRequest("/api/depositos", { signal }), apiRequest("/api/modelos", { signal }),
  ]);
  return {
    trains: requireList(trains, "trenes").map((row) => ({
      id: row.codigoTren, model: row.modelo, modelId: Number(row.idModelo), manufacturer: row.fabricante,
      year: numberValue(row.anioFabricacion), capacity: numberValue(row.capacidadTotal),
      status: labelCode(row.estadoOperativo, trainStates).label, statusCode: row.estadoOperativo,
      mileage: numberValue(row.kilometrajeKm), deposit: row.deposito, depositId: Number(row.idDeposito),
      lastInspection: row.fechaUltimaInspeccion ?? "", nextInspection: row.fechaProximaInspeccion ?? "",
      wagons: numberValue(row.vagones),
    })),
    wagons: requireList(wagons, "vagones").map((row) => ({
      id: row.numeroSerie, type: row.tipoVagon, seats: numberValue(row.capacidadSentados),
      standing: numberValue(row.capacidadPie), year: numberValue(row.anioFabricacion),
      train: row.trenActual ?? "Sin asignar",
      position: row.posicionActual == null ? null : numberValue(row.posicionActual),
      status: labelCode(row.estado, wagonStates).label, statusCode: row.estado,
      accessible: row.accesible === "S" || row.accesible === true,
    })),
    deposits: requireList(deposits, "depósitos").map((row) => ({
      id: String(row.idDeposito), apiId: Number(row.idDeposito), name: row.nombre,
      location: row.ubicacion ?? row.direccion ?? "—", capacity: numberValue(row.capacidadTrenes),
      assignedTrains: numberValue(row.trenesAsignados), status: row.estado ?? "Operativo",
    })),
    models: requireList(models, "modelos"),
  };
}

export function createTrain(form) {
  return apiRequest("/api/trenes", { method: "POST", body: {
    codigoTren: form.id, idModelo: Number(form.modelId), anioFabricacion: Number(form.year),
    capacidadTotal: Number(form.capacity), kilometrajeKm: Number(form.mileage || 0),
    idDeposito: Number(form.depositId), fechaUltimaInspeccion: form.lastInspection || null,
    fechaProximaInspeccion: form.nextInspection,
  } });
}

export async function createWagon(form) {
  await apiRequest("/api/vagones", { method: "POST", body: {
    numeroSerie: form.id, tipoVagon: form.type, capacidadSentados: Number(form.seats),
    capacidadPie: Number(form.standing), anioFabricacion: Number(form.year), accesible: Boolean(form.accessible),
  } });
  if (form.train) {
    await apiRequest(`/api/trenes/${encodeURIComponent(form.train)}/vagones`, { method: "POST", body: {
      numeroSerie: form.id, posicion: Number(form.position), fecha: null,
    } });
  }
}

export function retireTrain(id) {
  return apiRequest(`/api/trenes/${encodeURIComponent(id)}/estado`, { method: "PATCH", body: { estado: "RETIRADO" } });
}

export function retireWagon(id) {
  return apiRequest(`/api/vagones/${encodeURIComponent(id)}/estado`, { method: "PATCH", body: { estado: "RETIRADO" } });
}
