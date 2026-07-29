import { staticPages } from '../data/static-pages'
import { icons } from '../lib/icons'
import { NAMED_LIBRARY_COUNT, SEARCHABLE_ICON_COUNT } from '../data/library-catalog'
import HomeExperience from './components/HomeExperience'

export const metadata = {
  title: `IconSearch — Search ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} Free SVG Icons & Compare ${NAMED_LIBRARY_COUNT} Libraries (2026)`,
  description: `Search ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} free SVG icons across ${NAMED_LIBRARY_COUNT} open-source icon libraries. Compare React icon libraries by size, stars, and license.`,
  alternates: {
    canonical: 'https://iconsearch.info',
  },
  openGraph: {
    title: `IconSearch — Search ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} Free SVG Icons`,
    description: `Search ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} free SVG icons across ${NAMED_LIBRARY_COUNT} open-source icon libraries.`,
    url: 'https://iconsearch.info',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `IconSearch — Search ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} Free SVG Icons`,
    description: `Search ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} free SVG icons across ${NAMED_LIBRARY_COUNT} open-source icon libraries.`,
    creator: '@IconSearchinfo',
  },
}

export default function Home() {
  const allRecentItems = [...staticPages]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const homeFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is IconSearch?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `IconSearch is an open platform to search and compare ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} free SVG icons across ${NAMED_LIBRARY_COUNT} open-source libraries.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Which icon library has the most icons?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `IconSearch indexes ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} icons across ${NAMED_LIBRARY_COUNT} libraries. Tabler Icons has 6,100+ icons, and Fluent UI System Icons has 20,000+ icons.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Can I use these icons with Next.js?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes — all listed libraries ship as React components and work with Next.js App Router.',
        },
      },
    ],
  }

  return (
    <div suppressHydrationWarning>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqSchema) }}
      />
      <HomeExperience initialLibraries={icons} recentItems={allRecentItems} />
    </div>
  )
}
