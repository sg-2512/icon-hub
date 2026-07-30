import StatsClient from './StatsClient'
import { SEARCHABLE_ICON_COUNT } from '../../data/library-catalog'

export const metadata = {
  title: `Icon Library Stats & Rankings (2026) — ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} Icons Across 229 Libraries`,
  description: 'Live statistics and ecosystem analytics for 229 open-source icon libraries. Icon counts, license breakdown, volume rankings, and library metadata compared.',
}

export default function StatsPage() {
  return <StatsClient />
}