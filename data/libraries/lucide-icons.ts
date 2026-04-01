export const lucideIconsData = {
  name: "Lucide Icons",
  slug: "lucide-icons",
  tagline: "Beautiful & consistent open-source icons",
  description: {
    intro: "Lucide is one of the most popular open-source icon libraries in the developer ecosystem today. It was forked from Feather Icons in 2020 to address the lack of active maintenance, and has since grown into a thriving community-driven project with over 1,400 carefully crafted icons.",
    detail: "Every icon in Lucide is designed on a strict 24x24 grid with a 2px stroke width, ensuring perfect visual consistency across your entire application. Whether you use 5 icons or 500, they will all look like they belong together — something that cannot be said for many competing libraries.",
    technical: "Lucide is built from the ground up with modern development workflows in mind. It is fully tree-shakable, meaning your production bundle only includes the icons you actually import. It ships with complete TypeScript definitions, so you get full autocomplete and type safety in VS Code. The library supports React, Vue, Svelte, Angular, and vanilla JavaScript through separate packages.",
    verdict: "For most projects starting in 2026, Lucide Icons is the default recommendation. It hits the sweet spot between icon variety, visual quality, bundle size, and developer experience. The only reason to look elsewhere is if you need filled/duotone variants or a significantly larger icon set."
  },
  stats: {
    iconCount: 1400,
    stars: 12000,
    weeklyDownloads: 3200000,
    license: "ISC",
    firstRelease: "2020",
    latestVersion: "0.330.0",
    bundleSize: "~1kb per icon",
    openIssues: 120,
  },
  installation: {
    react: {
      package: "lucide-react",
      command: "npm install lucide-react",
      yarn: "yarn add lucide-react",
      pnpm: "pnpm add lucide-react",
    },
    nextjs: {
      package: "lucide-react",
      command: "npm install lucide-react",
      note: "Works with both App Router and Pages Router out of the box. No additional configuration needed.",
    },
    vue: {
      package: "lucide-vue-next",
      command: "npm install lucide-vue-next",
    },
    svelte: {
      package: "lucide-svelte",
      command: "npm install lucide-svelte",
    },
    vanilla: {
      package: "lucide",
      command: "npm install lucide",
    }
  },
  codeExamples: {
    basic: `import { Home, Settings, User } from 'lucide-react'

export default function App() {
  return (
    <div>
      <Home size={24} />
      <Settings size={24} color="#6366f1" />
      <User size={24} strokeWidth={1.5} />
    </div>
  )
}`,
    withTailwind: `import { Bell } from 'lucide-react'

export default function Navbar() {
  return (
    <button className="flex items-center gap-2">
      <Bell className="h-5 w-5 text-gray-500" />
      <span>Notifications</span>
    </button>
  )
}`,
    nextjs: `// app/page.tsx
import { ArrowRight, Github, Star } from 'lucide-react'

export default function Page() {
  return (
    <main>
      <h1>Welcome</h1>
      <a href="/docs">
        Get Started <ArrowRight size={16} />
      </a>
    </main>
  )
}`,
  },
  pros: [
    { title: "Actively maintained", detail: "New icons added regularly, bugs fixed quickly. The project has a dedicated team and a large contributor base." },
    { title: "Perfect consistency", detail: "Every icon follows the same 24x24 grid and 2px stroke rules. Your UI will look cohesive no matter how many icons you use." },
    { title: "Full TypeScript support", detail: "Every icon is typed. You get autocomplete in VS Code, catching typos at compile time instead of runtime." },
    { title: "Tree-shakable", detail: "Only the icons you import end up in your bundle. Using 10 icons adds roughly 10kb — not the entire library." },
    { title: "Framework agnostic", detail: "Official packages for React, Vue, Svelte, Angular and vanilla JS. One library for your entire stack." },
    { title: "Figma plugin available", detail: "Designers can use the same icons in Figma that developers use in code, keeping design and dev in sync." },
  ],
  cons: [
    { title: "Outline style only", detail: "Lucide only offers outline/stroke icons. If your design needs filled or duotone variants, you will need a different library or a workaround." },
    { title: "No animated icons", detail: "Icons are static SVGs. For animated icons you would need to use a separate solution like Lordicon or custom CSS animations." },
    { title: "Smaller set than Tabler", detail: "At 1,400 icons, Lucide is large but not exhaustive. Very niche icons (specific logos, industry symbols) may be missing." },
  ],
  whoShouldUse: [
    "React and Next.js developers who want a reliable, well-maintained icon library",
    "Projects using Tailwind CSS — Lucide integrates perfectly via className props",
    "TypeScript projects that need full type safety",
    "Teams where designers and developers need to stay in sync via Figma",
    "Projects that prioritize bundle size and performance",
  ],
  whoShouldNot: [
    "Projects that specifically need filled or duotone icon styles",
    "Designers who need 5,000+ icons to choose from (use Tabler instead)",
    "Projects that need brand/logo icons (use Simple Icons instead)",
  ],
  faqs: [
    {
      q: "Is Lucide Icons free for commercial use?",
      a: "Yes. Lucide uses the ISC license which is one of the most permissive open source licenses. You can use it in any commercial project without attribution."
    },
    {
      q: "Does Lucide Icons work with Next.js App Router?",
      a: "Yes. Lucide React components are compatible with both the Next.js App Router and Pages Router. They work in both Server Components and Client Components without any configuration."
    },
    {
      q: "How do I change the size and color of a Lucide icon?",
      a: "Use the size prop for dimensions (default 24) and the color prop for color. You can also use the strokeWidth prop to change the thickness. Alternatively, pass a className with Tailwind utilities like h-5 w-5 text-blue-500."
    },
    {
      q: "Is Lucide Icons the same as Feather Icons?",
      a: "Lucide started as a fork of Feather Icons but has since diverged significantly. Feather has 287 icons and is no longer actively maintained. Lucide has 1,400+ icons with active development and a large community."
    },
    {
      q: "How big is Lucide in my bundle?",
      a: "Each icon is approximately 0.5-1kb when tree-shaken. If you import 20 icons, you add roughly 10-20kb to your bundle — negligible for most applications."
    },
  ],
  alternatives: ["heroicons", "tabler-icons", "phosphor-icons", "feather-icons", "radix-icons"],
  links: {
    github: "https://github.com/lucide-icons/lucide",
    website: "https://lucide.dev",
    npm: "https://www.npmjs.com/package/lucide-react",
    figma: "https://www.figma.com/community/plugin/939567362549682242/lucide-icons",
  }
}