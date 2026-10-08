export function requireList(value, resource) {
  if (!Array.isArray(value)) {
    throw new Error(`La respuesta de ${resource} no contiene una lista válida.`);
  }
  return value;
}

export function objectValue(value, resource) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`La respuesta de ${resource} no tiene el formato esperado.`);
  }
  return value;
}

export function numberValue(value, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function textValue(value, fallback = "—") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function dateParts(value) {
  if (typeof value !== "string" || !value) return { date: "", time: "" };
  const [date = "", rawTime = ""] = value.split("T");
  return { date, time: rawTime.slice(0, 5) };
}

export function labelCode(value, labels = {}) {
  const code = textValue(value, "SIN_DATOS").toUpperCase();
  const fallback = code
    .toLocaleLowerCase("es")
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toLocaleUpperCase("es"));
  return { code, label: labels[code] ?? fallback };
}

export function queryString(parameters = {}) {
  const query = new URLSearchParams();
  Object.entries(parameters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

export function toIsoLocal(date, time) {
  return date && time ? `${date}T${time}:00` : null;
}
