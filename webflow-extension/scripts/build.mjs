import { build, context } from "esbuild";

const watch = process.argv.includes("--watch");
const options = {
  entryPoints: ["src/index.tsx"],
  outfile: "public/index.js",
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2022"],
  minify: false,
  sourcemap: true,
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
