export const heroiconsData = {
  name: "Heroicons",
  slug: "heroicons",
  tagline: "Beautiful hand-crafted SVG icons by the Tailwind CSS team",
  description: {
    intro: "Heroicons is a premium open-source icon library created and maintained by the team behind Tailwind CSS. Every icon is hand-crafted by professional designers, resulting in a level of visual polish that is difficult to match in the open-source space.",
    detail: "The library offers icons in three distinct styles — outline (24x24), solid (24x24), and mini (20x20). This gives you the flexibility to use lighter outline icons for general UI and solid/filled icons for emphasis or active states, all within the same consistent visual system.",
    technical: "Heroicons ships as a React and Vue package with full TypeScript support. Every icon is tree-shakable, so your bundle only includes what you use. The library is tightly integrated with Tailwind CSS — icons accept className props and work perfectly with Tailwind utility classes for sizing and coloring.",
    verdict: "Heroicons is the best choice if you are already using Tailwind CSS. The design language matches Tailwind UI components perfectly. The only significant limitation is the icon count — at 292 icons it is one of the smaller libraries, so complex applications may find gaps."
  },
  stats: {
    iconCount: 292,
    stars: 21000,
    weeklyDownloads: 1800000,
    license: "MIT",
    firstRelease: "2020",
    latestVersion: "2.1.1",
    bundleSize: "~1kb per icon",
    openIssues: 45,
  },
  installation: {
    react: {
      package: "@heroicons/react",
      command: "npm install @heroicons/react",
      yarn: "yarn add @heroicons/react",
      pnpm: "pnpm add @heroicons/react",
    },
    nextjs: {
      package: "@heroicons/react",
      command: "npm install @heroicons/react",
      note: "Fully compatible with Next.js App Router and Pages Router. Works in both Server and Client components.",
    },
    vue: {
      package: "@heroicons/vue",
      command: "npm install @heroicons/vue",
    },
    svelte: {
      package: "N/A",
      command: "// No official Svelte package — use SVG directly from heroicons.com",
    },
    vanilla: {
      package: "N/A",
      command: "// No vanilla JS package — copy SVG code directly from heroicons.com",
    }
  },
  codeExamples: {
    basic: `import { HomeIcon, BellIcon, UserIcon } from '@heroicons/react/24/outline'

export default function App() {
  return (
    <div>
      <HomeIcon className="h-6 w-6" />
      <BellIcon className="h-6 w-6 text-blue-500" />
      <UserIcon className="h-6 w-6 text-gray-400" />
    </div>
  )
}`,
    solidVariant: `// Use solid icons for emphasis or active states
import { HomeIcon } from '@heroicons/react/24/solid'
import { HomeIcon as HomeOutline } from '@heroicons/react/24/outline'

export default function Nav() {
  const isActive = true
  const Icon = isActive ? HomeIcon : HomeOutline
  return <Icon className="h-6 w-6" />
}`,
    miniIcons: `// Mini icons (20x20) for dense UIs like badges and tags
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'

export default function Badge() {
  return (
    <span className="flex items-center gap-1 text-sm">
      <CheckIcon className="h-4 w-4 text-green-500" />
      Verified
    </span>
  )
}`,
  },
  pros: [
    { title: "Hand-crafted by designers", detail: "Every icon is professionally designed, not auto-generated. The visual quality is consistently higher than most open-source alternatives." },
    { title: "Three style variants", detail: "Outline, solid, and mini styles give you flexibility for different UI contexts without switching libraries." },
    { title: "Perfect Tailwind integration", detail: "Built by the Tailwind team, Heroicons works seamlessly with Tailwind utility classes. Sizing and coloring via className is intuitive." },
    { title: "Actively maintained", detail: "Backed by the Tailwind CSS team which has strong commercial incentives to keep the library up to date." },
    { title: "Minimal and professional", detail: "The design language is clean and neutral — icons don't draw attention to themselves, they serve the UI." },
  ],
  cons: [
    { title: "Only 292 icons", detail: "This is the biggest limitation. Complex applications often need niche icons that Heroicons simply does not have." },
    { title: "No Vue 2 support", detail: "The Vue package only supports Vue 3. Older Vue projects cannot use Heroicons without workarounds." },
    { title: "No Svelte or Angular package", detail: "Official support is limited to React and Vue. Svelte and Angular developers need to use SVG directly." },
    { title: "No Figma plugin", detail: "Unlike Lucide, there is no official Figma plugin, making designer-developer handoff slightly harder." },
  ],
  whoShouldUse: [
    "Teams already using Tailwind CSS — the integration is seamless",
    "Projects that prioritize design quality over icon variety",
    "Applications with clean, minimal UI design language",
    "React and Next.js projects with straightforward icon needs",
    "Teams that want solid and outline variants from the same library",
  ],
  whoShouldNot: [
    "Applications that need 500+ unique icons — 292 will not be enough",
    "Svelte or Angular projects without a React/Vue layer",
    "Projects that need brand or logo icons",
    "Teams that need a Figma plugin for designer handoff",
  ],
  faqs: [
    {
      q: "Is Heroicons free for commercial use?",
      a: "Yes. Heroicons is MIT licensed which means you can use it in any commercial project, modify it, and distribute it freely without any attribution required."
    },
    {
      q: "What is the difference between Heroicons outline and solid?",
      a: "Outline icons use strokes on a transparent background — they are lighter and work well for general UI. Solid icons are fully filled and create more visual weight, making them ideal for active states, buttons, and emphasis."
    },
    {
      q: "Can I use Heroicons without Tailwind CSS?",
      a: "Yes. Heroicons works with any CSS framework or plain CSS. Tailwind is not a requirement — you can style icons with regular CSS classes or inline styles."
    },
    {
      q: "How do I change the color of a Heroicon?",
      a: "Pass a className with a text color utility — for example className='text-blue-500' with Tailwind, or use CSS color property. The icons use currentColor so they inherit the text color of their parent."
    },
    {
      q: "Does Heroicons work with Next.js Server Components?",
      a: "Yes. Heroicons are pure SVG components with no client-side dependencies, making them fully compatible with Next.js Server Components in the App Router."
    },
  ],
  alternatives: ["lucide-icons", "tabler-icons", "phosphor-icons", "radix-icons"],
  links: {
    github: "https://github.com/tailwindlabs/heroicons",
    website: "https://heroicons.com",
    npm: "https://www.npmjs.com/package/@heroicons/react",
    figma: "",
  }
}