import { apiRequest } from "./apiClient";
import { dateParts, labelCode, numberValue, requireList, toIsoLocal } from "./serviceUtils";

const tripStates = { PROGRAMADO: "Programado", EN_ABORDAJE: "En abordaje", EN_CURSO: "En curso", RETRASADO: "Retrasado", COMPLETADO: "Completado", CANCELADO: "Cancelado" };
const scheduleStates = { ACTIVO: "Vigente", INACTIVO: "Inactivo", SUSPENDIDO: "Suspendido" };
const serviceTypes = { LOCAL: "Local", EXPRESO: "Expreso", NOCTURNO: "Nocturno", ESPECIAL: "Servicio especial" };

export function adaptTrip(row) {
  const departure = dateParts(row.salidaProgramada);
  const arrival = dateParts(row.llegadaProgramada);
  const actualDeparture = dateParts(row.salidaReal);
  const actualArrival = dateParts(row.llegadaReal);
  const status = labelCode(row.estadoViaje, tripStates);
  return {
    id: String(row.numeroViaje), apiId: Number(row.numeroViaje), route: row.codigoRuta,
    routeId: Number(row.idRuta), line: row.idLinea, date: departure.date,
    scheduledDeparture: departure.time, scheduledArrival: arrival.time,
    actualDeparture: actualDeparture.time, actualArrival: actualArrival.time,
    train: row.codigoTren ?? "Sin asignar", driver: row.conductor ?? "Sin asignar",
    driverId: row.idConductor == null ? null : Number(row.idConductor),
    status: status.label, statusCode: status.code,
    passengers: numberValue(row.pasajerosEstimados), delayMinutes: numberValue(row.minutosRetraso),
  };
}

export function adaptSchedule(row) {
  const status = labelCode(row.estado, scheduleStates);
  return {
    id: String(row.idHorario), apiId: Number(row.idHorario), route: row.codigoRuta,
    routeId: Number(row.idRuta), line: row.idLinea, days: row.diaSemana,
    startTime: row.horaInicio, endTime: row.horaFin, frequency: numberValue(row.frecuenciaMin),
    service: labelCode(row.tipoServicio, serviceTypes).label, serviceCode: row.tipoServicio,
    startDate: row.fechaInicioVigor, endDate: row.fechaFinVigor ?? "",
    status: status.label, statusCode: status.code,
  };
}

export async function getOperations({ signal, includeRestricted = true } = {}) {
  const [trips, schedules, routes, trains, employees] = await Promise.all([
    includeRestricted ? apiRequest("/api/viajes", { signal }) : Promise.resolve([]),
    apiRequest("/api/horarios", { signal }),
    apiRequest("/api/rutas", { signal }), apiRequest("/api/trenes", { signal }),
    includeRestricted ? apiRequest("/api/empleados/opciones", { signal }) : Promise.resolve([]),
  ]);
  return {
    trips: requireList(trips, "viajes").map(adaptTrip),
    schedules: requireList(schedules, "horarios").map(adaptSchedule),
    routes, trains, employees: requireList(employees, "opciones de empleados").map((row) => ({
      idEmpleado: row.idEmpleado, nombres: row.nombre, apellidos: "", codigoCargo: row.codigoCargo,
    })).filter((employee) => employee.codigoCargo === "CONDUCTOR"),
  };
}

export function createTrip(form) {
  return apiRequest("/api/viajes", { method: "POST", body: {
    idRuta: Number(form.routeId), salida: toIsoLocal(form.date, form.scheduledDeparture),
    codigoTren: form.train || null, idConductor: form.driverId ? Number(form.driverId) : null,
    pasajerosEstimados: Number(form.passengers || 0),
  } });
}

export function createSchedule(form) {
  return apiRequest(`/api/rutas/${Number(form.routeId)}/horarios`, { method: "POST", body: {
    diaSemana: form.days, horaInicio: form.startTime, horaFin: form.endTime,
    frecuenciaMin: Number(form.frequency), tipoServicio: form.serviceCode,
    fechaInicioVigor: form.startDate || null, fechaFinVigor: form.endDate || null,
  } });
}

export function cancelTrip(id) {
  return apiRequest(`/api/viajes/${id}/cancelar`, { method: "POST", body: { motivo: "Cancelación administrativa desde la consola" } });
}

export function deactivateSchedule(id) {
  return apiRequest(`/api/horarios/${id}/estado`, { method: "PATCH", body: { estado: "INACTIVO" } });
}
