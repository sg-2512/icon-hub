"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const configHome = fs.mkdtempSync(path.join(os.tmpdir(), "iconsearch-tailwind-test-"));
process.env.ICONSEARCH_CONFIG_HOME = configHome;
delete process.env.ICONSEARCH_TOKEN;

const auth = require("../auth.cjs");

assert.throws(() => auth.assertConnected(), /requires a free IconSearch account/);

process.env.ICONSEARCH_TOKEN = "test-tailwind-session-token-000000000000000000000000";
assert.equal(auth.assertConnected().source, "environment");
delete process.env.ICONSEARCH_TOKEN;

auth.writeStoredSession({
  token: "stored-tailwind-session-token-00000000000000000000000",
  apiBaseUrl: "https://iconsearch.info",
  access: {
    product: "tailwind",
    tier: "free",
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
  },
});

assert.equal(auth.assertConnected().access.product, "tailwind");
auth.clearStoredSession();
assert.equal(auth.readStoredSession(), null);

fs.rmSync(configHome, { recursive: true, force: true });
console.log("IconSearch Tailwind account tests passed.");
