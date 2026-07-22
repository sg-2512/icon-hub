import { PENDING_KEY, SESSION_KEY } from "./constants";
import type { StoredSession } from "./types";

export function readSession(): StoredSession | null {
  try {
    const value = window.localStorage.getItem(SESSION_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as Partial<StoredSession>;
    return typeof parsed.token === "string" && parsed.token ? (parsed as StoredSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: StoredSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function readPendingDeviceCode() {
  return window.localStorage.getItem(PENDING_KEY) || "";
}

export function savePendingDeviceCode(deviceCode: string) {
  window.localStorage.setItem(PENDING_KEY, deviceCode);
}

export function clearPendingDeviceCode() {
  window.localStorage.removeItem(PENDING_KEY);
}
