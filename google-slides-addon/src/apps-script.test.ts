import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";

type AppsScriptContext = {
  assertPngSignature(bytes: number[]): void;
  calculatePlacement(position: string, size: number, width: number, height: number): { left: number; size: number; top: number };
  insertIcon(payload: Record<string, unknown>): { name: string; objectId: string; position: string; size: number };
};

function createContext() {
  const inserted = { args: [] as unknown[], description: "", selected: false, title: "" };
  const image = {
    getObjectId: () => "image-1",
    select: () => { inserted.selected = true; },
    setDescription: (value: string) => { inserted.description = value; },
    setTitle: (value: string) => { inserted.title = value; },
  };
  const slide = {
    insertImage: (...args: unknown[]) => {
      inserted.args = args;
      return image;
    },
  };
  const sandbox = {
    HtmlService: {},
    SlidesApp: {
      PageType: { SLIDE: "SLIDE" },
      getActivePresentation: () => ({
        getPageHeight: () => 405,
        getPageWidth: () => 720,
        getSelection: () => ({
          getCurrentPage: () => ({ asSlide: () => slide, getPageType: () => "SLIDE" }),
        }),
      }),
    },
    Utilities: {
      base64Decode: vi.fn(() => [-119, 80, 78, 71, 13, 10, 26, 10, 0]),
      newBlob: vi.fn(() => ({ kind: "png-blob" })),
    },
  };
  const code = readFileSync(resolve(import.meta.dirname, "../apps-script/Code.gs"), "utf8");
  runInNewContext(code, sandbox);
  return { context: sandbox as unknown as AppsScriptContext, inserted };
}

describe("Apps Script insertion boundary", () => {
  it("accepts Apps Script signed bytes and rejects a non-PNG signature", () => {
    const { context } = createContext();
    expect(() => context.assertPngSignature([-119, 80, 78, 71, 13, 10, 26, 10])).not.toThrow();
    expect(() => context.assertPngSignature([0, 80, 78, 71, 13, 10, 26, 10])).toThrow("valid PNG");
  });

  it("keeps every placement inside the presentation page", () => {
    const { context } = createContext();
    expect(context.calculatePlacement("center", 72, 720, 405)).toEqual({ left: 324, size: 72, top: 166.5 });
    expect(context.calculatePlacement("top-right", 240, 200, 120)).toEqual({ left: 56, size: 120, top: 0 });
  });

  it("inserts a validated PNG with accessible metadata", () => {
    const { context, inserted } = createContext();
    const result = context.insertIcon({
      base64: "iVBORw0KGgo=",
      color: "#2563EB",
      library: "Lucide Icons",
      name: "Arrow Right",
      position: "center",
      size: 72,
    });
    expect(result).toEqual({ name: "Arrow Right", objectId: "image-1", position: "center", size: 72 });
    expect(inserted.args.slice(1)).toEqual([324, 166.5, 72, 72]);
    expect(inserted.title).toBe("Arrow Right icon");
    expect(inserted.description).toContain("Lucide Icons");
    expect(inserted.selected).toBe(true);
  });
});
