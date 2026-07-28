export type SelectionState = {
  hasSelection: boolean;
  elementName?: string;
  canInsert: boolean;
  reason?: string;
};

export type InsertOptions = {
  svgMarkup: string;
  iconName: string;
  size: number;
};

function utf8ToBase64(str: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function resolveWebflowUserToken(): Promise<string | null> {
  try {
    if (typeof webflow !== "undefined" && typeof (webflow as any).getIdToken === "function") {
      const idToken = await (webflow as any).getIdToken();
      if (idToken) return String(idToken);
    }
  } catch {}
  return null;
}

export async function checkSelectionState(): Promise<SelectionState> {
  if (typeof webflow === "undefined") {
    return {
      hasSelection: true,
      canInsert: true,
      reason: "Preview mode (Webflow SDK simulator)"
    };
  }

  try {
    const element = await webflow.getSelectedElement();
    if (!element) {
      return {
        hasSelection: false,
        canInsert: false,
        reason: "Please select an element on the canvas."
      };
    }

    const type = (element as any).type || "Element";
    return {
      hasSelection: true,
      elementName: String(type),
      canInsert: true
    };
  } catch {
    return {
      hasSelection: false,
      canInsert: false,
      reason: "Could not read Webflow selection."
    };
  }
}

export function subscribeToSelection(callback: (state: SelectionState) => void): (() => void) {
  if (typeof webflow === "undefined") {
    callback({
      hasSelection: true,
      canInsert: true,
      reason: "Preview mode (Webflow SDK simulator)"
    });
    return () => {};
  }

  void checkSelectionState().then(callback);

  try {
    if (typeof (webflow as any).subscribe === "function") {
      const unsubscribe = (webflow as any).subscribe("selectedelement", (element: any) => {
        if (!element) {
          callback({
            hasSelection: false,
            canInsert: false,
            reason: "Please select an element on the canvas."
          });
        } else {
          const type = element.type || "Element";
          callback({
            hasSelection: true,
            elementName: String(type),
            canInsert: true
          });
        }
      });
      if (typeof unsubscribe === "function") return unsubscribe;
    }
  } catch {}

  return () => {};
}

export async function insertIconToCanvas(options: InsertOptions): Promise<void> {
  if (typeof webflow === "undefined") {
    throw new Error("Webflow Designer SDK is not initialized.");
  }

  const selectedElement = await webflow.getSelectedElement();
  if (!selectedElement) {
    throw new Error("Please select an element in the Webflow Designer canvas before inserting an icon.");
  }

  const base64Svg = utf8ToBase64(options.svgMarkup);
  const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;
  const filename = `${options.iconName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.svg`;

  let createdAsset: any = null;
  try {
    if (typeof (webflow as any).createAsset === "function") {
      createdAsset = await (webflow as any).createAsset(dataUrl, filename);
    }
  } catch {}

  const imagePreset = webflow.elementPresets.Image;
  let newElement: any = null;

  if (typeof (selectedElement as any).append === "function") {
    newElement = await (selectedElement as any).append(imagePreset);
  } else if (typeof (selectedElement as any).prepend === "function") {
    newElement = await (selectedElement as any).prepend(imagePreset);
  }

  if (newElement) {
    if (createdAsset && typeof newElement.setAsset === "function") {
      try {
        await newElement.setAsset(createdAsset);
      } catch {}
    } else if (typeof newElement.setAttribute === "function") {
      try {
        await newElement.setAttribute("src", dataUrl);
        await newElement.setAttribute("alt", options.iconName);
        await newElement.setAttribute("width", String(options.size));
        await newElement.setAttribute("height", String(options.size));
      } catch {}
    }
  }

  try {
    await webflow.notify({
      type: "Info",
      message: `Inserted ${options.iconName} (${options.size}px)`
    });
  } catch {}
}
