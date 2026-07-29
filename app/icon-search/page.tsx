import { Suspense } from 'react'
import fs from 'fs'
import path from 'path'
import IconSearchClient from './IconSearchClient'
import { SEARCHABLE_ICON_COUNT } from '../../data/library-catalog'

export const metadata = {
  title: `Icon Search Engine — ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} Free SVG Icons (2026)`,
  description: 'Search across Lucide, Heroicons, Phosphor, Tabler, Iconoir, and 229+ open-source icon libraries. Copy SVG, export to React, Vue, Svelte, or generate SVG sprites dynamically.',
}

export default async function IconSearchServerPage() {
  // Pre-load popular initial data for SSR to avoid Google "empty layout box" penalty
  let initialData = undefined
  try {
    const filePath = path.join(process.cwd(), 'data', 'icon-search (1).json')
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const parsedData = JSON.parse(fileContents)
      
      // We only want the first 80 icons to keep HTML payload reasonable
      if (parsedData && Array.isArray(parsedData.icons)) {
        initialData = {
          ...parsedData,
          icons: parsedData.icons.slice(0, 80),
          limit: 80,
          page: 1,
        }
      }
    }
  } catch (error) {
    console.error('Failed to load initial icon data for SSR:', error)
  }

  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}>// Booting Icon Engine...</div>}>
      <IconSearchClient initialData={initialData} />
    </Suspense>
  )
}
