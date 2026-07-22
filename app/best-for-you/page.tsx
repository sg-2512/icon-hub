'use client'

import { useState } from 'react'
import Link from 'next/link'
import { namedLibraries } from '../../data/library-catalog'

const questions = [
  {
    id: 'framework',
    question: 'What framework are you building with?',
    subtitle: 'This is the most important factor — some libraries have better support for specific frameworks.',
    options: [
      { value: 'react', label: 'React', desc: 'Create React App, Vite, or similar' },
      { value: 'nextjs', label: 'Next.js', desc: 'App Router or Pages Router' },
      { value: 'vue', label: 'Vue 3', desc: 'Vue 3 or Nuxt' },
      { value: 'svelte', label: 'Svelte / SvelteKit', desc: 'Svelte 4, 5 or SvelteKit' },
      { value: 'vanilla', label: 'Vanilla HTML/CSS', desc: 'No framework, just HTML' },
      { value: 'unsure', label: 'Not sure yet', desc: 'Still deciding on the stack' },
    ],
  },
  {
    id: 'ui_library',
    question: 'Are you using a UI component library?',
    subtitle: 'Some icon libraries are designed to pair with specific UI frameworks — this affects bundle size and design consistency.',
    options: [
      { value: 'mui', label: 'MUI (Material UI)', desc: '@mui/material — Google Material Design components' },
      { value: 'shadcn', label: 'shadcn/ui', desc: 'shadcn components built on Radix UI' },
      { value: 'tailwindui', label: 'Tailwind UI / Headless UI', desc: 'Official Tailwind component library' },
      { value: 'antd', label: 'Ant Design', desc: 'Alibaba enterprise component system' },
      { value: 'none', label: 'None / Custom', desc: 'Building my own components' },
      { value: 'unsure', label: 'Not decided yet', desc: 'Still evaluating options' },
    ],
  },
  {
    id: 'style',
    question: 'What icon style fits your design?',
    subtitle: 'Choose based on your overall UI aesthetic — this affects which libraries qualify.',
    options: [
      { value: 'outline', label: 'Outline / Minimal', desc: 'Clean, lightweight, modern feel' },
      { value: 'filled', label: 'Filled / Bold', desc: 'Strong, high-contrast, prominent' },
      { value: 'both', label: 'Both styles', desc: 'I need active and inactive variants' },
      { value: 'duotone', label: 'Duotone / Two-tone', desc: 'Premium two-color depth effect' },
      { value: 'any', label: 'No preference', desc: 'Whatever looks best' },
    ],
  },
  {
    id: 'volume',
    question: 'How many unique icons do you need?',
    subtitle: 'Be honest — most apps need fewer icons than developers think.',
    options: [
      { value: 'small', label: 'Under 300', desc: 'Basic UI — nav, buttons, forms only' },
      { value: 'medium', label: '300 to 1,500', desc: 'Most apps are covered here' },
      { value: 'large', label: '1,500+', desc: 'Need niche or specialized icons too' },
    ],
  },
  {
    id: 'project',
    question: 'What type of project is this?',
    subtitle: 'Different projects have different icon needs — brand icons, animation, and density all vary by context.',
    options: [
      { value: 'saas', label: 'SaaS / Dashboard', desc: 'Admin panels, analytics, management tools' },
      { value: 'marketing', label: 'Marketing / Landing page', desc: 'Product sites, portfolios, promos' },
      { value: 'mobile', label: 'Mobile web / PWA', desc: 'Touch-first, responsive apps' },
      { value: 'devtool', label: 'Developer tool / Docs', desc: 'Technical audience, code-focused' },
      { value: 'ecommerce', label: 'Ecommerce', desc: 'Shopping, payments, product pages' },
      { value: 'enterprise', label: 'Enterprise / Internal tool', desc: 'Internal dashboards, B2B products' },
      { value: 'personal', label: 'Personal / Portfolio', desc: 'Side project or portfolio site' },
    ],
  },
  {
    id: 'tailwind',
    question: 'Are you using Tailwind CSS?',
    subtitle: 'One library is made specifically by the Tailwind team and integrates more naturally.',
    options: [
      { value: 'yes', label: 'Yes', desc: 'Tailwind CSS is my primary styling solution' },
      { value: 'no', label: 'No', desc: 'Using CSS modules, styled-components, or other' },
    ],
  },
  {
    id: 'priority',
    question: 'What matters most to you?',
    subtitle: 'When two libraries both fit your stack, this is the tiebreaker.',
    options: [
      { value: 'bundle', label: 'Bundle size / Performance', desc: 'Smallest possible JavaScript footprint' },
      { value: 'variety', label: 'Icon variety', desc: 'As many icons as possible to choose from' },
      { value: 'consistency', label: 'Visual consistency', desc: 'All icons look like they belong together' },
      { value: 'dx', label: 'Developer experience', desc: 'Best TypeScript, autocomplete, and API' },
      { value: 'brand', label: 'Brand & social icons', desc: 'I specifically need logos (GitHub, Twitter, etc.)' },
    ],
  },
]

type Answers = Record<string, string>

type Result = {
  primary: {
    slug: string
    name: string
    reason: string
    installCommand: string
    tags: string[]
  }
  secondary: {
    slug: string
    name: string
    reason: string
  } | null
  tertiary?: {
    slug: string
    name: string
    reason: string
  } | null
  summary: string
  warning?: string
}

const namedLibrarySlugs = new Set(namedLibraries.map((library) => library.slug))

function getResultHref(slug: string): string {
  if (namedLibrarySlugs.has(slug)) return `/icons/${slug}`
  if (slug === 'react-icons') return '/react-icons'
  if (slug === 'material-icons') return '/icon-search?lib=iconify&iconifySet=material-symbols'
  if (slug === 'simple-icons') return '/icon-search?lib=iconify&iconifySet=simple-icons'
  if (slug === 'font-awesome') return '/icon-search?lib=iconify&iconifySet=fa6-solid'
  return '/icon-search'
}

function canCompareResults(first: string, second: string): boolean {
  return namedLibrarySlugs.has(first) && namedLibrarySlugs.has(second)
}

function getResult(answers: Answers): Result {
  const { framework, ui_library, style, volume, project, tailwind, priority } = answers

  // ─── MUI users → Material Icons (highest priority signal) ────────────────
  if (ui_library === 'mui') {
    return {
      primary: {
        slug: 'material-icons',
        name: 'Material Icons',
        reason: 'You are already using MUI (@mui/material). Material Icons is the natural choice — the peer dependencies (@mui/material, @emotion/styled, @emotion/react) are already installed so you pay zero additional bundle cost. The icons accept the sx prop, theme color tokens (primary.main, error, warning), and fontSize props that align with MUI\'s spacing scale perfectly. No other library integrates this natively.',
        installCommand: 'npm install @mui/icons-material',
        tags: ['Native MUI integration', '5 style variants', 'TypeScript', 'MIT License'],
      },
      secondary: {
        slug: 'lucide-icons',
        name: 'Lucide Icons',
        reason: 'If you need icons that fall outside Material Icons\' 2,100-icon set, Lucide React works alongside @mui/icons-material — just use path imports for MUI icons and named imports for Lucide. The aesthetic difference is noticeable but workable.',
      },
      summary: 'You are on MUI — Material Icons is the only correct answer. The peer dependencies are already paid for.',
    }
  }

  // ─── shadcn/ui users → Lucide (it's the shadcn default) ──────────────────
  if (ui_library === 'shadcn') {
    return {
      primary: {
        slug: 'lucide-icons',
        name: 'Lucide Icons',
        reason: 'shadcn/ui uses Lucide Icons as its default icon library — every component you add via npx shadcn add already imports from lucide-react. Staying with Lucide keeps your project coherent, eliminates a parallel icon system, and avoids the visual inconsistency of mixing two design languages across generated and custom components.',
        installCommand: 'npm install lucide-react',
        tags: ['shadcn/ui default', 'TypeScript', 'Tree-shakable', 'ISC License'],
      },
      secondary: {
        slug: 'radix-icons',
        name: 'Radix Icons',
        reason: 'Radix Icons are the companion icons used in Radix UI primitives — 15x15px, designed specifically for dense component UIs. Use them alongside Lucide for Radix-specific UI components only.',
      },
      tertiary: {
        slug: 'iconoir',
        name: 'Iconoir',
        reason: 'If you want a premium line-art alternative to Lucide with a slightly more polished aesthetic, Iconoir offers 1,500+ icons with the same outline focus and MIT license.',
      },
      summary: 'shadcn/ui ships with Lucide Icons. Staying on Lucide keeps your project coherent and avoids a parallel icon system.',
      warning: 'Do not add @mui/icons-material or react-icons to a shadcn project — the bundle cost and visual inconsistency outweigh the benefits.',
    }
  }

  // ─── Tailwind UI users → Heroicons ───────────────────────────────────────
  if (ui_library === 'tailwindui' || (tailwind === 'yes' && (style === 'outline' || style === 'both' || style === 'any') && volume !== 'large')) {
    return {
      primary: {
        slug: 'heroicons',
        name: 'Heroicons',
        reason: 'Heroicons is made by the exact same team that makes Tailwind CSS and Tailwind UI. The design language matches perfectly, every icon works with className and Tailwind utility classes, and Tailwind UI components already use Heroicons internally. This is the most natural pairing in the React ecosystem — zero friction, perfect visual consistency.',
        installCommand: 'npm install @heroicons/react',
        tags: ['Made by Tailwind team', 'TypeScript', 'Tree-shakable', 'MIT License'],
      },
      secondary: {
        slug: 'lucide-icons',
        name: 'Lucide Icons',
        reason: 'If you need more than Heroicons\' 292 icons, Lucide Icons is the best Tailwind-compatible alternative — same className API, 1,500+ icons, and a visual style close enough to Heroicons that mixing them rarely looks jarring.',
      },
      summary: 'Tailwind CSS + Heroicons is the most natural pairing in the React ecosystem. The same team built both.',
    }
  }

  // ─── Brand/social icons priority → Font Awesome ──────────────────────────
  if (priority === 'brand' || project === 'marketing' || project === 'ecommerce') {
    return {
      primary: {
        slug: 'font-awesome',
        name: 'Font Awesome',
        reason: `${priority === 'brand' ? 'You specifically need brand and social media icons.' : `${project === 'marketing' ? 'Marketing' : 'Ecommerce'} sites almost always need brand logos and social icons.`} Font Awesome is the only major free library that includes 400+ brand icons (GitHub, Twitter, Instagram, LinkedIn, Stripe, Apple Pay, and more) via its free-brands-svg-icons package. No other free library comes close for brand coverage. The icons are recognized by billions of users across the web.`,
        installCommand: 'npm install @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/free-brands-svg-icons @fortawesome/react-fontawesome',
        tags: ['400+ brand icons', '2,058 free icons', 'TypeScript', 'MIT code / CC BY 4.0 icons'],
      },
      secondary: {
        slug: 'lucide-icons',
        name: 'Lucide Icons',
        reason: 'If your project does not need brand or social logos, Lucide Icons is a dramatically simpler alternative — single package, 5KB for 50 icons vs Font Awesome\'s 81KB, and a cleaner modern aesthetic with zero attribution considerations.',
      },
      summary: `For ${project === 'ecommerce' ? 'ecommerce' : project === 'marketing' ? 'marketing' : 'brand-icon-heavy'} projects, Font Awesome is the only free library with comprehensive brand and social media logo coverage.`,
    }
  }

  // ─── Duotone style → Phosphor ────────────────────────────────────────────
  if (style === 'duotone') {
    return {
      primary: {
        slug: 'phosphor-icons',
        name: 'Phosphor Icons',
        reason: 'You need duotone icons. Phosphor Icons is the only major free icon library that offers duotone as a built-in weight variant alongside thin, light, regular, bold, and fill — 9,000+ icons across all 6 weights. Every icon has a duotone version automatically. No other free library supports this natively.',
        installCommand: 'npm install @phosphor-icons/react',
        tags: ['6 weight variants', 'Duotone included', 'TypeScript', 'MIT License'],
      },
      secondary: {
        slug: 'font-awesome',
        name: 'Font Awesome Pro',
        reason: 'Font Awesome Pro also offers duotone icons alongside 9 other styles. The better choice if you are open to the $120/year paid plan and need brand icons alongside duotone.',
      },
      summary: 'For duotone icons, Phosphor is the only major free option. 9,000+ icons, 6 weight variants, zero cost.',
    }
  }

  // ─── Svelte → Lucide Svelte ───────────────────────────────────────────────
  if (framework === 'svelte') {
    return {
      primary: {
        slug: 'lucide-icons',
        name: 'Lucide Icons',
        reason: 'For Svelte and SvelteKit, lucide-svelte is the gold standard. It is the only major icon library with a dedicated, actively maintained official Svelte package — full TypeScript support, tree-shaking, and the same 1,500+ icons as the React version. Install lucide-svelte, not lucide-react.',
        installCommand: 'npm install lucide-svelte',
        tags: ['Official Svelte package', 'TypeScript', 'Tree-shakable', 'ISC License'],
      },
      secondary: {
        slug: 'tabler-icons',
        name: 'Tabler Icons',
        reason: 'Tabler Icons also has an official Svelte package with 5,900+ icons — the right choice if lucide-svelte\'s 1,500 icons don\'t cover your niche needs.',
      },
      summary: 'Lucide Svelte is the community standard for icon libraries in the Svelte ecosystem.',
    }
  }

  // ─── Vue → Lucide Vue Next ────────────────────────────────────────────────
  if (framework === 'vue') {
    return {
      primary: {
        slug: 'lucide-icons',
        name: 'Lucide Icons',
        reason: 'For Vue 3 and Nuxt, lucide-vue-next is the top recommendation. Official package, full TypeScript support, tree-shaking, and active maintenance. Import icons as components: <Home :size="24" />. The most natural icon API in the Vue ecosystem.',
        installCommand: 'npm install lucide-vue-next',
        tags: ['Official Vue package', 'TypeScript', 'Tree-shakable', 'ISC License'],
      },
      secondary: {
        slug: 'tabler-icons',
        name: 'Tabler Icons',
        reason: 'For Vue projects that need 5,900+ icons, Tabler Icons Vue is the best alternative. MIT licensed, official package, scales linearly in bundle size.',
      },
      summary: 'Lucide Vue Next is the most popular and well-maintained icon library for Vue 3.',
    }
  }

  // ─── Vanilla HTML → Bootstrap Icons ──────────────────────────────────────
  if (framework === 'vanilla') {
    return {
      primary: {
        slug: 'bootstrap-icons',
        name: 'Bootstrap Icons',
        reason: 'For vanilla HTML and CSS projects, Bootstrap Icons is the most practical choice. Use the CSS font approach — one stylesheet import, then class names directly in HTML. No build step, no JavaScript bundle, no npm required. Works in any CMS, static site, or plain HTML file.',
        installCommand: 'npm install bootstrap-icons',
        tags: ['CSS font approach', '2,000+ icons', 'Outline + Filled', 'MIT License'],
      },
      secondary: {
        slug: 'font-awesome',
        name: 'Font Awesome',
        reason: 'Font Awesome also works in vanilla HTML via its free CDN Kit — paste one script tag and use class names. The best choice for vanilla projects that also need brand and social media icons.',
      },
      summary: 'For vanilla HTML projects, CSS icon fonts work better than SVG component libraries. Both Bootstrap Icons and Font Awesome support CDN delivery.',
    }
  }

  // ─── Enterprise / Internal tools → Material Icons or Lucide ──────────────
  if (project === 'enterprise') {
    return {
      primary: {
        slug: 'material-icons',
        name: 'Material Icons',
        reason: 'Enterprise and internal tools benefit from Google\'s Material Design visual language — it is the most widely recognized icon system among business users globally. Material Icons provides 2,100+ icons across 5 style variants (Filled, Outlined, Rounded, Sharp, TwoTone), 98K GitHub stars, and 5.1M weekly downloads. The design reads as professional, trustworthy, and familiar to non-technical stakeholders.',
        installCommand: 'npm install @mui/icons-material @mui/material @emotion/styled @emotion/react',
        tags: ['Google Material Design', '5 style variants', '5.1M weekly downloads', 'MIT License'],
      },
      secondary: {
        slug: 'lucide-icons',
        name: 'Lucide Icons',
        reason: 'If your enterprise product is not on MUI and the ~300KB peer dependency overhead is a concern, Lucide Icons delivers a clean professional aesthetic with zero peer deps and the best TypeScript experience available.',
      },
      summary: 'For enterprise and internal tools, Material Icons\' recognized Google aesthetic and 5-style system is the strongest choice — especially on MUI.',
      warning: 'Material Icons requires @mui/material as a peer dependency. If you are not already on MUI, Lucide Icons avoids this overhead entirely.',
    }
  }

  // ─── Mobile / PWA → Lucide or Phosphor ───────────────────────────────────
  if (project === 'mobile') {
    return {
      primary: {
        slug: 'lucide-icons',
        name: 'Lucide Icons',
        reason: 'For mobile web and PWAs, bundle size directly affects load time on slow connections — and Lucide delivers ~5KB gzip for 50 icons with full tree-shaking. The clean stroke-based design scales well at both touch-target sizes (44px+) and dense informational sizes. Works in Server Components for zero runtime JS on static sections.',
        installCommand: 'npm install lucide-react',
        tags: ['~5KB for 50 icons', 'Server Components', 'TypeScript', 'ISC License'],
      },
      secondary: {
        slug: 'phosphor-icons',
        name: 'Phosphor Icons',
        reason: 'If your mobile app is consumer-facing and needs a warmer, more expressive visual style, Phosphor\'s fill and duotone variants add personality that Lucide\'s minimal strokes do not provide. Higher bundle cost (~34KB for 50 icons) but justified for consumer apps.',
      },
      tertiary: {
        slug: 'iconoir',
        name: 'Iconoir',
        reason: 'Iconoir is another lightweight line-icon option with React Native support — great if your team also builds native mobile apps alongside the PWA.',
      },
      summary: 'For mobile web and PWAs, Lucide\'s minimal bundle footprint and clean aesthetic is the performance-safe choice.',
    }
  }

  // ─── Large volume → Tabler ────────────────────────────────────────────────
  if (volume === 'large') {
    return {
      primary: {
        slug: 'tabler-icons',
        name: 'Tabler Icons',
        reason: 'You need 1,500+ icons. Tabler Icons is the clear winner with 5,900+ MIT icons — the largest free icon library available. It covers every common UI pattern plus specialized icons for medicine, finance, weather, technology, sports, food, and more. Both outline and filled variants are available. Bundle size scales linearly like Lucide.',
        installCommand: 'npm install @tabler/icons-react',
        tags: ['5,900+ icons', 'Outline + Filled', 'TypeScript', 'MIT License'],
      },
      secondary: {
        slug: 'react-icons',
        name: 'React Icons',
        reason: 'If you need icons from multiple design families — or specifically need Font Awesome, Material Design, and UI icons in one project — React Icons bundles 40,000+ icons from 25+ sets. Better choice when variety across design languages matters more than visual consistency.',
      },
      summary: 'When icon volume is the priority, Tabler Icons is unmatched in the free tier at 5,900+ MIT icons.',
    }
  }

  // ─── Developer tool / Docs → Lucide ──────────────────────────────────────
  if (project === 'devtool') {
    return {
      primary: {
        slug: 'lucide-icons',
        name: 'Lucide Icons',
        reason: 'Developer tools need precise, monochrome icons that communicate technical concepts without decoration. Lucide Icons is the community standard for developer-facing React applications in 2026 — used in Linear, Vercel\'s dashboard, Raycast, and thousands of developer tools. Its minimal aesthetic matches what a technical audience expects and trusts.',
        installCommand: 'npm install lucide-react',
        tags: ['Community standard', 'TypeScript', 'Tree-shakable', 'ISC License'],
      },
      secondary: {
        slug: 'radix-icons',
        name: 'Radix Icons',
        reason: 'For dense technical UIs like code editors, toolbars, and IDE-style panels, Radix Icons at 15x15px are specifically designed for high-density developer interfaces. Use alongside Lucide — Radix for tight UI components, Lucide for everything else.',
      },
      tertiary: {
        slug: 'iconoir',
        name: 'Iconoir',
        reason: 'Iconoir\'s premium line-art aesthetic works beautifully in developer tools and docs. Consider it if you find Lucide too ubiquitous and want a more distinctive visual identity.',
      },
      summary: 'Lucide Icons is the default for developer tools in the React ecosystem.',
    }
  }

  // ─── Bundle size priority + small/medium volume → Heroicons ──────────────
  if (priority === 'bundle' && volume !== 'large') {
    return {
      primary: {
        slug: 'heroicons',
        name: 'Heroicons',
        reason: 'Bundle size is your priority. Heroicons delivers the smallest per-icon bundle of any library — ~0.7KB gzip per icon with perfect tree-shaking. At small to medium icon counts (under 300), Heroicons\' 292 carefully crafted icons likely cover your entire UI. If you are on Tailwind, this is also the natural pairing.',
        installCommand: 'npm install @heroicons/react',
        tags: ['Smallest bundle', '~0.7KB per icon', 'TypeScript', 'MIT License'],
      },
      secondary: {
        slug: 'lucide-icons',
        name: 'Lucide Icons',
        reason: 'If Heroicons\' 292 icons don\'t cover your needs, Lucide is the next-best option for bundle size — ~5KB for 50 icons with full ESM tree-shaking.',
      },
      summary: 'For maximum bundle efficiency, Heroicons delivers the smallest footprint of any free icon library.',
    }
  }

  // ─── Filled style only → Tabler ──────────────────────────────────────────
  if (style === 'filled') {
    return {
      primary: {
        slug: 'tabler-icons',
        name: 'Tabler Icons',
        reason: 'You specifically need filled icons. Tabler Icons offers both outline and filled variants for most of its 5,900+ icons — more filled icons than any other free library. Filled variants are named consistently with their outline counterparts, making it simple to switch between states (e.g., HomeIcon → HomeFilled for active states).',
        installCommand: 'npm install @tabler/icons-react',
        tags: ['Outline + Filled', '5,900+ icons', 'TypeScript', 'MIT License'],
      },
      secondary: {
        slug: 'phosphor-icons',
        name: 'Phosphor Icons',
        reason: 'Phosphor Icons also has a fill weight alongside 5 other styles. Its duotone variant is unique if you want to go beyond standard filled icons, and the 9,000-icon count exceeds Tabler.',
      },
      summary: 'For filled icon styles, Tabler Icons has the largest free selection with consistent outline/filled pairing.',
    }
  }

  // ─── Personal / Portfolio → React Icons ──────────────────────────────────
  if (project === 'personal') {
    return {
      primary: {
        slug: 'react-icons',
        name: 'React Icons',
        reason: 'For personal projects and portfolios, React Icons is the fastest way to get started. One package install gives you 40,000+ icons from 25+ libraries — Font Awesome, Material Design, Heroicons, Feather, Bootstrap Icons, and more — all with one unified API and one import style. You never have to switch packages when you cannot find the icon you need.',
        installCommand: 'npm install react-icons',
        tags: ['40,000+ icons', '25+ icon sets', 'TypeScript', 'MIT License'],
      },
      secondary: {
        slug: 'lucide-icons',
        name: 'Lucide Icons',
        reason: 'If you prefer a single focused library with a consistent visual style, Lucide Icons is the cleanest choice for personal projects — 1,500+ well-crafted icons, a modern aesthetic, and the best TypeScript experience.',
      },
      summary: 'For personal projects and portfolios, React Icons gives you maximum variety with minimum setup — one install, 40,000+ icons.',
    }
  }

  // ─── TypeScript DX priority + medium volume → Lucide ─────────────────────
  if ((priority === 'dx' || priority === 'consistency') && volume !== 'large') {
    return {
      primary: {
        slug: 'lucide-icons',
        name: 'Lucide Icons',
        reason: priority === 'dx'
          ? 'You want the best developer experience. Lucide has first-class TypeScript definitions — type any icon name in VS Code and it appears instantly with full autocomplete. The LucideIcon type makes prop-typing icon slots in your component API completely clean. It is the best overall TypeScript icon experience in the free tier.'
          : 'Visual consistency is your priority. Lucide Icons is designed as a single cohesive system — one stroke weight, one grid, one design language for all 1,500+ icons. Every icon was reviewed against the same guidelines. No library delivers more visual consistency at this icon count.',
        installCommand: 'npm install lucide-react',
        tags: [priority === 'dx' ? 'Best TypeScript DX' : 'Single design system', 'Tree-shakable', '1,500+ icons', 'ISC License'],
      },
      secondary: {
        slug: 'iconoir',
        name: 'Iconoir',
        reason: priority === 'dx'
          ? 'Iconoir also has excellent TypeScript definitions and a clean API. Its premium line-art aesthetic is slightly more refined than Lucide — consider it if visual polish matters alongside DX.'
          : 'Iconoir rivals Lucide for visual consistency — every icon shares a unified stroke weight and grid. Its premium line-art aesthetic is arguably more polished, though the icon count (1,500) is comparable.',
      },
      tertiary: {
        slug: 'heroicons',
        name: 'Heroicons',
        reason: 'If you are on Tailwind CSS, Heroicons offers the same TypeScript and design consistency quality with tighter Tailwind integration — at 292 icons.',
      },
      summary: priority === 'dx'
        ? 'For TypeScript-first projects with standard icon needs, Lucide Icons has the best developer experience available.'
        : 'For visual consistency above all else, Lucide\'s single-system design approach is unmatched in the free tier.',
    }
  }

  // ─── SaaS / Dashboard with outline style → Iconoir as strong candidate ───
  if (project === 'saas' && (style === 'outline' || style === 'any') && volume === 'medium') {
    return {
      primary: {
        slug: 'lucide-icons',
        name: 'Lucide Icons',
        reason: 'Based on your answers, Lucide Icons is the best all-around choice for SaaS dashboards. It is the most popular free icon library for React and Next.js in 2026 — 1,500+ icons, full TypeScript support, ~5KB for 50 icons, works in Server Components, ISC license with zero attribution required, and active maintenance.',
        installCommand: 'npm install lucide-react',
        tags: ['Most popular in 2026', 'TypeScript', 'Tree-shakable', 'ISC License'],
      },
      secondary: {
        slug: 'iconoir',
        name: 'Iconoir',
        reason: 'Iconoir is one of the best Lucide alternatives for SaaS dashboards. It offers 1,500+ premium line icons with an incredibly consistent, polished aesthetic that rivals paid libraries. Excellent TypeScript support and customizable stroke widths via props.',
      },
      tertiary: {
        slug: 'tabler-icons',
        name: 'Tabler Icons',
        reason: 'If your dashboard needs niche or specialized icons beyond 1,500, Tabler Icons has 5,900+ icons covering medicine, finance, weather, and more.',
      },
      summary: 'For SaaS dashboards, Lucide or Iconoir deliver the cleanest modern aesthetic. Both are premium-quality and MIT licensed.',
    }
  }

  // ─── Default → Lucide ─────────────────────────────────────────────────────
  return {
    primary: {
      slug: 'lucide-icons',
      name: 'Lucide Icons',
      reason: 'Based on your answers, Lucide Icons is the best all-around choice. It is the most popular free icon library for React and Next.js in 2026 — 1,500+ icons, full TypeScript support, ~5KB for 50 icons, works in Server Components, ISC license with zero attribution required, and active maintenance. It hits the sweet spot between icon count, design quality, bundle size, and developer experience. When in doubt, Lucide is the safe default.',
      installCommand: 'npm install lucide-react',
      tags: ['Most popular in 2026', 'TypeScript', 'Tree-shakable', 'ISC License'],
    },
    secondary: {
      slug: 'tabler-icons',
      name: 'Tabler Icons',
      reason: 'If you find Lucide\'s 1,500 icons don\'t cover your niche — Tabler Icons extends the same stroke-based aesthetic to 5,900+ MIT-licensed icons. Bundle size scales linearly with the same ESM tree-shaking.',
    },
    tertiary: {
      slug: 'iconoir',
      name: 'Iconoir',
      reason: 'Iconoir is a premium-quality Lucide alternative with 1,500+ line icons, customizable stroke widths, and wide framework support including React Native and Flutter.',
    },
    summary: 'For most React and Next.js projects in 2026, Lucide Icons is the safe default recommendation.',
  }
}

const questionLabels: Record<string, Record<string, string>> = {
  framework: { react: 'React', nextjs: 'Next.js', vue: 'Vue 3', svelte: 'Svelte', vanilla: 'Vanilla HTML', unsure: 'Not sure' },
  ui_library: { mui: 'MUI', shadcn: 'shadcn/ui', tailwindui: 'Tailwind UI', antd: 'Ant Design', none: 'None', unsure: 'Not decided' },
  style: { outline: 'Outline', filled: 'Filled', both: 'Both styles', duotone: 'Duotone', any: 'No preference' },
  volume: { small: '<300 icons', medium: '300–1,500', large: '1,500+' },
  project: { saas: 'SaaS / Dashboard', marketing: 'Marketing', mobile: 'Mobile / PWA', devtool: 'Dev tool', ecommerce: 'Ecommerce', enterprise: 'Enterprise', personal: 'Personal' },
  tailwind: { yes: 'Tailwind: Yes', no: 'Tailwind: No' },
  priority: { bundle: 'Bundle size', variety: 'Icon variety', consistency: 'Visual consistency', dx: 'Dev experience', brand: 'Brand icons' },
}

export default function BestForYouPage() {
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [result, setResult] = useState<Result | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  const progress = ((currentQ) / questions.length) * 100

  function handleSelect(value: string) {
    setSelected(value)
  }

  function handleNext() {
    if (!selected) return
    const newAnswers = { ...answers, [questions[currentQ].id]: selected }
    setAnswers(newAnswers)
    setSelected(null)

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      setResult(getResult(newAnswers))
    }
  }

  function handleBack() {
    if (currentQ > 0) {
      const prevQ = currentQ - 1
      setCurrentQ(prevQ)
      setSelected(answers[questions[prevQ].id] || null)
    }
  }

  function handleRestart() {
    setCurrentQ(0)
    setAnswers({})
    setResult(null)
    setSelected(null)
  }

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>

      {/* Header */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
          // SELECTOR TOOL
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px' }}>
          Find Your<br />
          <span style={{ color: 'var(--accent)' }}>Perfect Icon Library</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '500px' }}>
          Answer 7 quick questions and get a personalized recommendation based on your exact stack, style, and project type.
        </p>
      </section>

      {!result ? (
        <div style={{ maxWidth: '720px' }}>

          {/* Progress bar */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                Question {currentQ + 1} of {questions.length}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>
                {Math.round(progress)}% complete
              </span>
            </div>
            <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                background: 'var(--accent)',
                borderRadius: '2px',
                width: `${progress}%`,
                transition: 'width 0.3s ease',
              }} />
            </div>
            {/* Step dots */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
              {questions.map((_, i) => (
                <div key={i} style={{
                  width: i === currentQ ? '20px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: i < currentQ ? 'var(--accent)' : i === currentQ ? 'var(--accent)' : 'var(--border)',
                  transition: 'all 0.3s ease',
                  opacity: i < currentQ ? 0.5 : 1,
                }} />
              ))}
            </div>
          </div>

          {/* Question */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', lineHeight: 1.3 }}>
              {questions[currentQ].question}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
              {questions[currentQ].subtitle}
            </p>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
            {questions[currentQ].options.map(option => (
              <button suppressHydrationWarning
                key={option.value}
                onClick={() => handleSelect(option.value)}
                style={{
                  background: selected === option.value ? 'var(--accent-dim)' : 'var(--bg-card)',
                  border: `1px solid ${selected === option.value ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '10px',
                  padding: '14px 18px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.15s',
                  width: '100%',
                }}
              >
                <div>
                  <div style={{
                    fontWeight: 600,
                    fontSize: '14px',
                    color: selected === option.value ? 'var(--accent)' : 'var(--text)',
                    marginBottom: '2px',
                  }}>
                    {option.label}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {option.desc}
                  </div>
                </div>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: `2px solid ${selected === option.value ? 'var(--accent)' : 'var(--border)'}`,
                  background: selected === option.value ? 'var(--accent)' : 'transparent',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '16px',
                  transition: 'all 0.15s',
                }}>
                  {selected === option.value && (
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'white' }} />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {currentQ > 0 && (
              <button suppressHydrationWarning
                onClick={handleBack}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '13px',
                }}
              >
                ← Back
              </button>
            )}
            <button suppressHydrationWarning
              onClick={handleNext}
              disabled={!selected}
              style={{
                background: selected ? 'var(--accent)' : 'var(--bg-card)',
                border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                color: selected ? 'white' : 'var(--text-dim)',
                padding: '12px 32px',
                borderRadius: '8px',
                cursor: selected ? 'pointer' : 'not-allowed',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '13px',
                fontWeight: 600,
                transition: 'all 0.15s',
                opacity: selected ? 1 : 0.5,
              }}
            >
              {currentQ < questions.length - 1 ? 'Next Question →' : 'Get My Recommendation →'}
            </button>
          </div>

        </div>
      ) : (
        <div style={{ maxWidth: '800px' }}>

          {/* Result summary banner */}
          <div style={{
            background: 'var(--accent-dim)',
            border: '1px solid var(--accent)',
            borderRadius: '12px',
            padding: '20px 24px',
            marginBottom: '24px',
          }}>
            <div style={{ fontSize: '11px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '8px' }}>
              // YOUR RESULT
            </div>
            <p style={{ color: 'var(--text)', fontSize: '16px', lineHeight: 1.7, margin: 0 }}>
              {result.summary}
            </p>
          </div>

          {/* Warning banner (if present) */}
          {result.warning && (
            <div style={{
              background: '#f59e0b10',
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              padding: '14px 18px',
              marginBottom: '24px',
              fontSize: '13px',
              color: '#f59e0b',
              fontFamily: 'JetBrains Mono, monospace',
              lineHeight: 1.6,
            }}>
              ⚠ {result.warning}
            </div>
          )}

          {/* Primary recommendation */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--accent)',
            borderRadius: '12px',
            padding: '32px',
            marginBottom: '16px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--accent)',
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '2px',
                  marginBottom: '8px',
                }}>
                  ★ PRIMARY RECOMMENDATION
                </div>
                <h2 style={{ fontSize: '32px', fontWeight: 800, margin: 0 }}>{result.primary.name}</h2>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {result.primary.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: '11px',
                    color: 'var(--green)',
                    background: '#4ade8015',
                    border: '1px solid var(--green)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontFamily: 'JetBrains Mono, monospace',
                    whiteSpace: 'nowrap',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8, marginBottom: '24px' }}>
              {result.primary.reason}
            </p>

            <pre style={{
              background: 'var(--code-bg)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '14px 18px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px',
              color: 'var(--green)',
              marginBottom: '20px',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}>
              {result.primary.installCommand}
            </pre>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link
                href={getResultHref(result.primary.slug)}
                style={{
                  background: 'var(--accent)',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 600,
                }}
              >
                {namedLibrarySlugs.has(result.primary.slug) ? 'Full Guide →' : 'Explore Icons →'}
              </Link>
              {result.secondary && canCompareResults(result.primary.slug, result.secondary.slug) && (
                <Link
                  href={`/compare/${result.primary.slug}-vs-${result.secondary.slug}`}
                  style={{
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  Compare with runner-up →
                </Link>
              )}
            </div>
          </div>

          {/* Secondary recommendation */}
          {result.secondary && (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: result.tertiary ? '12px' : '32px',
            }}>
              <div style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '2px',
                marginBottom: '10px',
              }}>
                RUNNER UP
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>{result.secondary.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7, marginBottom: '14px' }}>
                {result.secondary.reason}
              </p>
              <Link
                href={getResultHref(result.secondary.slug)}
                style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}
              >
                {namedLibrarySlugs.has(result.secondary.slug) ? `View ${result.secondary.name} guide →` : `Explore ${result.secondary.name} →`}
              </Link>
            </div>
          )}

          {/* Tertiary recommendation */}
          {result.tertiary && (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px',
            }}>
              <div style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '2px',
                marginBottom: '10px',
              }}>
                ALSO CONSIDER
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>{result.tertiary.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7, marginBottom: '14px' }}>
                {result.tertiary.reason}
              </p>
              <Link
                href={getResultHref(result.tertiary.slug)}
                style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}
              >
                {namedLibrarySlugs.has(result.tertiary.slug) ? `View ${result.tertiary.name} guide →` : `Explore ${result.tertiary.name} →`}
              </Link>
            </div>
          )}

          {/* Your answers summary */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '20px 24px',
            marginBottom: '32px',
          }}>
            <div style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '2px',
              marginBottom: '14px',
            }}>
              YOUR ANSWERS
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Object.entries(answers).map(([key, value]) => (
                <span key={key} style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {questionLabels[key]?.[value] ?? value}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button suppressHydrationWarning
              onClick={handleRestart}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '13px',
              }}
            >
              ← Start Over
            </button>
            <Link
              href="/compare"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '13px',
              }}
            >
              Browse all comparisons →
            </Link>
            <Link
              href="/stats"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '13px',
              }}
            >
              View stats & rankings →
            </Link>
          </div>

        </div>
      )}

    </main>
  )
}
