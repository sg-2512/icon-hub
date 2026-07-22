import JSZip from 'jszip'
import { getCleanSvgUrl } from './icon-preview'

export type Icon = {
  id: string
  name: string
  displayName: string
  library: string
  libraryName: string
  npmPackage: string
  license: string
  tags: string[]
  reactImport: string
  reactUsage: string
  svgUrl: string
  legalSafe?: boolean
  licenseUrl?: string
}

export type CartItem = {
  key: string
  icon: Icon
  size: number
  stroke: number
  color: string
}

export type ExportConfig = {
  packageName: string
  items: CartItem[]
  formats: {
    svg: boolean
    png: boolean
    react: boolean
    vue: boolean
    tailwind: boolean
    sprite: boolean
  }
  pngScale: number
  usePreset: boolean
  presetSize: number
  presetStroke: number
  presetColor: string
}

type ExportMetadata = {
  id: string
  name: string
  library: string
  libraryName: string
  license: string
  legalSafe: boolean
  exportedConfig: {
    size: number
    stroke: number
    color: string
  }
}

export function customizeSvg(
  rawSvg: string,
  size: number,
  stroke: number,
  color: string
): string {
  if (!rawSvg) return ''
  let parsed = rawSvg
  parsed = parsed.replace(/width="[^"]*"/g, `width="${size}"`)
  parsed = parsed.replace(/height="[^"]*"/g, `height="${size}"`)
  parsed = parsed.replace(/stroke-width="[^"]*"/g, `stroke-width="${stroke}"`)
  parsed = parsed.replace(/stroke="currentColor"/g, `stroke="${color}"`)
  parsed = parsed.replace(/fill="currentColor"/g, `fill="${color}"`)
  if (!parsed.includes('width=')) parsed = parsed.replace('<svg', `<svg width="${size}"`)
  if (!parsed.includes('height=')) parsed = parsed.replace('<svg', `<svg height="${size}"`)
  if (!parsed.includes('stroke-width=')) parsed = parsed.replace('<svg', `<svg stroke-width="${stroke}"`)
  return parsed
}

export function renderSvgToPng(
  svgString: string,
  targetSize: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Canvas rendering is only supported in browser environments.'))
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = targetSize
    canvas.height = targetSize
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Failed to get 2d canvas context'))
      return
    }

    const img = new Image()
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      ctx.clearRect(0, 0, targetSize, targetSize)
      ctx.drawImage(img, 0, 0, targetSize, targetSize)
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url)
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to convert canvas to PNG blob'))
        }
      }, 'image/png')
    }

    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }

    img.src = url
  })
}

export function compileSvgSprite(
  items: { item: CartItem; svg: string }[],
  usePreset: boolean,
  presetStroke: number,
  presetColor: string
): string {
  let symbols = ''
  for (const { item, svg } of items) {
    if (!svg) continue

    const stroke = usePreset ? presetStroke : item.stroke
    const color = usePreset ? presetColor : item.color
    const styledSvg = customizeSvg(svg, 24, stroke, color)

    const innerContent = styledSvg
      .replace(/<svg[^>]*>/, '')
      .replace(/<\/svg>/, '')
      .trim()

    const viewBoxMatch = styledSvg.match(/viewBox="([^"]*)"/)
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24'
    const symbolId = `icon-${item.icon.library}-${item.icon.name}`

    symbols += `  <symbol id="${symbolId}" viewBox="${viewBox}">\n    ${innerContent}\n  </symbol>\n`
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">\n${symbols}</svg>`
}

export function generateReactComponent(
  name: string,
  svgContent: string
): string {
  const componentName = name
    .split(/[-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')

  let jsxSvg = svgContent
    .replace(/class=/g, 'className=')
    .replace(/stroke-width=/g, 'strokeWidth=')
    .replace(/stroke-linecap=/g, 'strokeLinecap=')
    .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
    .replace(/fill-rule=/g, 'fillRule=')
    .replace(/clip-rule=/g, 'clipRule=')
    .replace(/stroke-dasharray=/g, 'strokeDasharray=')
    .replace(/stroke-dashoffset=/g, 'strokeDashoffset=')
    .replace(/width="[^"]*"/, 'width={size}')
    .replace(/height="[^"]*"/, 'height={size}')

  if (!jsxSvg.includes('width={size}')) {
    jsxSvg = jsxSvg.replace('<svg', '<svg width={size}')
  }
  if (!jsxSvg.includes('height={size}')) {
    jsxSvg = jsxSvg.replace('<svg', '<svg height={size}')
  }

  return `import React from 'react'

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
}

export default function Icon${componentName}({ size = 24, ...props }: IconProps) {
  return (
    ${jsxSvg.replace('<svg', '<svg {...props}')}
  )
}
`
}

export function generateVueComponent(svgContent: string): string {
  let vueSvg = svgContent
    .replace(/width="[^"]*"/, ':width="size"')
    .replace(/height="[^"]*"/, ':height="size"')

  if (!vueSvg.includes(':width=')) {
    vueSvg = vueSvg.replace('<svg', '<svg :width="size"')
  }
  if (!vueSvg.includes(':height=')) {
    vueSvg = vueSvg.replace('<svg', '<svg :height="size"')
  }

  return `<template>
  ${vueSvg}
</template>

<script setup>
defineProps({
  size: {
    type: [Number, String],
    default: 24
  }
})
</script>
`
}

export async function fetchAllCartSvgs(
  items: CartItem[],
  onProgress?: (text: string) => void
): Promise<{ item: CartItem; svg: string }[]> {
  if (onProgress) onProgress('Fetching SVG sources...')
  const promises = items.map(async (item) => {
    try {
      const url = getCleanSvgUrl(item.icon.svgUrl, item.icon.library)
      const res = await fetch(url)
      const svg = await res.text()
      return { item, svg }
    } catch (e) {
      console.error(`Failed to fetch SVG for ${item.icon.name}`, e)
      return { item, svg: '' }
    }
  })
  return Promise.all(promises)
}

export async function generateZipPackage(
  config: ExportConfig,
  onProgress?: (text: string) => void
): Promise<void> {
  const { packageName, items, formats, pngScale, usePreset, presetSize, presetStroke, presetColor } = config
  if (items.length === 0) return

  // 1. Fetch all raw SVGs in parallel
  const fetched = await fetchAllCartSvgs(items, onProgress)

  // 2. Initialize JSZip
  if (onProgress) onProgress('Compiling workspace files...')
  const zip = new JSZip()
  const metadataList: ExportMetadata[] = []

  const svgFolder = formats.svg ? zip.folder('svg') : null
  const pngFolder = formats.png ? zip.folder('png') : null
  const reactFolder = formats.react ? zip.folder('react') : null
  const vueFolder = formats.vue ? zip.folder('vue') : null
  const tailwindFolder = formats.tailwind ? zip.folder('tailwind-html') : null

  // 3. Loop through fetched assets and customize
  for (const { item, svg } of fetched) {
    if (!svg) continue

    const size = usePreset ? presetSize : item.size
    const stroke = usePreset ? presetStroke : item.stroke
    const color = usePreset ? presetColor : item.color

    const customizedSvg = customizeSvg(svg, size, stroke, color)
    const componentName = item.icon.name
      .split(/[-_]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')

    // A. SVG Format
    if (svgFolder) {
      svgFolder.file(`${item.icon.name}.svg`, customizedSvg)
    }

    // B. React Format
    if (reactFolder) {
      reactFolder.file(`Icon${componentName}.tsx`, generateReactComponent(item.icon.name, customizedSvg))
    }

    // C. Vue Format
    if (vueFolder) {
      vueFolder.file(`Icon${componentName}.vue`, generateVueComponent(customizedSvg))
    }

    // D. HTML/Tailwind Format
    if (tailwindFolder) {
      tailwindFolder.file(`${item.icon.name}.html`, customizedSvg)
    }

    // E. PNG Format (batch render via canvas)
    if (pngFolder) {
      if (onProgress) onProgress(`Rasterizing ${item.icon.name} to PNG...`)
      try {
        const targetSize = size * pngScale
        const pngBlob = await renderSvgToPng(customizedSvg, targetSize)
        pngFolder.file(`${item.icon.name}.png`, pngBlob)
      } catch (e) {
        console.error(`Failed to render PNG for ${item.icon.name}`, e)
      }
    }

    metadataList.push({
      id: item.icon.id,
      name: item.icon.name,
      library: item.icon.library,
      libraryName: item.icon.libraryName,
      license: item.icon.license,
      legalSafe: Boolean(item.icon.legalSafe),
      exportedConfig: { size, stroke, color }
    })
  }

  // 4. Combined SVG Sprite Sheet
  if (formats.sprite) {
    if (onProgress) onProgress('Compiling SVG Sprite sheet...')
    const spriteContent = compileSvgSprite(fetched, usePreset, presetStroke, presetColor)
    zip.file('sprite.svg', spriteContent)
  }

  // 5. Package Metadata
  zip.file('metadata.json', JSON.stringify({
    packageName: packageName || 'icon-hub-package',
    exportedAt: new Date().toISOString(),
    totalIcons: items.length,
    configUsed: {
      usePreset,
      presetSize: usePreset ? presetSize : 'custom',
      presetStroke: usePreset ? presetStroke : 'custom',
      presetColor: usePreset ? presetColor : 'custom',
      pngScale: formats.png ? pngScale : 'N/A'
    },
    icons: metadataList
  }, null, 2))

  // 6. Generate and download ZIP
  if (onProgress) onProgress('Compressing package ZIP archive...')
  const zipBlob = await zip.generateAsync({ type: 'blob' })

  if (onProgress) onProgress('Triggering download...')
  const downloadUrl = URL.createObjectURL(zipBlob)
  const downloadLink = document.createElement('a')
  downloadLink.href = downloadUrl
  downloadLink.download = `${packageName || 'icon-hub-package'}.zip`
  document.body.appendChild(downloadLink)
  downloadLink.click()
  downloadLink.remove()
  URL.revokeObjectURL(downloadUrl)
}
