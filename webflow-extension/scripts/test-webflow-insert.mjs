import assert from "node:assert/strict";
import { build } from "esbuild";

const buildResult = await build({
  entryPoints: ["src/webflow-api.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  target: ["node22"],
  write: false,
  logLevel: "silent",
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(buildResult.outputFiles[0].text).toString("base64")}`;

const imagePreset = { id: ["Basic", "Image"] };
const createdAsset = { id: "asset-1" };
const appliedAttributes = new Map();
let uploadedFile;
let appliedAsset;
let altText;
let displayName;
let appendedPreset;

const imageElement = {
  type: "Image",
  async setAsset(asset) {
    appliedAsset = asset;
    return null;
  },
  async setAltText(value) {
    altText = value;
    return null;
  },
  async setAttribute(name, value) {
    appliedAttributes.set(name, value);
    return null;
  },
  async setDisplayName(value) {
    displayName = value;
    return null;
  },
};

const selectedElement = {
  type: "Body",
  children: true,
  async append(preset) {
    appendedPreset = preset;
    return imageElement;
  },
};

globalThis.webflow = {
  appModes: {
    canManageAssets: "canManageAssets",
    canModifyImageElement: "canModifyImageElement",
  },
  elementPresets: { Image: imagePreset },
  async canForAppMode() {
    return {
      canManageAssets: true,
      canModifyImageElement: true,
    };
  },
  async createAsset(file) {
    assert(file instanceof File, "createAsset must receive a File");
    uploadedFile = file;
    return createdAsset;
  },
  async getSelectedElement() {
    return selectedElement;
  },
  async notify() {},
  subscribe() {
    return () => {};
  },
};

const { checkSelectionState, insertIconToCanvas } = await import(moduleUrl);
assert.deepEqual(await checkSelectionState(), {
  hasSelection: true,
  elementName: "Body",
  canInsert: true,
});

const svgMarkup = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><path d="M0 0h64v64H0z"/></svg>';
await insertIconToCanvas({
  svgMarkup,
  iconName: "Arrow Up",
  size: 64,
});

assert.equal(uploadedFile.name, "iconsearch-arrow-up-64.svg");
assert.equal(uploadedFile.type, "image/svg+xml");
assert.equal(await uploadedFile.text(), svgMarkup);
assert.equal(appendedPreset, imagePreset);
assert.equal(appliedAsset, createdAsset);
assert.equal(altText, "Arrow Up");
assert.equal(appliedAttributes.get("width"), "64");
assert.equal(appliedAttributes.get("height"), "64");
assert.equal(displayName, "Icon - Arrow Up");

globalThis.webflow.getSelectedElement = async () => ({
  type: "Image",
  children: false,
});
await assert.rejects(
  () => insertIconToCanvas({ svgMarkup, iconName: "Arrow Up", size: 64 }),
  /cannot contain an image/,
);

console.log("Webflow insertion tests passed.");
