#!/usr/bin/env node
"use strict";

const { spawn } = require("node:child_process");
const {
  PRODUCT,
  clearStoredSession,
  getApiBaseUrl,
  getSessionPath,
  isUsableSession,
  resolveSession,
  writeStoredSession,
} = require("./auth.cjs");

const command = String(process.argv[2] || "help").toLowerCase();

async function main() {
  if (command === "login") return login();
  if (command === "whoami" || command === "status") return whoAmI();
  if (command === "logout") return logout();
  if (command === "help" || command === "--help" || command === "-h") return printHelp();

  throw new Error(`Unknown command "${command}". Run npx @iconsearch/tailwind help.`);
}

async function login() {
  const existing = resolveSession();
  if (isUsableSession(existing)) {
    try {
      const access = await fetchAccess(existing);
      printAccess("Already connected", access);
      return;
    } catch {
      if (existing.source === "environment") {
        throw new Error("ICONSEARCH_TOKEN is set but invalid. Remove or replace it before interactive login.");
      }
      clearStoredSession();
    }
  }

  const apiBaseUrl = getApiBaseUrl();
  const start = await requestJson(`${apiBaseUrl}/api/device/start`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ product: PRODUCT, clientName: "IconSearch Tailwind CLI" }),
  });

  const verificationUrl = safeVerificationUrl(start.verificationUriComplete);
  console.log("\nConnect IconSearch Tailwind in your browser:");
  console.log(verificationUrl);
  console.log("\nSign up or sign in, then approve the connection. Waiting for approval...");
  openBrowser(verificationUrl);

  const expiresAt = Date.now() + Number(start.expiresIn || 1800) * 1000;
  const interval = Math.min(10, Math.max(2, Number(start.interval || 3))) * 1000;

  while (Date.now() < expiresAt) {
    await delay(interval);
    const response = await fetch(`${apiBaseUrl}/api/device/status`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ deviceCode: start.deviceCode }),
    });
    const payload = await readJson(response);

    if (payload.status === "pending") continue;
    if (payload.status === "authorized") {
      const session = {
        token: payload.token,
        apiBaseUrl,
        access: payload.access,
        connectedAt: new Date().toISOString(),
      };
      const sessionPath = writeStoredSession(session);
      printAccess("Connected", payload.access);
      console.log(`Session saved to ${sessionPath}`);
      return;
    }

    throw new Error(payload.error || `Sign-in ended with status "${payload.status || response.status}".`);
  }

  throw new Error("The sign-in link expired. Run the login command again.");
}

async function whoAmI() {
  const session = resolveSession();
  if (!isUsableSession(session)) {
    throw new Error("Not connected. Run `npx @iconsearch/tailwind login` first.");
  }

  const access = await fetchAccess(session);
  printAccess("Connected", access);
  console.log(session.source === "environment" ? "Session source: ICONSEARCH_TOKEN" : `Session file: ${getSessionPath()}`);
}

async function logout() {
  const session = resolveSession();
  if (isUsableSession(session)) {
    try {
      await requestJson(`${getApiBaseUrl(session.apiBaseUrl)}/api/device/revoke`, {
        method: "POST",
        headers: { authorization: `Bearer ${session.token}` },
      });
    } catch (error) {
      console.warn(`Could not revoke the remote session: ${error.message}`);
    }
  }

  clearStoredSession();
  console.log("IconSearch Tailwind has been disconnected on this computer.");
  if (process.env.ICONSEARCH_TOKEN) console.log("ICONSEARCH_TOKEN is still set and must be removed separately.");
}

async function fetchAccess(session) {
  const payload = await requestJson(`${getApiBaseUrl(session.apiBaseUrl)}/api/entitlements/me`, {
    headers: { authorization: `Bearer ${session.token}` },
  });

  if (payload.access?.product !== PRODUCT) throw new Error("This IconSearch session is not valid for Tailwind.");
  return payload.access;
}

async function requestJson(url, init) {
  const response = await fetch(url, init);
  const payload = await readJson(response);
  if (!response.ok) throw new Error(payload.error || `IconSearch request failed (${response.status}).`);
  return payload;
}

async function readJson(response) {
  try {
    const value = await response.json();
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

function safeVerificationUrl(value) {
  const url = new URL(String(value || ""));
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("IconSearch returned an invalid sign-in URL.");
  return url.toString();
}

function openBrowser(url) {
  const commandByPlatform = {
    darwin: ["open", [url]],
    linux: ["xdg-open", [url]],
    win32: ["rundll32.exe", ["url.dll,FileProtocolHandler", url]],
  };
  const selected = commandByPlatform[process.platform];
  if (!selected) return;

  try {
    const child = spawn(selected[0], selected[1], { detached: true, stdio: "ignore", windowsHide: true });
    child.on("error", () => {});
    child.unref();
  } catch {
    // The URL remains visible for manual opening when a platform opener is unavailable.
  }
}

function printAccess(title, access) {
  console.log(`\n${title}: ${access.email || "IconSearch account"}`);
  console.log(`Plan: ${access.tier || "free"}`);
  if (access.expiresAt) console.log(`Session expires: ${access.expiresAt}`);
  console.log("");
}

function printHelp() {
  console.log(`IconSearch Tailwind account commands

  npx @iconsearch/tailwind login    Connect or create a free IconSearch account
  npx @iconsearch/tailwind whoami   Verify the connected account and plan
  npx @iconsearch/tailwind logout   Revoke and remove the local Tailwind session

Set ICONSEARCH_API_URL for local IconSearch server testing.
Set ICONSEARCH_TOKEN in CI instead of storing a local session.`);
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

main().catch((error) => {
  console.error(`\nError: ${error.message}\n`);
  process.exitCode = 1;
});
