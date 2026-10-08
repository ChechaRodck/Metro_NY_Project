import { apiRequest } from "./apiClient";

const LINE_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

const lineStatusLabels = {
  ACTIVA: "Operativa",
  SUSPENDIDA: "Suspendida",
  INACTIVA: "Inactiva",
};

const serviceTypeLabels = {
  EXPRESO: "Expreso",
  LOCAL: "Local",
  NOCTURNO: "Nocturno",
};

function requireObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("La respuesta de líneas no tiene el formato esperado.");
  }
  return value;
}

function requireString(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("La respuesta de líneas contiene texto no válido.");
  }
  return value.trim();
}

function requireNumber(value) {
  if (value === null || value === undefined || value === "" || typeof value === "boolean") {
    throw new Error("La respuesta de líneas contiene un valor numérico no válido.");
  }

  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) {
    throw new Error("La respuesta de líneas contiene un valor numérico no válido.");
  }
  return parsedValue;
}

function optionalNumber(value) {
  if (value === null || value === undefined) return null;
  return requireNumber(value);
}

function optionalTerminal(value) {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : "Sin terminal registrada";
}

function humanizeCode(value, labels) {
  const code = requireString(value).toUpperCase();
  const fallback = code
    .toLocaleLowerCase("es")
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toLocaleUpperCase("es"));

  return { code, label: labels[code] ?? fallback };
}

export function adaptLineResponse(value) {
  const line = requireObject(value);
  const status = humanizeCode(line.estadoOperativo, lineStatusLabels);
  const service = humanizeCode(line.tipoServicio, serviceTypeLabels);
  const activeRoutes = requireNumber(line.rutasActivas);
  const affectedRoutes = requireNumber(line.rutasAfectadas);
  const openIncidents = requireNumber(line.incidentesAbiertos);

  return {
    id: requireString(line.idLinea),
    name: requireString(line.nombre),
    color:
      typeof line.colorMapa === "string" && LINE_COLOR_PATTERN.test(line.colorMapa)
        ? line.colorMapa
        : "#60a5fa",
    origin: optionalTerminal(line.terminalOrigen),
    destination: optionalTerminal(line.terminalDestino),
    service: service.label,
    serviceCode: service.code,
    status: status.label,
    statusCode: status.code,
    stations: requireNumber(line.totalEstaciones),
    length: optionalNumber(line.longitudKm),
    activeRoutes,
    affectedRoutes,
    tripsInProgress: requireNumber(line.viajesEnCurso),
    openIncidents,
    hasAttention:
      status.code !== "ACTIVA" || affectedRoutes > 0 || openIncidents > 0,
  };
}

export async function getLines({ signal } = {}) {
  const response = await apiRequest("/api/lineas", { signal });

  if (!Array.isArray(response)) {
    throw new Error("La respuesta de líneas no contiene una lista válida.");
  }

  return response.map(adaptLineResponse);
}

export async function getStations({ signal } = {}) {
  const response = await apiRequest("/api/estaciones", { signal });
  return response.map((station) => {
    const status = humanizeCode(station.estadoOperativo, {
      OPERATIVA: "Operativa",
      CERRADA: "Cerrada",
      MANTENIMIENTO: "En mantenimiento",
    });
    return {
      id: String(station.idEstacion),
      apiId: Number(station.idEstacion),
      code: station.codigoEstacion,
      name: station.nombre,
      address: station.direccion,
      borough: station.distrito,
      lines: typeof station.lineas === "string" ? station.lineas.split(",").filter(Boolean) : [],
      platforms: Number(station.cantidadPlataformas ?? 0),
      accesses: Number(station.cantidadAccesos ?? 0),
      type: station.tipoEstacion,
      accessible: station.accesibleDiscapacidad === "S" || station.accesibleDiscapacidad === true,
      openingTime: station.horaApertura,
      closingTime: station.horaCierre,
      status: status.label,
      statusCode: status.code,
    };
  });
}

export async function getRoutes({ signal } = {}) {
  const response = await apiRequest("/api/rutas", { signal });
  return response.map((route) => {
    const status = humanizeCode(route.estado, { ACTIVA: "Activa", INACTIVA: "Inactiva", SUSPENDIDA: "Suspendida" });
    return {
      id: String(route.idRuta),
      apiId: Number(route.idRuta),
      code: route.codigoRuta,
      line: route.idLinea,
      origin: route.estacionOrigen,
      originId: Number(route.idEstacionOrigen),
      destination: route.estacionDestino,
      destinationId: Number(route.idEstacionDestino),
      direction: route.sentido,
      service: humanizeCode(route.tipoServicio, serviceTypeLabels).label,
      serviceCode: route.tipoServicio,
      distance: optionalNumber(route.distanciaTotalKm),
      duration: Number(route.duracionEstimadaMin ?? 0),
      startDate: route.fechaVigenciaInicio,
      endDate: route.fechaVigenciaFin,
      status: status.label,
      statusCode: status.code,
    };
  });
}

export function createLine(payload) {
  return apiRequest("/api/lineas", { method: "POST", body: payload });
}

export function updateLine(id, payload) {
  return apiRequest(`/api/lineas/${encodeURIComponent(id)}`, { method: "PUT", body: payload });
}

export function deactivateLine(id) {
  return apiRequest(`/api/lineas/${encodeURIComponent(id)}/desactivar`, { method: "POST" });
}

export function createStation(payload) {
  return apiRequest("/api/estaciones", { method: "POST", body: payload });
}

export function updateStation(id, payload) {
  return apiRequest(`/api/estaciones/${id}`, { method: "PUT", body: payload });
}

export function deactivateStation(id) {
  return apiRequest(`/api/estaciones/${id}/estado`, { method: "PATCH", body: { estado: "CERRADA" } });
}

export function createRoute(payload) {
  return apiRequest("/api/rutas", { method: "POST", body: payload });
}

export function updateRoute(id, payload) {
  return apiRequest(`/api/rutas/${id}`, { method: "PUT", body: payload });
}

export function deactivateRoute(id) {
  return apiRequest(`/api/rutas/${id}/estado`, { method: "PATCH", body: { estado: "INACTIVA" } });
}
