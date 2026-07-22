import { build, context } from "esbuild";

const watch = process.argv.includes("--watch");
const options = {
  entryPoints: ["src/index.ts"],
  outfile: "public/index.js",
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2022"],
  minify: !watch,
  sourcemap: watch ? "inline" : false,
  legalComments: "none",
  logLevel: "info",
};

if (watch) {
  const buildContext = await context(options);
  await buildContext.watch();
  console.log("Watching Webflow extension source...");
} else {
  await build(options);
}
