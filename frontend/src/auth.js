const AUTH_STORAGE_KEY = "metro-ny-demo-session";

export const demoCredentials = {
  email: "admin@metrony.com",
  password: "MetroNY2026",
};

export function isAuthenticated() {
  return (
    localStorage.getItem(AUTH_STORAGE_KEY) === "active" ||
    sessionStorage.getItem(AUTH_STORAGE_KEY) === "active"
  );
}

export function createDemoSession(rememberSession) {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);

  const storage = rememberSession ? localStorage : sessionStorage;
  storage.setItem(AUTH_STORAGE_KEY, "active");
}

export function clearDemoSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}
