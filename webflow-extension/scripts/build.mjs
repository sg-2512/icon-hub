import { build, context } from "esbuild";
import { rm } from "node:fs/promises";

const watch = process.argv.includes("--watch");
await Promise.all([
  rm("public/index.js.map", { force: true }),
  rm("public/index.css.map", { force: true }),
  rm("public/style.css", { force: true })
]);

const options = {
  entryPoints: ["src/index.tsx"],
  outfile: "public/index.js",
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2022"],
  minify: !watch,
  sourcemap: watch ? "inline" : false,
  define: {
    "process.env.NODE_ENV": '"production"'
  },
  drop: watch ? [] : ["console", "debugger"],
  legalComments: "inline",
  logLevel: "info",
};

if (watch) {
  const buildContext = await context(options);
  await buildContext.watch();
  console.log("Watching Webflow extension source...");
} else {
  await build(options);
}
