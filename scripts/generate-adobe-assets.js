const sharp = require('sharp');

const iconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#eb1000"/>
      <stop offset="100%" stop-color="#c10000"/>
    </linearGradient>
    <linearGradient id="glass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.05"/>
    </linearGradient>
  </defs>

  <rect width="512" height="512" rx="110" fill="url(#bg)"/>
  
  <circle cx="256" cy="256" r="160" fill="url(#glass)" stroke="#ffffff" stroke-opacity="0.3" stroke-width="3"/>

  <g filter="drop-shadow(0px 10px 16px rgba(0,0,0,0.3))">
    <circle cx="230" cy="230" r="80" fill="none" stroke="#ffffff" stroke-width="28" stroke-linecap="round"/>
    <line x1="290" y1="290" x2="360" y2="360" stroke="#ffffff" stroke-width="28" stroke-linecap="round"/>
    <path d="M230 180 L240 220 L280 230 L240 240 L230 280 L220 240 L180 230 L220 220 Z" fill="#ffd700"/>
  </g>
</svg>
`;

const bannerSvg = `
<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#7f1d1d"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>

  <rect width="1280" height="720" fill="url(#bg)"/>

  <!-- Brand Title -->
  <rect x="80" y="80" width="220" height="44" rx="22" fill="#eb1000" fill-opacity="0.2" stroke="#eb1000" stroke-width="2"/>
  <text x="190" y="108" text-anchor="middle" fill="#ff4d4d" font-size="16" font-weight="800" font-family="Inter, sans-serif">ADOBE EXPRESS ADD-ON</text>

  <text x="80" y="180" fill="#ffffff" font-size="44" font-weight="900" font-family="Inter, sans-serif">IconSearch for Adobe Express</text>
  <text x="80" y="225" fill="#94a3b8" font-size="22" font-weight="500" font-family="Inter, sans-serif">Search &amp; Insert 355,000+ Vector SVG Icons in 1 Click or Drag to Document</text>

  <!-- UI Mockup Container -->
  <rect x="80" y="280" width="1120" height="380" rx="20" fill="url(#cardBg)" stroke="#334155" stroke-width="2"/>
  
  <!-- Left Mock Panel -->
  <rect x="120" y="320" width="320" height="300" rx="14" fill="#0f172a" stroke="#334155" stroke-width="1"/>
  <rect x="140" y="345" width="280" height="40" rx="8" fill="#1e293b" stroke="#eb1000" stroke-width="2"/>
  <text x="160" y="371" fill="#94a3b8" font-size="15">Search home, user, arrow...</text>

  <!-- Grid Items -->
  <rect x="140" y="405" width="80" height="80" rx="10" fill="#1e293b" stroke="#eb1000" stroke-width="2"/>
  <text x="180" y="455" text-anchor="middle" fill="#eb1000" font-size="32">⚡</text>

  <rect x="240" y="405" width="80" height="80" rx="10" fill="#1e293b"/>
  <text x="280" y="455" text-anchor="middle" fill="#38bdf8" font-size="32">🚀</text>

  <rect x="340" y="405" width="80" height="80" rx="10" fill="#1e293b"/>
  <text x="380" y="455" text-anchor="middle" fill="#34d399" font-size="32">🔥</text>

  <!-- Canvas Simulation -->
  <rect x="480" y="320" width="680" height="300" rx="14" fill="#1e293b" stroke="#475569" stroke-width="1"/>
  <rect x="740" y="400" width="160" height="140" rx="12" fill="#eb1000" fill-opacity="0.1" stroke="#eb1000" stroke-width="3" stroke-dasharray="6,6"/>
  <text x="820" y="465" text-anchor="middle" fill="#eb1000" font-size="48">⚡</text>
  <text x="820" y="515" text-anchor="middle" fill="#ffffff" font-size="16" font-weight="700">1-Click / Drag to Canvas</text>
</svg>
`;

async function generateAdobeAssets() {
  await sharp(Buffer.from(iconSvg)).png().toFile('public/adobe-app-icon.png');
  console.log('✅ Generated public/adobe-app-icon.png (512x512)');

  await sharp(Buffer.from(bannerSvg)).png().toFile('public/adobe-featured-banner.png');
  console.log('✅ Generated public/adobe-featured-banner.png (1280x720)');
}

generateAdobeAssets().catch(console.error);
