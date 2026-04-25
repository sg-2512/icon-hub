import { writeFileSync, readdirSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')   // scripts/ → project root
const output = []

function toTags(name) {
  return name.toLowerCase().replace(/[-_]/g, ' ').split(' ').filter(Boolean)
}

function findDir(candidates) {
  for (const c of candidates) {
    const p = join(root, c)
    if (existsSync(p)) return p
  }
  return null
}

// ─── 1. LUCIDE ───────────────────────────────────────────────
console.log('Processing Lucide Icons...')
try {
  const lucideDir = findDir([
    'node_modules/lucide-react/dist/esm/icons',
    'node_modules/lucide-react/src/icons',
    'node_modules/lucide-static/icons',
  ])

  if (lucideDir) {
    console.log('  Found at:', lucideDir)
    // Files are .mjs — filter those, skip .map files
    const files = readdirSync(lucideDir).filter(f => f.endsWith('.mjs') && !f.endsWith('.map'))
    for (const file of files) {
      const name = file.replace(/\.mjs$/, '')
      if (name === 'index') continue
      const componentName = name.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('')
      output.push({
        id: `lucide-${name}`,
        name,
        displayName: componentName,
        library: 'lucide-icons',
        libraryName: 'Lucide Icons',
        npmPackage: 'lucide-react',
        license: 'ISC',
        tags: toTags(name),
        reactImport: `import { ${componentName} } from 'lucide-react'`,
        reactUsage: `<${componentName} size={24} />`,
        svgUrl: `https://cdn.jsdelivr.net/npm/lucide-static/icons/${name}.svg`,
      })
    }
    console.log(`✓ Lucide: ${files.length} icons`)
  } else {
    // Fallback: parse main bundle for export names
    const bundleCandidates = [
      'node_modules/lucide-react/dist/lucide-react.js',
      'node_modules/lucide-react/dist/cjs/lucide-react.js',
      'node_modules/lucide-react/dist/esm/lucide-react.js',
    ]
    const usePath = bundleCandidates.find(p => existsSync(join(root, p)))
    if (usePath) {
      const content = readFileSync(join(root, usePath), 'utf-8')
      // FIX: match both `var X =` and `const X =` style exports
      const matches = [...content.matchAll(/(?:var|const)\s+([A-Z][a-zA-Z]+)\s*=/g)]
      const names = new Set(matches.map(m => m[1]).filter(n => n.length > 2 && !n.includes('_')))
      for (const componentName of names) {
        const name = componentName.replace(/([A-Z])/g, s => `-${s.toLowerCase()}`).replace(/^-/, '')
        output.push({
          id: `lucide-${name}`,
          name,
          displayName: componentName,
          library: 'lucide-icons',
          libraryName: 'Lucide Icons',
          npmPackage: 'lucide-react',
          license: 'ISC',
          tags: toTags(name),
          reactImport: `import { ${componentName} } from 'lucide-react'`,
          reactUsage: `<${componentName} size={24} />`,
          svgUrl: `https://unpkg.com/lucide-static@latest/icons/${name}.svg`,
        })
      }
      console.log(`✓ Lucide (fallback): ${names.size} icons`)
    } else {
      console.log('  Lucide not found')
    }
  }
} catch (e) {
  console.log('Lucide error:', e.message)
}

// ─── 2. HEROICONS ─────────────────────────────────────────────
console.log('Processing Heroicons...')
try {
  const heroDir = findDir([
    'node_modules/@heroicons/react/24/outline',
    'node_modules/@heroicons/react/outline',
  ])
  if (heroDir) {
    // FIX: also accept .d.ts in case .js files are missing
    const files = readdirSync(heroDir).filter(f =>
      (f.endsWith('.js') || f.endsWith('.d.ts')) && f !== 'index.js' && f !== 'index.d.ts'
    )
    const seen = new Set()
    for (const file of files) {
      const componentName = file.replace(/\.(js|d\.ts)$/, '')
      if (seen.has(componentName)) continue
      seen.add(componentName)
      const name = componentName.replace(/Icon$/, '').replace(/([A-Z])/g, s => `-${s.toLowerCase()}`).replace(/^-/, '')
      output.push({
        id: `heroicons-${name}`,
        name,
        displayName: componentName,
        library: 'heroicons',
        libraryName: 'Heroicons',
        npmPackage: '@heroicons/react',
        license: 'MIT',
        tags: toTags(name),
        reactImport: `import { ${componentName} } from '@heroicons/react/24/outline'`,
        reactUsage: `<${componentName} className="h-6 w-6" />`,
        svgUrl: `https://raw.githubusercontent.com/tailwindlabs/heroicons/master/src/24/outline/${name}.svg`,
      })
    }
    console.log(`✓ Heroicons: ${seen.size} icons`)
  }
} catch (e) {
  console.log('Heroicons error:', e.message)
}

// ─── 3. TABLER ────────────────────────────────────────────────
console.log('Processing Tabler Icons...')
try {
  const tablerDir = findDir([
    'node_modules/@tabler/icons-react/dist/esm/icons',
    'node_modules/@tabler/icons-react/dist/cjs/icons',
    'node_modules/@tabler/icons/icons',
    'node_modules/@tabler/icons-react/icons',
  ])

  if (tablerDir) {
    console.log('  Found at:', tablerDir)
    // Files are .mjs — filter those, skip .map files
    const files = readdirSync(tablerDir).filter(f => f.endsWith('.mjs') && !f.endsWith('.map'))
    for (const file of files) {
      const isSvg = false
      const componentName = file.replace(/\.mjs$/, '')
      // Tabler components are named IconCamera, IconHome, etc.
      if (!isSvg && !componentName.startsWith('Icon')) continue
      const name = componentName
      .replace(/^Icon/, '')
      .replace(/([A-Z])/g, (s) => `-${s.toLowerCase()}`)
      .replace(/^-/, '')
      .replace(/--+/g, '-')
      const display = isSvg
        ? 'Icon' + name.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('')
        : componentName
      output.push({
        id: `tabler-${name}`,
        name,
        displayName: display,
        library: 'tabler-icons',
        libraryName: 'Tabler Icons',
        npmPackage: '@tabler/icons-react',
        license: 'MIT',
        tags: toTags(name),
        reactImport: `import { ${display} } from '@tabler/icons-react'`,
        reactUsage: `<${display} size={24} />`,
        svgUrl: `https://cdn.jsdelivr.net/npm/@tabler/icons/icons/${name}.svg`,
      })
    }
    console.log(`✓ Tabler: ${files.length} icons`)
  } else {
    console.log('  Tabler not found')
  }
} catch (e) {
  console.log('Tabler error:', e.message)
}

// ─── 4. PHOSPHOR ──────────────────────────────────────────────
console.log('Processing Phosphor Icons...')
try {
  // FIX: Phosphor is a monolithic bundle — parse the ESM bundle for component names
  const phosphorBundleCandidates = [
    'node_modules/@phosphor-icons/react/dist/index.es.js',
    'node_modules/@phosphor-icons/react/dist/index.esm.js',
    'node_modules/@phosphor-icons/react/dist/index.cjs.js',
  ]
  const phosphorBundle = phosphorBundleCandidates.find(p => existsSync(join(root, p)))

  if (phosphorBundle) {
    console.log('  Parsing bundle:', phosphorBundle)
    const content = readFileSync(join(root, phosphorBundle), 'utf-8')
    // Match named exports: `export { Camera, ... }` or `export const Camera =`
    const exportMatches = [...content.matchAll(/export\s*\{([^}]+)\}/g)]
    const names = new Set()
    for (const m of exportMatches) {
      m[1].split(',').forEach(part => {
        const name = part.trim().split(/\s+as\s+/).pop().trim()
        if (/^[A-Z][a-zA-Z]{2,}$/.test(name)) names.add(name)
      })
    }
    // Remove entries ending in 'Icon' if base name exists
    for (const n of names) {
      if (n.endsWith('Icon') && names.has(n.replace(/Icon$/, ''))) {
        names.delete(n)
      }
    }
    // Also catch `export function X` / `export const X`
    const directMatches = [...content.matchAll(/export\s+(?:function|const|var)\s+([A-Z][a-zA-Z]+)/g)]
    directMatches.forEach(m => { if (m[1].length > 2) names.add(m[1]) })
    for (const componentName of names) {
      const name = componentName.replace(/([A-Z])/g, s => `-${s.toLowerCase()}`).replace(/^-/, '')
      output.push({
        id: `phosphor-${name}`,
        name,
        displayName: componentName,
        library: 'phosphor-icons',
        libraryName: 'Phosphor Icons',
        npmPackage: '@phosphor-icons/react',
        license: 'MIT',
        tags: toTags(name),
        reactImport: `import { ${componentName} } from '@phosphor-icons/react'`,
        reactUsage: `<${componentName} size={24} />`,
        svgUrl: `https://cdn.jsdelivr.net/npm/@phosphor-icons/core/assets/regular/${name}.svg`,
      })
    }
    console.log(`✓ Phosphor: ${names.size} icons`)
  } else {
    // Fallback: try reading the defs folder which lists icon names
    const defsDir = join(root, 'node_modules/@phosphor-icons/react/dist/defs')
    if (existsSync(defsDir)) {
      const files = readdirSync(defsDir).filter(f => f.endsWith('.js') || f.endsWith('.d.ts'))
      for (const file of files) {
        const componentName = file.replace(/\.(js|d\.ts)$/, '')
        if (!componentName || componentName === 'index') continue
        const name = componentName.replace(/([A-Z])/g, s => `-${s.toLowerCase()}`).replace(/^-/, '')
        output.push({
          id: `phosphor-${name}`,
          name,
          displayName: componentName,
          library: 'phosphor-icons',
          libraryName: 'Phosphor Icons',
          npmPackage: '@phosphor-icons/react',
          license: 'MIT',
          tags: toTags(name),
          reactImport: `import { ${componentName} } from '@phosphor-icons/react'`,
          reactUsage: `<${componentName} size={24} />`,
          svgUrl: `https://unpkg.com/@phosphor-icons/core@latest/assets/regular/${name}.svg`,
        })
      }
      console.log(`✓ Phosphor (defs fallback): ${files.length} icons`)
    } else {
      console.log('  Phosphor bundle not found')
    }
  }
} catch (e) {
  console.log('Phosphor error:', e.message)
}

// ─── 5. RADIX ─────────────────────────────────────────────────
console.log('Processing Radix Icons...')
try {
  const radixDir = findDir(['node_modules/@radix-ui/react-icons/dist'])
  if (radixDir) {
    const files = readdirSync(radixDir)

    // FIX: Radix uses arrow functions / forwardRef, not `function X(`
    // Strategy A: read .d.ts files — each one = one icon component
    const dtFiles = files.filter(f => f.endsWith('.d.ts') && f !== 'index.d.ts' && f !== 'types.d.ts')
    if (dtFiles.length > 0) {
      for (const file of dtFiles) {
        const componentName = file.replace(/\.d\.ts$/, '')
        if (!componentName.endsWith('Icon')) continue
        const name = componentName.replace(/Icon$/, '').replace(/([A-Z])/g, s => `-${s.toLowerCase()}`).replace(/^-/, '')
        output.push({
          id: `radix-${name}`,
          name,
          displayName: componentName,
          library: 'radix-icons',
          libraryName: 'Radix Icons',
          npmPackage: '@radix-ui/react-icons',
          license: 'MIT',
          tags: toTags(name),
          reactImport: `import { ${componentName} } from '@radix-ui/react-icons'`,
          reactUsage: `<${componentName} />`,
          svgUrl: `https://raw.githubusercontent.com/radix-ui/icons/main/packages/radix-icons/icons/${name}.svg`,
        })
      }
      console.log(`✓ Radix: ${dtFiles.length} icons`)
    } else {
      // Strategy B: parse bundle for `var/const XIcon =` or forwardRef patterns
      const indexFile = files.find(f => f.includes('index') && (f.endsWith('.js') || f.endsWith('.esm.js')))
      if (indexFile) {
        const content = readFileSync(join(radixDir, indexFile), 'utf-8')
        // FIX: match arrow functions and forwardRef — not just `function X(`
        const matches = [...content.matchAll(/(?:var|const)\s+(\w+Icon)\s*=/g)]
        const names = new Set(matches.map(m => m[1]))
        for (const componentName of names) {
          const name = componentName.replace(/Icon$/, '').replace(/([A-Z])/g, s => `-${s.toLowerCase()}`).replace(/^-/, '')
          output.push({
            id: `radix-${name}`,
            name,
            displayName: componentName,
            library: 'radix-icons',
            libraryName: 'Radix Icons',
            npmPackage: '@radix-ui/react-icons',
            license: 'MIT',
            tags: toTags(name),
            reactImport: `import { ${componentName} } from '@radix-ui/react-icons'`,
            reactUsage: `<${componentName} />`,
            svgUrl: `https://www.radix-ui.com/icons`,
          })
        }
        console.log(`✓ Radix (bundle fallback): ${names.size} icons`)
      }
    }
  }
} catch (e) {
  console.log('Radix error:', e.message)
}

// ─── WRITE OUTPUT ─────────────────────────────────────────────
const outputPath = join(root, 'data/icon-search.json')
const publicPath = join(root, 'public/icon-search.json')
mkdirSync(join(root, 'data'), { recursive: true })
writeFileSync(outputPath, JSON.stringify(output, null, 2))
// Also copy to public/ so Next.js can serve it
writeFileSync(publicPath, JSON.stringify(output, null, 2))
console.log(`\n✅ Done! Total icons: ${output.length}`)
console.log(`📁 Written to: data/icon-search.json`)
console.log(`📁 Copied to:  public/icon-search.json`)