import { apiRequest } from "./apiClient";
import { requireList } from "./serviceUtils";

export const reportDefinitions = [
  { id: "passengers", name: "Pasajeros por línea", type: "Pasajeros", path: "/api/reportes/pasajeros-por-linea", roles: ["ADMIN", "OPERACIONES", "CONSULTA"] },
  { id: "flow", name: "Flujo por estación", type: "Pasajeros", path: "/api/reportes/estaciones-flujo", roles: ["ADMIN", "OPERACIONES", "MANTENIMIENTO", "CONSULTA"] },
  { id: "delays", name: "Retrasos por línea", type: "Operaciones", path: "/api/reportes/retrasos-por-linea", roles: ["ADMIN", "OPERACIONES", "MANTENIMIENTO", "CONSULTA"] },
  { id: "inspections", name: "Inspecciones vencidas", type: "Flota", path: "/api/reportes/trenes-inspeccion-vencida", roles: ["ADMIN", "OPERACIONES", "MANTENIMIENTO", "CONSULTA"] },
  { id: "drivers", name: "Conductores por viaje", type: "Personal", path: "/api/reportes/conductores-por-viaje", roles: ["ADMIN", "OPERACIONES"] },
  { id: "revenue", name: "Recaudación", type: "Finanzas", path: "/api/reportes/recaudacion", roles: ["ADMIN"] },
];

export async function getReports(roles, { signal } = {}) {
  const allowed = reportDefinitions.filter((report) => report.roles.some((role) => roles.includes(role)));
  const results = await Promise.all(allowed.map(async (definition) => {
    const rows = requireList(await apiRequest(definition.path, { signal }), definition.name);
    return {
      id: definition.id, name: definition.name, type: definition.type,
      period: "Consulta actual de Oracle", status: "Disponible",
      format: "Datos", rows, count: rows.length, source: definition.path,
    };
  }));
  return results;
}
