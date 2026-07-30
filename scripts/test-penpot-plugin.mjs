import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const rootDirectory = path.resolve(scriptDirectory, "..");

function runMainProcess(code) {
  const calls = {
    close: 0,
    created: [],
    listeners: 0,
    messages: [],
    opened: [],
    resized: [],
  };
  let listener = null;
  const penpot = {
    viewport: { center: { x: 400, y: 300 } },
    selection: [],
    closePlugin() {
      calls.close++;
    },
    createShapeFromSvg(svg) {
      calls.created.push(svg);
      return { width: 40, height: 20, x: 0, y: 0, name: "" };
    },
    ui: {
      onMessage(callback) {
        calls.listeners++;
        listener = callback;
      },
      open(...args) {
        calls.opened.push(args);
      },
      resize(width, height) {
        calls.resized.push([width, height]);
      },
      sendMessage(message) {
        calls.messages.push(message);
      },
    },
  };

  const quietConsole = { error() {}, log() {}, warn() {} };
  vm.runInNewContext(code, { console: quietConsole, penpot }, { filename: "penpot-code.js" });
  assert.equal(typeof listener, "function", "Main process did not register a listener.");
  return { calls, listener, penpot };
}

const productionCode = await readFile(
  path.join(rootDirectory, "public", "penpot", "code.js"),
  "utf8",
);
const localCode = await readFile(
  path.join(rootDirectory, "public", "penpot", "code.local.js"),
  "utf8",
);

const production = runMainProcess(productionCode);
assert.equal(production.calls.listeners, 1, "Main process registered duplicate listeners.");
assert.equal(
  production.calls.opened[0][1],
  "https://iconsearch.info/penpot/index.html",
  "Production UI URL is incorrect.",
);

production.listener({
  type: "insert-svg",
  svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="#111827" d="M2 12h20"/></svg>',
  name: "Arrow",
  library: "Lucide",
});
assert.equal(production.calls.created.length, 1, "Valid SVG was not inserted.");
assert.equal(production.penpot.selection.length, 1, "Inserted vector was not selected.");
assert.equal(production.penpot.selection[0].x, 380, "Inserted vector was not centered on x.");
assert.equal(production.penpot.selection[0].y, 290, "Inserted vector was not centered on y.");
assert.equal(production.penpot.selection[0].name, "Arrow (Lucide)");
assert.equal(production.calls.messages.at(-1).type, "insert-success");

for (const unsafeSvg of [
  '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
  '<svg xmlns="http://www.w3.org/2000/svg"><use href="https://evil.example/icon.svg#x"/></svg>',
  '<!DOCTYPE svg><svg xmlns="http://www.w3.org/2000/svg"></svg>',
]) {
  production.listener({ type: "insert-svg", svg: unsafeSvg, name: "Unsafe" });
}
assert.equal(production.calls.created.length, 1, "Unsafe SVG reached Penpot.");
assert.equal(production.calls.messages.at(-1).type, "insert-error");

production.listener({ type: "resize", width: 9999, height: 1 });
assert.deepEqual(production.calls.resized.at(-1), [800, 300]);
production.listener({ type: "close" });
assert.equal(production.calls.close, 1);

const local = runMainProcess(localCode);
assert.equal(
  local.calls.opened[0][1],
  "http://localhost:3000/penpot/index.html",
  "Local UI URL is incorrect.",
);

console.log("Penpot main-process tests passed (insert, reject, center, resize, local URL).");
