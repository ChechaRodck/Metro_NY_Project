import { useSyncExternalStore } from "react";

const AUTH_STORAGE_KEY = "metro-ny-auth-session";
const MAX_TIMEOUT_DELAY = 2_147_483_647;
const listeners = new Set();

let currentSession = restoreSession();
let expirationTimer = null;

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeUser(user) {
  if (
    !isObject(user) ||
    typeof user.username !== "string" ||
    !user.username.trim() ||
    typeof user.displayName !== "string" ||
    !Array.isArray(user.roles) ||
    user.roles.some((role) => typeof role !== "string")
  ) {
    return null;
  }

  return {
    username: user.username,
    displayName: user.displayName,
    roles: [...user.roles],
  };
}

function normalizeSession(value) {
  if (
    !isObject(value) ||
    typeof value.accessToken !== "string" ||
    !value.accessToken ||
    typeof value.tokenType !== "string" ||
    value.tokenType.toLowerCase() !== "bearer" ||
    typeof value.expiresAt !== "string"
  ) {
    return null;
  }

  const expiresAtTime = Date.parse(value.expiresAt);
  const user = normalizeUser(value.user);

  if (!Number.isFinite(expiresAtTime) || expiresAtTime <= Date.now() || !user) {
    return null;
  }

  return {
    accessToken: value.accessToken,
    tokenType: "Bearer",
    expiresAt: value.expiresAt,
    user,
  };
}

function getSessionStorage() {
  if (typeof window === "undefined") return null;

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function removeStoredSession() {
  const storage = getSessionStorage();

  try {
    storage?.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // The in-memory session remains authoritative when storage is unavailable.
  }
}

function restoreSession() {
  const storage = getSessionStorage();

  if (!storage) return null;

  try {
    const serializedSession = storage.getItem(AUTH_STORAGE_KEY);

    if (!serializedSession) return null;

    const session = normalizeSession(JSON.parse(serializedSession));

    if (!session) storage.removeItem(AUTH_STORAGE_KEY);
    return session;
  } catch {
    try {
      storage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Nothing else is required when storage access is blocked.
    }
    return null;
  }
}

function notifySessionChange() {
  listeners.forEach((listener) => listener());
}

function clearExpirationTimer() {
  if (expirationTimer !== null && typeof window !== "undefined") {
    window.clearTimeout(expirationTimer);
  }
  expirationTimer = null;
}

function scheduleExpiration() {
  clearExpirationTimer();

  if (!currentSession || typeof window === "undefined") return;

  const remainingTime = Date.parse(currentSession.expiresAt) - Date.now();

  if (remainingTime <= 0) {
    clearAuthSession();
    return;
  }

  expirationTimer = window.setTimeout(
    () => {
      if (Date.parse(currentSession?.expiresAt ?? "") <= Date.now()) {
        clearAuthSession();
      } else {
        scheduleExpiration();
      }
    },
    Math.min(remainingTime, MAX_TIMEOUT_DELAY),
  );
}

export function createAuthSession(loginResponse, persistInTab = true) {
  const session = normalizeSession(loginResponse);

  if (!session) {
    throw new Error("La respuesta de autenticación no tiene el formato esperado.");
  }

  currentSession = session;
  removeStoredSession();

  if (persistInTab) {
    const storage = getSessionStorage();

    try {
      storage?.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // A valid in-memory session can continue even if storage is unavailable.
    }
  }

  scheduleExpiration();
  notifySessionChange();
  return session;
}

export function clearAuthSession() {
  const hadSession = currentSession !== null;

  currentSession = null;
  clearExpirationTimer();
  removeStoredSession();

  if (hadSession) notifySessionChange();
}

export function getAuthSession() {
  return currentSession;
}

export function getAccessToken() {
  if (currentSession && Date.parse(currentSession.expiresAt) <= Date.now()) {
    clearAuthSession();
  }

  return currentSession?.accessToken ?? null;
}

export function isAuthenticated() {
  return getAccessToken() !== null;
}

export function subscribeToAuthSession(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAuthSession() {
  return useSyncExternalStore(
    subscribeToAuthSession,
    getAuthSession,
    () => null,
  );
}

export function hasAnyRole(session, allowedRoles) {
  const roles = session?.user?.roles;
  return Array.isArray(roles) && allowedRoles.some((role) => roles.includes(role));
}

scheduleExpiration();
