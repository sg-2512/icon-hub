const sharp = require('sharp');

const svg = `
<svg width="900" height="900" viewBox="0 0 900 900" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
    <linearGradient id="glass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.05"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#0f172a" flood-opacity="0.3"/>
    </filter>
  </defs>

  <rect width="900" height="900" rx="200" fill="url(#bg)"/>
  
  <!-- Outer Glow Ring -->
  <circle cx="450" cy="450" r="280" fill="url(#glass)" stroke="#ffffff" stroke-opacity="0.3" stroke-width="4"/>

  <!-- Center Search Icon Symbol -->
  <g filter="url(#shadow)">
    <!-- Magnifying Glass Ring -->
    <circle cx="410" cy="410" r="140" fill="none" stroke="#ffffff" stroke-width="48" stroke-linecap="round"/>
    <!-- Magnifying Glass Handle -->
    <line x1="515" y1="515" x2="630" y2="630" stroke="#ffffff" stroke-width="48" stroke-linecap="round"/>
    <!-- Sparkle / Star Icon inside Glass -->
    <path d="M410 330 L425 395 L490 410 L425 425 L410 490 L395 425 L330 410 L395 395 Z" fill="#60a5fa"/>
  </g>

  <!-- IS Text Badge -->
  <text x="450" y="770" text-anchor="middle" fill="#ffffff" font-size="64" font-weight="900" font-family="Inter, system-ui, sans-serif" letter-spacing="8">ICONSEARCH</text>
</svg>
`;

sharp(Buffer.from(svg))
  .png()
  .toFile('public/iconsearch-logo-900.png')
  .then(() => console.log('✅ High-resolution 900x900 PNG icon generated at public/iconsearch-logo-900.png'))
  .catch(console.error);
