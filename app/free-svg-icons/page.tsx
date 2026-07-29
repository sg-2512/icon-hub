import { Metadata } from 'next'
import { allLibraries, SEARCHABLE_ICON_COUNT } from '../../data/library-catalog'
import BrowsePageClient from './BrowsePageClient'

export const metadata: Metadata = {
  title: 'Free SVG Icons for Web Projects — All 242 Open Source Libraries',
  description: `Browse 242 open-source SVG icon libraries for web projects, search ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} icons across Lucide, Heroicons, Mage, Solar, Tabler, Material Symbols, and more.`,
}

export default function FreeSvgIconsPage() {
  return (
    <main>
      <BrowsePageClient libraries={allLibraries} totalIconCount={SEARCHABLE_ICON_COUNT} />
    </main>
  )
}
