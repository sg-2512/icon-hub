import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";

const root = document.getElementById("root") || createRootElement();
createRoot(root).render(<App />);

function createRootElement() {
  const element = document.createElement("div");
  element.id = "root";
  document.body.appendChild(element);
  return element;
}
