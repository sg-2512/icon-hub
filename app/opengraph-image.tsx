import { ImageResponse } from 'next/og'
import { NAMED_LIBRARY_COUNT, SEARCHABLE_ICON_COUNT } from '../data/library-catalog'

export const alt = 'IconSearch — search, customize, and download free SVG icons'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          color: '#f8fafc',
          background:
            'linear-gradient(135deg, #09090b 0%, #18112f 58%, #24164a 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '20px',
              background: '#8b5cf6',
              fontSize: '38px',
              fontWeight: 800,
            }}
          >
            IS
          </div>
          <div style={{ display: 'flex', fontSize: '40px', fontWeight: 800 }}>
            IconSearch
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div
            style={{
              display: 'flex',
              maxWidth: '960px',
              fontSize: '64px',
              lineHeight: 1.05,
              letterSpacing: '-2px',
              fontWeight: 850,
            }}
          >
            Find your icon system.
          </div>
          <div
            style={{
              display: 'flex',
              maxWidth: '900px',
              color: '#c4b5fd',
              fontSize: '28px',
              lineHeight: 1.35,
            }}
          >
            Search {SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} free SVG icons
            across {NAMED_LIBRARY_COUNT} open-source libraries.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            color: '#94a3b8',
            fontSize: '22px',
            letterSpacing: '1px',
          }}
        >
          iconsearch.info
        </div>
      </div>
    ),
    size,
  )
}
