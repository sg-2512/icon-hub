import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const width = 1600
const height = 1200
const outDir = path.join(process.cwd(), 'framer-plugin', 'media')

await mkdir(outDir, { recursive: true })

const images = [
  ['iconsearch-framer-cover.png', coverSvg()],
  ['iconsearch-framer-search.png', searchSvg()],
  ['iconsearch-framer-customize.png', customizeSvg()],
  ['iconsearch-framer-workflow.png', workflowSvg()],
]

for (const [filename, svg] of images) {
  await sharp(Buffer.from(svg)).png().toFile(path.join(outDir, filename))
}

console.log(`Created ${images.length} explanatory Framer Marketplace media images in ${outDir}`)

function coverSvg() {
  return shell(`
    ${defs()}
    <rect width="${width}" height="${height}" fill="#070b16"/>
    <circle cx="1340" cy="170" r="430" fill="url(#blueGlow)" opacity=".44"/>
    <circle cx="210" cy="1000" r="420" fill="url(#cyanGlow)" opacity=".28"/>
    <rect x="78" y="70" width="1444" height="1060" rx="76" fill="#0d1220" stroke="#22304a" stroke-width="2"/>

    ${logo(132, 126, 86)}
    ${text(242, 158, 'IconSearch for Framer', 62, '#f8fafc', 900, 48)}
    ${text(246, 240, 'Search 355,702 free SVG icons, customize them, and insert clean SVGs onto your Framer canvas.', 29, '#a7b4cc', 650, 72)}

    ${pluginPanel(930, 260, 480, 710)}
    ${canvasPanel(150, 384, 670, 430)}

    ${featurePill(150, 980, '355,702 icons', 'Search the live IconSearch catalog', '#22d3ee')}
    ${featurePill(500, 980, 'Customize', 'Pick size, color, or original colors', '#8b5cf6')}
    ${featurePill(850, 980, 'Drag & insert', 'Drop production-ready SVGs', '#60a5fa')}
  `)
}

function searchSvg() {
  return shell(`
    ${defs()}
    <rect width="${width}" height="${height}" fill="#f6f8fc"/>
    <rect x="80" y="74" width="1440" height="1052" rx="70" fill="#ffffff" stroke="#dbe4f0"/>
    ${logo(130, 128, 72)}
    ${text(224, 152, 'Find icons fast', 56, '#111827', 900, 42)}
    ${text(228, 230, 'Search by keyword, then narrow results by library, style, and legal-safe sources.', 28, '#64748b', 700, 72)}

    ${searchBox(148, 342, 625, 'comment')}
    ${filterBox(148, 436, 292, 'All libraries')}
    ${filterBox(470, 436, 250, 'All styles')}
    ${toggleRow(148, 520, 'Legal-safe only')}

    ${libraryStack(840, 330)}
    ${resultGrid(160, 610)}

    ${callout(945, 790, 'Live online results', 'No bundled database. The plugin searches IconSearch directly so users get the latest icon catalog.', '#2563eb')}
  `)
}

function customizeSvg() {
  return shell(`
    ${defs()}
    <rect width="${width}" height="${height}" fill="#0b1020"/>
    <circle cx="240" cy="210" r="410" fill="url(#cyanGlow)" opacity=".28"/>
    <circle cx="1370" cy="980" r="410" fill="url(#purpleGlow)" opacity=".34"/>
    <path d="M0 820 C340 710 520 890 830 760 C1120 640 1280 710 1600 548 L1600 1200 L0 1200 Z" fill="#121c35"/>

    ${text(112, 136, 'Customize before inserting', 60, '#f8fafc', 900, 44)}
    ${text(116, 220, 'Choose the canvas size, recolor monochrome icons, or keep each icon’s original colors.', 28, '#a7b4cc', 700, 70)}

    ${controlCard(112, 350)}
    ${beforeAfter(760, 360)}
    ${callout(928, 868, 'Clean SVG output', 'Icons are inserted as editable SVG layers, not flattened screenshots.', '#22d3ee', true)}
  `)
}

function workflowSvg() {
  return shell(`
    ${defs()}
    <rect width="${width}" height="${height}" fill="#f8fafc"/>
    <rect x="80" y="74" width="1440" height="1052" rx="70" fill="#ffffff" stroke="#dbe4f0"/>
    ${logo(130, 128, 72)}
    ${text(224, 152, 'Drag, insert, pin, repeat', 56, '#111827', 900, 44)}
    ${text(228, 230, 'Use the same icon workflow designers expect: drag to canvas, click to insert, and pin favorites.', 28, '#64748b', 700, 72)}

    ${stepCard(145, 355, '1', 'Search', 'Find the icon you need across libraries.', 'search')}
    ${arrow(465, 610, 575, 610, '#2563eb')}
    ${stepCard(610, 355, '2', 'Insert', 'Click or drag clean SVGs onto canvas.', 'drop')}
    ${arrow(930, 610, 1040, 610, '#7c3aed')}
    ${stepCard(1075, 355, '3', 'Pin', 'Save favorites for the next design pass.', 'pin')}

    <rect x="252" y="880" width="1096" height="92" rx="46" fill="#eef2ff" stroke="#dbe4f0"/>
    ${text(318, 938, 'Built for repeated Framer design work, not one-off copy/paste.', 30, '#1e293b', 900, 78)}
  `)
}

function pluginPanel(x, y, w, h) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="36" fill="#ffffff" filter="url(#shadow)"/>
    <rect x="${x}" y="${y}" width="${w}" height="82" rx="36" fill="#0b1220"/>
    ${logo(x + 26, y + 22, 42)}
    ${text(x + 82, y + 53, 'IconSearch', 25, '#f8fafc', 900, 24)}
    ${searchBox(x + 28, y + 112, w - 56, 'home')}
    ${filterBox(x + 28, y + 194, 206, 'All libraries')}
    ${filterBox(x + 248, y + 194, 204, 'All styles')}
    ${miniControl(x + 28, y + 270, 'Size', '96px')}
    ${miniControl(x + 248, y + 270, 'Color', 'Original')}
    ${iconResult(x + 32, y + 380, 'home', '#111827')}
    ${iconResult(x + 180, y + 380, 'arrow', '#2563eb')}
    ${iconResult(x + 328, y + 380, 'chart', '#8b5cf6')}
    ${iconResult(x + 32, y + 540, 'comment', '#111827')}
    ${iconResult(x + 180, y + 540, 'calendar', '#059669')}
    ${iconResult(x + 328, y + 540, 'star', '#f59e0b')}
  `
}

function canvasPanel(x, y, w, h) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="36" fill="#f8fafc" stroke="#dbe4f0" stroke-width="2"/>
    <rect x="${x + 34}" y="${y + 34}" width="${w - 68}" height="${h - 68}" rx="24" fill="#ffffff"/>
    <path d="M${x + 92} ${y + h - 118} C${x + 220} ${y + h - 180} ${x + 350} ${y + h - 80} ${x + 485} ${y + h - 148} C${x + 560} ${y + h - 186} ${x + 620} ${y + h - 150} ${x + 650} ${y + h - 128}" fill="none" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round"/>
    ${homeIcon(x + 220, y + 100, 140, '#111827')}
    ${arrowIcon(x + 440, y + 110, 112, '#2563eb')}
    ${chartIcon(x + 330, y + 270, 125, '#8b5cf6')}
  `
}

function resultGrid(x, y) {
  const cards = [
    ['comment', 'Prime', '#111827'],
    ['comment', 'Feather', '#111827'],
    ['comment', 'Meteor', '#6b7280'],
    ['comment', 'Mono', '#111827'],
    ['comment', 'IconPark', '#111827'],
    ['comment', 'Solid', '#111827'],
  ]
  return cards.map(([name, label, color], index) => {
    const col = index % 3
    const row = Math.floor(index / 3)
    return iconCard(x + col * 184, y + row * 176, name, 'comment', label, color)
  }).join('')
}

function libraryStack(x, y) {
  const items = [
    ['Popular libraries', 'Lucide, Heroicons, Tabler, Remix'],
    ['Iconify collections', '224 icon collections available'],
    ['Legal-safe filter', 'Only use icons safe for projects'],
  ]
  return `
    <rect x="${x}" y="${y}" width="560" height="390" rx="34" fill="#0f172a"/>
    ${text(x + 42, y + 62, 'Filter without friction', 34, '#f8fafc', 900, 40)}
    ${items.map(([title, body], index) => `
      <rect x="${x + 42}" y="${y + 106 + index * 86}" width="476" height="68" rx="18" fill="#172033"/>
      <circle cx="${x + 72}" cy="${y + 140 + index * 86}" r="10" fill="${index === 0 ? '#22d3ee' : index === 1 ? '#8b5cf6' : '#10b981'}"/>
      ${text(x + 96, y + 132 + index * 86, title, 20, '#f8fafc', 900, 28)}
      ${text(x + 96, y + 158 + index * 86, body, 16, '#a7b4cc', 650, 48)}
    `).join('')}
  `
}

function controlCard(x, y) {
  return `
    <rect x="${x}" y="${y}" width="560" height="502" rx="42" fill="#ffffff" filter="url(#shadow)"/>
    ${text(x + 42, y + 70, 'Before insert', 32, '#111827', 900, 34)}
    ${text(x + 42, y + 116, 'Set the icon exactly how you want it.', 22, '#64748b', 700, 40)}
    ${controlRow(x + 44, y + 178, 'Canvas size', '48, 64, 96, 128, 192, 256px')}
    ${controlRow(x + 44, y + 272, 'Color mode', 'Original colors or custom color')}
    ${controlRow(x + 44, y + 366, 'Saved icons', 'Pin favorites and reuse recent icons')}
  `
}

function controlRow(x, y, title, body) {
  return `
    <rect x="${x}" y="${y}" width="472" height="72" rx="22" fill="#f8fafc" stroke="#dbe4f0"/>
    ${text(x + 24, y + 31, title, 20, '#111827', 900, 28)}
    ${text(x + 24, y + 58, body, 16, '#64748b', 700, 48)}
  `
}

function beforeAfter(x, y) {
  return `
    <rect x="${x}" y="${y}" width="688" height="426" rx="42" fill="#ffffff" opacity=".98" filter="url(#shadow)"/>
    ${text(x + 42, y + 64, 'Live preview to clean SVG', 34, '#111827', 900, 42)}
    <rect x="${x + 54}" y="${y + 120}" width="250" height="210" rx="30" fill="#f8fafc" stroke="#dbe4f0"/>
    ${commentIcon(x + 125, y + 168, 105, '#111827')}
    ${text(x + 112, y + 366, 'Preview', 24, '#64748b', 900, 28)}
    ${arrow(x + 330, y + 224, x + 416, y + 224, '#7c3aed')}
    <rect x="${x + 438}" y="${y + 120}" width="196" height="210" rx="30" fill="#eef2ff" stroke="#dbe4f0"/>
    ${commentIcon(x + 486, y + 166, 105, '#2563eb')}
    ${text(x + 488, y + 366, '96px SVG', 24, '#2563eb', 900, 28)}
  `
}

function stepCard(x, y, n, title, body, icon) {
  return `
    <rect x="${x}" y="${y}" width="285" height="378" rx="38" fill="#ffffff" stroke="#dbe4f0" filter="url(#softShadow)"/>
    <circle cx="${x + 56}" cy="${y + 56}" r="28" fill="#2563eb"/>
    ${text(x + 47, y + 66, n, 26, '#ffffff', 900, 8)}
    <rect x="${x + 64}" y="${y + 116}" width="158" height="158" rx="34" fill="#eef2ff"/>
    ${icon === 'search' ? searchGlyph(x + 108, y + 158, 70, '#2563eb') : icon === 'drop' ? dropGlyph(x + 108, y + 158, 70, '#7c3aed') : pinGlyph(x + 108, y + 154, 76, '#059669')}
    ${text(x + 42, y + 318, title, 28, '#111827', 900, 26)}
    ${text(x + 42, y + 352, body, 16, '#64748b', 700, 32)}
  `
}

function featurePill(x, y, title, body, color) {
  return `
    <rect x="${x}" y="${y}" width="310" height="104" rx="30" fill="${color}" opacity=".15" stroke="${color}" stroke-opacity=".45"/>
    ${text(x + 28, y + 40, title, 24, '#f8fafc', 900, 26)}
    ${text(x + 28, y + 73, body, 16, '#cbd5e1', 700, 34)}
  `
}

function callout(x, y, title, body, color, dark = false) {
  return `
    <rect x="${x}" y="${y}" width="455" height="176" rx="34" fill="${dark ? '#111827' : '#ffffff'}" stroke="${dark ? '#22304a' : '#dbe4f0'}"/>
    <circle cx="${x + 44}" cy="${y + 48}" r="14" fill="${color}"/>
    ${text(x + 70, y + 56, title, 26, dark ? '#f8fafc' : '#111827', 900, 34)}
    ${text(x + 42, y + 104, body, 18, dark ? '#a7b4cc' : '#64748b', 700, 44)}
  `
}

function searchBox(x, y, w, value) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="64" rx="22" fill="#f1f5f9" stroke="#d8e2ef"/>
    ${searchGlyph(x + 26, y + 21, 24, '#64748b')}
    ${text(x + 68, y + 42, value, 21, '#111827', 900, 30)}
  `
}

function filterBox(x, y, w, value) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="58" rx="18" fill="#ffffff" stroke="#d8e2ef"/>
    ${text(x + 24, y + 37, value, 20, '#111827', 900, 24)}
    <path d="M${x + w - 34} ${y + 24} L${x + w - 24} ${y + 34} L${x + w - 14} ${y + 24}" stroke="#111827" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  `
}

function toggleRow(x, y, label) {
  return `
    <rect x="${x}" y="${y}" width="240" height="42" rx="21" fill="#eff6ff"/>
    <rect x="${x + 18}" y="${y + 12}" width="18" height="18" rx="5" fill="#2563eb"/>
    <path d="M${x + 23} ${y + 21} L${x + 27} ${y + 25} L${x + 34} ${y + 17}" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    ${text(x + 48, y + 28, label, 18, '#1d4ed8', 900, 30)}
  `
}

function miniControl(x, y, title, value) {
  return `
    ${text(x, y, title, 15, '#64748b', 900, 12)}
    <rect x="${x}" y="${y + 16}" width="204" height="52" rx="16" fill="#f8fafc" stroke="#d8e2ef"/>
    ${text(x + 18, y + 50, value, 18, '#111827', 900, 20)}
  `
}

function iconResult(x, y, name, color) {
  return iconCard(x, y, name, name, 'Iconify', color, 120, 138)
}

function iconCard(x, y, icon, name, lib, color, w = 156, h = 150) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="24" fill="#ffffff" stroke="#d8e2ef"/>
    <rect x="${x + w / 2 - 34}" y="${y + 20}" width="68" height="68" rx="18" fill="#eef2ff"/>
    ${drawIcon(icon, x + w / 2 - 18, y + 36, 36, color)}
    ${text(x + 22, y + 112, name, 18, '#111827', 900, 18)}
    ${text(x + 22, y + 136, lib, 15, '#64748b', 700, 20)}
  `
}

function drawIcon(icon, x, y, size, color) {
  if (icon === 'home') return homeIcon(x, y, size, color)
  if (icon === 'arrow') return arrowIcon(x, y, size, color)
  if (icon === 'chart') return chartIcon(x, y, size, color)
  if (icon === 'calendar') return calendarIcon(x, y, size, color)
  if (icon === 'star') return starIcon(x, y, size, color)
  return commentIcon(x, y, size, color)
}

function logo(x, y, size) {
  return `
    <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * .22}" fill="url(#brandGradient)"/>
    ${text(x + size * .28, y + size * .62, 'IS', size * .36, '#ffffff', 900, 8)}
  `
}

function homeIcon(x, y, s, color) {
  return `<path d="M${x + s * .08} ${y + s * .48} L${x + s * .5} ${y + s * .1} L${x + s * .92} ${y + s * .48} V${y + s * .92} H${x + s * .62} V${y + s * .64} H${x + s * .38} V${y + s * .92} H${x + s * .08} Z" fill="${color}"/>`
}

function arrowIcon(x, y, s, color) {
  return `<path d="M${x + s * .5} ${y + s * .08} L${x + s * .88} ${y + s * .46} L${x + s * .68} ${y + s * .66} L${x + s * .58} ${y + s * .56} V${y + s * .92} H${x + s * .42} V${y + s * .56} L${x + s * .32} ${y + s * .66} L${x + s * .12} ${y + s * .46} Z" fill="${color}"/>`
}

function chartIcon(x, y, s, color) {
  return `<path d="M${x + s * .12} ${y + s * .84} H${x + s * .9}" stroke="${color}" stroke-width="${s * .1}" stroke-linecap="round"/><rect x="${x + s * .2}" y="${y + s * .52}" width="${s * .14}" height="${s * .32}" rx="${s * .04}" fill="${color}"/><rect x="${x + s * .43}" y="${y + s * .3}" width="${s * .14}" height="${s * .54}" rx="${s * .04}" fill="${color}"/><rect x="${x + s * .66}" y="${y + s * .16}" width="${s * .14}" height="${s * .68}" rx="${s * .04}" fill="${color}"/>`
}

function calendarIcon(x, y, s, color) {
  return `<rect x="${x + s * .12}" y="${y + s * .2}" width="${s * .76}" height="${s * .68}" rx="${s * .1}" fill="none" stroke="${color}" stroke-width="${s * .1}"/><path d="M${x + s * .12} ${y + s * .4} H${x + s * .88}" stroke="${color}" stroke-width="${s * .1}"/><path d="M${x + s * .32} ${y + s * .12} V${y + s * .28} M${x + s * .68} ${y + s * .12} V${y + s * .28}" stroke="${color}" stroke-width="${s * .1}" stroke-linecap="round"/>`
}

function starIcon(x, y, s, color) {
  return `<path d="M${x + s * .5} ${y + s * .08} L${x + s * .62} ${y + s * .36} L${x + s * .92} ${y + s * .38} L${x + s * .69} ${y + s * .58} L${x + s * .76} ${y + s * .88} L${x + s * .5} ${y + s * .72} L${x + s * .24} ${y + s * .88} L${x + s * .31} ${y + s * .58} L${x + s * .08} ${y + s * .38} L${x + s * .38} ${y + s * .36} Z" fill="${color}"/>`
}

function commentIcon(x, y, s, color) {
  return `<path d="M${x + s * .14} ${y + s * .22} C${x + s * .28} ${y + s * .08} ${x + s * .62} ${y + s * .06} ${x + s * .78} ${y + s * .24} C${x + s * .94} ${y + s * .42} ${x + s * .86} ${y + s * .72} ${x + s * .62} ${y + s * .82} C${x + s * .5} ${y + s * .87} ${x + s * .36} ${y + s * .84} ${x + s * .24} ${y + s * .78} L${x + s * .1} ${y + s * .84} L${x + s * .16} ${y + s * .66} C${x + s * .05} ${y + s * .52} ${x + s * .04} ${y + s * .34} ${x + s * .14} ${y + s * .22} Z" fill="none" stroke="${color}" stroke-width="${s * .09}" stroke-linejoin="round"/>`
}

function searchGlyph(x, y, s, color) {
  return `<circle cx="${x + s * .38}" cy="${y + s * .38}" r="${s * .26}" fill="none" stroke="${color}" stroke-width="${s * .12}"/><path d="M${x + s * .6} ${y + s * .6} L${x + s * .9} ${y + s * .9}" stroke="${color}" stroke-width="${s * .12}" stroke-linecap="round"/>`
}

function dropGlyph(x, y, s, color) {
  return `<path d="M${x + s * .18} ${y + s * .1} L${x + s * .78} ${y + s * .44} L${x + s * .48} ${y + s * .54} L${x + s * .64} ${y + s * .88} L${x + s * .46} ${y + s * .96} L${x + s * .3} ${y + s * .62} L${x + s * .08} ${y + s * .82} Z" fill="${color}"/>`
}

function pinGlyph(x, y, s, color) {
  return `<path d="M${x + s * .32} ${y + s * .1} H${x + s * .68} L${x + s * .62} ${y + s * .42} L${x + s * .82} ${y + s * .62} V${y + s * .72} H${x + s * .55} L${x + s * .5} ${y + s * .96} L${x + s * .45} ${y + s * .72} H${x + s * .18} V${y + s * .62} L${x + s * .38} ${y + s * .42} Z" fill="${color}"/>`
}

function arrow(x1, y1, x2, y2, color) {
  return `<path d="M${x1} ${y1} C${x1 + 46} ${y1 - 46} ${x2 - 68} ${y2 - 46} ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round"/><path d="M${x2 - 28} ${y2 - 26} L${x2} ${y2} L${x2 - 36} ${y2 + 16}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`
}

function text(x, y, value, size, color, weight, maxChars = 40) {
  const lines = wrap(value, maxChars)
  return lines.map((line, index) => (
    `<text x="${x}" y="${y + index * size * 1.25}" fill="${color}" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${size}" font-weight="${weight}">${escapeXml(line)}</text>`
  )).join('')
}

function wrap(value, maxChars) {
  const words = String(value).split(' ')
  const lines = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (line && next.length > maxChars) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

function shell(content) {
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">${content}</svg>`
}

function defs() {
  return `
    <defs>
      <linearGradient id="brandGradient" x1="0" y1="1" x2="1" y2="0">
        <stop stop-color="#22d3ee"/>
        <stop offset=".55" stop-color="#3b82f6"/>
        <stop offset="1" stop-color="#8b5cf6"/>
      </linearGradient>
      <radialGradient id="blueGlow"><stop stop-color="#2563eb"/><stop offset="1" stop-color="#2563eb" stop-opacity="0"/></radialGradient>
      <radialGradient id="cyanGlow"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/></radialGradient>
      <radialGradient id="purpleGlow"><stop stop-color="#8b5cf6"/><stop offset="1" stop-color="#8b5cf6" stop-opacity="0"/></radialGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="24" stdDeviation="24" flood-color="#0f172a" flood-opacity=".18"/>
      </filter>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#0f172a" flood-opacity=".08"/>
      </filter>
    </defs>
  `
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
