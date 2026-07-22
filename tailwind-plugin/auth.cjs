"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const PRODUCT = "tailwind";
const DEFAULT_API_BASE_URL = "https://iconsearch.info";
const MIN_TOKEN_LENGTH = 32;

function getConfigDirectory() {
  const override = String(process.env.ICONSEARCH_CONFIG_HOME || "").trim();
  if (override) return path.resolve(override);

  if (process.platform === "win32") {
    return path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "IconSearch");
  }

  return path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config"), "iconsearch");
}

function getSessionPath() {
  return path.join(getConfigDirectory(), `${PRODUCT}-session.json`);
}

function getApiBaseUrl(value) {
  const raw = String(value || process.env.ICONSEARCH_API_URL || DEFAULT_API_BASE_URL).trim();

  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Unsupported protocol.");
    return url.toString().replace(/\/+$/, "");
  } catch {
    throw new Error("ICONSEARCH_API_URL must be a valid HTTP or HTTPS URL.");
  }
}

function readStoredSession() {
  try {
    const value = JSON.parse(fs.readFileSync(getSessionPath(), "utf8"));
    return value && typeof value === "object" ? value : null;
  } catch {
    return null;
  }
}

function writeStoredSession(session) {
  if (!isUsableSession(session)) throw new Error("IconSearch returned an invalid Tailwind session.");

  const directory = getConfigDirectory();
  const sessionPath = getSessionPath();
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  fs.writeFileSync(sessionPath, `${JSON.stringify(session, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });

  try {
    fs.chmodSync(sessionPath, 0o600);
  } catch {
    // Windows protects this file through the current user's profile permissions.
  }

  return sessionPath;
}

function clearStoredSession() {
  try {
    fs.unlinkSync(getSessionPath());
  } catch (error) {
    if (!error || error.code !== "ENOENT") throw error;
  }
}

function resolveSession() {
  const environmentToken = String(process.env.ICONSEARCH_TOKEN || "").trim();
  if (environmentToken) {
    return {
      token: environmentToken,
      apiBaseUrl: getApiBaseUrl(),
      access: { product: PRODUCT },
      source: "environment",
    };
  }

  const stored = readStoredSession();
  if (!stored) return null;
  return { ...stored, source: "stored" };
}

function isUsableSession(session) {
  if (!session || typeof session !== "object") return false;
  if (typeof session.token !== "string" || session.token.trim().length < MIN_TOKEN_LENGTH) return false;
  if (session.access?.product !== PRODUCT) return false;

  const expiresAt = session.access?.expiresAt;
  if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) return false;
  return true;
}

function assertConnected() {
  const session = resolveSession();
  if (!isUsableSession(session)) {
    throw new Error(
      "IconSearch Tailwind requires a free IconSearch account. Run `npx @iconsearch/tailwind login` and rebuild.",
    );
  }
  return session;
}

module.exports = {
  DEFAULT_API_BASE_URL,
  PRODUCT,
  assertConnected,
  clearStoredSession,
  getApiBaseUrl,
  getSessionPath,
  isUsableSession,
  readStoredSession,
  resolveSession,
  writeStoredSession,
};
