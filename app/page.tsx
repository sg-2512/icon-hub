import { staticPages } from '../data/static-pages'
import { getAllPosts } from '../lib/blog'
import { icons } from '../lib/icons'
import { ICONIFY_COLLECTION_COUNT, NAMED_LIBRARY_COUNT, SEARCHABLE_ICON_COUNT } from '../data/library-catalog'
import HomeExperience from './components/HomeExperience'

export const metadata = {
  title: 'IconSearch — Find & Compare Free SVG Icon Libraries (2026)',
  description: `Search ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} free SVG icons from ${NAMED_LIBRARY_COUNT} named libraries and ${ICONIFY_COLLECTION_COUNT} Iconify collections. Compare ${NAMED_LIBRARY_COUNT} React icon libraries by size, stars, and license.`,
  keywords: 'free svg icons, react icons, icon library comparison, lucide icons, heroicons, tabler icons, phosphor icons, open source icons, bootstrap icons, remix icons, feather icons, iconoir icons, iconify',
  openGraph: {
    title: 'IconSearch — Find & Compare Free SVG Icon Libraries',
    description: `Search ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} free SVG icons from ${NAMED_LIBRARY_COUNT} named libraries and ${ICONIFY_COLLECTION_COUNT} Iconify collections.`,
    url: 'https://iconsearch.info',
    siteName: 'IconSearch',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IconSearch — Find & Compare Free SVG Icon Libraries',
    description: `Search ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} free SVG icons from ${NAMED_LIBRARY_COUNT} named libraries and ${ICONIFY_COLLECTION_COUNT} Iconify collections.`,
  },
  alternates: {
    canonical: 'https://iconsearch.info',
  },
}

export default function HomePage() {
  const blogItems = getAllPosts().map((post) => ({
    label: post.title,
    href: `/blog/${post.slug}`,
    date: post.date,
  }))

  const allRecentItems = [...blogItems, ...staticPages]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the best free icon library for React?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Lucide Icons, Heroicons, and Iconoir are highly popular outline choices for React.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are these icon libraries free to use commercially?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes — all libraries use MIT or ISC licenses which allow free commercial use.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which icon library has the most icons?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `IconSearch indexes ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} icons, including ${ICONIFY_COLLECTION_COUNT} Iconify collections. For the ${NAMED_LIBRARY_COUNT} named libraries, Tabler Icons has the largest collection with 6,100+ icons.`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomeExperience initialLibraries={icons} recentItems={allRecentItems} />
    </div>
  )
}
