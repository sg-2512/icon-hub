import StatsClient from './StatsClient'
import { NAMED_LIBRARY_COUNT, SEARCHABLE_ICON_COUNT } from '../../data/library-catalog'
import { createPageMetadata } from '../../lib/seo'

export const metadata = createPageMetadata({
  title: `Icon Library Statistics 2026 — Compare ${NAMED_LIBRARY_COUNT} Libraries`,
  description: `Explore statistics for ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} icons across ${NAMED_LIBRARY_COUNT} open-source libraries, including icon counts, license breakdowns, and size rankings.`,
  path: '/stats',
})

export default function StatsPage() {
  return <StatsClient />
}
