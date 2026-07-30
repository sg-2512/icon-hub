import type { ReactNode } from 'react'
import { createPageMetadata } from '../../lib/seo'

export const metadata = createPageMetadata({
  title: 'Best Icon Library for Your Project — Interactive Finder (2026)',
  description: 'Answer a few questions about your framework, UI stack, style, and project needs to find the best open-source icon library for your project.',
  path: '/best-for-you',
})

export default function BestForYouLayout({ children }: { children: ReactNode }) {
  return children
}
