"use strict";

process.env.ICONSEARCH_TOKEN = "test-tailwind-session-token-000000000000000000000000";

const assert = require("node:assert/strict");
const postcss = require("postcss");
const tailwindcss = require("tailwindcss-v3");
const iconSearch = require("../index.cjs");

async function run() {
  const result = await postcss([
    tailwindcss({
      content: [
        {
          raw: '<span class="is-icon-[lucide--home]"></span>',
          extension: "html",
        },
      ],
      corePlugins: { preflight: false },
      plugins: [iconSearch],
    }),
  ]).process("@tailwind utilities;", { from: undefined });

  assert.match(result.css, /\.is-icon-\\\[lucide--home\\\]/);
  assert.match(result.css, /mask: url\(/);
  assert.match(result.css, /lucide\/home\.svg/);
  assert.match(result.css, /background-color: currentColor/);

  console.log("Tailwind v3 smoke test passed.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
