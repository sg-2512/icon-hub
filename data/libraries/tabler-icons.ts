export const tablerIconsData = {
  name: "Tabler Icons",
  slug: "tabler-icons",
  tagline: "5500+ free MIT-licensed high-quality SVG icons",
  description: {
    intro: "Tabler Icons is the largest free open-source icon library available today, offering over 5,500 carefully crafted SVG icons. It was created by Paweł Kuna as part of the Tabler admin dashboard project and has since grown into one of the most comprehensive icon sets in the developer ecosystem.",
    detail: "What makes Tabler stand out is sheer volume combined with consistency. Every icon follows the same design grid, stroke width, and visual language. Whether you need common UI icons or highly specific symbols for finance, medicine, sports, or technology — Tabler almost certainly has what you need.",
    technical: "Tabler Icons ships with full React, Vue, and Svelte support via separate packages. All packages are fully tree-shakable and include complete TypeScript definitions. Icons accept size, color, strokeWidth, and className props. A Figma plugin is available for design teams.",
    verdict: "If you need the largest possible icon selection without paying, Tabler Icons is the clear winner. The only caution is bundle size — make sure you import icons individually rather than the entire library, or your bundle will bloat significantly."
  },
  stats: {
    iconCount: 5500,
    stars: 18000,
    weeklyDownloads: 900000,
    license: "MIT",
    firstRelease: "2020",
    latestVersion: "3.11.0",
    bundleSize: "~1kb per icon",
    openIssues: 89,
  },
  installation: {
    react: {
      package: "@tabler/icons-react",
      command: "npm install @tabler/icons-react",
      yarn: "yarn add @tabler/icons-react",
      pnpm: "pnpm add @tabler/icons-react",
    },
    nextjs: {
      package: "@tabler/icons-react",
      command: "npm install @tabler/icons-react",
      note: "Works with Next.js App Router. Import icons individually for best tree-shaking performance.",
    },
    vue: {
      package: "@tabler/icons-vue",
      command: "npm install @tabler/icons-vue",
    },
    svelte: {
      package: "@tabler/icons-svelte",
      command: "npm install @tabler/icons-svelte",
    },
    vanilla: {
      package: "@tabler/icons",
      command: "npm install @tabler/icons",
    }
  },
  codeExamples: {
    basic: `import { IconHome, IconSettings, IconUser } from '@tabler/icons-react'

export default function App() {
  return (
    <div>
      <IconHome size={24} />
      <IconSettings size={24} color="#6366f1" />
      <IconUser size={24} strokeWidth={1.5} />
    </div>
  )
}`,
    withTailwind: `import { IconBell } from '@tabler/icons-react'

export default function Navbar() {
  return (
    <button className="flex items-center gap-2">
      <IconBell className="h-5 w-5 text-gray-500" />
      <span>Notifications</span>
    </button>
  )
}`,
    filledVariant: `// Tabler also offers filled variants
import { IconHomeFilled, IconHeartFilled } from '@tabler/icons-react'

export default function App() {
  return (
    <div>
      <IconHomeFilled size={24} />
      <IconHeartFilled size={24} color="red" />
    </div>
  )
}`,
  },
  pros: [
    { title: "Largest free icon set", detail: "5,500+ icons covering virtually every use case — from common UI to highly specific symbols for medicine, finance, sports, and more." },
    { title: "Both outline and filled styles", detail: "Unlike Lucide which is outline-only, Tabler offers filled variants for most icons giving you more design flexibility." },
    { title: "Fully tree-shakable", detail: "Import only what you use. Each icon adds roughly 1kb to your bundle, keeping performance optimal." },
    { title: "Multi-framework support", detail: "Official packages for React, Vue, Svelte, and vanilla JS cover virtually every modern frontend stack." },
    { title: "Figma plugin available", detail: "The official Figma plugin lets designers use the same icons as developers, keeping the design system in sync." },
  ],
  cons: [
    { title: "Large bundle if not careful", detail: "With 5,500 icons the full package is massive. Always import icons individually — never import the entire library at once." },
    { title: "All icons prefixed with Icon", detail: "Every component is named IconHome, IconUser etc. This adds verbosity compared to libraries like Lucide where you just write Home." },
    { title: "Less recognizable brand", detail: "Tabler is less well-known than Lucide or Heroicons in the React community, which can matter for team familiarity." },
  ],
  whoShouldUse: [
    "Projects that need a very large and diverse icon set",
    "Admin dashboards and data-heavy applications",
    "Applications that need both outline and filled icon variants",
    "Teams using Svelte who need a well-supported icon library",
    "Projects where finding niche or specialized icons is a priority",
  ],
  whoShouldNot: [
    "Projects where you only need 20-30 common icons — Lucide is simpler",
    "Teams new to icon libraries who might accidentally import the whole package",
    "Projects with very strict bundle size requirements without proper tree-shaking setup",
  ],
  faqs: [
    {
      q: "Is Tabler Icons free for commercial use?",
      a: "Yes. Tabler Icons uses the MIT license, one of the most permissive open source licenses. You can use it in any commercial project without attribution."
    },
    {
      q: "How do I use Tabler Icons in Next.js?",
      a: "Install @tabler/icons-react and import icons individually. For example: import { IconHome } from '@tabler/icons-react'. This works in both App Router and Pages Router without any additional configuration."
    },
    {
      q: "Does Tabler have filled icons?",
      a: "Yes. Tabler offers filled variants for many icons. Filled icon names end with Filled — for example IconHomeFilled, IconHeartFilled. Not all icons have a filled variant yet."
    },
    {
      q: "How is Tabler Icons different from Lucide Icons?",
      a: "The main differences are icon count (5,500 vs 1,400) and style options. Tabler has far more icons and offers filled variants. Lucide has a slightly more polished and consistent design language and is more popular in the React community."
    },
    {
      q: "Will Tabler Icons slow down my app?",
      a: "Only if you import incorrectly. Never do import * from '@tabler/icons-react'. Always import individual icons. With proper tree-shaking each icon adds roughly 1kb to your bundle."
    },
  ],
  alternatives: ["lucide-icons", "heroicons", "phosphor-icons", "remix-icon"],
  links: {
    github: "https://github.com/tabler/tabler-icons",
    website: "https://tabler-icons.io",
    npm: "https://www.npmjs.com/package/@tabler/icons-react",
    figma: "https://www.figma.com/community/plugin/1169807996149376642",
  }
}