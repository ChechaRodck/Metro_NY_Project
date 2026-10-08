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

export function dateOnlyValue(value) {
  if (typeof value !== "string") return "";
  return value.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? "";
}

export async function loadSequentially(loaders, { signal, timeoutMs = 20000 } = {}) {
  const controller = new AbortController();
  let didTimeout = false;
  const handleExternalAbort = () => controller.abort();

  if (signal?.aborted) controller.abort();
  else signal?.addEventListener("abort", handleExternalAbort, { once: true });

  const timeoutId = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeoutMs);

  try {
    const results = [];

    for (const load of loaders) {
      results.push(await load(controller.signal));
    }

    return results;
  } catch (error) {
    if (didTimeout) {
      throw new Error(
        "La carga tardó demasiado. Verifica el servicio y vuelve a intentarlo.",
        { cause: error },
      );
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", handleExternalAbort);
  }
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
