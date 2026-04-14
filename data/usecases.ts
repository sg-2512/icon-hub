export type UseCase = {
  slug: string
  name: string
  description: string
  longDescription: string
  keywords: string[]
  recommendedLibraries: string[]
  whyItMatters: string
  designTips: string[]
  mustHaveIcons: string[]
  avoidMistakes: string[]
}

export const useCases: UseCase[] = [
  {
    slug: 'icons-for-saas',
    name: 'Icons for SaaS Products',
    description: 'Best free icon libraries for SaaS applications — dashboards, settings, billing, and user management.',
    longDescription: 'SaaS products have unique icon requirements. Unlike marketing sites or simple apps, SaaS interfaces are used daily by professionals who need to navigate complex workflows quickly. Icons in SaaS must be instantly recognizable, visually neutral, and consistent across dozens of screens — from onboarding flows to billing management to team settings.',
    keywords: ['icons for saas', 'saas icon library', 'best icons for saas dashboard', 'react icons saas', 'saas ui icons'],
    recommendedLibraries: ['lucide-icons', 'heroicons', 'radix-icons'],
    whyItMatters: 'In SaaS products, icons are used hundreds of times per session. A bad icon system creates friction and confusion. Users who struggle to find features blame the product, not the icons — but the icons are often the root cause.',
    designTips: [
      'Use outline icons for most UI — they feel professional and do not compete with content',
      'Reserve filled icons for active navigation states only',
      'Keep icon sizes consistent — 16px for tables, 20px for buttons, 24px for navigation',
      'Never use icon-only buttons for destructive actions like delete or cancel',
      'Use the same library across your entire product — do not mix Lucide and Heroicons',
    ],
    mustHaveIcons: ['settings', 'users', 'billing', 'dashboard', 'logout', 'bell', 'search', 'filter', 'edit', 'trash', 'plus', 'check'],
    avoidMistakes: [
      'Mixing icon styles across different parts of the product',
      'Using decorative icons that add no meaning',
      'Icon-only navigation without tooltips or labels',
      'Different icon sizes on the same page without a system',
    ],
  },
  {
    slug: 'icons-for-dashboards',
    name: 'Icons for Dashboards',
    description: 'Best icon libraries for data dashboards and admin panels — charts, metrics, navigation and controls.',
    longDescription: 'Dashboard interfaces are the most icon-dense UIs in software. A typical admin dashboard uses 30 to 50 unique icons across navigation, data tables, filter controls, stat cards, action menus, and chart labels. Density is the key constraint — icons must be readable and distinguishable at 16px in tight spaces.',
    keywords: ['dashboard icons', 'admin panel icons', 'icons for analytics dashboard', 'react dashboard icons', 'data visualization icons'],
    recommendedLibraries: ['lucide-icons', 'radix-icons', 'tabler-icons'],
    whyItMatters: 'Dashboards are used by power users who navigate quickly. When icons are ambiguous or inconsistent, users slow down. In enterprise software, this friction translates directly to lower adoption and more support tickets.',
    designTips: [
      'Use 16px icons in tables and sidebars — 24px is too large for dense layouts',
      'Radix Icons at 15x15 are specifically designed for dense dashboard UIs',
      'Pair every icon in the sidebar with a text label — never icon-only navigation in dashboards',
      'Use consistent icon weight throughout — mixing thin and bold looks broken',
      'Chart type icons should be visually distinct from each other at a glance',
    ],
    mustHaveIcons: ['bar-chart', 'line-chart', 'trending-up', 'trending-down', 'users', 'dollar', 'filter', 'download', 'refresh', 'settings', 'grid', 'list'],
    avoidMistakes: [
      'Using 24px icons in tight sidebar navigation',
      'Icon-only sidebar without text labels',
      'Mixing outline and filled icons randomly in the same table',
      'Using the same icon for different actions in different contexts',
    ],
  },
  {
    slug: 'icons-for-mobile-apps',
    name: 'Icons for Mobile Apps',
    description: 'Best icon libraries for mobile web apps and React Native — tap-friendly, bold, and high contrast.',
    longDescription: 'Mobile interfaces have strict constraints that desktop UIs do not. Touch targets must be at least 44x44px for reliable tapping. Icons must be readable on varying screen qualities from budget Android devices to Retina displays. Navigation patterns like tab bars and hamburger menus rely heavily on universally recognized icons.',
    keywords: ['mobile app icons', 'react native icons', 'icons for mobile ui', 'pwa icons', 'mobile svg icons react'],
    recommendedLibraries: ['lucide-icons', 'phosphor-icons', 'heroicons'],
    whyItMatters: 'On mobile, users tap icons with their thumb while moving. An icon that is too small, too ambiguous, or too similar to an adjacent icon causes tapping errors. These errors create frustration that leads to app abandonment.',
    designTips: [
      'Minimum touch target is 44x44px — the visible icon can be smaller but the tappable area must not be',
      'Use 24px to 28px visible icon sizes for tab bars and action buttons',
      'Filled icons work better than outline icons in mobile tab bars — they are more visible at a glance',
      'Avoid icons that are too similar — home, house, and building icons can be confused on small screens',
      'Always pair tab bar icons with text labels',
    ],
    mustHaveIcons: ['home', 'search', 'bell', 'user', 'menu', 'arrow-back', 'share', 'heart', 'bookmark', 'camera', 'more-horizontal', 'check'],
    avoidMistakes: [
      'Touch targets smaller than 44x44px',
      'Icon-only tab bars without text labels',
      'Using the same icon for multiple different actions',
      'Outline icons that are too thin to read on low-quality screens',
    ],
  },
  {
    slug: 'icons-for-landing-pages',
    name: 'Icons for Landing Pages',
    description: 'Best icon libraries for marketing sites and landing pages — feature icons, benefit icons, and social proof.',
    longDescription: 'Landing page icons serve a different purpose than app icons. Instead of navigation and actions, they communicate features, benefits, and trust signals. They appear in feature grids, pricing tables, testimonial sections, and FAQ accordions. Visual expression matters more here than in apps — icons can be larger, more decorative, and carry more personality.',
    keywords: ['icons for landing pages', 'marketing icons react', 'feature icons svg', 'website icons free', 'landing page svg icons'],
    recommendedLibraries: ['phosphor-icons', 'lucide-icons', 'tabler-icons'],
    whyItMatters: 'On landing pages, icons serve as visual anchors that break up text and guide the eye. Well-chosen feature icons increase comprehension of what a product does. Poor or generic icons make a product feel like every other SaaS and reduce conversion.',
    designTips: [
      'Use larger icons on landing pages — 32px to 48px for feature sections looks great',
      'Phosphor duotone icons add a premium feel to feature grids',
      'Wrap icons in colored backgrounds or gradient containers for visual interest',
      'Keep all feature section icons at the same visual weight and size',
      'Avoid stock-looking generic icons — they make your product look like a template',
    ],
    mustHaveIcons: ['check-circle', 'shield', 'zap', 'star', 'rocket', 'lock', 'globe', 'trending-up', 'users', 'clock', 'heart', 'award'],
    avoidMistakes: [
      'Using tiny 16px icons in feature sections — they look weak at that size',
      'Mixing completely different icon styles across sections',
      'Using the same generic set every other SaaS uses',
      'Forgetting to use icons in the hero section to add visual interest',
    ],
  },
  {
    slug: 'icons-for-ecommerce',
    name: 'Icons for Ecommerce',
    description: 'Best icon libraries for ecommerce sites — cart, wishlist, payment, shipping and product icons.',
    longDescription: 'Ecommerce interfaces rely heavily on icons to communicate the shopping journey. Cart and bag icons, payment method symbols, shipping and delivery indicators, wishlist hearts, and review stars all need to be instantly recognizable. Conversion rates are directly affected by how clearly these icons communicate — a confusing checkout experience loses sales.',
    keywords: ['ecommerce icons react', 'shopping cart icon svg', 'payment icons free', 'icons for online store', 'ecommerce svg icons'],
    recommendedLibraries: ['lucide-icons', 'tabler-icons', 'phosphor-icons'],
    whyItMatters: 'In ecommerce, every friction point in the purchase flow reduces conversion. Icons that confuse users — an unclear cart icon, an ambiguous payment symbol, a missing delivery indicator — directly cost revenue. Clear, universally recognized icons are a conversion optimization tool.',
    designTips: [
      'Use the universally recognized shopping cart icon — do not get creative here',
      'Heart for wishlist and star for reviews are both universally understood',
      'Show payment method logos not generic credit card icons when possible',
      'Shipping icons should clearly communicate the delivery type',
      'Use filled icons for active states like added-to-cart vs outline for empty cart',
    ],
    mustHaveIcons: ['shopping-cart', 'heart', 'star', 'credit-card', 'truck', 'package', 'tag', 'percent', 'shield', 'refresh', 'search', 'filter'],
    avoidMistakes: [
      'Creative or ambiguous cart icons that users do not immediately recognize',
      'Missing wishlist functionality without a clear heart or bookmark icon',
      'No visual distinction between empty and full cart states',
      'Inconsistent icon styles across product pages, cart, and checkout',
    ],
  },
  {
    slug: 'icons-for-dark-mode',
    name: 'Icons for Dark Mode',
    description: 'Best icon libraries for dark mode UIs — icons that work on dark backgrounds with proper contrast.',
    longDescription: 'Dark mode has specific requirements for icons that light mode does not. Thin outline icons that look perfect on white backgrounds can become hard to read on very dark backgrounds. Icon libraries that use currentColor and SVG strokes adapt naturally to dark mode when you set the text color correctly. Understanding this technical detail is the key to a flawless dark mode icon experience.',
    keywords: ['dark mode icons', 'icons for dark ui', 'dark theme icons react', 'svg icons dark mode', 'react icons dark background'],
    recommendedLibraries: ['lucide-icons', 'heroicons', 'phosphor-icons'],
    whyItMatters: 'More than 80 percent of developers prefer dark mode. A product with broken or hard-to-see icons in dark mode immediately signals poor attention to detail. For developer tools, SaaS products, and code editors, dark mode is often the primary use case not an afterthought.',
    designTips: [
      'Use icons that rely on currentColor — they automatically adapt to your text color in dark mode',
      'Slightly increase stroke width in dark mode — thin strokes disappear on dark backgrounds',
      'Test icons at all your dark mode background shades, not just pure black',
      'Avoid icon libraries that use hardcoded colors — they do not adapt to dark mode',
      'Use slightly higher opacity for muted icon states in dark mode compared to light mode',
    ],
    mustHaveIcons: ['moon', 'sun', 'monitor', 'eye', 'eye-off', 'contrast', 'palette', 'settings'],
    avoidMistakes: [
      'Icon libraries with hardcoded black fill colors that disappear on dark backgrounds',
      'Not testing icon contrast ratios on your actual dark background colors',
      'Using the same icon opacity for both light and dark modes',
      'Forgetting to update icon hover states for dark mode',
    ],
  },
  {
    slug: 'icons-for-developer-tools',
    name: 'Icons for Developer Tools',
    description: 'Best icon libraries for developer tools, CLIs, code editors and technical products.',
    longDescription: 'Developer tools have a uniquely demanding user base. Developers notice inconsistency, poor performance, and low-quality design immediately. They also spend more time in your product than average users — meaning icon quality has more cumulative impact. Technical products benefit from clean, precise, monochrome icon systems that communicate information density without visual noise.',
    keywords: ['developer tool icons', 'code editor icons', 'terminal icons react', 'technical icons svg', 'dev tool ui icons'],
    recommendedLibraries: ['lucide-icons', 'radix-icons', 'tabler-icons'],
    whyItMatters: 'Developers are the harshest critics of bad UI. They will notice if your icons are inconsistent, poorly spaced, or visually off. Building a developer tool with a polished icon system communicates that you care about quality — which is the most important signal you can send to a technical audience.',
    designTips: [
      'Use monochrome icon systems — developers prefer clean and functional over colorful',
      'Lucide Icons is the community standard for React developer tools in 2026',
      'Prioritize icons for code actions: copy, expand, collapse, run, stop, debug',
      'Use consistent icon sizes in toolbars — 16px is standard for dense technical UIs',
      'Dark mode is mandatory for developer tools — most developers use it by default',
    ],
    mustHaveIcons: ['code', 'terminal', 'git-branch', 'copy', 'check', 'x', 'chevron-right', 'folder', 'file', 'settings', 'search', 'play'],
    avoidMistakes: [
      'Colorful or playful icons that feel inappropriate for technical contexts',
      'Missing dark mode support — unacceptable for developer tools',
      'No icons for core development actions like copy, run, and debug',
      'Inconsistent icon sizes in toolbars and code editors',
    ],
  },
  {
    slug: 'icons-for-nextjs-app-router',
    name: 'Icons for Next.js App Router',
    description: 'Best icon libraries verified to work with Next.js 14+ App Router — no SSR errors, no configuration.',
    longDescription: 'The Next.js App Router introduced Server Components which changed how frontend libraries must be built. Icon libraries that use React context, browser APIs, or client-side state break in Server Components. This page covers only icon libraries that are verified to work correctly in Next.js App Router without any special configuration or use client directives.',
    keywords: ['nextjs app router icons', 'icons next.js 14', 'server component icons', 'next.js icon library 2026', 'app router svg icons'],
    recommendedLibraries: ['lucide-icons', 'heroicons', 'radix-icons'],
    whyItMatters: 'Using an incompatible icon library with Next.js App Router causes runtime errors that are difficult to debug. The error messages are often cryptic — "You cannot use useState in a Server Component" — when the real cause is an icon library that internally uses React hooks.',
    designTips: [
      'Always check if an icon library has specific Next.js App Router documentation before using it',
      'Libraries that render pure SVG with no React hooks or context are always safe in Server Components',
      'Lucide React, Heroicons, and Radix Icons are all confirmed Server Component compatible',
      'If you must use a non-compatible library, wrap it in a Client Component with use client',
      'Test icon rendering in both Server and Client Components during development',
    ],
    mustHaveIcons: ['home', 'arrow-right', 'check', 'x', 'menu', 'search', 'user', 'settings', 'bell', 'chevron-down', 'external-link', 'loader'],
    avoidMistakes: [
      'Using icon libraries that internally use useState or useContext',
      'Not testing icons in actual Server Components before shipping',
      'Wrapping every icon in use client when it is not necessary',
      'Using icon font libraries like Font Awesome which require DOM manipulation',
    ],
  },
]