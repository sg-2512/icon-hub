const sharp = require('sharp');

const screenshots = [
  {
    filename: 'public/webflow-screenshot-1.png',
    title: 'Secure IconSearch Device Sign-In',
    subtitle: 'Authentication and Session Security inside Webflow Designer',
    badge: 'Step 1: Authenticate',
    accent: '#2563eb',
    previewSvg: `
      <rect x="360" y="240" width="560" height="380" rx="20" fill="#1e293b" stroke="#334155" stroke-width="2"/>
      <circle cx="640" cy="340" r="44" fill="#2563eb"/>
      <text x="640" y="354" text-anchor="middle" fill="#ffffff" font-size="32" font-weight="800">IS</text>
      <text x="640" y="430" text-anchor="middle" fill="#ffffff" font-size="24" font-weight="700">Connect your IconSearch Account</text>
      <text x="640" y="470" text-anchor="middle" fill="#94a3b8" font-size="16">Search and insert 355,000+ open-source SVG icons</text>
      <rect x="480" y="510" width="320" height="56" rx="12" fill="#2563eb"/>
      <text x="640" y="546" text-anchor="middle" fill="#ffffff" font-size="18" font-weight="700">Sign in with IconSearch</text>
    `
  },
  {
    filename: 'public/webflow-screenshot-2.png',
    title: 'Instant Search Across 355,000+ SVG Icons',
    subtitle: '100+ Icon Libraries (Lucide, Heroicons, Tabler, Phosphor, Remix)',
    badge: 'Step 2: Search Icons',
    accent: '#38bdf8',
    previewSvg: `
      <rect x="240" y="220" width="800" height="440" rx="20" fill="#1e293b" stroke="#334155" stroke-width="2"/>
      <rect x="280" y="260" width="480" height="56" rx="12" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
      <text x="320" y="296" fill="#f8fafc" font-size="18">Search home, arrow, user...</text>
      <rect x="780" y="260" width="220" height="56" rx="12" fill="#0f172a" stroke="#334155" stroke-width="2"/>
      <text x="810" y="296" fill="#f8fafc" font-size="16">All libraries</text>
      <rect x="280" y="340" width="165" height="130" rx="14" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
      <text x="362" y="400" text-anchor="middle" fill="#38bdf8" font-size="40">⚡</text>
      <text x="362" y="445" text-anchor="middle" fill="#f8fafc" font-size="14" font-weight="700">Lucide</text>

      <rect x="465" y="340" width="165" height="130" rx="14" fill="#0f172a" stroke="#334155" stroke-width="1"/>
      <text x="547" y="400" text-anchor="middle" fill="#34d399" font-size="40">🎯</text>
      <text x="547" y="445" text-anchor="middle" fill="#f8fafc" font-size="14" font-weight="700">Heroicons</text>

      <rect x="650" y="340" width="165" height="130" rx="14" fill="#0f172a" stroke="#334155" stroke-width="1"/>
      <text x="732" y="400" text-anchor="middle" fill="#f472b6" font-size="40">🔥</text>
      <text x="732" y="445" text-anchor="middle" fill="#f8fafc" font-size="14" font-weight="700">Tabler</text>

      <rect x="835" y="340" width="165" height="130" rx="14" fill="#0f172a" stroke="#334155" stroke-width="1"/>
      <text x="917" y="400" text-anchor="middle" fill="#fb923c" font-size="40">🚀</text>
      <text x="917" y="445" text-anchor="middle" fill="#f8fafc" font-size="14" font-weight="700">Remix</text>

      <rect x="280" y="490" width="165" height="130" rx="14" fill="#0f172a" stroke="#334155" stroke-width="1"/>
      <text x="362" y="550" text-anchor="middle" fill="#a78bfa" font-size="40">🎨</text>
      <text x="362" y="595" text-anchor="middle" fill="#f8fafc" font-size="14" font-weight="700">Phosphor</text>

      <rect x="465" y="490" width="165" height="130" rx="14" fill="#0f172a" stroke="#334155" stroke-width="1"/>
      <text x="547" y="550" text-anchor="middle" fill="#60a5fa" font-size="40">💎</text>
      <text x="547" y="595" text-anchor="middle" fill="#f8fafc" font-size="14" font-weight="700">Bootstrap</text>

      <rect x="650" y="490" width="165" height="130" rx="14" fill="#0f172a" stroke="#334155" stroke-width="1"/>
      <text x="732" y="550" text-anchor="middle" fill="#fbbf24" font-size="40">✨</text>
      <text x="732" y="595" text-anchor="middle" fill="#f8fafc" font-size="14" font-weight="700">Feather</text>

      <rect x="835" y="490" width="165" height="130" rx="14" fill="#0f172a" stroke="#334155" stroke-width="1"/>
      <text x="917" y="550" text-anchor="middle" fill="#2dd4bf" font-size="40">🌐</text>
      <text x="917" y="595" text-anchor="middle" fill="#f8fafc" font-size="14" font-weight="700">Iconify</text>
    `
  },
  {
    filename: 'public/webflow-screenshot-3.png',
    title: 'Real-Time SVG Color and Size Customization',
    subtitle: 'HEX Color Picker, Preset Swatches, and Dynamic Resizing (16px to 256px)',
    badge: 'Step 3: Customize Style',
    accent: '#34d399',
    previewSvg: `
      <rect x="280" y="240" width="720" height="400" rx="20" fill="#1e293b" stroke="#334155" stroke-width="2"/>
      <rect x="330" y="280" width="140" height="140" rx="18" fill="#0f172a" stroke="#34d399" stroke-width="3"/>
      <text x="400" y="365" text-anchor="middle" fill="#34d399" font-size="64">⚡</text>
      
      <text x="500" y="320" fill="#ffffff" font-size="24" font-weight="800">Lucide Arrow Icon</text>
      <text x="500" y="355" fill="#94a3b8" font-size="16">Size: 48px  |  Color: #34D399 (Brand Green)</text>
      
      <circle cx="520" cy="400" r="18" fill="#34d399" stroke="#ffffff" stroke-width="3"/>
      <circle cx="570" cy="400" r="18" fill="#38bdf8"/>
      <circle cx="620" cy="400" r="18" fill="#f472b6"/>
      <circle cx="670" cy="400" r="18" fill="#fb923c"/>
      <circle cx="720" cy="400" r="18" fill="#ffffff"/>

      <rect x="330" y="470" width="620" height="12" rx="6" fill="#0f172a"/>
      <rect x="330" y="470" width="280" height="12" rx="6" fill="#34d399"/>
      <circle cx="610" cy="476" r="14" fill="#ffffff"/>

      <rect x="330" y="520" width="620" height="56" rx="14" fill="#34d399"/>
      <text x="640" y="556" text-anchor="middle" fill="#0f172a" font-size="18" font-weight="800">Apply Style Customization</text>
    `
  },
  {
    filename: 'public/webflow-screenshot-4.png',
    title: '1-Click Webflow Designer Canvas Insertion',
    subtitle: 'Target Placement: Inside Selection, After Selection, or Before Selection',
    badge: 'Step 4: Insert to Canvas',
    accent: '#f472b6',
    previewSvg: `
      <rect x="280" y="240" width="720" height="400" rx="20" fill="#1e293b" stroke="#334155" stroke-width="2"/>
      <text x="640" y="300" text-anchor="middle" fill="#ffffff" font-size="24" font-weight="800">Select Webflow Canvas Target</text>
      
      <rect x="330" y="340" width="180" height="140" rx="16" fill="#0f172a" stroke="#f472b6" stroke-width="3"/>
      <text x="420" y="400" text-anchor="middle" fill="#f472b6" font-size="32">📥</text>
      <text x="420" y="445" text-anchor="middle" fill="#ffffff" font-size="16" font-weight="700">Inside Selection</text>

      <rect x="550" y="340" width="180" height="140" rx="16" fill="#0f172a" stroke="#334155" stroke-width="2"/>
      <text x="640" y="400" text-anchor="middle" fill="#94a3b8" font-size="32">➡️</text>
      <text x="640" y="445" text-anchor="middle" fill="#ffffff" font-size="16" font-weight="700">After Selection</text>

      <rect x="770" y="340" width="180" height="140" rx="16" fill="#0f172a" stroke="#334155" stroke-width="2"/>
      <text x="860" y="400" text-anchor="middle" fill="#94a3b8" font-size="32">⬅️</text>
      <text x="860" y="445" text-anchor="middle" fill="#ffffff" font-size="16" font-weight="700">Before Selection</text>

      <rect x="330" y="520" width="620" height="56" rx="14" fill="#f472b6"/>
      <text x="640" y="556" text-anchor="middle" fill="#0f172a" font-size="18" font-weight="800">Insert SVG into Webflow Canvas</text>
    `
  },
  {
    filename: 'public/webflow-screenshot-5.png',
    title: 'Commercial-Safe License Filtering',
    subtitle: 'Filter 100% Legal-Safe Icons (MIT, Apache 2.0, CC0) for Business Projects',
    badge: 'Step 5: Commercial Safety',
    accent: '#fb923c',
    previewSvg: `
      <rect x="280" y="240" width="720" height="400" rx="20" fill="#1e293b" stroke="#334155" stroke-width="2"/>
      
      <rect x="330" y="280" width="620" height="64" rx="14" fill="#0f172a" stroke="#fb923c" stroke-width="2"/>
      <text x="370" y="320" fill="#fb923c" font-size="20" font-weight="800">Commercial-safe only (259,070+ icons)</text>

      <rect x="330" y="370" width="290" height="110" rx="14" fill="#0f172a" stroke="#334155" stroke-width="1"/>
      <text x="360" y="415" fill="#ffffff" font-size="18" font-weight="800">MIT License</text>
      <text x="360" y="450" fill="#94a3b8" font-size="14">Free commercial and personal use</text>

      <rect x="660" y="370" width="290" height="110" rx="14" fill="#0f172a" stroke="#334155" stroke-width="1"/>
      <text x="690" y="415" fill="#ffffff" font-size="18" font-weight="800">Apache 2.0 / CC0</text>
      <text x="690" y="450" fill="#94a3b8" font-size="14">Open source compliance guaranteed</text>

      <rect x="330" y="510" width="620" height="90" rx="14" fill="#fb923c" fill-opacity="0.15" stroke="#fb923c" stroke-width="2"/>
      <text x="640" y="562" text-anchor="middle" fill="#fb923c" font-size="18" font-weight="800">100% Royalty Free for Client and Commercial Webflow Sites</text>
    `
  }
];

async function generateScreenshots() {
  for (const item of screenshots) {
    const svg = `
    <svg width="1280" height="846" viewBox="0 0 1280 846" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="50%" stop-color="#1e1b4b"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>

      <rect width="1280" height="846" fill="url(#bg)"/>
      <rect x="40" y="40" width="1200" height="766" rx="28" fill="#1e293b" fill-opacity="0.5" stroke="#334155" stroke-width="2"/>

      <rect x="80" y="80" width="200" height="40" rx="20" fill="${item.accent}" fill-opacity="0.2" stroke="${item.accent}" stroke-width="2"/>
      <text x="180" y="106" text-anchor="middle" fill="${item.accent}" font-size="15" font-weight="800" font-family="Inter, sans-serif">${item.badge}</text>

      <text x="80" y="155" fill="#ffffff" font-size="34" font-weight="800" font-family="Inter, sans-serif">${item.title}</text>
      <text x="80" y="190" fill="#94a3b8" font-size="18" font-weight="500" font-family="Inter, sans-serif">${item.subtitle}</text>

      ${item.previewSvg}
    </svg>
    `;

    await sharp(Buffer.from(svg))
      .png()
      .toFile(item.filename);
    console.log(`✅ Generated ${item.filename} (1280x846)`);
  }
}

generateScreenshots().catch(console.error);
