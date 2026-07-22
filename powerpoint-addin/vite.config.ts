import { getHttpsServerOptions } from "office-addin-dev-certs";
import { defineConfig } from "vite";

export default defineConfig(async () => ({
  base: "./",
  server: {
    host: "0.0.0.0",
    port: 3007,
    strictPort: true,
    https: await getHttpsServerOptions(),
  },
  preview: {
    host: "0.0.0.0",
    port: 3007,
    strictPort: true,
  },
}));
