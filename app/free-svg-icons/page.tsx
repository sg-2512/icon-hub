import { allLibraries, NAMED_LIBRARY_COUNT, SEARCHABLE_ICON_COUNT } from '../../data/library-catalog'
import { createPageMetadata } from '../../lib/seo'
import BrowsePageClient from './BrowsePageClient'

export const metadata = createPageMetadata({
  title: `Free SVG Icon Libraries — Browse All ${NAMED_LIBRARY_COUNT} Collections`,
  description: `Browse ${NAMED_LIBRARY_COUNT} open-source SVG icon libraries and search ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} icons across Lucide, Heroicons, Tabler, Material Symbols, and more.`,
  path: '/free-svg-icons',
})

export default function FreeSvgIconsPage() {
  return (
    <main>
      <BrowsePageClient libraries={allLibraries} totalIconCount={SEARCHABLE_ICON_COUNT} />
    </main>
  )
}
