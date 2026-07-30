import { ImageResponse } from 'next/og'

export const alt = 'Free SVG icon on IconSearch'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

function humanize(value: string) {
  return decodeURIComponent(value)
    .replace(/\.svg$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .slice(0, 80)
}

export default async function IconOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string; iconName: string }>
}) {
  const { slug, iconName } = await params
  const iconLabel = humanize(iconName)
  const libraryLabel = humanize(slug)

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
        <div style={{ display: 'flex', color: '#c4b5fd', fontSize: '30px', fontWeight: 700 }}>
          IconSearch · {libraryLabel}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div style={{ display: 'flex', fontSize: '76px', lineHeight: 1.05, fontWeight: 850 }}>
            {iconLabel} SVG Icon
          </div>
          <div style={{ display: 'flex', color: '#cbd5e1', fontSize: '30px' }}>
            Customize, copy, and download free.
          </div>
        </div>
        <div style={{ display: 'flex', color: '#94a3b8', fontSize: '22px' }}>
          iconsearch.info
        </div>
      </div>
    ),
    size,
  )
}
