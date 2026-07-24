import React from "react";
import type { DesignEditorIntent } from "@canva/intents/design";
import { createRoot } from "react-dom/client";
import { App } from "../../app";

async function render() {
  const container = document.getElementById("root") || createRootElement();
  const root = createRoot(container);
  root.render(<App />);
}

function createRootElement() {
  const element = document.createElement("div");
  element.id = "root";
  document.body.appendChild(element);
  return element;
}

const designEditor: DesignEditorIntent = { render };
export default designEditor;
