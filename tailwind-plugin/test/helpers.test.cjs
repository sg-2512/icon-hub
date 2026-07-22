"use strict";

const assert = require("node:assert/strict");
const iconSearchTailwind = require("../index.cjs");

assert.equal(
  iconSearchTailwind.buildIconMaskUrl("lucide--home"),
  "https://api.iconify.design/lucide/home.svg",
);

assert.equal(
  iconSearchTailwind.buildIconMaskUrl("lucide:search"),
  "https://api.iconify.design/lucide/search.svg",
);

assert.equal(
  iconSearchTailwind.buildIconMaskUrl("iconify-mdi--account"),
  "https://api.iconify.design/mdi/account.svg",
);

assert.equal(
  iconSearchTailwind.buildIconMaskUrl("home", { defaultCollection: "lucide" }),
  "https://api.iconify.design/lucide/home.svg",
);

assert.equal(
  iconSearchTailwind.buildIconMaskUrl("bootstrap-icons--alarm", { source: "iconsearch" }),
  "https://iconsearch.info/api/icon-preview/bootstrap-icons/alarm?v=named-library-preview-v3",
);

assert.equal(
  iconSearchTailwind.buildIconMaskUrl("https://example.com/icons/home.svg"),
  "https://example.com/icons/home.svg",
);

assert.deepEqual(iconSearchTailwind.parseIconValue("tabler/brand-github"), {
  collection: "tabler",
  name: "brand-github",
});

const utility = iconSearchTailwind.createIconUtility("heroicons--academic-cap", { scale: 1.25 });
assert.equal(utility.display, "inline-block");
assert.equal(utility.width, "1.25em");
assert.equal(utility.height, "1.25em");
assert.match(utility.mask, /https:\/\/api\.iconify\.design\/heroicons\/academic-cap\.svg/);
assert.match(utility["-webkit-mask"], /contain/);

assert.equal(typeof iconSearchTailwind, "function");

console.log("IconSearch Tailwind helper tests passed.");
