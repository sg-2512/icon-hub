export const featherIconsData = {
  name: "Feather Icons",
  slug: "feather-icons",
  tagline: "Simply beautiful open source icons — the original minimal icon set",
  description: {
    intro: "Feather Icons is the original minimal open-source icon library that inspired a generation of modern icon sets. Created by Cole Bemis, Feather established the design language of clean, consistent stroke-based icons that libraries like Lucide later built upon.",
    detail: "With 287 carefully crafted icons, Feather prioritizes quality and consistency over quantity. Every icon is designed on a 24x24 grid with a 2px stroke, rounded line caps, and rounded line joins — creating a cohesive, friendly aesthetic that works well for consumer-facing applications.",
    technical: "The react-feather package provides typed React components for all icons. Each component is tree-shakable and accepts size, color, strokeWidth, and className props. However the library has not received significant updates since 2020 and is considered feature-complete by its maintainer.",
    verdict: "Feather Icons is a classic for a reason — the design quality is exceptional for its size. However for new projects in 2026, Lucide Icons is the better choice as it is a direct spiritual successor with 5x more icons, active maintenance, and the same design philosophy."
  },
  stats: {
    iconCount: 287,
    stars: 24000,
    weeklyDownloads: 600000,
    license: "MIT",
    firstRelease: "2017",
    latestVersion: "2.1.0",
    bundleSize: "~1kb per icon",
    openIssues: 180,
  },
  installation: {
    react: {
      package: "react-feather",
      command: "npm install react-feather",
      yarn: "yarn add react-feather",
      pnpm: "pnpm add react-feather",
    },
    nextjs: {
      package: "react-feather",
      command: "npm install react-feather",
      note: "Works with Next.js but note the library is no longer actively maintained. Consider Lucide Icons as a maintained alternative.",
    },
    vue: {
      package: "N/A",
      command: "// No official Vue package. Use vue-feather community package or SVG files directly.",
    },
    svelte: {
      package: "N/A",
      command: "// No official Svelte package. Use SVG files directly from feathericons.com",
    },
    vanilla: {
      package: "feather-icons",
      command: "npm install feather-icons",
    }
  },
  codeExamples: {
    basic: `import { Home, Settings, User } from 'react-feather'

export default function App() {
  return (
    <div>
      <Home size={24} />
      <Settings size={24} color="#6366f1" />
      <User size={24} strokeWidth={1} />
    </div>
  )
}`,
    withTailwind: `import { Bell } from 'react-feather'

export default function Navbar() {
  return (
    <button className="flex items-center gap-2 text-gray-500">
      <Bell className="h-5 w-5" />
      <span>Notifications</span>
    </button>
  )
}`,
    vanillaJS: `// Vanilla JS usage
const feather = require('feather-icons')
feather.replace()

// In HTML:
// <i data-feather="home"></i>`,
  },
  pros: [
    { title: "Exceptional design quality", detail: "Each of the 287 icons is a masterpiece of minimal design. The consistency and craftsmanship is unmatched for such a small set." },
    { title: "High GitHub stars", detail: "24,000 stars reflects the long-term trust the developer community has placed in this library over many years." },
    { title: "Lightweight", detail: "287 icons means the full library is small. Tree-shaking makes individual icon usage extremely efficient." },
    { title: "Proven and stable", detail: "The library is feature-complete and stable. No breaking changes to worry about." },
    { title: "Inspired Lucide", detail: "The same design DNA as Lucide Icons — if you like the look, you already know the style." },
  ],
  cons: [
    { title: "No longer actively maintained", detail: "The last significant update was in 2020. Open issues are not being addressed and no new icons are being added." },
    { title: "Only 287 icons", detail: "The smallest library on this list. Any moderately complex application will likely need icons that Feather does not have." },
    { title: "No TypeScript in core package", detail: "The react-feather community package has types but the core library does not ship with TypeScript definitions." },
    { title: "No filled variants", detail: "Like Lucide, Feather is outline-only. No filled or duotone options available." },
  ],
  whoShouldUse: [
    "Projects that specifically love the Feather aesthetic and have simple icon needs",
    "Legacy codebases already using Feather that are not worth migrating",
    "Projects where the exact 287 Feather icons cover all needs",
    "Developers who want a frozen, stable library with zero maintenance overhead",
  ],
  whoShouldNot: [
    "New projects in 2026 — use Lucide Icons instead for the same aesthetic with active maintenance",
    "Applications needing more than 287 icons",
    "Projects needing filled or duotone icon variants",
    "Teams that need regular library updates and bug fixes",
  ],
  faqs: [
    {
      q: "Is Feather Icons still maintained?",
      a: "No. Feather Icons has not received significant updates since 2020. The maintainer considers it feature-complete. For a maintained alternative with the same design philosophy, use Lucide Icons which is a direct fork of Feather with active development."
    },
    {
      q: "What is the difference between Feather Icons and Lucide Icons?",
      a: "Lucide Icons was forked from Feather Icons in 2020 specifically because Feather stopped being maintained. Lucide has grown to 1,400+ icons vs Feather's 287, has active maintenance, full TypeScript support, and a thriving community."
    },
    {
      q: "Is Feather Icons free for commercial use?",
      a: "Yes. Feather Icons uses the MIT license which allows free use in any commercial project."
    },
    {
      q: "How do I migrate from Feather Icons to Lucide Icons?",
      a: "Most Feather icons have direct equivalents in Lucide with the same names. Uninstall react-feather, install lucide-react, and update your imports. The API is nearly identical — both accept size, color, and strokeWidth props."
    },
    {
      q: "Can I use Feather Icons with Next.js?",
      a: "Yes, react-feather works with Next.js. However given the library is unmaintained, consider using Lucide Icons instead for new Next.js projects."
    },
  ],
  alternatives: ["lucide-icons", "heroicons", "tabler-icons", "phosphor-icons"],
  links: {
    github: "https://github.com/feathericons/feather",
    website: "https://feathericons.com",
    npm: "https://www.npmjs.com/package/react-feather",
    figma: "",
  }
}