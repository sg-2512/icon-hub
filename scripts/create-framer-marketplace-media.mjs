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
    <rect width="${width}" height="${height}" fill="#f1f3f5"/>
    ${marketHeader('IconSearch for Framer', 'Find an icon, make it yours, and place an editable SVG without leaving the canvas.', '350,000+ icons')}
    ${framerWorkspace(64, 226, 1472, 904)}
    ${siteCanvas(166, 342, 790, 680)}
    ${productPanel(1022, 286, 450, 790, { query: 'home', color: '#2563eb', size: '96px' })}
    <path d="M1046 716 C998 716 962 606 894 592" fill="none" stroke="#f06449" stroke-width="7" stroke-linecap="round" stroke-dasharray="12 14"/>
    <path d="M912 574 L884 590 L910 608" fill="none" stroke="#f06449" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    ${numberBadge(1, 1064, 690, '#f06449')}
    ${captionChip(612, 736, 274, 'Drop editable SVG', '#fff2ee', '#b93821')}
  `)
}

function searchSvg() {
  return shell(`
    ${defs()}
    <rect width="${width}" height="${height}" fill="#f1f3f5"/>
    ${marketHeader('Find the right icon in seconds', 'Search the live catalog, then narrow results by library, style, and legal-safe status.', 'Search + filters')}
    <rect x="64" y="226" width="1472" height="904" rx="34" fill="#ffffff" stroke="#d8dde4"/>
    ${productPanel(104, 270, 600, 816, { query: 'calendar', color: '#111827', size: '64px', wide: true })}
    ${explainRow(790, 324, 1, 'Search naturally', 'Use familiar words such as calendar, chart, home, or arrow.', '#2563eb')}
    ${explainRow(790, 524, 2, 'Narrow the catalog', 'Choose a library and style, then switch on legal-safe results.', '#0a9b72')}
    ${explainRow(790, 724, 3, 'Compare before inserting', 'Scan icon, library, and visual style together in one result grid.', '#f06449')}
    ${connector(704, 384, 784, 354, '#2563eb')}
    ${connector(704, 548, 784, 554, '#0a9b72')}
    ${connector(704, 818, 784, 754, '#f06449')}
    <rect x="790" y="942" width="640" height="92" rx="20" fill="#17191d"/>
    ${text(824, 980, 'Live results. No stale bundled database.', 24, '#ffffff', 850, 44)}
    ${text(824, 1012, 'The newest IconSearch catalog is always one search away.', 17, '#b8bec8', 650, 58)}
  `)
}

function customizeSvg() {
  return shell(`
    ${defs()}
    <rect width="${width}" height="${height}" fill="#f1f3f5"/>
    ${marketHeader('Match the icon to your design', 'Set size and color before insertion, or preserve the artwork\'s original palette.', 'Size + color')}
    ${framerWorkspace(64, 226, 1472, 904)}
    ${productPanel(106, 286, 462, 790, { query: 'comment', color: '#2563eb', size: '128px' })}
    <rect x="642" y="314" width="808" height="686" rx="28" fill="#ffffff" stroke="#d8dde4"/>
    ${text(690, 370, 'Canvas preview', 18, '#737b87', 800, 24)}
    ${previewTile(690, 418, 210, 240, '#15171a', 'Original', 74)}
    ${previewTile(932, 418, 210, 240, '#2563eb', 'Blue · 96px', 96)}
    ${previewTile(1174, 418, 226, 240, '#f06449', 'Coral · 128px', 128)}
    <rect x="690" y="716" width="710" height="210" rx="24" fill="#f7f8fa" stroke="#d8dde4"/>
    ${text(728, 762, 'Inserted as an editable SVG layer', 26, '#17191d', 900, 44)}
    ${layerRow(728, 794, 'Comment.svg', 'Vector', '#2563eb')}
    ${text(728, 894, 'Resize, recolor, or animate it later in Framer.', 18, '#68717d', 650, 58)}
    <path d="M596 564 H626" fill="none" stroke="#2563eb" stroke-width="5" stroke-linecap="round"/>
    <path d="M616 552 L630 564 L616 576" fill="none" stroke="#2563eb" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    ${numberBadge(1, 574, 564, '#2563eb')}
    ${captionChip(166, 1014, 342, 'Choose size + color', '#eaf1ff', '#1f58c7')}
  `)
}

function legacyCustomizeSvg() {
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
    <rect width="${width}" height="${height}" fill="#f1f3f5"/>
    ${marketHeader('Search, drag, done', 'Move an icon from results to an editable Framer layer in one direct workflow.', 'Drag + insert')}
    <rect x="64" y="226" width="1472" height="904" rx="34" fill="#17191d"/>
    ${workflowStep(108, 282, 1, 'Find', 'Search and filter', '#2563eb')}
    ${workflowStep(574, 282, 2, 'Place', 'Drag or click', '#f06449')}
    ${workflowStep(1040, 282, 3, 'Keep moving', 'Edit, pin, reuse', '#0a9b72')}
    ${miniSearchPanel(108, 412)}
    ${dropCanvas(574, 412)}
    ${outputPanel(1040, 412)}
    <path d="M494 704 H548" fill="none" stroke="#f06449" stroke-width="7" stroke-linecap="round" stroke-dasharray="11 12"/>
    <path d="M538 688 L558 704 L538 720" fill="none" stroke="#f06449" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M960 704 H1014" fill="none" stroke="#0a9b72" stroke-width="7" stroke-linecap="round"/>
    <path d="M1004 688 L1024 704 L1004 720" fill="none" stroke="#0a9b72" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="194" y="1000" width="1212" height="78" rx="20" fill="#26292e" stroke="#3a3e45"/>
    ${pinGlyph(232, 1017, 42, '#f5c84b')}
    ${text(296, 1046, 'Pinned and recent icons keep the next design pass fast.', 23, '#ffffff', 800, 66)}
  `)
}

function legacyWorkflowSvg() {
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

function marketHeader(title, subtitle, tag) {
  return `
    ${logo(70, 62, 70)}
    ${text(164, 98, title, 48, '#17191d', 900, 50)}
    ${text(164, 148, subtitle, 22, '#606975', 650, 92)}
    <rect x="1302" y="72" width="228" height="48" rx="16" fill="#17191d"/>
    ${text(1330, 104, tag, 18, '#ffffff', 850, 24)}
  `
}

function framerWorkspace(x, y, w, h) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="34" fill="#1b1d21"/>
    <rect x="${x}" y="${y}" width="${w}" height="62" rx="34" fill="#24272c"/>
    <rect x="${x}" y="${y + 34}" width="${w}" height="28" fill="#24272c"/>
    <circle cx="${x + 28}" cy="${y + 31}" r="7" fill="#f06449"/>
    <circle cx="${x + 50}" cy="${y + 31}" r="7" fill="#f5c84b"/>
    <circle cx="${x + 72}" cy="${y + 31}" r="7" fill="#0a9b72"/>
    ${text(x + 112, y + 39, 'Framer · IconSearch demo', 16, '#d9dde3', 750, 34)}
    <rect x="${x + 18}" y="${y + 80}" width="58" height="${h - 98}" rx="18" fill="#24272c"/>
    ${toolButton(x + 31, y + 103, 'cursor')}
    ${toolButton(x + 31, y + 163, 'frame')}
    ${toolButton(x + 31, y + 223, 'text')}
    <rect x="${x + 92}" y="${y + 80}" width="${w - 110}" height="${h - 98}" rx="22" fill="#e7e9ed"/>
    <path d="M${x + 112} ${y + 130} H${x + w - 38} M${x + 112} ${y + 200} H${x + w - 38} M${x + 112} ${y + 270} H${x + w - 38}" stroke="#d9dce1" stroke-width="1"/>
  `
}

function toolButton(x, y, type) {
  if (type === 'text') return `<text x="${x + 9}" y="${y + 28}" fill="#d9dde3" font-family="Arial" font-size="26" font-weight="700">T</text>`
  if (type === 'frame') return `<rect x="${x + 8}" y="${y + 8}" width="24" height="24" rx="4" fill="none" stroke="#d9dde3" stroke-width="2"/>`
  return `<path d="M${x + 8} ${y + 6} L${x + 31} ${y + 22} L${x + 20} ${y + 24} L${x + 16} ${y + 35} Z" fill="#ffffff"/>`
}

function siteCanvas(x, y, w, h) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="24" fill="#ffffff" filter="url(#softShadow)"/>
    <rect x="${x + 34}" y="${y + 30}" width="${w - 68}" height="46" rx="12" fill="#f2f4f6"/>
    ${text(x + 56, y + 60, 'Framer canvas', 16, '#5f6874', 800, 18)}
    <rect x="${x + w - 214}" y="${y + 47}" width="42" height="6" rx="3" fill="#c6cbd2"/>
    <rect x="${x + w - 154}" y="${y + 47}" width="42" height="6" rx="3" fill="#c6cbd2"/>
    <rect x="${x + w - 94}" y="${y + 47}" width="42" height="6" rx="3" fill="#c6cbd2"/>
    ${text(x + 58, y + 154, 'Plan work.', 52, '#17191d', 900, 22)}
    ${text(x + 58, y + 214, 'Move together.', 52, '#17191d', 900, 22)}
    ${text(x + 58, y + 270, 'A calmer workspace for fast-moving teams.', 19, '#69717d', 650, 46)}
    <rect x="${x + 58}" y="${y + 308}" width="166" height="48" rx="14" fill="#17191d"/>
    ${text(x + 88, y + 339, 'Start planning', 16, '#ffffff', 800, 20)}
    <rect x="${x + 448}" y="${y + 122}" width="270" height="250" rx="24" fill="#eaf1ff"/>
    ${homeIcon(x + 520, y + 180, 126, '#2563eb')}
    <rect x="${x + 58}" y="${y + 430}" width="660" height="168" rx="20" fill="#f7f8fa" stroke="#e0e3e8"/>
    ${text(x + 90, y + 478, 'Weekly momentum', 18, '#17191d', 850, 24)}
    ${chartIcon(x + 92, y + 512, 72, '#0a9b72')}
    ${calendarIcon(x + 226, y + 512, 72, '#f06449')}
    ${commentIcon(x + 360, y + 512, 72, '#2563eb')}
    ${starIcon(x + 494, y + 512, 72, '#f5aa20')}
  `
}

function productPanel(x, y, w, h, options = {}) {
  const query = options.query || 'home'
  const color = options.color || '#2563eb'
  const size = options.size || '96px'
  const cols = 3
  const gap = 12
  const padding = 24
  const cardW = (w - padding * 2 - gap * (cols - 1)) / cols
  const names = query === 'calendar' ? ['calendar', 'calendar', 'calendar', 'calendar', 'calendar', 'calendar'] : query === 'comment' ? ['comment', 'comment', 'comment', 'comment', 'comment', 'comment'] : ['home', 'arrow', 'chart', 'comment', 'calendar', 'star']
  const libs = ['Lucide', 'Heroicons', 'Tabler', 'Phosphor', 'Remix', 'Iconify']
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="26" fill="#ffffff" stroke="#d7dce3" filter="url(#shadow)"/>
    ${logo(x + 22, y + 20, 42)}
    ${text(x + 78, y + 47, 'IconSearch', 21, '#17191d', 900, 20)}
    <rect x="${x + w - 86}" y="${y + 25}" width="62" height="30" rx="10" fill="#eef1f4"/>
    ${text(x + w - 72, y + 46, 'FREE', 12, '#59616d', 900, 10)}
    ${searchBox(x + padding, y + 82, w - padding * 2, query)}
    ${filterBox(x + padding, y + 158, (w - padding * 2 - 10) * .58, 'All libraries')}
    ${filterBox(x + padding + (w - padding * 2 - 10) * .58 + 10, y + 158, (w - padding * 2 - 10) * .42, 'All styles')}
    ${miniControlSized(x + padding, y + 238, (w - padding * 2 - 12) / 2, 'Size', size)}
    ${miniColorControl(x + padding + (w - padding * 2 - 12) / 2 + 12, y + 238, (w - padding * 2 - 12) / 2, color)}
    ${toggleRow(x + padding, y + 320, 'Legal-safe only')}
    ${text(x + w - 154, y + 348, 'Pinned 4', 15, '#69717d', 800, 16)}
    ${names.map((name, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols
      return productResultCard(x + padding + col * (cardW + gap), y + 386 + row * 174, cardW, name, libs[index], index === 0 ? color : '#17191d', index === 0)
    }).join('')}
  `
}

function miniControlSized(x, y, w, title, value) {
  return `
    ${text(x, y, title.toUpperCase(), 12, '#747c87', 900, 12)}
    <rect x="${x}" y="${y + 12}" width="${w}" height="54" rx="14" fill="#f7f8fa" stroke="#d8dde4"/>
    ${text(x + 16, y + 46, value, 17, '#17191d', 850, 18)}
  `
}

function miniColorControl(x, y, w, color) {
  return `
    ${text(x, y, 'COLOR', 12, '#747c87', 900, 12)}
    <rect x="${x}" y="${y + 12}" width="${w}" height="54" rx="14" fill="#f7f8fa" stroke="#d8dde4"/>
    <circle cx="${x + 24}" cy="${y + 39}" r="12" fill="${color}"/>
    ${text(x + 44, y + 46, color.toUpperCase(), 15, '#17191d', 850, 12)}
  `
}

function productResultCard(x, y, w, icon, lib, color, selected) {
  const label = icon === 'arrow' ? 'arrow-up' : icon
  return `
    <rect x="${x}" y="${y}" width="${w}" height="158" rx="18" fill="${selected ? '#eef4ff' : '#ffffff'}" stroke="${selected ? '#2563eb' : '#d8dde4'}" stroke-width="${selected ? 2 : 1}"/>
    <rect x="${x + 16}" y="${y + 14}" width="${w - 32}" height="78" rx="14" fill="#f5f6f8"/>
    ${drawIcon(icon, x + w / 2 - 24, y + 30, 48, color)}
    ${text(x + 14, y + 118, label, 15, '#17191d', 850, 14)}
    ${text(x + 14, y + 142, lib, 12, '#747c87', 700, 14)}
  `
}

function numberBadge(number, x, y, color) {
  return `<circle cx="${x}" cy="${y}" r="22" fill="${color}" stroke="#ffffff" stroke-width="5"/>${text(x - 6, y + 7, String(number), 19, '#ffffff', 900, 2)}`
}

function captionChip(x, y, w, label, fill, color) {
  return `<rect x="${x}" y="${y}" width="${w}" height="52" rx="16" fill="${fill}" stroke="${color}" stroke-opacity=".24"/>${text(x + 22, y + 34, label, 18, color, 850, 26)}`
}

function explainRow(x, y, number, title, body, color) {
  return `
    <circle cx="${x + 28}" cy="${y + 30}" r="26" fill="${color}"/>
    ${text(x + 21, y + 38, String(number).padStart(2, '0'), 16, '#ffffff', 900, 3)}
    ${text(x + 76, y + 22, title, 28, '#17191d', 900, 34)}
    ${text(x + 76, y + 60, body, 18, '#66707c', 650, 56)}
  `
}

function connector(x1, y1, x2, y2, color) {
  return `<path d="M${x1} ${y1} C${x1 + 20} ${y1} ${x2 - 20} ${y2} ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round"/><circle cx="${x1}" cy="${y1}" r="7" fill="${color}"/>`
}

function previewTile(x, y, w, h, color, label, iconSize) {
  const s = Math.min(iconSize, 118)
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="#f7f8fa" stroke="#d8dde4"/>
    ${commentIcon(x + w / 2 - s / 2, y + 42, s, color)}
    ${text(x + 24, y + h - 26, label, 17, '#424a55', 850, 20)}
  `
}

function layerRow(x, y, name, type, color) {
  return `
    <rect x="${x}" y="${y}" width="634" height="70" rx="16" fill="#ffffff" stroke="#d8dde4"/>
    <rect x="${x + 18}" y="${y + 17}" width="36" height="36" rx="10" fill="#eaf1ff"/>
    ${commentIcon(x + 27, y + 26, 18, color)}
    ${text(x + 72, y + 32, name, 17, '#17191d', 850, 22)}
    ${text(x + 72, y + 55, type, 13, '#747c87', 700, 12)}
    ${text(x + 536, y + 42, '128 × 128', 14, '#747c87', 750, 12)}
  `
}

function workflowStep(x, y, number, title, body, color) {
  return `
    <circle cx="${x + 24}" cy="${y + 24}" r="24" fill="${color}"/>
    ${text(x + 18, y + 31, String(number), 17, '#ffffff', 900, 2)}
    ${text(x + 64, y + 18, title, 26, '#ffffff', 900, 20)}
    ${text(x + 64, y + 48, body, 16, '#aeb4bd', 700, 22)}
  `
}

function miniSearchPanel(x, y) {
  return `
    <rect x="${x}" y="${y}" width="368" height="512" rx="26" fill="#ffffff"/>
    ${logo(x + 22, y + 20, 38)}
    ${text(x + 72, y + 45, 'IconSearch', 19, '#17191d', 900, 20)}
    ${searchBox(x + 22, y + 78, 324, 'home')}
    ${filterBox(x + 22, y + 154, 190, 'All libraries')}
    ${filterBox(x + 222, y + 154, 124, 'Style')}
    ${productResultCard(x + 22, y + 238, 150, 'home', 'Lucide', '#2563eb', true)}
    ${productResultCard(x + 194, y + 238, 150, 'home', 'Heroicons', '#17191d', false)}
    <rect x="${x + 22}" y="${y + 426}" width="324" height="54" rx="16" fill="#eef4ff"/>
    ${text(x + 82, y + 460, 'Drag this SVG', 18, '#1f58c7', 850, 24)}
    ${dropGlyph(x + 46, y + 440, 26, '#2563eb')}
  `
}

function dropCanvas(x, y) {
  return `
    <rect x="${x}" y="${y}" width="368" height="512" rx="26" fill="#eceef2"/>
    <rect x="${x + 34}" y="${y + 42}" width="300" height="414" rx="22" fill="#ffffff" stroke="#d8dde4"/>
    ${text(x + 64, y + 88, 'Project overview', 19, '#17191d', 900, 24)}
    ${text(x + 64, y + 120, 'Everything your team needs.', 15, '#737b87', 650, 32)}
    <rect x="${x + 64}" y="${y + 160}" width="240" height="190" rx="20" fill="#eaf1ff" stroke="#2563eb" stroke-width="2" stroke-dasharray="8 8"/>
    ${homeIcon(x + 130, y + 204, 108, '#2563eb')}
    <rect x="${x + 64}" y="${y + 382}" width="174" height="44" rx="13" fill="#17191d"/>
    ${text(x + 92, y + 411, 'Editable SVG', 15, '#ffffff', 850, 18)}
  `
}

function outputPanel(x, y) {
  return `
    <rect x="${x}" y="${y}" width="368" height="512" rx="26" fill="#ffffff"/>
    ${text(x + 28, y + 48, 'Selected layer', 18, '#737b87', 800, 20)}
    <rect x="${x + 28}" y="${y + 76}" width="312" height="82" rx="18" fill="#f7f8fa" stroke="#d8dde4"/>
    ${homeIcon(x + 50, y + 98, 38, '#2563eb')}
    ${text(x + 108, y + 111, 'Home.svg', 18, '#17191d', 850, 18)}
    ${text(x + 108, y + 136, 'Vector layer', 13, '#747c87', 700, 16)}
    ${miniControlSized(x + 28, y + 194, 144, 'Width', '96px')}
    ${miniControlSized(x + 196, y + 194, 144, 'Height', '96px')}
    ${miniColorControl(x + 28, y + 286, 312, '#2563eb')}
    <rect x="${x + 28}" y="${y + 386}" width="142" height="52" rx="15" fill="#fff7dd"/>
    ${pinGlyph(x + 46, y + 400, 26, '#b77a00')}
    ${text(x + 84, y + 419, 'Pinned', 16, '#805600', 850, 14)}
    <rect x="${x + 186}" y="${y + 386}" width="154" height="52" rx="15" fill="#e8f7f2"/>
    ${text(x + 214, y + 419, 'Recent', 16, '#087454', 850, 14)}
  `
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
    ['Iconify collections', '220+ icon collections available'],
    ['Legal-safe filter', 'Focus on icons marked legal-safe'],
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
