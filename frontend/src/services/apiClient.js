import { clearAuthSession, getAccessToken } from "../auth";

const DEFAULT_API_BASE_URL = "http://localhost:8080";
const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const API_BASE_URL = (configuredBaseUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, "");

const genericMessages = {
  400: "La solicitud no pudo procesarse.",
  401: "La sesión no es válida o ha vencido.",
  403: "No tienes permisos para realizar esta acción.",
  404: "El recurso solicitado no está disponible.",
  429: "Se alcanzó el límite de solicitudes. Inténtalo más tarde.",
};

export class ApiError extends Error {
  constructor({ status, code, message, fieldErrors = {}, retryAfter = null }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
    this.retryAfter = retryAfter;
  }
}

function createApiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

async function readResponseBody(response) {
  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function createResponseError(response, body) {
  const safeBody =
    body && typeof body === "object" && !Array.isArray(body) ? body : {};
  const message =
    typeof safeBody.message === "string" && safeBody.message.trim()
      ? safeBody.message
      : genericMessages[response.status] ??
        "El servicio no pudo completar la solicitud.";

  return new ApiError({
    status: response.status,
    code:
      typeof safeBody.code === "string" ? safeBody.code : "API_REQUEST_FAILED",
    message,
    fieldErrors:
      safeBody.fieldErrors && typeof safeBody.fieldErrors === "object"
        ? safeBody.fieldErrors
        : {},
    retryAfter: response.headers.get("retry-after"),
  });
}

export async function apiRequest(
  path,
  { method = "GET", body, authenticated = true, signal, cache } = {},
) {
  const headers = new Headers({ Accept: "application/json" });

  if (authenticated) {
    const accessToken = getAccessToken();

    if (!accessToken) {
      throw new ApiError({
        status: 401,
        code: "AUTHENTICATION_REQUIRED",
        message: genericMessages[401],
      });
    }

    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  if (body !== undefined) headers.set("Content-Type", "application/json");

  let response;

  try {
    response = await fetch(createApiUrl(path), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "omit",
      signal,
      cache,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;

    throw new ApiError({
      status: 0,
      code: "NETWORK_ERROR",
      message: "No fue posible conectar con el servicio de Metro NY.",
    });
  }

  const responseBody = await readResponseBody(response);

  if (!response.ok) {
    if (response.status === 401 && authenticated) clearAuthSession();
    throw createResponseError(response, responseBody);
  }

  return responseBody;
}
