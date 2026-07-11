---
title: "Next.js 16 Icons Guide: React 19.2, Server Components, Turbopack and SVG Performance"
description: "The complete 2026 guide to using icons in Next.js 16. Covers React 19.2, Server Components, Turbopack, SVG sprites, icon imports, next/font, accessibility, bundle size, and SEO-friendly implementation patterns."
date: "2026-07-02"
author: "IconSearch Team"
category: "Performance"
tags: ["nextjs 16", "react 19.2", "server components", "turbopack", "svg icons", "lucide", "performance", "seo", "2026"]
featured: true
---

Next.js 16 changed how serious teams should think about icons. The old advice was simple: install an icon library, use named imports, and let tree-shaking handle the rest. That is still partly true, but it is no longer enough.

In 2026 a modern Next.js app is built around React Server Components, Turbopack, async route APIs, streaming metadata, React 19.2, stable React Compiler support, and increasingly AI-generated UI code. Icons sit inside every one of those systems. A search icon in a Server Component has a different performance profile from a search icon in a Client Component. An SVG sprite loaded in `layout.tsx` has a different tradeoff from `lucide-react` imports. An icon font has different Core Web Vitals risk from inline SVG. A dynamic icon picker behaves differently from a static navigation icon.

This guide is written for developers searching for:

- Next.js 16 icons
- Next.js SVG icons
- React Server Components icons
- lucide-react Next.js 16
- Turbopack icon tree-shaking
- SVG icons vs icon fonts in Next.js
- Next.js icon bundle size
- React 19.2 icon performance
- shadcn/ui icons Next.js
- accessible icons in Next.js

The short answer: for most Next.js 16 apps, use **Lucide Icons with direct named imports**, render static icons in **Server Components**, keep icon-only controls accessible, avoid icon fonts for app UI, and measure production builds rather than development bundles.

For finding exact icon names, use [IconSearch](/icon-search). For choosing a library, start with [Lucide Icons](/icons/lucide-icons), then compare [Tabler Icons](/icons/tabler-icons), [Heroicons](/icons/heroicons), and [Phosphor Icons](/icons/phosphor-icons).

## What Changed in Next.js 16

Next.js 16 matters for icons because the framework's defaults moved forward:

| Next.js 16 change | Why it matters for icons |
|---|---|
| Turbopack is the default bundler for `next dev` and `next build` | Icon tree-shaking and package shape matter more because Turbopack sees your imports directly |
| React 19.2 is part of the App Router stack | Server rendering, Suspense behavior, Activity, and performance tracks affect icon-heavy UI shells |
| React Compiler support is stable | Memoization can reduce repeated Client Component work around interactive icon controls |
| Async request APIs are fully enforced | Dynamic metadata and route params around generated icon pages must use `await params` |
| `next/image` defaults changed | Raster icon assets, app icons, thumbnails, and SVG previews need safer image configuration |
| `next lint` is removed | Use ESLint directly, including icon accessibility and import rules |
| Build output changed | Do not rely on old "First Load JS" summaries alone; measure with Lighthouse and bundle analyzers |

This does not mean icons are harder now. It means the best icon architecture is more specific.

## The Best Default Setup

For a new Next.js 16 app, this is the default icon stack we recommend:

| Need | Recommendation |
|---|---|
| General UI icons | `lucide-react` |
| shadcn/ui icons | `lucide-react` |
| Tailwind icons | SVG components using `className`, `currentColor`, `h-4 w-4` |
| Huge icon variety | `@tabler/icons-react` |
| Multiple weights or duotone | `@phosphor-icons/react` |
| Brand logos | Simple Icons, Devicons, or official brand SVGs |
| Tiny dense controls | Radix Icons or Lucide at `h-3.5 w-3.5` |
| Dynamic icon search UI | Server-rendered icon data plus static SVG URLs |
| Marketing pages | Server Components with inline SVG icon components |
| App icons and favicons | Next.js metadata file conventions |

Install Lucide:

```bash
npm install lucide-react
```

Use named imports:

```tsx
import { Search, Settings, User } from 'lucide-react'

export function Toolbar() {
  return (
    <div className="flex items-center gap-2">
      <Search className="h-4 w-4" aria-hidden="true" focusable="false" />
      <Settings className="h-4 w-4" aria-hidden="true" focusable="false" />
      <User className="h-4 w-4" aria-hidden="true" focusable="false" />
    </div>
  )
}
```

Do not use namespace imports:

```tsx
import * as Icons from 'lucide-react'

const Icon = Icons[iconName]
```

That pattern is convenient for icon pickers, but it usually forces the bundler to keep far more icon code than the route needs.

## Server Components Are the Biggest Icon Optimization

The most important Next.js App Router rule is simple: **static icons belong in Server Components**.

When an icon renders in a Server Component, the browser receives SVG markup in the HTML. It does not need the React component code for that icon in the client bundle.

```tsx
// app/components/AppNav.tsx
// No "use client" directive.
import Link from 'next/link'
import { Home, Search, Settings } from 'lucide-react'

export function AppNav() {
  return (
    <nav>
      <Link href="/" className="flex items-center gap-2">
        <Home className="h-4 w-4" aria-hidden="true" focusable="false" />
        Home
      </Link>
      <Link href="/icon-search" className="flex items-center gap-2">
        <Search className="h-4 w-4" aria-hidden="true" focusable="false" />
        Search
      </Link>
      <Link href="/account" className="flex items-center gap-2">
        <Settings className="h-4 w-4" aria-hidden="true" focusable="false" />
        Settings
      </Link>
    </nav>
  )
}
```

Good Server Component icon candidates:

- Sidebar navigation icons
- Header links
- Footer icons
- Static feature icons
- Pricing table icons
- Blog post illustrations made from SVG components
- Status badges known at render time
- Category and collection icons
- SEO landing page icons

Client Components should be reserved for icons whose parent needs browser-only behavior:

- Icon buttons that open menus
- Drag and drop toolbars
- Animated hover tools controlled by state
- Realtime upload or sync indicators
- Theme toggles
- Icon pickers with search state
- Customization panels

The icon itself is rarely the reason a component needs `"use client"`. State, effects, event handlers, and browser APIs are the usual reasons.

## The Client Boundary Mistake

A common performance mistake is putting the entire layout behind a Client Component because one small icon button is interactive.

Bad:

```tsx
'use client'

import { Home, Search, Settings, Menu } from 'lucide-react'

export function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <aside>
      <button onClick={() => setOpen(!open)}>
        <Menu className="h-4 w-4" />
      </button>
      <Home className="h-4 w-4" />
      <Search className="h-4 w-4" />
      <Settings className="h-4 w-4" />
    </aside>
  )
}
```

Better:

```tsx
// app/components/Sidebar.tsx
import { Home, Search, Settings } from 'lucide-react'
import { MobileMenuButton } from './MobileMenuButton'

export function Sidebar() {
  return (
    <aside>
      <MobileMenuButton />
      <Home className="h-4 w-4" aria-hidden="true" focusable="false" />
      <Search className="h-4 w-4" aria-hidden="true" focusable="false" />
      <Settings className="h-4 w-4" aria-hidden="true" focusable="false" />
    </aside>
  )
}
```

```tsx
// app/components/MobileMenuButton.tsx
'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'

export function MobileMenuButton() {
  const [open, setOpen] = useState(false)

  return (
    <button aria-label="Toggle navigation" onClick={() => setOpen(!open)}>
      <Menu className="h-4 w-4" aria-hidden="true" focusable="false" />
    </button>
  )
}
```

This keeps the static navigation icons server-rendered and moves only the interactive button into the client bundle.

## Turbopack and Icon Imports

Next.js 16 uses Turbopack by default for both development and production builds. That changes how teams experience icon performance.

Turbopack is fast, but it cannot rescue bad import architecture. If you import a giant icon barrel or dynamically index into a whole library object, the bundler has to preserve that possibility.

Use these import patterns:

| Library | Recommended import |
|---|---|
| Lucide | `import { Search } from 'lucide-react'` |
| Heroicons | `import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'` |
| Tabler | `import { IconSearch } from '@tabler/icons-react'` |
| Phosphor | `import { MagnifyingGlass } from '@phosphor-icons/react'` |
| Radix | `import { MagnifyingGlassIcon } from '@radix-ui/react-icons'` |
| React Icons | Prefer `@react-icons/all-files` for performance-sensitive apps |
| Iconify | Use static icon IDs or prebuilt offline bundles for critical UI |

Avoid these patterns:

```tsx
import * as Lucide from 'lucide-react'
import * as Tabler from '@tabler/icons-react'
import { HomeIcon } from '@heroicons/react'
const iconMap = require('lucide-react')
```

Heroicons deserves special mention. Always import from the style subpath:

```tsx
import { HomeIcon } from '@heroicons/react/24/outline'
import { HomeIcon as HomeSolidIcon } from '@heroicons/react/24/solid'
```

Avoid:

```tsx
import { HomeIcon } from '@heroicons/react'
```

The root import is not the path you want in production UI.

## React 19.2 and Icon-Heavy UI

React 19.2 does not make SVG icons magically smaller, but it changes the surrounding performance story.

The most relevant React 19.2 features for icon-heavy interfaces are:

| React 19.2 feature | Icon UI impact |
|---|---|
| `<Activity />` | Can keep hidden interface sections warm without mounting visible effects |
| `useEffectEvent` | Helps interactive icon widgets avoid reconnecting or resubscribing due to unrelated values |
| React Performance Tracks | Makes it easier to see icon-heavy component work in Chrome DevTools profiles |
| Partial Pre-rendering foundation | Reinforces the Server Component pattern for static shell UI |
| SSR Suspense reveal batching | Helps streamed UI reveal more coherently |
| React Compiler support in Next 16 | Can reduce repeated work around Client Component controls |

For icons, the practical lesson is:

- Use Server Components for static icon markup.
- Use Client Components only around the interactive shell.
- Use React Performance Tracks to verify that icon-heavy client panels are not re-rendering unnecessarily.
- Use React Compiler when your app benefits from automatic memoization, but do not use it as a substitute for good import patterns.

Example of an interactive icon panel where React 19.2 tooling helps:

```tsx
'use client'

import { useMemo, useState } from 'react'
import { Check, Search } from 'lucide-react'

const iconOptions = [
  { name: 'Search', component: Search },
  { name: 'Check', component: Check },
]

export function SmallIconPicker() {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    return iconOptions.filter((icon) =>
      icon.name.toLowerCase().includes(query.toLowerCase())
    )
  }, [query])

  return (
    <div>
      <input value={query} onChange={(event) => setQuery(event.target.value)} />
      {results.map(({ name, component: Icon }) => (
        <button key={name} type="button">
          <Icon className="h-4 w-4" aria-hidden="true" focusable="false" />
          {name}
        </button>
      ))}
    </div>
  )
}
```

This pattern is fine for a tiny static list. For hundreds or thousands of icons, do not import all icon components into the client. Use a search API, static SVG URLs, or a virtualized result list.

## Dynamic Icon Pickers in Next.js 16

An icon search product or design-system admin panel needs dynamic icon rendering. This is where many apps accidentally import an entire icon library.

Bad dynamic picker:

```tsx
'use client'

import * as Icons from 'lucide-react'

export function IconPreview({ name }: { name: string }) {
  const Icon = Icons[name as keyof typeof Icons]
  return Icon ? <Icon className="h-4 w-4" /> : null
}
```

Better approaches:

| Approach | Best for | Tradeoff |
|---|---|---|
| Static SVG URLs | Large searchable icon catalogs | You need a trusted icon index and safe SVG handling |
| Server-rendered selected icon | Detail pages and static previews | Less interactive, but excellent for SEO |
| Small allowlisted map | Product settings with 10-50 icons | Manual map maintenance |
| Dynamic import per icon | Rarely used icon-heavy panels | More loading states and chunk management |
| Iconify offline bundles | Large multi-library coverage | Requires careful bundle generation |

For a product UI where users choose from a small set of icons, use an allowlist:

```tsx
import { Bell, Home, Search, Settings, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  bell: Bell,
  home: Home,
  search: Search,
  settings: Settings,
  user: User,
}

export function IconPreview({ name }: { name: string }) {
  const Icon = iconMap[name]

  if (!Icon) return null

  return <Icon className="h-4 w-4" aria-hidden="true" focusable="false" />
}
```

This lets Turbopack see the exact imported icons.

For a huge catalog, use data instead of component imports:

```tsx
type SearchIcon = {
  name: string
  libraryName: string
  svgUrl: string
}

export function SearchResultIcon({ icon }: { icon: SearchIcon }) {
  return (
    <img
      src={icon.svgUrl}
      alt=""
      width={24}
      height={24}
      loading="lazy"
    />
  )
}
```

For production, sanitize and control the source of those URLs. Do not render arbitrary user-submitted SVG strings.

## SVG Components vs SVG Files vs Icon Fonts

Next.js 16 does not force one icon format. Choose based on where the icon appears.

| Format | Best use | Avoid when |
|---|---|---|
| React SVG component | App UI, buttons, nav, cards | You need thousands of dynamic icons on one route |
| Inline SVG markup | One-off custom icons, logos, critical UI | Repeated hundreds of times without reuse |
| SVG file in `/public` | Static assets, logos, downloadable icons | You need theme color via `currentColor` |
| SVG sprite | Repeated same icons at scale | You need per-icon React props and easy library imports |
| Icon font | Legacy systems, font-based design kits | Modern accessible app UI |
| Raster PNG/WebP | App store assets, thumbnails, previews | Interface icons that need scaling and theme color |

For most app UI, React SVG components win because they:

- Use `currentColor`.
- Scale without blur.
- Work with Tailwind classes.
- Can be hidden from assistive tech or labeled.
- Tree-shake when imported correctly.
- Render in Server Components.

Icon fonts are usually worse for modern Next.js UI because they:

- Can flash invisible or wrong glyphs while fonts load.
- Are harder to label accessibly.
- Depend on font loading behavior.
- Make individual icon subsetting harder.
- Can render as missing boxes if the font fails.

If you are still using an icon font in a Next.js 16 app, the migration path is usually:

1. Keep brand or legacy icons temporarily.
2. Replace common UI icons with Lucide or Heroicons.
3. Remove the icon font CSS from the critical path.
4. Audit for missing accessible names.
5. Delete the old font assets after usage drops to zero.

## SVG Sprites in Next.js 16

SVG sprites still have a place, especially for design systems that reuse the same icons hundreds of times.

Example sprite usage:

```tsx
export function SpriteIcon({
  name,
  label,
}: {
  name: string
  label?: string
}) {
  return (
    <svg
      className="h-4 w-4"
      aria-hidden={label ? undefined : 'true'}
      role={label ? 'img' : undefined}
      aria-label={label}
      focusable="false"
    >
      <use href={`/icons/sprite.svg#${name}`} />
    </svg>
  )
}
```

Sprites work best when:

- The icon set is small and stable.
- Icons repeat many times on the same route.
- You control the sprite generation pipeline.
- You do not need complex per-icon React props.

Sprites are less convenient when:

- Designers frequently add icons.
- Developers need type-safe icon names.
- You rely heavily on tree-shaking.
- You need multi-library search and previews.

For most product teams, a typed SVG component library is simpler. For very large repeated tables, sprites can still be worth it.

## Next.js Metadata Icons, Favicons and OG Images

Do not confuse UI icons with metadata icons.

Next.js has file conventions for:

- `favicon.ico`
- `icon.png`, `icon.jpg`, or generated `icon.tsx`
- `apple-icon.png`
- `opengraph-image.jpg` or generated `opengraph-image.tsx`
- `twitter-image.jpg` or generated `twitter-image.tsx`

These are for browsers, search results, bookmarks, social previews, and app homescreens. They are not replacements for UI icon libraries.

In Next.js 16, remember that params passed to generated image functions such as `opengraph-image`, `twitter-image`, `icon`, and `apple-icon` are promises. If you generate per-route icon or OG assets, use async params:

```tsx
// app/icons/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 72,
          background: '#0f172a',
          color: '#fff',
        }}
      >
        {slug}
      </div>
    )
  )
}
```

This is one of the easy places to break after a Next.js 16 upgrade if your older code still treats `params` as synchronous.

## Accessibility Rules for Next.js Icons

Icon accessibility does not change in Next.js 16, but Server Components make it easier to get right consistently.

Use three patterns:

| Pattern | Code |
|---|---|
| Decorative icon with visible text | `<Search aria-hidden="true" focusable="false" />` |
| Icon-only button | `<button aria-label="Search"><Search aria-hidden="true" /></button>` |
| Informative standalone icon | `<CircleAlert role="img" aria-label="Warning" />` |

Correct icon-only button:

```tsx
import { Search } from 'lucide-react'

export function SearchButton() {
  return (
    <button aria-label="Search icons">
      <Search className="h-4 w-4" aria-hidden="true" focusable="false" />
    </button>
  )
}
```

Correct visible-label button:

```tsx
import { Download } from 'lucide-react'

export function DownloadButton() {
  return (
    <button className="inline-flex items-center gap-2">
      <Download className="h-4 w-4" aria-hidden="true" focusable="false" />
      Download SVG
    </button>
  )
}
```

Correct status icon:

```tsx
import { CircleCheck } from 'lucide-react'

export function SuccessIcon() {
  return (
    <CircleCheck
      className="h-4 w-4 text-green-600"
      role="img"
      aria-label="Export complete"
      focusable="false"
    />
  )
}
```

For a deeper accessibility walkthrough, read [Icon Accessibility in React](/blog/icon-accessibility-react-2026).

## Dark Mode and `currentColor`

Next.js 16 apps often use Tailwind CSS and CSS variables for theme color. Icons should follow text color unless there is a specific semantic state.

Good:

```tsx
import { Moon, Sun } from 'lucide-react'

export function ThemeLabel({ dark }: { dark: boolean }) {
  const Icon = dark ? Moon : Sun

  return (
    <span className="inline-flex items-center gap-2 text-muted-foreground">
      <Icon className="h-4 w-4" aria-hidden="true" focusable="false" />
      {dark ? 'Dark mode' : 'Light mode'}
    </span>
  )
}
```

Avoid hardcoded colors unless they represent state:

```tsx
<Settings color="#666" />
```

Prefer:

```tsx
<Settings className="h-4 w-4 text-muted-foreground" />
```

This keeps icons aligned with dark mode, high contrast adjustments, and design tokens.

For more detail, read [SVG Icons in Dark Mode](/blog/svg-icons-dark-mode-react-nextjs-2026).

## SEO for Icon Pages in Next.js 16

Icon-heavy websites have a special SEO problem: pages can look visually rich but contain thin textual content. Search engines need descriptive copy, metadata, structured internal links, and crawlable pages.

For an icon library page, include:

- The library name in the H1.
- Installation commands.
- React and Next.js examples.
- License information.
- Icon count.
- Use cases.
- Accessibility notes.
- Bundle size notes.
- Alternatives and comparisons.
- Internal links to related libraries.

For an individual icon page, include:

- Human-readable icon name.
- Library name.
- SVG preview.
- React import.
- JSX usage.
- Tags and category.
- License.
- Related icons.
- Similar icons in other libraries.
- Download options.

Next.js 16 metadata should be generated from the same source of truth as the page:

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const icon = await getIcon(slug)

  return {
    title: `${icon.displayName} icon - ${icon.libraryName}`,
    description: `Download and use the ${icon.displayName} SVG icon from ${icon.libraryName}. Includes React import, JSX usage, license, tags, and alternatives.`,
  }
}
```

The key Next.js 16 detail is `await params`.

## Performance Checklist

Use this checklist before shipping a Next.js 16 app with icons:

| Check | Why it matters |
|---|---|
| Static icons render in Server Components | Removes component JavaScript from the client bundle |
| Client boundaries are small | Prevents static icon shells from becoming hydrated UI |
| Named imports only | Keeps tree-shaking clear |
| No namespace icon imports | Avoids shipping whole icon libraries |
| No root Heroicons imports | Prevents style packs from bundling incorrectly |
| Icon-only buttons have labels | Required for screen readers |
| Decorative icons are hidden | Prevents duplicate announcements |
| Icons use `currentColor` | Makes dark mode and tokens easy |
| Production build is measured | Dev mode can mislead bundle analysis |
| Lighthouse or Web Vitals checked | Next 16 build output no longer tells the whole story |

## Production Measurement in 2026

Next.js 16 removed some older build-output size summaries because they were inaccurate for server-driven architectures. That means you should measure icons with better tools.

Use:

- Lighthouse for Core Web Vitals and unused JavaScript warnings.
- Chrome DevTools Coverage for unused icon code.
- Bundle analyzer for client chunks.
- React Performance Tracks for component work in icon-heavy Client Components.
- Real user monitoring through Vercel Analytics or your analytics provider.

Run production builds:

```bash
npm run build
npm run start
```

Then test the production server, not only `next dev`.

Development mode is optimized for feedback speed. Production mode is what users receive.

## Common Next.js 16 Icon Mistakes

**Mistake 1: Measuring icon bundle size in dev mode**

Dev mode and production mode can load modules differently. Always measure production output before making a bundle-size decision.

**Mistake 2: Putting the whole shell in a Client Component**

One menu toggle should not force every nav icon to hydrate. Split client islands from static layout.

**Mistake 3: Using an icon font because it feels smaller**

Icon fonts can create render-blocking font requests, missing glyphs, accessibility issues, and poor subsetting. SVG components are usually better.

**Mistake 4: Dynamically indexing an entire icon package**

`Icons[name]` is a bundle-size trap. Use a small allowlist, SVG URLs, or server-side icon data.

**Mistake 5: Forgetting async params in generated metadata or OG images**

Next.js 16 fully enforces async params. Old synchronous examples will fail or behave incorrectly.

**Mistake 6: Treating React Compiler as an icon optimization**

React Compiler can reduce repeated client render work. It does not fix a bad import that bundles 5,000 icons.

## Recommended Architecture by Project Type

| Project type | Icon architecture |
|---|---|
| SaaS dashboard | Lucide in Server Components for nav and layout, small Client Components for actions |
| shadcn/ui app | Lucide only unless a specific icon is missing |
| Marketing site | Server-rendered SVG components, no icon font |
| Icon search website | Static SVG URL data for catalog results, component imports only for app chrome |
| Design system docs | Server-rendered examples plus bundle guidance |
| Admin panel | Lazy-load icon-heavy settings and reporting sections |
| Mobile web app | Fewer icons, visible labels, strict contrast, no hover-only tooltips |
| AI product | Lucide `Sparkles`, `WandSparkles`, `BotMessageSquare`, `BrainCircuit`, and `Workflow` with text labels |

The architecture should match the job. A five-icon marketing page and a 300,000-icon search engine should not use the same rendering strategy.

## The 2026 Verdict

The best icon setup for Next.js 16 is not "use one package everywhere". It is a layered approach:

- Use SVG component libraries for product UI.
- Render static icons in Server Components.
- Keep Client Components narrow.
- Use named imports.
- Use SVG URLs or server data for giant dynamic catalogs.
- Use metadata file conventions for favicons and social images.
- Measure production builds.
- Use visible labels and accessible names.

If you want one practical default, choose `lucide-react`, import named icons directly, and make your app shell a Server Component. That combination fits Next.js 16, React 19.2, Turbopack, shadcn/ui, Tailwind CSS, and modern SEO better than any icon-font or all-icons-in-client approach.

## Research Sources

This article uses the local Next.js 16 docs shipped with the project and current official framework documentation:

- [Next.js 16 release notes](https://nextjs.org/blog/next-16)
- [Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [React 19.2 release notes](https://react.dev/blog/2025/10/01/react-19-2)
- [Next.js metadata and OG image docs](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- [Next.js dynamic route segments docs](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes)

## Frequently Asked Questions

### What is the best icon library for Next.js 16?

Lucide Icons is the best default for most Next.js 16 apps because it is tree-shakable, TypeScript-friendly, compatible with Server Components, and visually aligned with shadcn/ui. Use Tabler when you need more icons and Phosphor when you need multiple weights.

### Do icons work in React Server Components?

Yes. SVG icon components like Lucide, Heroicons, and Tabler can render in Server Components as long as the surrounding component does not need client-only APIs. The output is SVG markup in HTML, which avoids sending icon component JavaScript to the browser.

### Does Turbopack tree-shake icon libraries?

Yes for well-packaged ESM icon libraries and clear named imports. Turbopack cannot fully optimize patterns that dynamically index into an entire icon package or import from large barrels. Import exact icons directly.

### Should I use SVG icons or icon fonts in Next.js?

Use SVG icons for modern app UI. SVG components are easier to theme, label, tree-shake, server-render, and scale. Icon fonts are mainly useful for legacy systems or font-based design kits.

### Do I need `"use client"` for Lucide icons?

No. Lucide icons do not require `"use client"` by themselves. You only need a Client Component when the component uses state, effects, event handlers, browser APIs, or other client-only behavior.

### How do I make icon-only buttons accessible in Next.js?

Put the accessible name on the button with `aria-label`, and hide the SVG with `aria-hidden="true"`. For example: `<button aria-label="Search"><Search aria-hidden="true" /></button>`.

### How should I render thousands of searchable icons?

Do not import thousands of React icon components into the client. Use a server-backed icon index, static SVG URLs, pagination, virtualization, and component imports only for the app chrome or selected allowlisted icons.
