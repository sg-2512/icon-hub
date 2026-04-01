export const phosphorIconsData = {
  name: "Phosphor Icons",
  slug: "phosphor-icons",
  tagline: "Flexible icon family with 6 weights for interfaces and more",
  description: {
    intro: "Phosphor Icons is a flexible icon family designed for interfaces, diagrams, and presentations. With over 1,200 icons available in 6 different weights, it offers the most style variety of any major open-source icon library.",
    detail: "The 6 weights — thin, light, regular, bold, fill, and duotone — give designers and developers extraordinary control over visual hierarchy and tone. You can use thin icons for elegant, minimal UIs, bold icons for high-contrast accessibility needs, and duotone icons for a modern two-color effect.",
    technical: "Phosphor ships as a React package with full TypeScript support. Icons are tree-shakable and accept size, color, weight, and mirrored props. The weight prop makes it trivial to switch between all 6 variants without changing your import. A Figma plugin is available with all weights.",
    verdict: "Phosphor is the best choice when your design requires multiple icon styles within the same library. The duotone weight in particular is unique among free icon libraries and gives applications a premium, modern feel that is difficult to achieve otherwise."
  },
  stats: {
    iconCount: 1248,
    stars: 8000,
    weeklyDownloads: 400000,
    license: "MIT",
    firstRelease: "2020",
    latestVersion: "2.1.1",
    bundleSize: "~1.5kb per icon",
    openIssues: 34,
  },
  installation: {
    react: {
      package: "@phosphor-icons/react",
      command: "npm install @phosphor-icons/react",
      yarn: "yarn add @phosphor-icons/react",
      pnpm: "pnpm add @phosphor-icons/react",
    },
    nextjs: {
      package: "@phosphor-icons/react",
      command: "npm install @phosphor-icons/react",
      note: "Compatible with Next.js App Router. Works in both Server and Client Components.",
    },
    vue: {
      package: "@phosphor-icons/vue",
      command: "npm install @phosphor-icons/vue",
    },
    svelte: {
      package: "N/A",
      command: "// No official Svelte package. Use the SVG files directly from phosphoricons.com",
    },
    vanilla: {
      package: "@phosphor-icons/web",
      command: "npm install @phosphor-icons/web",
    }
  },
  codeExamples: {
    basic: `import { House, Gear, User } from '@phosphor-icons/react'

export default function App() {
  return (
    <div>
      <House size={24} />
      <Gear size={24} weight="bold" />
      <User size={24} weight="duotone" />
    </div>
  )
}`,
    allWeights: `import { Heart } from '@phosphor-icons/react'

export default function WeightShowcase() {
  const weights = ['thin', 'light', 'regular', 'bold', 'fill', 'duotone']
  return (
    <div className="flex gap-4">
      {weights.map(weight => (
        <Heart key={weight} size={32} weight={weight} />
      ))}
    </div>
  )
}`,
    duotone: `// Duotone icons support custom color for the secondary layer
import { ShieldCheck } from '@phosphor-icons/react'

export default function Badge() {
  return (
    <ShieldCheck
      size={48}
      weight="duotone"
      color="#6366f1"
    />
  )
}`,
  },
  pros: [
    { title: "6 weight variants", detail: "No other free icon library offers this many style variants from a single import. Switch weights with one prop change." },
    { title: "Duotone support", detail: "The duotone weight creates a two-color effect that gives applications a premium, modern aesthetic at no cost." },
    { title: "Large icon count", detail: "1,248 icons covering most common UI needs with good coverage of specialized categories." },
    { title: "Simple weight API", detail: "Changing from outline to filled to duotone is as simple as changing the weight prop — no different imports needed." },
    { title: "Figma plugin", detail: "Full Figma plugin support with all 6 weights, making designer-developer collaboration seamless." },
  ],
  cons: [
    { title: "Heavier package size", detail: "Because each icon includes 6 weight variants, the package is larger than single-style libraries like Lucide." },
    { title: "Less community adoption", detail: "Phosphor is less widely used than Lucide or Heroicons, meaning fewer tutorials, Stack Overflow answers, and community resources." },
    { title: "No Svelte official package", detail: "Svelte developers need to use SVG files directly, which is more cumbersome than a dedicated package." },
  ],
  whoShouldUse: [
    "Projects where design requires multiple icon weights or styles",
    "Applications that want duotone icons for a modern premium feel",
    "Teams where designers and developers both need Figma and code access",
    "Marketing sites and landing pages where visual variety matters",
    "Apps targeting accessibility where bold/heavy icon weights improve readability",
  ],
  whoShouldNot: [
    "Projects that need a single consistent style and maximum performance",
    "Svelte developers who need an official package",
    "Teams that prioritize community familiarity and documentation volume",
  ],
  faqs: [
    {
      q: "What is a duotone icon?",
      a: "A duotone icon uses two colors — a primary color and a lighter secondary color applied to different parts of the icon. In Phosphor, the secondary layer uses 20% opacity of the primary color by default, creating a subtle two-tone effect."
    },
    {
      q: "How do I change the weight of a Phosphor icon?",
      a: "Use the weight prop on any icon component. Available values are thin, light, regular, bold, fill, and duotone. For example: <House weight='duotone' />."
    },
    {
      q: "Is Phosphor Icons free for commercial use?",
      a: "Yes. Phosphor Icons uses the MIT license which allows free use in any commercial project without attribution."
    },
    {
      q: "How does Phosphor compare to Lucide Icons?",
      a: "Phosphor offers 6 weight variants vs Lucide's single outline style. Lucide has a slightly more active community and is more commonly seen in React projects. Phosphor wins on style flexibility, Lucide wins on community support and simplicity."
    },
    {
      q: "Does Phosphor Icons work with Tailwind CSS?",
      a: "Yes. Pass className with Tailwind utilities for sizing. For color, use the color prop instead of text color utilities since Phosphor icons use fill and stroke rather than just currentColor."
    },
  ],
  alternatives: ["lucide-icons", "tabler-icons", "heroicons", "remix-icon"],
  links: {
    github: "https://github.com/phosphor-icons/react",
    website: "https://phosphoricons.com",
    npm: "https://www.npmjs.com/package/@phosphor-icons/react",
    figma: "https://www.figma.com/community/plugin/898620911119764929",
  }
}