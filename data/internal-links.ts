export type InternalLink = {
  label: string
  href: string
}

export type InternalLinkGroup = {
  title: string
  links: InternalLink[]
}

export const internalLinkGroups: InternalLinkGroup[] = [
  {
    title: 'LIBRARIES',
    links: [
      { label: 'Lucide Icons', href: '/icons/lucide-icons' },
      { label: 'Heroicons', href: '/icons/heroicons' },
      { label: 'Tabler Icons', href: '/icons/tabler-icons' },
      { label: 'Phosphor Icons', href: '/icons/phosphor-icons' },
      { label: 'All Libraries', href: '/free-svg-icons' },
    ],
  },
  {
    title: 'FRAMEWORKS',
    links: [
      { label: 'React Icons', href: '/react-icons' },
      { label: 'Next.js Icons', href: '/nextjs-icons' },
      { label: 'Vue Icons', href: '/vue-icons' },
      { label: 'Svelte Icons', href: '/svelte-icons' },
      { label: 'Tailwind Icons', href: '/tailwind-icons' },
      { label: 'TypeScript Icons', href: '/typescript-icons' },
    ],
  },
  {
    title: 'USE CASES',
    links: [
      { label: 'Icons for SaaS', href: '/use-cases/icons-for-saas' },
      { label: 'Icons for Dashboards', href: '/use-cases/icons-for-dashboards' },
      { label: 'Icons for Mobile', href: '/use-cases/icons-for-mobile-apps' },
      { label: 'Icons for Dark Mode', href: '/use-cases/icons-for-dark-mode' },
      { label: 'All Use Cases', href: '/use-cases' },
    ],
  },
  {
    title: 'RESOURCES',
    links: [
      { label: 'Browse', href: '/free-svg-icons' },
      { label: 'Site Directory', href: '/directory' },
      { label: 'Best For You', href: '/best-for-you' },
      { label: 'VS Code Extension', href: '/vscode-extension' },
      { label: 'Figma Plugin', href: '/figma-plugin' },
      { label: 'Chrome Extension', href: '/chrome-extension' },
      { label: 'Framer Plugin', href: '/framer-plugin' },
      { label: 'Categories', href: '/icons/category' },
      { label: 'License Guide', href: '/licenses' },
      { label: 'Use Cases', href: '/use-cases' },
      { label: 'Stats', href: '/stats' },
      { label: 'TypeScript Icons', href: '/typescript-icons' },
    ],
  },
]

export const footerLegalLinks: InternalLink[] = [
  { label: 'Account', href: '/account' },
  { label: 'About', href: '/about' },
  { label: 'Best For You', href: '/best-for-you' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Contact', href: '/contact' },
]
