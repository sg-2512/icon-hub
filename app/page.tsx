import { staticPages } from '../data/static-pages'
import { icons } from '../lib/icons'
import { NAMED_LIBRARY_COUNT, SEARCHABLE_ICON_COUNT } from '../data/library-catalog'
import { createPageMetadata } from '../lib/seo'
import HomeExperience from './components/HomeExperience'

const title = `Free SVG Icons — Search ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} Icons from ${NAMED_LIBRARY_COUNT} Libraries`
const description = `Search, customize, and download ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} free SVG icons from ${NAMED_LIBRARY_COUNT} open-source libraries, including Lucide, Heroicons, Tabler, and Phosphor.`

export const metadata = createPageMetadata({
  title,
  description,
  path: '/',
})

export default function Home() {
  const allRecentItems = [...staticPages]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <div suppressHydrationWarning>
      <HomeExperience initialLibraries={icons} recentItems={allRecentItems} />
    </div>
  )
}
