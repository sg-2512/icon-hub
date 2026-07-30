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

async function getSelectionState(element: AnyElement | null): Promise<SelectionState> {
  if (!element) {
    return {
      hasSelection: false,
      canInsert: false,
      reason: "Please select a container on the Webflow canvas."
    };
  }

  const elementName = element.type || "Element";
  if (!element.children || !("append" in element) || typeof element.append !== "function") {
    return {
      hasSelection: true,
      elementName,
      canInsert: false,
      reason: "The selected element cannot contain an image. Select Body, a Section, or a Div Block."
    };
  }

  try {
    const abilities = await webflow.canForAppMode([
      webflow.appModes.canManageAssets,
      webflow.appModes.canModifyImageElement
    ]);

    if (!abilities.canManageAssets || !abilities.canModifyImageElement) {
      return {
        hasSelection: true,
        elementName,
        canInsert: false,
        reason: "Switch Webflow to Design mode on the main canvas, then try again."
      };
    }
  } catch {
    return {
      hasSelection: true,
      elementName,
      canInsert: false,
      reason: "IconSearch could not confirm permission to add an image in the current Webflow mode."
    };
  }

  return {
    hasSelection: true,
    elementName,
    canInsert: true
  };
}

export async function checkSelectionState(): Promise<SelectionState> {
  if (typeof webflow === "undefined") {
    return {
      hasSelection: false,
      canInsert: false,
      reason: "Open IconSearch inside Webflow Designer."
    };
  }

  try {
    const element = await webflow.getSelectedElement();
    return await getSelectionState(element);
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
      hasSelection: false,
      canInsert: false,
      reason: "Open IconSearch inside Webflow Designer."
    });
    return () => {};
  }

  void checkSelectionState().then(callback);

  try {
    const unsubscribe = webflow.subscribe("selectedelement", (element) => {
      void getSelectionState(element).then((state) => {
        callback(state);
      });
    });
    return unsubscribe;
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

  if (!selectedElement.children || !("append" in selectedElement) || typeof selectedElement.append !== "function") {
    throw new Error("The selected element cannot contain an image. Select Body, a Section, or a Div Block.");
  }

  const abilities = await webflow.canForAppMode([
    webflow.appModes.canManageAssets,
    webflow.appModes.canModifyImageElement
  ]);
  if (!abilities.canManageAssets || !abilities.canModifyImageElement) {
    throw new Error("Switch Webflow to Design mode on the main canvas, then try again.");
  }

  const safeName = options.iconName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "icon";
  const filename = `iconsearch-${safeName}-${options.size}.svg`;
  const svgFile = new File([options.svgMarkup], filename, { type: "image/svg+xml" });
  const createdAsset = await webflow.createAsset(svgFile);

  const newElement = await selectedElement.append(webflow.elementPresets.Image);

  if (newElement.type !== "Image") {
    throw new Error("Webflow could not create a compatible Image element.");
  }

  await newElement.setAsset(createdAsset);
  await newElement.setAltText(options.iconName);
  await newElement.setAttribute("width", String(options.size));
  await newElement.setAttribute("height", String(options.size));
  await newElement.setDisplayName(`Icon - ${options.iconName}`);

  try {
    await webflow.notify({
      type: "Info",
      message: `Inserted ${options.iconName} (${options.size}px)`
    });
  } catch {}
}
