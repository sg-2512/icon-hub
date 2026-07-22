"use strict";

process.env.ICONSEARCH_TOKEN = "test-tailwind-session-token-000000000000000000000000";

const assert = require("node:assert/strict");
const path = require("node:path");
const { compile } = require("tailwindcss");

(async () => {
  const pluginPath = path.join(__dirname, "..", "index.cjs").replace(/\\/g, "/");
  const result = await compile(`@plugin "${pluginPath}";\n@tailwind utilities;`, {
    base: __dirname,
    from: path.join(__dirname, "fixture.css"),
    loadModule: async (id, base) => {
      const resolved = path.isAbsolute(id) ? id : require.resolve(id, { paths: [base || process.cwd()] });
      return {
        base: path.dirname(resolved),
        module: require(resolved),
      };
    },
  });
  const css = result.build(["is-icon-[lucide--home]"]);

  assert.match(css, /is-icon/);
  assert.match(css, /https:\/\/api\.iconify\.design\/lucide\/home\.svg/);
  assert.match(css, /background-color:\s*currentColor/);

  console.log("IconSearch Tailwind v4 smoke test passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
