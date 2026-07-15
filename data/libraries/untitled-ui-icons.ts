export const untitledUiIconsData = {
  name: "Untitled UI Icons",
  slug: "untitled-ui-icons",
  tagline: "1,179 MIT-licensed React icons for SaaS dashboards and product UI",
  description: {
    intro: "Untitled UI Icons is the official React icon package from the Untitled UI ecosystem. It focuses on clean 24px outline symbols that feel at home in SaaS apps, admin dashboards, settings panels, onboarding flows, marketing sites, and product-led interfaces.",
    detail: "The collection sits in a useful middle ground: more product-focused than Feather, smaller and more curated than Tabler, and less enterprise-heavy than PatternFly. Names like Home01, SearchMd, Settings01, ChartBreakoutSquare, and CreditCard01 make the library especially comfortable for teams building modern web applications.",
    focus: "Untitled UI Icons is strongest when you want a polished product interface vocabulary: navigation, charts, files, folders, users, payments, arrows, communications, status, security, and layout controls. It is not a brand-logo library and it is not a multi-style icon family.",
    technical: "The npm package ships typed React components, ESM/CJS builds, and per-icon component modules. Icons accept size and color props, default to a 24px viewBox, and use currentColor-friendly SVG strokes. IconSearch also generates static SVG previews from the React components so search, detail pages, and plugins can render them without depending on Iconify.",
    verdict: "Choose Untitled UI Icons when your app needs crisp, modern, SaaS-ready outline icons with a permissive MIT license. Choose Tabler if you need maximum icon volume, Phosphor if you need multiple weights, or PatternFly if your product is closer to enterprise console design."
  },
  stats: {
    iconCount: 1179,
    stars: 0,
    weeklyDownloads: 242135,
    license: "MIT",
    firstRelease: "2025",
    latestVersion: "0.0.22",
    bundleSize: "~2.7 MB unpacked; tree-shakable per icon",
    openIssues: 0,
  },
  installation: {
    react: {
      package: "@untitledui/icons",
      command: "npm install @untitledui/icons",
      yarn: "yarn add @untitledui/icons",
      pnpm: "pnpm add @untitledui/icons",
    },
    nextjs: {
      package: "@untitledui/icons",
      command: "npm install @untitledui/icons",
      note: "Works in Next.js App Router. Import only the icons you use so the package can be tree-shaken.",
    },
    typescript: {
      package: "@untitledui/icons",
      command: "npm install @untitledui/icons\n\n// TypeScript definitions are included in the package.",
    },
  },
  codeExamples: {
    basic: `import { Home01, SearchMd, Settings01 } from '@untitledui/icons'

export default function Toolbar() {
  return (
    <div className="flex items-center gap-3">
      <Home01 size={24} />
      <SearchMd size={24} />
      <Settings01 size={24} />
    </div>
  )
}`,
    withColor: `import { Rocket01, ArrowRight } from '@untitledui/icons'

export function LaunchButton() {
  return (
    <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white">
      <Rocket01 size={18} color="currentColor" />
      Launch
      <ArrowRight size={18} color="currentColor" />
    </button>
  )
}`,
    dashboardCards: `import { Bell01, ChartBreakoutSquare, CreditCard01, Zap } from '@untitledui/icons'

const items = [
  { label: 'Alerts', icon: Bell01 },
  { label: 'Growth', icon: ChartBreakoutSquare },
  { label: 'Billing', icon: CreditCard01 },
  { label: 'Automation', icon: Zap },
]

export function DashboardShortcuts() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {items.map(({ label, icon: Icon }) => (
        <button key={label} className="rounded-lg border p-4">
          <Icon size={22} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}`,
  },
  pros: [
    { title: "Strong SaaS interface fit", detail: "The icons are especially good for product dashboards, account settings, billing flows, charts, empty states, navigation, and admin-style UI." },
    { title: "Official typed React package", detail: "The package ships React components and TypeScript declarations, so usage is straightforward in React and Next.js projects." },
    { title: "Tree-shakable ESM modules", detail: "You can import individual icons and keep the final app bundle focused on only the symbols you actually use." },
    { title: "MIT licensed", detail: "The package metadata lists MIT, which is permissive for personal, commercial, and internal product use as long as the license notice is preserved." },
    { title: "Local static previews in IconSearch", detail: "IconSearch renders the package components into SVG files during the icon database build, so previews do not rely on Iconify coverage." },
  ],
  cons: [
    { title: "React-first package", detail: "Unlike Lucide or Tabler, there are not official first-party packages for Vue, Svelte, or plain SVG distribution through npm." },
    { title: "Outline style only", detail: "If you need filled, duotone, bold, thin, or multiple weights, Phosphor, Remix, or Heroicons may be a better match." },
    { title: "Smaller than Tabler", detail: "1,179 icons is solid, but Tabler and PatternFly cover more niche symbols and edge-case categories." },
    { title: "No public GitHub star signal", detail: "The npm package is official, but the package metadata does not expose a public GitHub repository with stars in the way Lucide or Tabler do." },
  ],
  whoShouldUse: [
    "SaaS dashboards and B2B product interfaces",
    "Teams already using Untitled UI design patterns",
    "Next.js and React apps that want clean outline components",
    "Products that need a curated set rather than thousands of niche icons",
    "Design systems where 24px currentColor outline icons are the default",
  ],
  whoShouldNot: [
    "Vue or Svelte projects that require official framework packages",
    "Apps that need filled, duotone, or multi-weight icon variants",
    "Projects that need brand logos or technology logos",
    "Products that need the broadest possible icon coverage",
  ],
  faqs: [
    {
      q: "Is Untitled UI Icons free for commercial use?",
      a: "Yes. The installed npm package metadata lists the license as MIT, which allows use in commercial products as long as the license notice is preserved."
    },
    {
      q: "Does Untitled UI Icons work in Next.js?",
      a: "Yes. Install @untitledui/icons and import individual React components in your Next.js app, for example import { Home01 } from '@untitledui/icons'."
    },
    {
      q: "Why are previews available in IconSearch if this is not in Iconify?",
      a: "IconSearch renders the installed React components to static SVG files during the icon database build, then serves those generated files from /untitled-ui-icons."
    },
    {
      q: "How is Untitled UI Icons different from Tabler Icons?",
      a: "Untitled UI Icons is smaller and more curated for SaaS/product UI. Tabler is much larger and better when you need maximum coverage or more niche categories."
    },
    {
      q: "Does Untitled UI Icons include filled icons?",
      a: "No. The package is an outline icon set. Use Heroicons, Remix Icon, or Phosphor if filled variants are a requirement."
    },
  ],
  alternatives: ["lucide-icons", "tabler-icons", "patternfly-icons", "phosphor-icons"],
  links: {
    github: "https://www.npmjs.com/package/@untitledui/icons",
    website: "https://www.untitledui.com/icons",
    npm: "https://www.npmjs.com/package/@untitledui/icons",
  }
}
