'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { IconLibrary } from '../../lib/icons'
import { ICONIFY_COLLECTION_COUNT, NAMED_LIBRARY_COUNT, SEARCHABLE_ICON_COUNT } from '../../data/library-catalog'

// Hardcoded sample SVGs for the Customizer Sandbox (Lucide/Heroicons standard outlines)
const sandboxIcons = [
  {
    name: 'Home',
    slug: 'home',
    paths: (
      <>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </>
    ),
    rawCode: (size: number, stroke: number, color: string) => 
`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  <polyline points="9 22 9 12 15 12 15 22" />
</svg>`,
    reactCode: (stroke: number, color: string) => 
`import { Home } from 'lucide-react';

export default function MyWidget() {
  return <Home size={32} strokeWidth={${stroke}} color="${color}" />;
}`,
    vueCode: (size: number, stroke: number, color: string) =>
`<template>
  <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
</template>`,
    svelteCode: (size: number, stroke: number, color: string) =>
`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  <polyline points="9 22 9 12 15 12 15 22" />
</svg>`,
    tailwindCode: (size: number, stroke: number, color: string) =>
`<svg class="w-[${size}px] h-[${size}px] text-[${color}]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  <polyline points="9 22 9 12 15 12 15 22" />
</svg>`
  },
  {
    name: 'Search',
    slug: 'search',
    paths: (
      <>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </>
    ),
    rawCode: (size: number, stroke: number, color: string) =>
`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="11" cy="11" r="8" />
  <line x1="21" y1="21" x2="16.65" y2="16.65" />
</svg>`,
    reactCode: (stroke: number, color: string) =>
`import { Search } from 'lucide-react';

export default function MyWidget() {
  return <Search size={32} strokeWidth={${stroke}} color="${color}" />;
}`,
    vueCode: (size: number, stroke: number, color: string) =>
`<template>
  <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
</template>`,
    svelteCode: (size: number, stroke: number, color: string) =>
`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="11" cy="11" r="8" />
  <line x1="21" y1="21" x2="16.65" y2="16.65" />
</svg>`,
    tailwindCode: (size: number, stroke: number, color: string) =>
`<svg class="w-[${size}px] h-[${size}px] text-[${color}]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="11" cy="11" r="8" />
  <line x1="21" y1="21" x2="16.65" y2="16.65" />
</svg>`
  },
  {
    name: 'Settings',
    slug: 'settings',
    paths: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </>
    ),
    rawCode: (size: number, stroke: number, color: string) =>
`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="3" />
  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
</svg>`,
    reactCode: (stroke: number, color: string) =>
`import { Settings } from 'lucide-react';

export default function MyWidget() {
  return <Settings size={32} strokeWidth={${stroke}} color="${color}" />;
}`,
    vueCode: (size: number, stroke: number, color: string) =>
`<template>
  <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
</template>`,
    svelteCode: (size: number, stroke: number, color: string) =>
`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="3" />
  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
</svg>`,
    tailwindCode: (size: number, stroke: number, color: string) =>
`<svg class="w-[${size}px] h-[${size}px] text-[${color}]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="3" />
  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
</svg>`
  },
  {
    name: 'Heart',
    slug: 'heart',
    paths: (
      <>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </>
    ),
    rawCode: (size: number, stroke: number, color: string) =>
`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
</svg>`,
    reactCode: (stroke: number, color: string) =>
`import { Heart } from 'lucide-react';

export default function MyWidget() {
  return <Heart size={32} strokeWidth={${stroke}} color="${color}" />;
}`,
    vueCode: (size: number, stroke: number, color: string) =>
`<template>
  <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
</template>`,
    svelteCode: (size: number, stroke: number, color: string) =>
`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
</svg>`,
    tailwindCode: (size: number, stroke: number, color: string) =>
`<svg class="w-[${size}px] h-[${size}px] text-[${color}]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
</svg>`
  },
  {
    name: 'Camera',
    slug: 'camera',
    paths: (
      <>
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="4" />
      </>
    ),
    rawCode: (size: number, stroke: number, color: string) =>
`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
  <circle cx="12" cy="13" r="4" />
</svg>`,
    reactCode: (stroke: number, color: string) =>
`import { Camera } from 'lucide-react';

export default function MyWidget() {
  return <Camera size={32} strokeWidth={${stroke}} color="${color}" />;
}`,
    vueCode: (size: number, stroke: number, color: string) =>
`<template>
  <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
</template>`,
    svelteCode: (size: number, stroke: number, color: string) =>
`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
  <circle cx="12" cy="13" r="4" />
</svg>`,
    tailwindCode: (size: number, stroke: number, color: string) =>
`<svg class="w-[${size}px] h-[${size}px] text-[${color}]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
  <circle cx="12" cy="13" r="4" />
</svg>`
  },
  {
    name: 'Bell',
    slug: 'bell',
    paths: (
      <>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </>
    ),
    rawCode: (size: number, stroke: number, color: string) =>
`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
</svg>`,
    reactCode: (stroke: number, color: string) =>
`import { Bell } from 'lucide-react';

export default function MyWidget() {
  return <Bell size={32} strokeWidth={${stroke}} color="${color}" />;
}`,
    vueCode: (size: number, stroke: number, color: string) =>
`<template>
  <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
</template>`,
    svelteCode: (size: number, stroke: number, color: string) =>
`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
</svg>`,
    tailwindCode: (size: number, stroke: number, color: string) =>
`<svg class="w-[${size}px] h-[${size}px] text-[${color}]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
</svg>`
  },
  {
    name: 'Shield',
    slug: 'shield',
    paths: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </>
    ),
    rawCode: (size: number, stroke: number, color: string) =>
`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
</svg>`,
    reactCode: (stroke: number, color: string) =>
`import { Shield } from 'lucide-react';

export default function MyWidget() {
  return <Shield size={32} strokeWidth={${stroke}} color="${color}" />;
}`,
    vueCode: (size: number, stroke: number, color: string) =>
`<template>
  <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
</template>`,
    svelteCode: (size: number, stroke: number, color: string) =>
`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
</svg>`,
    tailwindCode: (size: number, stroke: number, color: string) =>
`<svg class="w-[${size}px] h-[${size}px] text-[${color}]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
</svg>`
  },
  {
    name: 'Cloud',
    slug: 'cloud',
    paths: (
      <>
        <path d="M17.5 19A5.5 5.5 0 0 0 22 13.5A5.5 5.5 0 0 0 16.5 8H15a7 7 0 1 0-14 0h.5A5.5 5.5 0 0 0 7 13.5a5.5 5.5 0 0 0 5.5 5.5Z" />
      </>
    ),
    rawCode: (size: number, stroke: number, color: string) =>
`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
  <path d="M17.5 19A5.5 5.5 0 0 0 22 13.5A5.5 5.5 0 0 0 16.5 8H15a7 7 0 1 0-14 0h.5A5.5 5.5 0 0 0 7 13.5a5.5 5.5 0 0 0 5.5 5.5Z" />
</svg>`,
    reactCode: (stroke: number, color: string) =>
`import { Cloud } from 'lucide-react';

export default function MyWidget() {
  return <Cloud size={32} strokeWidth={${stroke}} color="${color}" />;
}`,
    vueCode: (size: number, stroke: number, color: string) =>
`<template>
  <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17.5 19A5.5 5.5 0 0 0 22 13.5A5.5 5.5 0 0 0 16.5 8H15a7 7 0 1 0-14 0h.5A5.5 5.5 0 0 0 7 13.5a5.5 5.5 0 0 0 5.5 5.5Z" />
  </svg>
</template>`,
    svelteCode: (size: number, stroke: number, color: string) =>
`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
  <path d="M17.5 19A5.5 5.5 0 0 0 22 13.5A5.5 5.5 0 0 0 16.5 8H15a7 7 0 1 0-14 0h.5A5.5 5.5 0 0 0 7 13.5a5.5 5.5 0 0 0 5.5 5.5Z" />
</svg>`,
    tailwindCode: (size: number, stroke: number, color: string) =>
`<svg class="w-[${size}px] h-[${size}px] text-[${color}]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
  <path d="M17.5 19A5.5 5.5 0 0 0 22 13.5A5.5 5.5 0 0 0 16.5 8H15a7 7 0 1 0-14 0h.5A5.5 5.5 0 0 0 7 13.5a5.5 5.5 0 0 0 5.5 5.5Z" />
</svg>`
  }
]

// Sample size approximations in KB for popular libraries
const BUNDLE_SIZES: Record<string, number> = {
  'lucide-icons': 256,
  'heroicons': 32,
  'tabler-icons': 812,
  'phosphor-icons': 192,
  'remix-icon': 210,
  'feather-icons': 22,
  'bootstrap-icons': 245,
  'radix-icons': 28,
  'font-awesome': 580,
  'react-icons': 1850,
  'iconify': 15,
  'simple-icons': 320,
  'iconoir': 148,
}

// Preset tailwind colors for sandbox customizer
const PRESET_COLORS = [
  { name: 'Indigo', hex: '#818cf8', glow: 'rgba(129, 140, 248, 0.4)' },
  { name: 'Emerald', hex: '#34d399', glow: 'rgba(52, 211, 153, 0.4)' },
  { name: 'Cyber Neon', hex: '#22d3ee', glow: 'rgba(34, 211, 238, 0.4)' },
  { name: 'Rose Glow', hex: '#fb7185', glow: 'rgba(251, 113, 133, 0.4)' },
  { name: 'Amber Glow', hex: '#fbbf24', glow: 'rgba(251, 191, 36, 0.4)' },
  { name: 'White', hex: '#f8fafc', glow: 'rgba(248, 250, 252, 0.4)' }
]

// Helper to format numbers with commas (locale-independent to prevent hydration mismatches)
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

type DynamicHomeProps = {
  initialLibraries: IconLibrary[]
  recentItems: { label: string; href: string; date: string }[]
}

export default function DynamicHome({ initialLibraries, recentItems }: DynamicHomeProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  // ── 1. SVG Sandbox States ───────────────────────────────────────────────────
  const [selectedIconIdx, setSelectedIconIdx] = useState(0)
  const [iconSize, setIconSize] = useState(48)
  const [strokeWidth, setStrokeWidth] = useState(1.5)
  const [iconColor, setIconColor] = useState('#818cf8')
  const [selectedFramework, setSelectedFramework] = useState<'react' | 'vue' | 'svelte' | 'tailwind' | 'svg'>('react')
  const [copied, setCopied] = useState(false)

  const activeSandboxIcon = sandboxIcons[selectedIconIdx]

  function handleCopy() {
    const textToCopy = selectedFramework === 'react' 
      ? activeSandboxIcon.reactCode(strokeWidth, iconColor)
      : selectedFramework === 'vue'
      ? activeSandboxIcon.vueCode(iconSize, strokeWidth, iconColor)
      : selectedFramework === 'svelte'
      ? activeSandboxIcon.svelteCode(iconSize, strokeWidth, iconColor)
      : selectedFramework === 'tailwind'
      ? activeSandboxIcon.tailwindCode(iconSize, strokeWidth, iconColor)
      : activeSandboxIcon.rawCode(iconSize, strokeWidth, iconColor)

    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── 2. Comparison States ────────────────────────────────────────────────────
  const [libAKey, setLibAKey] = useState('lucide-icons')
  const [libBKey, setLibBKey] = useState('heroicons')

  const libraryA = useMemo(() => 
    initialLibraries.find(l => l.slug === libAKey) || initialLibraries[0]
  , [libAKey, initialLibraries])

  const libraryB = useMemo(() => 
    initialLibraries.find(l => l.slug === libBKey) || initialLibraries[1]
  , [libBKey, initialLibraries])

  // ── 3. Mini Recommendation Quiz States ──────────────────────────────────────
  const [quizStep, setQuizStep] = useState(1)
  const [quizAnswers, setQuizAnswers] = useState({
    framework: '',
    style: '',
    priority: ''
  })

  // Quiz evaluation algorithm
  const quizRecommendation = useMemo(() => {
    if (!quizAnswers.framework || !quizAnswers.style || !quizAnswers.priority) return null

    const scores = initialLibraries.map(lib => {
      let score = 50 // Base score

      // Framework matching
      const fw = quizAnswers.framework.toLowerCase()
      if (fw === 'react' && lib.frameworks.includes('react')) score += 15
      if (fw === 'vue' && lib.frameworks.includes('vue')) score += 15
      if (fw === 'svelte' && lib.frameworks.includes('svelte')) score += 15
      if (fw === 'vanilla' && (lib.slug === 'iconify' || lib.license.includes('MIT'))) score += 10

      // Style matching
      const preferredStyle = quizAnswers.style.toLowerCase() // outline, solid, multiweight, brands
      if (preferredStyle === 'outline' && lib.style.includes('outline')) score += 20
      if (preferredStyle === 'solid' && lib.style.includes('filled')) score += 20
      if (preferredStyle === 'multiweight' && lib.style.length > 2) score += 25
      if (preferredStyle === 'brands' && lib.slug === 'simple-icons') score += 30

      // Priority matching
      const prio = quizAnswers.priority.toLowerCase() // imports, weight, count, dashboard
      if (prio === 'imports') {
        if (lib.typescript && lib.treeshakable) score += 20
        if (lib.slug === 'react-icons' || lib.slug === 'lucide-icons') score += 10
      }
      if (prio === 'weight') {
        const size = BUNDLE_SIZES[lib.slug] || 150
        if (size < 40) score += 25
        else if (size < 200) score += 10
      }
      if (prio === 'count') {
        if (lib.iconCount > 4000) score += 25
        else if (lib.iconCount > 1500) score += 10
      }
      if (prio === 'dashboard') {
        if (lib.slug === 'radix-icons' || lib.slug === 'lucide-icons' || lib.slug === 'iconoir') score += 20
      }

      return { lib, score: Math.min(score, 99) }
    })

    // Sort descending and return the top match
    scores.sort((a, b) => b.score - a.score)
    return scores[0]
  }, [quizAnswers, initialLibraries])

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    router.push(`/icon-search?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Visual Glowing Backgrounds */}
      <div className="glow-grid-overlay" />
      <div className="glow-gradient-node" />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        
        {/* ── SECTION 1: HERO OVERHAUL ────────────────────────────────────────── */}
        <section style={{ padding: '90px 0 64px', borderBottom: '1px solid var(--border)' }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '12px',
            color: 'var(--accent)',
            marginBottom: '16px',
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}>
            // The Ultimate Developer Icon Registry
          </div>
          
          <h1 className="animate-float" style={{
            fontSize: 'clamp(42px, 7vw, 76px)',
            fontWeight: 800,
            lineHeight: 1.05,
            marginBottom: '24px',
            fontFamily: 'var(--font-inter), sans-serif',
            letterSpacing: '-0.04em',
            textShadow: '0 4px 24px rgba(139, 92, 246, 0.25)'
          }}>
            Find, Compare &<br />
            <span style={{ 
              background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #2dd4bf 100%)', 
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'var(--accent)'
            }}>Customize Free Icons</span><br />
            for Modern SaaS Apps
          </h1>

          <p style={{
            color: 'var(--text-muted)',
            fontSize: '18px',
            maxWidth: '560px',
            marginBottom: '32px',
            lineHeight: '1.6'
          }}>
            Instant search across <span style={{ color: 'var(--text)', fontWeight: 600 }}>{SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} free SVG icons</span> from 229 open-source icon libraries. Zero packages required to customize and export.
          </p>

          {/* Core Search Form */}
          <form onSubmit={handleSearchSubmit} style={{ maxWidth: '640px', marginBottom: '36px' }}>
            <div style={{ position: 'relative' }} className="search-input-focus">
              <input suppressHydrationWarning
                type="text"
                placeholder={`Search ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} icons — try 'settings', 'bell', 'arrow'...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(24, 24, 27, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '20px 140px 20px 28px',
                  fontSize: '16px',
                  color: 'var(--text)',
                  fontFamily: 'JetBrains Mono, monospace',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backdropFilter: 'blur(16px)',
                  transition: 'all 0.3s ease',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
                }}
              />
              <button suppressHydrationWarning
                type="submit"
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'var(--accent-accessible)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  transition: 'background 0.2s'
                }}
              >
                Search →
              </button>
            </div>
            {/* Quick search tags */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              {['camera', 'home', 'settings', 'arrow', 'user', 'bell', 'heart', 'cloud'].map(term => (
                <button suppressHydrationWarning
                  key={term}
                  type="button"
                  onClick={() => router.push(`/icon-search?q=${term}`)}
                  style={{
                    background: 'rgba(24, 24, 27, 0.4)',
                    border: '1px solid var(--border)',
                    borderRadius: '100px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontFamily: 'JetBrains Mono, monospace',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = 'var(--text)'
                    e.currentTarget.style.borderColor = 'var(--border-hover)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'var(--text-muted)'
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
          </form>

          {/* Quick Stats Banner */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' }}>
            {['React Native', 'Vue 3', 'Next.js App Router', 'TypeScript', 'MIT License', 'Tree-Shaking'].map(tag => (
              <span key={tag} style={{
                background: 'rgba(129, 140, 248, 0.08)',
                border: '1px solid rgba(129, 140, 248, 0.2)',
                color: 'var(--accent)',
                padding: '6px 14px',
                borderRadius: '100px',
                fontSize: '12px',
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                {tag}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/icon-search" style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontSize: '15px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700,
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(139, 92, 246, 0.6)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(139, 92, 246, 0.4)';
              }}
            >
              Explore {SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} Icons →
            </Link>
          </div>
        </section>

        {/* ── SECTION 2: ROLLING ICON TICKER (ALIVE EFFECT) ──────────────────── */}
        <section style={{ padding: '24px 0', borderBottom: '1px solid var(--border)', overflow: 'hidden' }}>
          <div className="icon-ticker-container">
            <div className="icon-ticker-track">
              {/* Render icons twice to create infinite looping scroll */}
              {[...sandboxIcons, ...sandboxIcons, ...sandboxIcons, ...sandboxIcons].map((item, idx) => (
                <div 
                  key={`${item.slug}-${idx}`} 
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '90px',
                    height: '90px',
                    gap: '8px',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setSelectedIconIdx(idx % sandboxIcons.length)
                    const sandboxSection = document.getElementById('sandbox-customizer')
                    if (sandboxSection) sandboxSection.scrollIntoView({ behavior: 'smooth' })
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--accent)'
                    e.currentTarget.style.transform = 'translateY(-4px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.transform = 'none'
                  }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    role="img"
                    aria-label={`${item.name} icon`}
                  >
                    {item.paths}
                  </svg>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 3: SVG SANDBOX CUSTOMIZER ──────────────────────────────── */}
        <section id="sandbox-customizer" style={{ padding: '80px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-inter), sans-serif', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              SVG Customizer Sandbox
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', fontFamily: 'JetBrains Mono, monospace' }}>
              // Customize size, stroke, and colors in real-time. Copy pure SVG or JSX code instantly.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
            gap: '32px',
            alignItems: 'stretch'
          }}>
            {/* Left side: Canvas & Controls */}
            <div style={{
              background: 'rgba(15, 15, 20, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>
              {/* Live Preview Screen */}
              <div style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                height: '240px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                position: 'relative',
                overflow: 'hidden',
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)',
                backgroundSize: '16px 16px'
              }}>
                {/* Decorative border tags */}
                <span style={{ position: 'absolute', top: '10px', left: '12px', fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>PREVIEW_CANVAS</span>
                <span style={{ position: 'absolute', bottom: '10px', right: '12px', fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>{iconSize}x{iconSize}px</span>

                {/* Animated glow matching custom color */}
                <div style={{
                  position: 'absolute',
                  width: '120px',
                  height: '120px',
                  background: iconColor,
                  opacity: 0.08,
                  filter: 'blur(40px)',
                  borderRadius: '50%',
                  pointerEvents: 'none'
                }} />

                {/* Dynamic SVG */}
                <svg
                  width={iconSize}
                  height={iconSize}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={iconColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transition: 'stroke 0.2s, stroke-width 0.1s' }}
                >
                  {activeSandboxIcon.paths}
                </svg>
              </div>

              {/* Selector Icons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px', marginBottom: '24px' }}>
                {sandboxIcons.map((icon, idx) => (
                  <button suppressHydrationWarning
                    key={icon.slug}
                    aria-label={`Select ${icon.name} icon`}
                    onClick={() => setSelectedIconIdx(idx)}
                    style={{
                      background: selectedIconIdx === idx ? 'rgba(129, 140, 248, 0.1)' : 'var(--bg)',
                      border: '1px solid',
                      borderColor: selectedIconIdx === idx ? 'var(--accent)' : 'var(--border)',
                      borderRadius: '8px',
                      padding: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s'
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={selectedIconIdx === idx ? 'var(--accent)' : 'var(--text-muted)'}
                      strokeWidth="1.5"
                    >
                      {icon.paths}
                    </svg>
                  </button>
                ))}
              </div>

              {/* Range sliders */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Size slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Icon Size</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{iconSize}px</span>
                  </div>
                  <input suppressHydrationWarning
                    aria-label="Icon Size"
                    type="range"
                    min="16"
                    max="64"
                    value={iconSize}
                    onChange={e => setIconSize(Number(e.target.value))}
                  />
                </div>

                {/* Stroke width slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Stroke Weight</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{strokeWidth}px</span>
                  </div>
                  <input suppressHydrationWarning
                    aria-label="Stroke Weight"
                    type="range"
                    min="1"
                    max="3"
                    step="0.25"
                    value={strokeWidth}
                    onChange={e => setStrokeWidth(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Right side: Color customizer and Export code panel */}
            <div style={{
              background: 'rgba(24, 24, 27, 0.6)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backdropFilter: 'blur(12px)'
            }}>
              {/* Color picker area */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  CHOOSE A PALETTE
                </h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {PRESET_COLORS.map(c => (
                    <button suppressHydrationWarning
                      key={c.name}
                      onClick={() => setIconColor(c.hex)}
                      style={{
                        background: 'var(--bg)',
                        border: '1px solid',
                        borderColor: iconColor === c.hex ? 'var(--accent)' : 'var(--border)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: c.hex,
                        boxShadow: `0 0 8px ${c.glow}`
                      }} />
                      <span style={{ fontSize: '12px', color: iconColor === c.hex ? 'var(--text)' : 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {c.name}
                      </span>
                    </button>
                  ))}
                  {/* Custom HTML color picker */}
                  <div style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    position: 'relative'
                  }}>
                    <input suppressHydrationWarning
                      type="color"
                      value={iconColor}
                      onChange={e => setIconColor(e.target.value)}
                      title="Pick a custom icon color"
                      aria-label="Pick a custom icon color"
                      style={{
                        border: 'none',
                        background: 'transparent',
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                      Custom
                    </span>
                  </div>
                </div>
              </div>

              {/* Code output blocks */}
              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '14px' }}>
                  {([
                    { id: 'react', label: 'React/Next.js' },
                    { id: 'vue', label: 'Vue 3' },
                    { id: 'svelte', label: 'Svelte' },
                    { id: 'tailwind', label: 'Tailwind' },
                    { id: 'svg', label: 'Raw SVG' }
                  ] as const).map(fw => (
                    <button suppressHydrationWarning
                      key={fw.id}
                      onClick={() => setSelectedFramework(fw.id)}
                      style={{
                        background: selectedFramework === fw.id ? 'var(--accent-accessible)' : 'transparent',
                        border: '1px solid',
                        borderColor: selectedFramework === fw.id ? 'var(--accent-accessible)' : 'var(--border)',
                        color: selectedFramework === fw.id ? '#fff' : 'var(--text-muted)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: 600,
                        transition: 'all 0.2s'
                      }}
                    >
                      {fw.label}
                    </button>
                  ))}
                </div>

                <div style={{
                  background: 'var(--code-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '16px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                  position: 'relative',
                  flexGrow: 1,
                  minHeight: '140px',
                  display: 'flex',
                  alignItems: 'stretch'
                }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', overflowX: 'auto', width: '100%' }}>
                    {selectedFramework === 'react' 
                      ? activeSandboxIcon.reactCode(strokeWidth, iconColor)
                      : selectedFramework === 'vue'
                      ? activeSandboxIcon.vueCode(iconSize, strokeWidth, iconColor)
                      : selectedFramework === 'svelte'
                      ? activeSandboxIcon.svelteCode(iconSize, strokeWidth, iconColor)
                      : selectedFramework === 'tailwind'
                      ? activeSandboxIcon.tailwindCode(iconSize, strokeWidth, iconColor)
                      : activeSandboxIcon.rawCode(iconSize, strokeWidth, iconColor)
                    }
                  </pre>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button suppressHydrationWarning
                  onClick={handleCopy}
                  style={{
                    background: copied ? '#047857' : 'var(--accent-accessible)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    flexGrow: 1,
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                >
                  {copied ? '✓ Copied!' : 'Copy to Clipboard'}
                </button>
                <Link href="/icon-search" style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontFamily: 'JetBrains Mono, monospace',
                  textAlign: 'center'
                }}>
                  Search Full Set
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 4: COMPARISON SIMULATOR ───────────────────────────────── */}
        <section style={{ padding: '80px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ textAlign: 'center', marginBottom: '45px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-inter), sans-serif', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              Library Comparison Simulator
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', fontFamily: 'JetBrains Mono, monospace' }}>
              // Select two open-source libraries to dynamically evaluate sizes, scores, and weights.
            </p>
          </div>

          <div style={{
            background: 'rgba(24, 24, 27, 0.4)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '32px',
            backdropFilter: 'blur(12px)'
          }}>
            {/* Twin Selector Dropdowns */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 60px 1fr',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '40px'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  LIBRARY A
                </label>
                <select suppressHydrationWarning
                  aria-label="Compare Library A"
                  value={libAKey}
                  onChange={e => setLibAKey(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: 'var(--text)',
                    fontSize: '14px',
                    fontFamily: 'JetBrains Mono, monospace',
                    outline: 'none'
                  }}
                >
                  {initialLibraries.map(lib => (
                    <option key={lib.slug} value={lib.slug}>{lib.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ textAlign: 'center', fontSize: '16px', fontWeight: 700, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', marginTop: '20px' }}>
                VS
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  LIBRARY B
                </label>
                <select suppressHydrationWarning
                  aria-label="Compare Library B"
                  value={libBKey}
                  onChange={e => setLibBKey(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: 'var(--text)',
                    fontSize: '14px',
                    fontFamily: 'JetBrains Mono, monospace',
                    outline: 'none'
                  }}
                >
                  {initialLibraries.map(lib => (
                    <option key={lib.slug} value={lib.slug}>{lib.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Metrics Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              
              {/* Star rating comparator */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}>
                  <span>⭐ GitHub Stars ({libraryA.name})</span>
                  <span style={{ color: 'var(--accent)' }}>{formatNumber(libraryA.stars)} vs {formatNumber(libraryB.stars)}</span>
                  <span>⭐ GitHub Stars ({libraryB.name})</span>
                </div>
                {/* Horizontal comparative split bar */}
                <div style={{ display: 'flex', height: '10px', borderRadius: '5px', overflow: 'hidden', background: 'var(--border)' }}>
                  <div style={{ 
                    width: `${(libraryA.stars / (libraryA.stars + libraryB.stars)) * 100}%`, 
                    background: 'var(--accent)', 
                    transition: 'width 0.4s ease'
                  }} />
                  <div style={{ 
                    width: `${(libraryB.stars / (libraryA.stars + libraryB.stars)) * 100}%`, 
                    background: '#a855f7', 
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>

              {/* Icon count comparator */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}>
                  <span>◆ Total Icon Count ({libraryA.name})</span>
                  <span style={{ color: 'var(--accent)' }}>{formatNumber(libraryA.iconCount)} vs {formatNumber(libraryB.iconCount)}</span>
                  <span>◆ Total Icon Count ({libraryB.name})</span>
                </div>
                <div style={{ display: 'flex', height: '10px', borderRadius: '5px', overflow: 'hidden', background: 'var(--border)' }}>
                  <div style={{ 
                    width: `${(libraryA.iconCount / (libraryA.iconCount + libraryB.iconCount)) * 100}%`, 
                    background: 'var(--accent)', 
                    transition: 'width 0.4s ease'
                  }} />
                  <div style={{ 
                    width: `${(libraryB.iconCount / (libraryA.iconCount + libraryB.iconCount)) * 100}%`, 
                    background: '#a855f7', 
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>

              {/* Bundle Size comparator */}
              <div>
                {/* Estimations based on database or bundle */}
                {(() => {
                  const sizeA = BUNDLE_SIZES[libraryA.slug] || 150
                  const sizeB = BUNDLE_SIZES[libraryB.slug] || 150
                  return (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}>
                        <span>⚖ Bundle Gzip Size ({libraryA.name})</span>
                        <span style={{ color: 'var(--accent)' }}>{sizeA} KB vs {sizeB} KB</span>
                        <span>⚖ Bundle Gzip Size ({libraryB.name})</span>
                      </div>
                      <div style={{ display: 'flex', height: '10px', borderRadius: '5px', overflow: 'hidden', background: 'var(--border)' }}>
                        <div style={{ 
                          width: `${(sizeA / (sizeA + sizeB)) * 100}%`, 
                          background: 'var(--accent)', 
                          transition: 'width 0.4s ease'
                        }} />
                        <div style={{ 
                          width: `${(sizeB / (sizeA + sizeB)) * 100}%`, 
                          background: '#a855f7', 
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                      <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', marginTop: '4px', textAlign: 'center' }}>
                        *Lower bundle sizes indicate lighter footprints (ideal for load speed).
                      </span>
                    </>
                  )
                })()}
              </div>

              {/* Visual Grid Comparison of Core Info */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1px',
                background: 'var(--border)',
                borderRadius: '8px',
                overflow: 'hidden',
                marginTop: '16px'
              }}>
                {/* Row 1 */}
                <div style={{ background: 'var(--bg)', padding: '16px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '4px' }}>LICENSE</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--green)' }}>{libraryA.license}</div>
                </div>
                <div style={{ background: 'var(--bg)', padding: '16px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '4px' }}>LICENSE</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--green)' }}>{libraryB.license}</div>
                </div>

                {/* Row 2 */}
                <div style={{ background: 'var(--bg)', padding: '16px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '4px' }}>STYLES</div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {libraryA.style.map(s => (
                      <span key={s} style={{ background: 'rgba(255,255,255,0.05)', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', color: 'var(--text)' }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div style={{ background: 'var(--bg)', padding: '16px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '4px' }}>STYLES</div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {libraryB.style.map(s => (
                      <span key={s} style={{ background: 'rgba(255,255,255,0.05)', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', color: 'var(--text)' }}>{s}</span>
                    ))}
                  </div>
                </div>

                {/* Row 3 */}
                <div style={{ background: 'var(--bg)', padding: '16px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '4px' }}>TREESHAKABLE</div>
                  <div style={{ fontSize: '14px', color: libraryA.treeshakable ? 'var(--green)' : 'var(--red)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {libraryA.treeshakable ? 'Yes ✓' : 'No ✗'}
                  </div>
                </div>
                <div style={{ background: 'var(--bg)', padding: '16px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '4px' }}>TREESHAKABLE</div>
                  <div style={{ fontSize: '14px', color: libraryB.treeshakable ? 'var(--green)' : 'var(--red)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {libraryB.treeshakable ? 'Yes ✓' : 'No ✗'}
                  </div>
                </div>
              </div>
            </div>


          </div>
        </section>

        {/* ── SECTION 5: RECOMMENDER QUIZ WIDGET ──────────────────────────────── */}
        <section style={{ padding: '80px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-inter), sans-serif', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              Find Your Ideal Icon Library
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', fontFamily: 'JetBrains Mono, monospace' }}>
              // Short 3-step dynamic quiz to automatically match you to the perfect package.
            </p>
          </div>

          <div style={{
            maxWidth: '680px',
            margin: '0 auto',
            background: 'rgba(24, 24, 27, 0.5)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '32px',
            backdropFilter: 'blur(12px)',
            position: 'relative'
          }}>
            {/* Step indicators */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
              {[1, 2, 3].map(step => (
                <div 
                  key={step} 
                  style={{
                    height: '4px',
                    flexGrow: 1,
                    borderRadius: '2px',
                    background: quizStep >= step ? 'var(--accent)' : 'var(--border)',
                    transition: 'background 0.3s'
                  }} 
                />
              ))}
            </div>

            {/* STEP 1: Framework */}
            {quizStep === 1 && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', fontFamily: 'var(--font-inter), sans-serif' }}>
                  1. What framework are you building with?
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { key: 'react', label: 'React / Next.js', sub: 'Using standard hooks or server components' },
                    { key: 'vue', label: 'Vue.js', sub: 'Using Composition or Options API' },
                    { key: 'svelte', label: 'Svelte', sub: 'For ultra-lightweight compiled apps' },
                    { key: 'vanilla', label: 'Vanilla JS / HTML / Angular', sub: 'Using raw SVGs or web components' }
                  ].map(option => (
                    <button suppressHydrationWarning
                      key={option.key}
                      onClick={() => {
                        setQuizAnswers(prev => ({ ...prev, framework: option.key }))
                        setQuizStep(2)
                      }}
                      style={{
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        padding: '16px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>{option.label}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginTop: '2px' }}>{option.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Icon Style */}
            {quizStep === 2 && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', fontFamily: 'var(--font-inter), sans-serif' }}>
                  2. What icon aesthetics do you prefer?
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { key: 'outline', label: 'Clean, Consistent Outline (Line Art)', sub: 'Modern minimal wireframe stroke (e.g. Lucide, Iconoir)' },
                    { key: 'solid', label: 'Bold, Solid Filled Icons', sub: 'Strong solid color fills (e.g. Material, Bootstrap)' },
                    { key: 'multiweight', label: 'Flexible weights (Light, Thin, Duotone)', sub: 'Custom weight flexibility (e.g. Phosphor)' },
                    { key: 'brands', label: 'Technology Brand Logos Only', sub: 'Stripe, GitHub, Figma, Vercel (e.g. Simple Icons)' }
                  ].map(option => (
                    <button suppressHydrationWarning
                      key={option.key}
                      onClick={() => {
                        setQuizAnswers(prev => ({ ...prev, style: option.key }))
                        setQuizStep(3)
                      }}
                      style={{
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        padding: '16px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>{option.label}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginTop: '2px' }}>{option.sub}</div>
                    </button>
                  ))}
                </div>
                <button suppressHydrationWarning 
                  onClick={() => setQuizStep(1)} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer', marginTop: '16px' }}
                >
                  ← Back to framework selection
                </button>
              </div>
            )}

            {/* STEP 3: Priority */}
            {quizStep === 3 && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', fontFamily: 'var(--font-inter), sans-serif' }}>
                  3. What is your primary project goal?
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { key: 'imports', label: 'Perfect Developer DX & Autocomplete', sub: 'Easy TypeScript types, clean imports, fully tree-shakable' },
                    { key: 'weight', label: 'Tiny Bundle Size / Speed', sub: 'Minimal page-load footprint, zero bloated libraries' },
                    { key: 'count', label: 'Massive Variety of Icons', sub: 'Never run out of icons, thousands of options' },
                    { key: 'dashboard', label: 'Compact dense dashboard elements', sub: 'Specialized 15x15 grids or sleek micro layouts' }
                  ].map(option => (
                    <button suppressHydrationWarning
                      key={option.key}
                      onClick={() => {
                        setQuizAnswers(prev => ({ ...prev, priority: option.key }))
                        setQuizStep(4)
                      }}
                      style={{
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        padding: '16px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>{option.label}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginTop: '2px' }}>{option.sub}</div>
                    </button>
                  ))}
                </div>
                <button suppressHydrationWarning 
                  onClick={() => setQuizStep(2)} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer', marginTop: '16px' }}
                >
                  ← Back to visual aesthetics
                </button>
              </div>
            )}

            {/* STEP 4: Recommendation Results */}
            {quizStep === 4 && quizRecommendation && (
              <div style={{ textAlign: 'center' }}>
                <span style={{
                  background: 'rgba(52, 211, 153, 0.15)',
                  color: 'var(--green)',
                  border: '1px solid var(--green)',
                  borderRadius: '100px',
                  padding: '6px 14px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'inline-block',
                  marginBottom: '16px'
                }}>
                  🎯 {quizRecommendation.score}% PERFECT MATCH
                </span>

                <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px', color: 'var(--text)', fontFamily: 'var(--font-inter), sans-serif' }}>
                  {quizRecommendation.lib.name}
                </h3>

                <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '480px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                  {quizRecommendation.lib.description}
                </p>

                {/* Quick Info Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '12px',
                  maxWidth: '440px',
                  margin: '0 auto 28px'
                }}>
                  <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '9px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>STARS</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)', marginTop: '4px' }}>⭐ {formatNumber(quizRecommendation.lib.stars)}</div>
                  </div>
                  <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '9px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>ICONS</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)', marginTop: '4px' }}>◆ {formatNumber(quizRecommendation.lib.iconCount)}</div>
                  </div>
                  <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '9px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>LICENSE</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)', marginTop: '4px' }}>{quizRecommendation.lib.license}</div>
                  </div>
                </div>

                {/* Install shell script */}
                <div style={{
                  background: 'var(--code-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '14px 20px',
                  maxWidth: '440px',
                  margin: '0 auto 28px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '12px'
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>$ {quizRecommendation.lib.installCommand}</span>
                  <button suppressHydrationWarning
                    onClick={() => {
                      navigator.clipboard.writeText(quizRecommendation.lib.installCommand)
                      alert('Command copied!')
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Copy
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <Link href={`/icons/${quizRecommendation.lib.slug}`} style={{
                    background: 'var(--accent-accessible)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 600
                  }}>
                    View Integration Guide →
                  </Link>
                  <button suppressHydrationWarning
                    onClick={() => {
                      setQuizAnswers({ framework: '', style: '', priority: '' })
                      setQuizStep(1)
                    }}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontFamily: 'JetBrains Mono, monospace'
                    }}
                  >
                    Restart Quiz ↺
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── SECTION 6: BROWSE GRID (RESTYLED WITH GLOWS) ───────────────────── */}
        <section style={{ padding: '80px 0' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-inter), sans-serif', letterSpacing: '-0.02em', marginBottom: '8px', textAlign: 'center' }}>
            Explore Core Icon Collections
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '40px', fontFamily: 'JetBrains Mono, monospace', textAlign: 'center' }}>
            // {initialLibraries.length} libraries indexed — click to view direct guides & installation blocks.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
            gap: '16px'
          }}>
            {initialLibraries.map(icon => (
              <Link 
                key={icon.slug} 
                href={`/icons/${icon.slug}`} 
                style={{
                  background: 'rgba(24, 24, 27, 0.4)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '24px',
                  textDecoration: 'none',
                  color: 'var(--text)',
                  display: 'block',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(8px)',
                  position: 'relative'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(99, 102, 241, 0.08)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text)' }}>{icon.name}</h3>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11px',
                    color: 'var(--green)',
                    background: '#4ade8015',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}>
                    {icon.license}
                  </span>
                </div>
                <p style={{
                  color: 'var(--text-muted)',
                  fontSize: '13px',
                  marginBottom: '16px',
                  lineHeight: 1.5,
                }}>
                  {icon.description}
                </p>
                <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                    ⭐ {formatNumber(icon.stars)}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                    ◆ {formatNumber(icon.iconCount)} icons
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── SECTION 7: POPULAR COMPARISONS ────────────────────────────────── */}


        {/* ── SECTION 8: RECENTLY ADDED ─────────────────────────────────────── */}
        <section style={{ padding: '0 0 80px' }}>
          <h2 style={{ fontSize: '13px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '16px', textTransform: 'uppercase' }}>
            // Recently Added Updates & Pages
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentItems.map(link => (
              <Link
                key={link.href} 
                href={link.href} 
                style={{ 
                  color: 'var(--text-muted)', 
                  textDecoration: 'none', 
                  fontSize: '14px', 
                  fontFamily: 'JetBrains Mono, monospace', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '12px 18px', 
                  background: 'rgba(24, 24, 27, 0.4)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '8px',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--border-hover)'
                  e.currentTarget.style.color = 'var(--text)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.color = 'var(--text-muted)'
                }}
              >
                <span>{link.label}</span>
                <span style={{ color: 'var(--accent)' }}>→</span>
              </Link>
            ))}
          </div>
        </section>

      </main>
    </div>
  )
}
