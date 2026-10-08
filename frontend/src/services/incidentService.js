import { apiRequest } from "./apiClient";
import { labelCode, numberValue, requireList } from "./serviceUtils";

const severities = { CRITICO: "Crítica", ALTO: "Alta", MEDIO: "Media", BAJO: "Baja" };
const states = { ABIERTO: "Abierto", EN_ATENCION: "En atención", CERRADO: "Cerrado" };

export function adaptIncident(row) {
  return {
    incidentNumber: Number(row.numeroIncidente), type: labelCode(row.tipoIncidente).label,
    typeCode: row.tipoIncidente, description: row.descripcion,
    startDateTime: row.fechaHoraInicio ?? "", endDateTime: row.fechaHoraFin ?? "",
    severity: labelCode(row.severidad, severities).label, severityCode: row.severidad,
    reportedBy: row.empleadoReporta ?? row.reportadoPor ?? "No registrado",
    status: labelCode(row.estado, states).label, statusCode: row.estado,
    identifiedCause: row.causaIdentificada ?? row.causa ?? "Sin causa confirmada",
    actionsTaken: row.accionesRealizadas ?? row.accionesTomadas ?? "Sin acciones registradas",
    affectedPassengers: numberValue(row.pasajerosAfectados),
    relatedType: row.tipoElemento ? labelCode(row.tipoElemento).label : "Sin asociación",
    relatedResource: row.elemento ?? "Sin elemento asociado",
    location: row.lugarAfectado ?? "No registrada",
    durationMinutes: numberValue(row.duracionMin),
  };
}

export async function getIncidents({ signal } = {}) {
  const response = await apiRequest("/api/incidentes", { signal });
  return requireList(response, "incidentes").map(adaptIncident);
}

export function createIncident(form) {
  return apiRequest("/api/incidentes", { method: "POST", body: {
    tipoIncidente: form.typeCode, descripcion: form.description,
    fechaHoraInicio: form.startDateTime || null, lugarAfectado: form.location,
    severidad: form.severityCode, idEmpleadoReporta: form.reporterId ? Number(form.reporterId) : null,
    reportadoPor: form.reportedBy || null, causa: form.identifiedCause || null,
    pasajerosAfectados: Number(form.affectedPassengers || 0), elementos: [],
  } });
}

export function closeIncident(id, incident = {}) {
  return apiRequest(`/api/incidentes/${id}/cerrar`, { method: "POST", body: {
    fechaFin: null,
    causa: incident.identifiedCause === "Sin causa confirmada" ? null : incident.identifiedCause || null,
    restablecer: true,
  } });
}
