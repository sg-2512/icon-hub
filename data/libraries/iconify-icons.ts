export const iconifyIconsData = {
  name: 'Iconify',
  slug: 'iconify',
  tagline: 'One framework for 332,012 open source icons across 227 icon collections — React, Vue, Svelte, and vanilla',
  description: {
    intro: 'Iconify is the most comprehensive open-source icon ecosystem available in 2026. Rather than a single icon set, it is a unified framework that provides access to 332,012 icons from 227 open-source icon collections — Lucide, Material Symbols, Font Awesome, Tabler, Heroicons, Phosphor, Bootstrap Icons, Remix, and hundreds more — all through one consistent API and one import syntax.',
    detail: 'The defining architectural decision that separates Iconify from every other library is its on-demand loading model. Icons are not bundled into your application at build time. Instead, the @iconify/react component fetches icon data from Iconify\'s public API at runtime when it first encounters an icon name. This means you can use any of the 332,012 icons with zero build-time cost — your bundle contains only the rendering engine, not the icon data. For production applications that need offline capability, Iconify also supports fully offline mode by pre-bundling specific icon sets as JSON data.',
    technical: 'The React package (@iconify/react) receives 605,000+ weekly npm downloads and works in React, Next.js, Vue, Svelte, SolidJS, Angular, and vanilla HTML. Icon names follow a prefix:icon-name syntax — "lucide:home", "mdi:account", "heroicons:magnifying-glass". This unified naming system means you never need to look up library-specific naming conventions. TypeScript support is available. However, the runtime API-loading model means icons do not work in Next.js Server Components without switching to the offline/bundled mode, which requires additional setup.',
    verdict: 'Iconify is the right choice when icon variety is the top priority and you are comfortable with either the API-loading model or the offline setup. For projects that need access to hundreds of icon sets without installing multiple packages, it has no equal. For standard React/Next.js projects that need 50–200 icons from a consistent visual family, Lucide or Heroicons are more straightforward with better Server Component support out of the box.'
  },
  stats: {
    iconCount: 332012,
    stars: 5162,
    weeklyDownloads: 605709,
    license: 'MIT (framework) — icon sets use their original licenses',
    firstRelease: '2020',
    latestVersion: "4.1.2",
    bundleSize: '~15KB (renderer only) — icon data loaded on demand',
    openIssues: 420,
  },
  installation: {
    react: {
      package: '@iconify/react',
      command: 'npm install @iconify/react',
      yarn: 'yarn add @iconify/react',
      pnpm: 'pnpm add @iconify/react',
      note: 'No icon data is bundled. Icons load from the Iconify API on first render. For offline/SSR use, install icon set packages: npm install @iconify-json/lucide @iconify-json/mdi',
    },
    nextjs: {
      package: '@iconify/react',
      command: 'npm install @iconify/react',
      note: 'API-loading mode does not work in Server Components. For Next.js App Router, use offline mode with pre-bundled icon sets. Import addCollection from @iconify/react and load icon JSON data before rendering.',
    },
    vue: {
      package: '@iconify/vue',
      command: 'npm install @iconify/vue',
    },
    svelte: {
      package: '@iconify/svelte',
      command: 'npm install @iconify/svelte',
    },
    vanilla: {
      package: 'iconify-icon',
      command: 'npm install iconify-icon',
    },
  },
  codeExamples: {
    basic: `import { Icon } from '@iconify/react'

// Icon names follow prefix:icon-name syntax
// Access 332,012 icons from 227 collections with one component
export default function App() {
  return (
    <div>
      {/* Lucide icons */}
      <Icon icon="lucide:home" />
      <Icon icon="lucide:settings" width={24} height={24} />

      {/* Material Design Icons */}
      <Icon icon="mdi:account-circle" width={24} />

      {/* Font Awesome Solid */}
      <Icon icon="fa6-solid:house" width={20} />

      {/* Heroicons */}
      <Icon icon="heroicons:magnifying-glass" width={24} />

      {/* Tabler Icons */}
      <Icon icon="tabler:brand-github" width={24} />
    </div>
  )
}`,
    withColor: `import { Icon } from '@iconify/react'

// Color and size via props
<Icon icon="lucide:heart" color="#ef4444" width={24} height={24} />
<Icon icon="mdi:check-circle" color="var(--green)" width={20} />

// With Tailwind className — uses currentColor
<Icon icon="lucide:bell" className="h-5 w-5 text-gray-500" />`,
    offlineMode: `// Offline mode — pre-bundle specific icon sets for SSR / Server Components
import { addCollection } from '@iconify/react'
import lucideIcons from '@iconify-json/lucide/icons.json'

// Call once at app startup (e.g. in layout.tsx or _app.tsx)
addCollection(lucideIcons)

// Now 'lucide:*' icons work offline with no API calls
import { Icon } from '@iconify/react'
<Icon icon="lucide:home" />  // served from bundled data`,
    findIcon: `// Icon name format: "prefix:icon-name"
// Browse all sets at: https://icon-sets.iconify.design/

// Common prefixes:
// lucide:       → Lucide Icons (1,500+)
// mdi:          → Material Design Icons (7,000+)
// heroicons:    → Heroicons (292)
// tabler:       → Tabler Icons (5,900+)
// ph:           → Phosphor Icons (9,000+)
// fa6-solid:    → Font Awesome 6 Solid (1,388)
// fa6-brands:   → Font Awesome 6 Brands (465)
// simple-icons: → Simple Icons brand logos (3,000+)
// bi:           → Bootstrap Icons (2,000+)
// ri:           → Remix Icon (2,800+)
// carbon:       → IBM Carbon (2,100+)
// octicon:      → GitHub Octicons (300+)`,
  },
  pros: [
    {
      title: '332,012 icons from one import',
      detail: 'Access Lucide, Material Design Icons, Font Awesome, Tabler, Heroicons, Phosphor, Simple Icons, Bootstrap Icons, and 200+ more icon sets through a single <Icon> component with a unified prefix:name syntax. No switching packages or learning different APIs.',
    },
    {
      title: 'Zero bundle cost for unused icons',
      detail: 'In API mode, icon data is fetched on demand from the Iconify CDN — your JavaScript bundle contains only the 15KB rendering engine. You can reference all 332,012 icons without any of them touching your production bundle unless they are actually used on screen.',
    },
    {
      title: 'Works with every major framework',
      detail: 'Official packages for React, Vue, Svelte, SolidJS, Angular, and vanilla HTML with a web component. One icon system scales across any framework your organization uses — useful for monorepos and teams working across multiple stacks.',
    },
    {
      title: 'All icon sets automatically kept up to date',
      detail: 'Iconify checks icon set repositories for updates multiple times per week. You get the latest icons from every set — new Lucide icons, new Material Symbols, new Tabler additions — without updating any npm packages in your project.',
    },
    {
      title: 'Unified search and browsing across all sets',
      detail: 'The Iconify icon search at icon-sets.iconify.design lets you search across all 332,012 icons at once by name, category, or visual similarity — no need to browse 227 different collection pages separately.',
    },
    {
      title: 'Figma plugin for design handoff',
      detail: 'The Iconify Figma plugin lets designers browse and place icons from all 227 collections directly in Figma, then export icon names that developers can use directly in code with the same prefix:name syntax.',
    },
  ],
  cons: [
    {
      title: 'API mode does not work in Server Components',
      detail: 'The on-demand API loading model requires browser JavaScript and network access at render time. This is incompatible with Next.js App Router Server Components. Switching to offline mode requires installing @iconify-json/* packages and calling addCollection() before rendering — meaningful additional setup.',
    },
    {
      title: 'API dependency introduces network risk',
      detail: 'In API mode, if the Iconify CDN is slow or unavailable, icons fail to load silently — elements render at correct size but display nothing. For production applications where every icon is critical UI, offline mode is required, which negates the bundle-size advantage.',
    },
    {
      title: 'Mixed icon licenses require per-icon verification',
      detail: 'Iconify aggregates 227 icon collections with different licenses — MIT, CC BY 4.0, Apache 2.0, CC BY-SA, and others. The framework is MIT but each icon carries its source set\'s license. Using icons from multiple sets in a commercial product requires verifying each set\'s license separately.',
    },
    {
      title: 'Visual inconsistency across sets',
      detail: 'Because Iconify gives access to 227 different icon collections, mixing icons from different collections in the same UI creates visual inconsistency — a Lucide stroke icon next to a Material Design filled icon next to a Font Awesome bold icon looks like three different products. Discipline about which collections you use is required.',
    },
    {
      title: 'Low GitHub stars relative to usage',
      detail: 'The @iconify/iconify core repository has ~5,000 stars — low relative to its download count and breadth, suggesting the project is more of an infrastructure dependency than a developer-community library. Documentation quality is good but community resources are thinner than for Lucide or Font Awesome.',
    },
  ],
  whoShouldUse: [
    'Projects that genuinely need icons from multiple design families — brand logos, Material Design, stroke icons, and specialized sets — in one consistent API',
    'Monorepo teams using multiple frameworks (React, Vue, Svelte) who want one icon system across all of them',
    'Rapid prototyping where discovering the right icon matters more than bundle optimization',
    'Design systems that use Figma with the Iconify plugin and want code/design parity across 227 icon collections',
    'Projects already on offline mode setup with specific @iconify-json/* sets pre-bundled',
  ],
  whoShouldNot: [
    'Next.js App Router projects using Server Components heavily — offline mode setup is required and adds friction',
    'Production applications that cannot tolerate any API dependency for icon rendering',
    'Projects that want strict visual consistency — accessing 227 collections makes accidental mixing easy',
    'Developers who want a simple single-install solution — @react-icons/all-files or Tabler cover large icon counts with simpler setup',
    'Projects with strict commercial licensing requirements — per-set license verification across 227 collections is impractical',
  ],
  faqs: [
    {
      q: 'Does Iconify work in Next.js App Router Server Components?',
      a: 'Not in API mode. The default API-loading model requires browser JavaScript and cannot run in Server Components. For Next.js App Router, use offline mode: install @iconify-json/[prefix] packages for the sets you need, call addCollection() with the JSON data, and the icons will be served from your bundle with no API calls. This requires setup but makes Iconify work in any rendering context.'
    },
    {
      q: 'What is the difference between Iconify API mode and offline mode?',
      a: 'API mode: the @iconify/react component fetches icon SVG data from Iconify\'s public CDN on first render. Zero bundle cost, works immediately, but requires network access and browser JavaScript. Offline mode: you install @iconify-json/[prefix] packages (e.g. @iconify-json/lucide) and call addCollection() with the imported JSON. Icon data is bundled with your app — works in SSR, Server Components, and offline environments, but adds bundle weight.'
    },
    {
      q: 'Is Iconify free for commercial use?',
      a: 'The Iconify framework code is MIT licensed and free for commercial use. The individual icon sets retain their original licenses — most are MIT, Apache 2.0, or CC BY 4.0. Before using a specific icon set commercially, check its license on the icon-sets.iconify.design page. Clicking any icon set shows the license. The majority of popular sets (Lucide, Tabler, Heroicons, Bootstrap Icons) are MIT.'
    },
    {
      q: 'How do I find icon names to use with Iconify?',
      a: 'Browse icon-sets.iconify.design to search across all 332,012 icons. Select an icon and the site shows the full prefix:name string to use in code (e.g. "lucide:home", "mdi:account"). The Iconify Figma plugin lets designers browse and copy icon names directly from Figma.'
    },
    {
      q: 'Should I use Iconify or react-icons?',
      a: 'Both aggregate multiple icon sets but work differently. react-icons bundles all icon data at build time (~81KB per sub-pack due to CommonJS). Iconify loads icon data on demand with a 15KB runtime cost in API mode. For bundle-sensitive projects, Iconify\'s API mode is more efficient. For offline/SSR use, react-icons\' @react-icons/all-files (ESM) is simpler to set up. Iconify covers significantly more icon collections (227 vs ~25) and has official Vue, Svelte, and SolidJS support.'
    },
  ],
  alternatives: ['lucide-icons', 'react-icons', 'tabler-icons', 'phosphor-icons', 'material-icons'],
  links: {
    github: 'https://github.com/iconify/iconify',
    website: 'https://iconify.design',
    npm: 'https://www.npmjs.com/package/@iconify/react',
    figma: 'https://www.figma.com/community/plugin/735098390272716381',
  },
}
