export type IconLibrary = {
  name: string
  slug: string
  description: string
  website: string
  github: string
  npm: string
  stars: number
  iconCount: number
  license: string
  frameworks: string[]
  style: string[]
  figmaPlugin: boolean
  typescript: boolean
  treeshakable: boolean
  pros: string[]
  cons: string[]
  installCommand: string
  usageExample: string
}

export const icons: IconLibrary[] = [
  {
    name: "Lucide Icons",
    slug: "lucide-icons",
    description: "A clean, consistent open-source icon library with 1960+ icons, forked from Feather Icons with active maintenance and TypeScript support.",
    website: "https://lucide.dev",
    github: "https://github.com/lucide-icons/lucide",
    npm: "lucide-react",
    stars: 12000,
    iconCount: 1960,
    license: "ISC",
    frameworks: ["react", "vue", "svelte", "nextjs"],
    style: ["outline"],
    figmaPlugin: true,
    typescript: true,
    treeshakable: true,
    pros: ["Actively maintained", "Consistent style", "TypeScript support", "Tree-shakable"],
    cons: ["Outline only", "No filled variant"],
    installCommand: "npm install lucide-react",
    usageExample: "import { Home } from 'lucide-react'\n\nexport default function App() {\n  return <Home size={24} />\n}"
  },
  {
    name: "Heroicons",
    slug: "heroicons",
    description: "Beautiful hand-crafted SVG icons by the makers of Tailwind CSS. Available in outline and solid styles with 324 icons.",
    website: "https://heroicons.com",
    github: "https://github.com/tailwindlabs/heroicons",
    npm: "@heroicons/react",
    stars: 21000,
    iconCount: 324,
    license: "MIT",
    frameworks: ["react", "vue", "nextjs"],
    style: ["outline", "solid", "mini"],
    figmaPlugin: true,
    typescript: true,
    treeshakable: true,
    pros: ["Made by Tailwind team", "Multiple styles", "High quality"],
    cons: ["Only 292 icons", "Limited framework support"],
    installCommand: "npm install @heroicons/react",
    usageExample: "import { HomeIcon } from '@heroicons/react/24/outline'\n\nexport default function App() {\n  return <HomeIcon className='h-6 w-6' />\n}"
  },
  {
    name: "Tabler Icons",
    slug: "tabler-icons",
    description: "Over 6100 free MIT-licensed high-quality SVG icons. One of the largest free icon libraries available for web projects.",
    website: "https://tabler-icons.io",
    github: "https://github.com/tabler/tabler-icons",
    npm: "@tabler/icons-react",
    stars: 18000,
    iconCount: 6147,
    license: "MIT",
    frameworks: ["react", "vue", "svelte", "nextjs"],
    style: ["outline", "filled"],
    figmaPlugin: true,
    typescript: true,
    treeshakable: true,
    pros: ["Largest collection", "Both outline and filled", "Very consistent"],
    cons: ["Large package if not tree-shaken"],
    installCommand: "npm install @tabler/icons-react",
    usageExample: "import { IconHome } from '@tabler/icons-react'\n\nexport default function App() {\n  return <IconHome size={24} />\n}"
  },
  {
    name: "PatternFly Icons",
    slug: "patternfly-icons",
    description: "Red Hat's PatternFly icon system with 2,800+ MIT-licensed React icons for enterprise consoles, admin dashboards, developer tools, and product UIs.",
    website: "https://www.patternfly.org/",
    github: "https://github.com/patternfly/patternfly-react",
    npm: "@patternfly/react-icons",
    stars: 2400,
    iconCount: 2884,
    license: "MIT",
    frameworks: ["react", "nextjs"],
    style: ["solid", "outline", "brand"],
    figmaPlugin: false,
    typescript: true,
    treeshakable: true,
    pros: ["Large enterprise-focused set", "Native React components", "TypeScript support", "Tree-shakable package"],
    cons: ["PatternFly visual language is more utilitarian than consumer-facing", "React-focused package only"],
    installCommand: "npm install @patternfly/react-icons",
    usageExample: "import { ServerIcon } from '@patternfly/react-icons'\n\nexport default function App() {\n  return <ServerIcon />\n}"
  },
  {
    name: "Untitled UI Icons",
    slug: "untitled-ui-icons",
    description: "Official MIT-licensed React icons from Untitled UI, with 1,179 crisp outline icons for SaaS products, dashboards, and modern product interfaces.",
    website: "https://www.untitledui.com/icons",
    github: "https://www.npmjs.com/package/@untitledui/icons",
    npm: "@untitledui/icons",
    stars: 0,
    iconCount: 1179,
    license: "MIT",
    frameworks: ["react", "nextjs"],
    style: ["outline"],
    figmaPlugin: false,
    typescript: true,
    treeshakable: true,
    pros: ["Polished SaaS/product UI style", "Official React components", "TypeScript support", "Tree-shakable ESM package"],
    cons: ["React-focused package", "Outline style only", "No public GitHub star signal"],
    installCommand: "npm install @untitledui/icons",
    usageExample: "import { Home01 } from '@untitledui/icons'\n\nexport default function App() {\n  return <Home01 size={24} color='currentColor' />\n}"
  },
  {
    name: "Phosphor Icons",
    slug: "phosphor-icons",
    description: "Flexible icon family with 6 weights including thin, light, regular, bold, fill and duotone. Over 1500 icons available.",
    website: "https://phosphoricons.com",
    github: "https://github.com/phosphor-icons/react",
    npm: "@phosphor-icons/react",
    stars: 8000,
    iconCount: 1533,
    license: "MIT",
    frameworks: ["react", "vue", "nextjs"],
    style: ["thin", "light", "regular", "bold", "fill", "duotone"],
    figmaPlugin: true,
    typescript: true,
    treeshakable: true,
    pros: ["6 weight variants", "Duotone support", "Large collection"],
    cons: ["Heavier package size"],
    installCommand: "npm install @phosphor-icons/react",
    usageExample: "import { House } from '@phosphor-icons/react'\n\nexport default function App() {\n  return <House size={24} weight='duotone' />\n}"
  },
  {
    name: "Remix Icon",
    slug: "remix-icon",
    description: "Open-source neutral-style system symbols for designers and developers. Over 3200 icons in line and fill styles.",
    website: "https://remixicon.com",
    github: "https://github.com/Remix-Design/RemixIcon",
    npm: "remixicon",
    stars: 6000,
    iconCount: 3229,
    license: "Apache 2.0",
    frameworks: ["react", "vue", "nextjs"],
    style: ["line", "fill"],
    figmaPlugin: false,
    typescript: false,
    treeshakable: false,
    pros: ["2800+ icons", "Both line and fill", "Free for commercial use"],
    cons: ["No TypeScript", "Not tree-shakable"],
    installCommand: "npm install remixicon",
    usageExample: "import 'remixicon/fonts/remixicon.css'\n\nexport default function App() {\n  return <i className='ri-home-line'></i>\n}"
  },
  {
    name: "Feather Icons",
    slug: "feather-icons",
    description: "Simply beautiful open source icons designed on a 24x24 grid with an emphasis on simplicity, consistency and readability.",
    website: "https://feathericons.com",
    github: "https://github.com/feathericons/feather",
    npm: "react-feather",
    stars: 24000,
    iconCount: 287,
    license: "MIT",
    frameworks: ["react", "nextjs"],
    style: ["outline"],
    figmaPlugin: false,
    typescript: false,
    treeshakable: true,
    pros: ["Minimal and clean", "Lightweight", "High GitHub stars"],
    cons: ["No longer maintained", "Only 287 icons", "No TypeScript"],
    installCommand: "npm install react-feather",
    usageExample: "import { Home } from 'react-feather'\n\nexport default function App() {\n  return <Home size={24} />\n}"
  },
  {
    name: "Bootstrap Icons",
    slug: "bootstrap-icons",
    description: "Free, high quality, open source icon library with over 2000 icons. Designed by the Bootstrap team.",
    website: "https://icons.getbootstrap.com",
    github: "https://github.com/twbs/icons",
    npm: "bootstrap-icons",
    stars: 7000,
    iconCount: 2078,
    license: "MIT",
    frameworks: ["react", "vue", "nextjs"],
    style: ["outline", "filled"],
    figmaPlugin: true,
    typescript: false,
    treeshakable: false,
    pros: ["1800+ icons", "Both styles", "Backed by Bootstrap team"],
    cons: ["No TypeScript", "Not tree-shakable"],
    installCommand: "npm install bootstrap-icons",
    usageExample: "import 'bootstrap-icons/font/bootstrap-icons.css'\n\nexport default function App() {\n  return <i className='bi bi-house'></i>\n}"
  },
  {
    name: "Radix Icons",
    slug: "radix-icons",
    description: "A crisp set of 15x15 icons designed by the WorkOS team. Perfectly sized for dense UIs and dashboards.",
    website: "https://radix-ui.com/icons",
    github: "https://github.com/radix-ui/icons",
    npm: "@radix-ui/react-icons",
    stars: 5000,
    iconCount: 318,
    license: "MIT",
    frameworks: ["react", "nextjs"],
    style: ["outline"],
    figmaPlugin: true,
    typescript: true,
    treeshakable: true,
    pros: ["Perfect for dense UIs", "TypeScript support", "Made by Radix team"],
    cons: ["Only 318 icons", "15x15 fixed size only"],
    installCommand: "npm install @radix-ui/react-icons",
    usageExample: "import { HomeIcon } from '@radix-ui/react-icons'\n\nexport default function App() {\n  return <HomeIcon />\n}"
  },




  // ── Iconify ───────────────────────────────────────────────────────────────────


// ── Simple Icons ──────────────────────────────────────────────────────────────
  
  // ── Iconoir ──────────────────────────────────────────────────────────────────
  {
    name: 'Iconoir',
    slug: 'iconoir',
    description: 'A high-quality, open-source icon library featuring over 1,300 meticulously crafted line icons. Highly consistent, premium aesthetic perfect for modern UIs.',
    website: 'https://iconoir.com',
    github: 'https://github.com/iconoir-icons/iconoir',
    npm: 'iconoir-react',
    stars: 5200,
    iconCount: 1384,
    license: 'MIT',
    frameworks: ['react', 'nextjs', 'vue', 'solid'],
    style: ['outline'],
    figmaPlugin: true,
    typescript: true,
    treeshakable: true,
    pros: [
      'Incredibly consistent, premium aesthetic that rivals paid libraries.',
      'Wide framework support including React Native and Flutter.',
      'Highly customizable stroke widths.',
      'Excellent Figma plugin synchronization.'
    ],
    cons: [
      'Line style only — no filled or duotone variants.',
      'Does not include brand/social media icons.'
    ],
    installCommand: 'npm install iconoir-react',
    usageExample: "import { Camera, Search } from 'iconoir-react'\n\nexport default function App() {\n  return (\n    <div className=\"flex gap-4 text-blue-500\">\n      <Camera color=\"currentColor\" strokeWidth={1.5} />\n      <Search />\n    </div>\n  )\n}",
  },
  {
    name: "IonIcons",
    slug: "ionicons",
    description: "Premium, carefully designed icons by the Ionic Framework team. Provides Outline, Filled, and Sharp variants with over 1300 icons for responsive mobile and web apps.",
    website: "https://ionic.io/ionicons",
    github: "https://github.com/ionic-team/ionicons",
    npm: "react-ionicons",
    stars: 17200,
    iconCount: 1300,
    license: "MIT",
    frameworks: ["react", "nextjs", "vanilla"],
    style: ["outline", "filled", "sharp"],
    figmaPlugin: false,
    typescript: true,
    treeshakable: true,
    pros: [
      "Outline, Filled, and Sharp variants for every single icon",
      "Designed specifically for high-fidelity iOS and Android web applications",
      "Robust official react-ionicons NPM module for quick React integration",
      "Clean path dimensions optimized for small layouts (16px/24px)",
    ],
    cons: [
      "No official bindings for Vue or Svelte",
      "NPM library uses string size props instead of standard numbers",
    ],
    installCommand: "npm install react-ionicons",
    usageExample: "import { HomeOutline } from 'react-ionicons'\n\nexport default function App() {\n  return <HomeOutline color='#6366f1' height='24px' width='24px' />\n}"
  },
  {
    name: "Octicons",
    slug: "octicons",
    description: "GitHub's official icon set designed specifically for developer dashboards, code repositories, git histories, and developer utilities.",
    website: "https://primer.style/octicons/",
    github: "https://github.com/primer/octicons",
    npm: "@primer/octicons-react",
    stars: 10400,
    iconCount: 280,
    license: "MIT",
    frameworks: ["react", "vue", "nextjs", "jekyll"],
    style: ["outline"],
    figmaPlugin: false,
    typescript: true,
    treeshakable: true,
    pros: [
      "Designed on strict 16px and 24px grid systems to prevent rendering blurriness",
      "Specialized Git workflow, repo, pull-request, and codebase symbols",
      "Maintained directly by GitHub's design systems team",
      "Built-in semantic accessibility descriptions and aria attributes",
    ],
    cons: [
      "Small overall collection size (280 icons)",
      "Strictly technical visual aesthetic, no multitone or colored variations",
    ],
    installCommand: "npm install @primer/octicons-react",
    usageExample: "import { RepoIcon } from '@primer/octicons-react'\n\nexport default function App() {\n  return <RepoIcon size={16} />\n}"
  },
  {
    name: "Ant Design Icons",
    slug: "ant-design-icons",
    description: "The official icon set for Ant Design (AntD), featuring over 800 highly consistent icons in Outlined, Filled, and TwoTone themes for enterprise UIs.",
    website: "https://ant.design/components/icon",
    github: "https://github.com/ant-design/ant-design-icons",
    npm: "@ant-design/icons",
    stars: 8700,
    iconCount: 840,
    license: "MIT",
    frameworks: ["react", "vue"],
    style: ["outline", "filled", "twotone"],
    figmaPlugin: true,
    typescript: true,
    treeshakable: true,
    pros: ["Three distinct themes", "Native React components", "Dynamic TwoTone coloring", "Enterprise grade"],
    cons: ["Opinionated aesthetic", "No mini variants", "Relies on CSS font-size for scaling"],
    installCommand: "npm install @ant-design/icons",
    usageExample: "import { SmileTwoTone } from '@ant-design/icons'\n\nexport default function App() {\n  return <SmileTwoTone twoToneColor='#eb2f96' style={{ fontSize: '24px' }} />\n}"
  },
  {
    name: "Devicons",
    slug: "devicons",
    description: "800+ developer and technology brand icons — logos for every programming language, framework, database, and tool. Available in original (color), plain, and line variants.",
    website: "https://devicon.dev",
    github: "https://github.com/devicons/devicon",
    npm: "devicon",
    stars: 9500,
    iconCount: 800,
    license: "MIT",
    frameworks: ["react", "vue", "svelte", "nextjs", "vanilla"],
    style: ["original", "plain", "line", "wordmark"],
    figmaPlugin: false,
    typescript: false,
    treeshakable: false,
    pros: ["800+ technology logos", "Multiple color variants", "CDN-ready with zero install", "Actively maintained"],
    cons: ["Technology logos only — no UI icons", "No official React component package", "Font loads all icons"],
    installCommand: '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css" />',
    usageExample: "<!-- Font class usage -->\n<i class=\"devicon-react-original colored\"></i>\n<i class=\"devicon-typescript-plain colored\"></i>\n\n<!-- SVG usage -->\n<img src=\"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg\" width=\"24\" />"
  },
  {
    name: "Teenyicons",
    slug: "teenyicons",
    description: "Tiny, minimalist 1px-stroke vector icons designed to fit beautifully in the smallest spaces. Optimised for 15x15 grids.",
    website: "https://teenyicons.com",
    github: "https://github.com/teenyicons/teenyicons",
    npm: "teenyicons",
    stars: 2100,
    iconCount: 1200,
    license: "MIT",
    frameworks: ["react", "vue", "svelte", "nextjs", "vanilla"],
    style: ["outline", "solid"],
    figmaPlugin: true,
    typescript: false,
    treeshakable: true,
    pros: ["Superb pixel sharpness at tiny sizes", "Consistent 1px line thickness", "Outline and Solid visual match"],
    cons: ["Very basic/geometric look", "No official custom wrapper modules"],
    installCommand: "npm install teenyicons",
    usageExample: "import { Home } from 'teenyicons'\n\nexport default function App() {\n  return <Home className='w-4 h-4' />\n}"
  },
  {
    name: "Circum Icons",
    slug: "circum-icons",
    description: "Consistent, ultra-minimalist line icons featuring simple visual geometry and rounded outlines.",
    website: "https://circumicons.com",
    github: "https://github.com/klaufel/circum-icons",
    npm: "circum-icons",
    stars: 800,
    iconCount: 288,
    license: "MPL-2.0",
    frameworks: ["react", "vue", "svelte", "nextjs", "vanilla"],
    style: ["outline"],
    figmaPlugin: true,
    typescript: false,
    treeshakable: true,
    pros: ["Superb aesthetic consistency", "Rounded outlines look soft and modern", "MPL-2.0 open-source license"],
    cons: ["Small count of 288 icons", "Outline style only"],
    installCommand: "npm install circum-icons",
    usageExample: "import { Home } from 'circum-icons'\n\nexport default function App() {\n  return <Home size={24} />\n}"
  },
  {
    name: "Elusive Icons",
    slug: "elusive-icons",
    description: "A clean, customisable web font and SVG vector icon set optimized for Bootstrap layouts.",
    website: "https://redux.io/",
    github: "https://github.com/dovy/elusive-icons",
    npm: "elusive-icons",
    stars: 1200,
    iconCount: 304,
    license: "OFL-1.1",
    frameworks: ["react", "vue", "svelte", "nextjs", "vanilla"],
    style: ["solid"],
    figmaPlugin: true,
    typescript: false,
    treeshakable: true,
    pros: ["High contrast filled designs", "Bootstrap grid system native layout", "OFL-1.1 open source license"],
    cons: ["Slightly legacy visual look", "Solid weights only"],
    installCommand: "npm install elusive-icons",
    usageExample: "import 'elusive-icons/css/elusive-icons.min.css'\n\nexport default function App() {\n  return <i className='el el-home'></i>\n}"
  }
]

export function getIconBySlug(slug: string) {
  return icons.find((i) => i.slug === slug)
}

export function getComparisonPairs() {
  const pairs: [IconLibrary, IconLibrary][] = []
  for (let i = 0; i < icons.length; i++) {
    for (let j = i + 1; j < icons.length; j++) {
      pairs.push([icons[i], icons[j]])
    }
  }
  return pairs
}
