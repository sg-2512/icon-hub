import { Suspense } from 'react'
import fs from 'fs'
import path from 'path'
import IconSearchClient from './IconSearchClient'
import { NAMED_LIBRARY_COUNT, SEARCHABLE_ICON_COUNT } from '../../data/library-catalog'
import { createPageMetadata } from '../../lib/seo'

const title = `Free SVG Icon Search — ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} Icons`
const description = `Search ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} free SVG icons from ${NAMED_LIBRARY_COUNT} open-source libraries. Customize icons, copy SVG or JSX, and export code for React, Vue, and Svelte.`

export const metadata = createPageMetadata({
  title,
  description,
  path: '/icon-search',
})

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
    <>
      <header style={{ maxWidth: '1500px', margin: '0 auto', padding: '40px 48px 0' }}>
        <h1 style={{ fontSize: 'clamp(34px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '12px' }}>
          Search {SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} Free SVG Icons
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '760px', lineHeight: 1.7 }}>
          Search, customize, and export icons from {NAMED_LIBRARY_COUNT} open-source libraries. Copy SVG or generate production-ready React, Vue, and Svelte code.
        </p>
      </header>
      <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}>// Booting Icon Engine...</div>}>
        <IconSearchClient initialData={initialData} />
      </Suspense>
    </>
  )
}
