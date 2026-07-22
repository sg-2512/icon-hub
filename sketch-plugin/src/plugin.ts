import { calculatePlacement, parseInsertPayload } from "./native";
import sketch from "sketch";
import BrowserWindow from "sketch-module-web-view";

declare const __ICONSEARCH_PANEL_URL__: string;

let panelWindow: BrowserWindow | null = null;

export function onRun(): void {
  const document = sketch.getSelectedDocument();
  if (!document) {
    sketch.UI.message("Open a Sketch document before using IconSearch.");
    return;
  }

  if (panelWindow) {
    try {
      panelWindow.focus();
      return;
    } catch {
      panelWindow = null;
    }
  }

  const nextWindow = new BrowserWindow({
    identifier: "info.iconsearch.sketch.panel",
    title: "IconSearch",
    width: 430,
    height: 700,
    minWidth: 360,
    minHeight: 560,
    backgroundColor: "#F5F5F7",
    hidesOnDeactivate: false,
    remembersWindowFrame: true,
    show: false,
    webPreferences: { devTools: true },
  });
  panelWindow = nextWindow;

  nextWindow.on("closed", () => {
    if (panelWindow === nextWindow) panelWindow = null;
  });

  nextWindow.webContents.on("insertIcon", (rawPayload: unknown) => {
    try {
      const result = insertIconIntoDocument(rawPayload);
      sketch.UI.message(`Inserted ${result.name} from IconSearch.`);
      return { ok: true, ...result };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sketch could not insert the icon.";
      sketch.UI.message(message);
      return { ok: false, error: message };
    }
  });

  nextWindow.webContents.on("did-finish-load", () => {
    nextWindow.webContents.executeJavaScript('window.__ICONSEARCH_SKETCH__ = true; window.dispatchEvent(new Event("iconsearch:sketch-ready"));');
  });
  nextWindow.once("ready-to-show", () => nextWindow.show());
  nextWindow.loadURL(__ICONSEARCH_PANEL_URL__);
}

function insertIconIntoDocument(rawPayload: unknown): { layerId: string; name: string; placement: string; size: number } {
  const payload = parseInsertPayload(rawPayload);
  const document = sketch.getSelectedDocument();
  if (!document) throw new Error("Open a Sketch document before inserting an icon.");

  const anchor = document.selectedLayers.layers[0] || null;
  const selectedPage = document.selectedPage;
  const parent = payload.placement === "page-origin" ? selectedPage : anchor?.parent || selectedPage;
  const anchorFrame = anchor && anchor.parent === parent ? {
    height: Number(anchor.frame.height) || 0,
    width: Number(anchor.frame.width) || 0,
    x: Number(anchor.frame.x) || 0,
    y: Number(anchor.frame.y) || 0,
  } : null;
  const point = calculatePlacement(payload.placement, payload.size, anchorFrame);
  const layer = sketch.createLayerFromData(payload.svg, "svg");
  if (!layer) throw new Error("Sketch could not create a layer from this SVG.");

  layer.parent = parent;
  layer.name = payload.name;
  layer.frame.x = point.x;
  layer.frame.y = point.y;
  layer.frame.width = payload.size;
  layer.frame.height = payload.size;
  document.selectedLayers.layers = [layer];
  document.centerOnLayer(layer);

  return {
    layerId: String(layer.id || ""),
    name: payload.name,
    placement: payload.placement,
    size: payload.size,
  };
}
