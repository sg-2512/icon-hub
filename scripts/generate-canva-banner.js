const sharp = require('sharp');

const svg = `
<svg width="2400" height="1800" viewBox="0 0 2400 1800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="badge" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="2400" height="1800" fill="url(#bg)"/>
  <rect x="80" y="80" width="2240" height="1640" rx="48" fill="#1e293b" fill-opacity="0.5" stroke="#334155" stroke-width="4"/>

  <!-- Top Decorative Grid Pattern -->
  <circle cx="400" cy="300" r="300" fill="#3b82f6" fill-opacity="0.08"/>
  <circle cx="2000" cy="1500" r="400" fill="#6366f1" fill-opacity="0.08"/>

  <!-- Brand Tile Logo -->
  <rect x="1080" y="320" width="240" height="240" rx="56" fill="url(#badge)"/>
  <text x="1200" y="475" text-anchor="middle" fill="#ffffff" font-size="104" font-weight="900" font-family="Inter, system-ui, sans-serif">IS</text>

  <!-- Title & Headline -->
  <text x="1200" y="710" text-anchor="middle" fill="url(#textGrad)" font-size="108" font-weight="800" font-family="Inter, system-ui, sans-serif">IconSearch for Canva</text>
  <text x="1200" y="830" text-anchor="middle" fill="#94a3b8" font-size="48" font-weight="500" font-family="Inter, system-ui, sans-serif">Instant search &amp; 1-click insertion for 355,000+ open-source vector SVG icons</text>

  <!-- Middle Preview Cards Graphic -->
  <rect x="520" y="940" width="1360" height="420" rx="32" fill="url(#cardGrad)" stroke="#475569" stroke-width="3"/>

  <!-- Simulated Search Input -->
  <rect x="580" y="990" width="1240" height="88" rx="20" fill="#0f172a" stroke="#334155" stroke-width="2"/>
  <text x="640" y="1048" fill="#64748b" font-size="32" font-family="Inter, sans-serif">🔍 Search home, arrow, user, settings...</text>

  <!-- Simulated Icon Tiles inside Banner Graphic -->
  <rect x="580" y="1110" width="220" height="200" rx="20" fill="#1e293b" stroke="#3b82f6" stroke-width="3"/>
  <text x="690" y="1210" text-anchor="middle" fill="#3b82f6" font-size="64">⚡</text>
  <text x="690" y="1280" text-anchor="middle" fill="#f8fafc" font-size="22" font-weight="700" font-family="Inter, sans-serif">Lucide</text>

  <rect x="835" y="1110" width="220" height="200" rx="20" fill="#1e293b" stroke="#334155" stroke-width="2"/>
  <text x="945" y="1210" text-anchor="middle" fill="#38bdf8" font-size="64">🎯</text>
  <text x="945" y="1280" text-anchor="middle" fill="#f8fafc" font-size="22" font-weight="700" font-family="Inter, sans-serif">Heroicons</text>

  <rect x="1090" y="1110" width="220" height="200" rx="20" fill="#1e293b" stroke="#334155" stroke-width="2"/>
  <text x="1200" y="1210" text-anchor="middle" fill="#34d399" font-size="64">🎨</text>
  <text x="1200" y="1280" text-anchor="middle" fill="#f8fafc" font-size="22" font-weight="700" font-family="Inter, sans-serif">Tabler</text>

  <rect x="1345" y="1110" width="220" height="200" rx="20" fill="#1e293b" stroke="#334155" stroke-width="2"/>
  <text x="1455" y="1210" text-anchor="middle" fill="#f472b6" font-size="64">🔥</text>
  <text x="1455" y="1280" text-anchor="middle" fill="#f8fafc" font-size="22" font-weight="700" font-family="Inter, sans-serif">Phosphor</text>

  <rect x="1600" y="1110" width="220" height="200" rx="20" fill="#1e293b" stroke="#334155" stroke-width="2"/>
  <text x="1710" y="1210" text-anchor="middle" fill="#fb923c" font-size="64">🚀</text>
  <text x="1710" y="1280" text-anchor="middle" fill="#f8fafc" font-size="22" font-weight="700" font-family="Inter, sans-serif">Remix</text>

  <!-- Bottom Feature Pill Badges -->
  <rect x="420" y="1460" width="480" height="84" rx="42" fill="#334155" fill-opacity="0.9"/>
  <text x="660" y="1514" text-anchor="middle" fill="#38bdf8" font-size="32" font-weight="700" font-family="Inter, sans-serif">100+ Icon Libraries</text>

  <rect x="960" y="1460" width="480" height="84" rx="42" fill="#334155" fill-opacity="0.9"/>
  <text x="1200" y="1514" text-anchor="middle" fill="#34d399" font-size="32" font-weight="700" font-family="Inter, sans-serif">Commercial-Safe Filter</text>

  <rect x="1500" y="1460" width="480" height="84" rx="42" fill="#334155" fill-opacity="0.9"/>
  <text x="1740" y="1514" text-anchor="middle" fill="#a78bfa" font-size="32" font-weight="700" font-family="Inter, sans-serif">Vector SVG Canvas Insert</text>
</svg>
`;

sharp(Buffer.from(svg))
  .png()
  .toFile('public/canva-featured-banner.png')
  .then(() => console.log('✅ Generated public/canva-featured-banner.png (2400x1800 - 4:3 ratio)'))
  .catch(console.error);
