import { apiRequest } from "./apiClient";
import { numberValue, requireList } from "./serviceUtils";
import { adaptLineResponse } from "./lineService";
import { adaptIncident } from "./incidentService";
import { adaptTrip } from "./operationsService";

export async function getDashboard({ signal } = {}) {
  const [summary, lines, incidents, trips, passengerFlow] = await Promise.all([
    apiRequest("/api/dashboard/resumen", { signal }),
    apiRequest("/api/lineas", { signal }),
    apiRequest("/api/incidentes", { signal }),
    apiRequest("/api/viajes", { signal }).catch((error) => {
      if (error.status === 403) return [];
      throw error;
    }),
    apiRequest("/api/reportes/pasajeros-por-linea", { signal }).catch((error) => {
      if (error.status === 403) return [];
      throw error;
    }),
  ]);

  return {
    summary,
    lines: requireList(lines, "líneas").map(adaptLineResponse),
    incidents: requireList(incidents, "incidentes").map(adaptIncident),
    trips: requireList(trips, "viajes").map(adaptTrip),
    passengerFlow: requireList(passengerFlow, "pasajeros por línea").map((row) => ({
      day: row.idLinea,
      name: row.nombre,
      passengers: numberValue(row.pasajeros),
    })),
  };
}
