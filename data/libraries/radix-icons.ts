export const radixIconsData = {
  name: "Radix Icons",
  slug: "radix-icons",
  tagline: "Crisp 15x15 icons designed for dense UIs and dashboards",
  description: {
    intro: "Radix Icons is a crisp set of 318 icons designed by the WorkOS team, the same team behind Radix UI — the headless component library that powers shadcn/ui and many other popular React component systems.",
    detail: "Unlike most icon libraries that target 24x24, Radix Icons are designed at 15x15. This makes them uniquely suited for dense interfaces where space is at a premium — data tables, toolbars, dropdowns, badges, and form controls all benefit from the smaller, more precise icons.",
    technical: "The @radix-ui/react-icons package provides fully typed React components for all 318 icons. All icons are tree-shakable and render as inline SVGs. They accept className props and work perfectly with Tailwind CSS. The library integrates seamlessly with Radix UI components and shadcn/ui.",
    verdict: "Radix Icons is a specialized tool — not a general-purpose icon library. If you are building with Radix UI or shadcn/ui, it is the natural companion. For general use, its 318 icons and 15x15 size constraint make it too limited. Pair it with Lucide Icons for broader coverage."
  },
  stats: {
    iconCount: 318,
    stars: 5000,
    weeklyDownloads: 1200000,
    license: "MIT",
    firstRelease: "2021",
    latestVersion: "1.3.0",
    bundleSize: "~0.5kb per icon",
    openIssues: 23,
  },
  installation: {
    react: {
      package: "@radix-ui/react-icons",
      command: "npm install @radix-ui/react-icons",
      yarn: "yarn add @radix-ui/react-icons",
      pnpm: "pnpm add @radix-ui/react-icons",
    },
    nextjs: {
      package: "@radix-ui/react-icons",
      command: "npm install @radix-ui/react-icons",
      note: "Perfect for Next.js projects using shadcn/ui. Works in both Server and Client Components.",
    },
    vue: {
      package: "N/A",
      command: "// No official Vue package. Use SVG files directly from radix-ui.com/icons",
    },
    svelte: {
      package: "N/A",
      command: "// No official Svelte package. Use SVG files directly.",
    },
    vanilla: {
      package: "N/A",
      command: "// No vanilla JS package. Download SVG files from radix-ui.com/icons",
    }
  },
  codeExamples: {
    basic: `import { HomeIcon, GearIcon, PersonIcon } from '@radix-ui/react-icons'

export default function App() {
  return (
    <div>
      <HomeIcon />
      <GearIcon className="text-gray-500" />
      <PersonIcon className="h-4 w-4" />
    </div>
  )
}`,
    withShadcn: `// Perfect pairing with shadcn/ui components
import { Button } from '@/components/ui/button'
import { PlusIcon, Cross2Icon } from '@radix-ui/react-icons'

export default function Toolbar() {
  return (
    <div className="flex gap-2">
      <Button size="sm">
        <PlusIcon className="mr-1" />
        Add Item
      </Button>
      <Button variant="ghost" size="sm">
        <Cross2Icon />
      </Button>
    </div>
  )
}`,
    inDropdown: `import {
  ChevronDownIcon,
  CheckIcon,
  DotFilledIcon
} from '@radix-ui/react-icons'

export default function MenuItem({ checked }: { checked: boolean }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 text-sm">
      <span className="w-4">
        {checked && <CheckIcon className="h-4 w-4" />}
      </span>
      Menu Item
      <ChevronDownIcon className="ml-auto" />
    </div>
  )
}`,
  },
  pros: [
    { title: "Perfect for dense UIs", detail: "The 15x15 design grid makes these icons ideal for toolbars, dropdowns, badges, and data-dense interfaces where 24px icons would be too large." },
    { title: "Full TypeScript support", detail: "Every icon is fully typed with autocomplete in VS Code. The package is maintained by WorkOS who prioritize TypeScript quality." },
    { title: "Seamless shadcn/ui integration", detail: "If you use shadcn/ui, Radix Icons are the natural companion — they share the same design language and team." },
    { title: "Extremely lightweight", detail: "At ~0.5kb per icon, Radix Icons are among the smallest per-icon sizes available. Perfect for performance-critical applications." },
    { title: "Tree-shakable", detail: "Only the icons you import are included in your bundle. The rest are eliminated at build time." },
  ],
  cons: [
    { title: "Only 318 icons", detail: "The smallest library here alongside Feather. Complex applications will definitely encounter gaps." },
    { title: "15x15 only", detail: "The fixed 15x15 design means icons can look small or blurry if scaled up significantly. Not suitable as large decorative icons." },
    { title: "React only", detail: "No official Vue, Svelte, or Angular packages. Only React developers can use this library comfortably." },
    { title: "Not a standalone library", detail: "Radix Icons is really designed as a companion to Radix UI and shadcn/ui. As a standalone icon library it is too limited." },
  ],
  whoShouldUse: [
    "Projects built with shadcn/ui — Radix Icons are the default companion",
    "Applications using Radix UI headless components",
    "Data-dense interfaces like admin dashboards and data tables",
    "React projects that need small, precise icons for UI controls",
    "Teams already in the Radix ecosystem who want design consistency",
  ],
  whoShouldNot: [
    "Projects that need more than 318 icons",
    "Applications where icons are used as large decorative elements",
    "Vue, Svelte, or Angular developers",
    "Projects not using Radix UI or shadcn/ui",
  ],
  faqs: [
    {
      q: "Is Radix Icons the same as Radix UI?",
      a: "No. Radix UI is a headless component library (buttons, dialogs, dropdowns etc). Radix Icons is a separate icon library by the same team. They pair well together but are independent packages."
    },
    {
      q: "Do I need to use Radix UI to use Radix Icons?",
      a: "No. Radix Icons can be used in any React project independently of Radix UI components."
    },
    {
      q: "Why are Radix Icons 15x15 instead of 24x24?",
      a: "The 15x15 grid was chosen to make icons sharp and precise at small sizes, which is where they are most commonly used — inside buttons, dropdowns, form fields, and toolbars."
    },
    {
      q: "Is Radix Icons free for commercial use?",
      a: "Yes. Radix Icons uses the MIT license which allows free use in any commercial project."
    },
    {
      q: "Should I use Radix Icons or Lucide Icons with shadcn/ui?",
      a: "shadcn/ui uses Radix Icons internally for its own components. For icons in your application content, Lucide Icons is the more common choice due to its larger icon set. Many shadcn/ui projects use both libraries together."
    },
  ],
  alternatives: ["lucide-icons", "heroicons", "tabler-icons", "phosphor-icons"],
  links: {
    github: "https://github.com/radix-ui/icons",
    website: "https://www.radix-ui.com/icons",
    npm: "https://www.npmjs.com/package/@radix-ui/react-icons",
    figma: "https://www.figma.com/community/file/1140210386674630256",
  }
}