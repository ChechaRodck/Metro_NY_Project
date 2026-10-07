import { apiRequest } from "./apiClient";

export function login({ username, password }) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: { username, password },
    authenticated: false,
    cache: "no-store",
  });
}
