import { writeFileSync, readdirSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { dirname } from 'path'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')   // scripts/ → project root
const output = []
const PATTERNFLY_REACT_ICONS_VERSION = '6.6.0'

function toTags(name) {
  return name.toLowerCase().replace(/[-_]/g, ' ').split(' ').filter(Boolean)
}

function iconifySvgUrl(prefix, name) {
  return `https://api.iconify.design/${prefix}/${name.replace(/_/g, '-')}.svg`
}

function pascalToKebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Za-z])([0-9])/g, '$1-$2')
    .replace(/([0-9])([A-Za-z])/g, '$1-$2')
    .replace(/--+/g, '-')
    .toLowerCase()
}

function normalizeStaticSvg(svg) {
  if (!/^<svg\b/i.test(svg)) return svg

  let normalized = svg
  if (!/\sxmlns=/.test(normalized)) {
    normalized = normalized.replace(/^<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"')
  }

  return normalized
    .replace(/\swidth="1em"/i, ' width="24"')
    .replace(/\sheight="1em"/i, ' height="24"')
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

// ─── 6. BOOTSTRAP ICONS ───────────────────────────────────────
console.log('Processing Bootstrap Icons...')
try {
  const bsDir = findDir(['node_modules/bootstrap-icons/icons'])
  if (bsDir) {
    const files = readdirSync(bsDir).filter(f => f.endsWith('.svg'))
    for (const file of files) {
      const name = file.replace(/\.svg$/, '')
      const componentName = name.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('')
      output.push({
        id: `bootstrap-${name}`,
        name,
        displayName: componentName,
        library: 'bootstrap-icons',
        libraryName: 'Bootstrap Icons',
        npmPackage: 'bootstrap-icons',
        license: 'MIT',
        tags: toTags(name),
        reactImport: `import 'bootstrap-icons/font/bootstrap-icons.css'`,
        reactUsage: `<i className="bi bi-${name}"></i>`,
        svgUrl: `https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/${name}.svg`,
      })
    }
    console.log(`✓ Bootstrap: ${files.length} icons`)
  } else {
    console.log('  Bootstrap not found')
  }
} catch (e) {
  console.log('Bootstrap error:', e.message)
}

// ─── 7. FEATHER ICONS ─────────────────────────────────────────
console.log('Processing Feather Icons...')
try {
  const featherDir = findDir(['node_modules/react-feather/dist/icons'])
  if (featherDir) {
    const files = readdirSync(featherDir).filter(f => f.endsWith('.js') && f !== 'index.js')
    for (const file of files) {
      const componentNameName = file.replace(/\.js$/, '')
      const componentName = componentNameName.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('')
      const name = componentNameName
      output.push({
        id: `feather-${name}`,
        name,
        displayName: componentName,
        library: 'feather-icons',
        libraryName: 'Feather Icons',
        npmPackage: 'react-feather',
        license: 'MIT',
        tags: toTags(name),
        reactImport: `import { ${componentName} } from 'react-feather'`,
        reactUsage: `<${componentName} size={24} />`,
        svgUrl: `https://unpkg.com/feather-icons@latest/dist/icons/${name}.svg`,
      })
    }
    console.log(`✓ Feather: ${files.length} icons`)
  } else {
    console.log('  Feather not found')
  }
} catch (e) {
  console.log('Feather error:', e.message)
}

// ─── 8. REMIX ICON ────────────────────────────────────────────
console.log('Processing Remix Icons...')
try {
  const remixDir = findDir(['node_modules/remixicon/icons'])
  if (remixDir) {
    let remixCount = 0
    const categories = readdirSync(remixDir).filter(f => {
      const p = join(remixDir, f)
      return existsSync(p) && readdirSync(p).length > 0
    })
    for (const cat of categories) {
      const catDir = join(remixDir, cat)
      const files = readdirSync(catDir).filter(f => f.endsWith('.svg'))
      for (const file of files) {
        const name = file.replace(/\.svg$/, '')
        const componentName = name.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('')
        output.push({
          id: `remix-${name}`,
          name,
          displayName: componentName,
          library: 'remix-icon',
          libraryName: 'Remix Icon',
          npmPackage: 'remixicon',
          license: 'Apache 2.0',
          tags: toTags(name),
          reactImport: `import 'remixicon/fonts/remixicon.css'`,
          reactUsage: `<i className="ri ri-${name}"></i>`,
          svgUrl: `https://cdn.jsdelivr.net/npm/remixicon@4.2.0/icons/${cat}/${name}.svg`,
        })
        remixCount++
      }
    }
    console.log(`✓ Remix Icon: ${remixCount} icons`)
  } else {
    console.log('  Remix Icon not found')
  }
} catch (e) {
  console.log('Remix Icon error:', e.message)
}

// ─── 9. ICONOIR ───────────────────────────────────────────────
console.log('Processing Iconoir...')
try {
  const iconoirDir = findDir([
    'node_modules/iconoir-react/dist/esm/regular',
    'node_modules/iconoir-react/dist/regular',
  ])

  if (iconoirDir) {
    console.log('  Found at:', iconoirDir)
    const files = readdirSync(iconoirDir).filter(f => f.endsWith('.mjs') && !f.endsWith('.map'))
    for (const file of files) {
      const componentName = file.replace(/\.mjs$/, '')
      if (componentName === 'index') continue
      // Convert PascalCase to kebab-case for name
      const name = componentName
        .replace(/([A-Z])/g, s => `-${s.toLowerCase()}`)
        .replace(/^-/, '')
        .replace(/--+/g, '-')
      output.push({
        id: `iconoir-${name}`,
        name,
        displayName: componentName,
        library: 'iconoir',
        libraryName: 'Iconoir',
        npmPackage: 'iconoir-react',
        license: 'MIT',
        tags: toTags(name),
        reactImport: `import { ${componentName} } from 'iconoir-react'`,
        reactUsage: `<${componentName} width={24} height={24} />`,
        svgUrl: `https://cdn.jsdelivr.net/npm/iconoir@latest/icons/regular/${name}.svg`,
      })
    }
    console.log(`✓ Iconoir: ${files.length} icons`)
  } else {
    console.log('  Iconoir not found')
  }
} catch (e) {
  console.log('Iconoir error:', e.message)
}

// ─── 10. TEENYICONS ───────────────────────────────────────────
console.log('Processing Teenyicons...')
try {
  const teenyDir = findDir([
    'node_modules/teenyicons/outline',
    'node_modules/teenyicons/solid',
  ])

  if (teenyDir) {
    console.log('  Found at:', teenyDir)
    const files = readdirSync(teenyDir).filter(f => f.endsWith('.svg'))
    for (const file of files) {
      const name = file.replace(/\.svg$/, '')
      const componentName = name.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('')
      output.push({
        id: `teenyicons-${name}`,
        name,
        displayName: componentName,
        library: 'teenyicons',
        libraryName: 'Teenyicons',
        npmPackage: 'teenyicons',
        license: 'MIT',
        tags: toTags(name),
        reactImport: `import { ${componentName} } from 'teenyicons'`,
        reactUsage: `<${componentName} className="w-4 h-4" />`,
        svgUrl: iconifySvgUrl('teenyicons', name),
      })
    }
    console.log(`✓ Teenyicons: ${files.length} icons`)
  } else {
    console.log('  Teenyicons not found locally, trying to fetch from GitHub CDN/jsDelivr list...')
    try {
      const res = await fetch('https://cdn.jsdelivr.net/npm/@iconify-json/teenyicons@latest/icons.json')
      if (res.ok) {
        const data = await res.json()
        let tCount = 0
        if (data && data.icons) {
          for (const [name] of Object.entries(data.icons)) {
            const componentName = name.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('')
            output.push({
              id: `teenyicons-${name}`,
              name,
              displayName: componentName,
              library: 'teenyicons',
              libraryName: 'Teenyicons',
              npmPackage: 'teenyicons',
              license: 'MIT',
              tags: toTags(name),
              reactImport: `import { ${componentName} } from 'teenyicons'`,
              reactUsage: `<${componentName} className="w-4 h-4" />`,
              svgUrl: iconifySvgUrl('teenyicons', name),
            })
            tCount++
          }
        }
        console.log(`✓ Teenyicons (CDN): ${tCount} icons`)
      } else {
        console.log('  Failed to fetch Teenyicons json from jsdelivr')
      }
    } catch (cdnErr) {
      console.log('  Teenyicons CDN fetch failed:', cdnErr.message)
    }
  }
} catch (e) {
  console.log('Teenyicons error:', e.message)
}

// ─── 11. CIRCUM ICONS ─────────────────────────────────────────
console.log('Processing Circum Icons...')
try {
  const circumDir = findDir([
    'node_modules/circum-icons/svg',
  ])

  if (circumDir) {
    console.log('  Found at:', circumDir)
    const files = readdirSync(circumDir).filter(f => f.endsWith('.svg'))
    for (const file of files) {
      const name = file.replace(/\.svg$/, '')
      const componentName = name.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('')
      output.push({
        id: `circum-${name}`,
        name,
        displayName: componentName,
        library: 'circum-icons',
        libraryName: 'Circum Icons',
        npmPackage: 'circum-icons',
        license: 'MPL-2.0',
        tags: toTags(name),
        reactImport: `import { ${componentName} } from 'circum-icons'`,
        reactUsage: `<${componentName} size={24} />`,
        svgUrl: iconifySvgUrl('circum', name),
      })
    }
    console.log(`✓ Circum Icons: ${files.length} icons`)
  } else {
    console.log('  Circum Icons not found locally, trying to fetch from GitHub CDN/jsDelivr list...')
    try {
      const res = await fetch('https://cdn.jsdelivr.net/npm/@iconify-json/circum@latest/icons.json')
      if (res.ok) {
        const data = await res.json()
        let cCount = 0
        if (data && data.icons) {
          for (const [name] of Object.entries(data.icons)) {
            const componentName = name.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('')
            output.push({
              id: `circum-${name}`,
              name,
              displayName: componentName,
              library: 'circum-icons',
              libraryName: 'Circum Icons',
              npmPackage: 'circum-icons',
              license: 'MPL-2.0',
              tags: toTags(name),
              reactImport: `import { ${componentName} } from 'circum-icons'`,
              reactUsage: `<${componentName} size={24} />`,
              svgUrl: iconifySvgUrl('circum', name),
            })
            cCount++
          }
        }
        console.log(`✓ Circum Icons (CDN): ${cCount} icons`)
      } else {
        console.log('  Failed to fetch Circum Icons json from jsdelivr')
      }
    } catch (cdnErr) {
      console.log('  Circum Icons CDN fetch failed:', cdnErr.message)
    }
  }
} catch (e) {
  console.log('Circum Icons error:', e.message)
}

// ─── 12. ELUSIVE ICONS ────────────────────────────────────────
console.log('Processing Elusive Icons...')
try {
  const elusiveDir = findDir([
    'node_modules/elusive-icons/dev/svg',
    'node_modules/elusive-icons/svg',
  ])

  if (elusiveDir) {
    console.log('  Found at:', elusiveDir)
    const files = readdirSync(elusiveDir).filter(f => f.endsWith('.svg'))
    for (const file of files) {
      const name = file.replace(/\.svg$/, '')
      const componentName = name.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('')
      output.push({
        id: `elusive-${name}`,
        name,
        displayName: componentName,
        library: 'elusive-icons',
        libraryName: 'Elusive Icons',
        npmPackage: 'elusive-icons',
        license: 'OFL-1.1',
        tags: toTags(name),
        reactImport: `// Use via SVG or Iconify component`,
        reactUsage: `<iconify-icon icon="el:${name}"></iconify-icon>`,
        svgUrl: iconifySvgUrl('el', name),
      })
    }
    console.log(`✓ Elusive Icons: ${files.length} icons`)
  } else {
    console.log('  Elusive Icons not found locally, trying to fetch from GitHub CDN/jsDelivr list...')
    try {
      const res = await fetch('https://cdn.jsdelivr.net/npm/@iconify-json/el@latest/icons.json')
      if (res.ok) {
        const data = await res.json()
        let eCount = 0
        if (data && data.icons) {
          for (const [name] of Object.entries(data.icons)) {
            const componentName = name.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('')
            output.push({
              id: `elusive-${name}`,
              name,
              displayName: componentName,
              library: 'elusive-icons',
              libraryName: 'Elusive Icons',
              npmPackage: 'elusive-icons',
              license: 'OFL-1.1',
              tags: toTags(name),
              reactImport: `// Use via SVG or Iconify component`,
              reactUsage: `<iconify-icon icon="el:${name}"></iconify-icon>`,
              svgUrl: iconifySvgUrl('el', name),
            })
            eCount++
          }
        }
        console.log(`✓ Elusive Icons (CDN): ${eCount} icons`)
      } else {
        console.log('  Failed to fetch Elusive Icons json from jsdelivr')
      }
    } catch (cdnErr) {
      console.log('  Elusive Icons CDN fetch failed:', cdnErr.message)
    }
  }
} catch (e) {
  console.log('Elusive Icons error:', e.message)
}

// ─── 13. DEVICONS (fetched from GitHub CDN) ──────────────────
console.log('Processing Devicons...')
try {
  // Devicon publishes a JSON manifest on GitHub with all icon metadata
  const deviconsJsonPath = join(root, 'node_modules/devicon/devicon.json')
  let deviconsManifest = null

  if (existsSync(deviconsJsonPath)) {
    // If devicon is installed locally via npm
    deviconsManifest = JSON.parse(readFileSync(deviconsJsonPath, 'utf-8'))
    console.log('  Found local devicon package')
  } else {
    // Fallback: try to fetch from CDN at build time
    console.log('  devicon not in node_modules — trying CDN fetch...')
    try {
      const resp = await fetch('https://raw.githubusercontent.com/devicons/devicon/master/devicon.json')
      if (resp.ok) {
        deviconsManifest = await resp.json()
        console.log('  Fetched devicon.json from GitHub')
      }
    } catch (fetchErr) {
      console.log('  CDN fetch failed:', fetchErr.message)
    }
  }

  if (deviconsManifest && Array.isArray(deviconsManifest)) {
    let devCount = 0
    for (const icon of deviconsManifest) {
      const name = icon.name
      if (!name) continue
      // Pick the best SVG variant: prefer "original", fallback to "plain", then "line"
      const svgVariants = icon.versions?.svg || []
      const bestVariant = svgVariants.includes('original') ? 'original'
        : svgVariants.includes('plain') ? 'plain'
        : svgVariants.includes('line') ? 'line'
        : svgVariants[0] || 'original'

      const displayName = name.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
      const tags = [...(icon.tags || []), ...(icon.altnames || []), name].map(t => t.toLowerCase())

      output.push({
        id: `devicons-${name}`,
        name,
        displayName,
        library: 'devicons',
        libraryName: 'Devicons',
        npmPackage: 'devicon',
        license: 'MIT',
        tags,
        reactImport: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css" />`,
        reactUsage: `<i className="devicon-${name}-${bestVariant} colored"></i>`,
        svgUrl: `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${name}/${name}-${bestVariant}.svg`,
      })
      devCount++
    }
    console.log(`✓ Devicons: ${devCount} icons`)
  } else {
    console.log('  Devicons manifest not available')
  }
} catch (e) {
  console.log('Devicons error:', e.message)
}

// --- 14. PATTERNFLY ICONS -------------------------------------------------
console.log('Processing PatternFly Icons...')
try {
  const patternflyStaticDir = findDir(['node_modules/@patternfly/react-icons/dist/static'])
  const patternflyExportsPath = join(root, 'node_modules/@patternfly/react-icons/dist/esm/icons/index.d.ts')

  if (patternflyStaticDir && existsSync(patternflyExportsPath)) {
    const exportsContent = readFileSync(patternflyExportsPath, 'utf-8')
    const exportMap = new Map()
    for (const match of exportsContent.matchAll(/export \{ ([A-Za-z0-9]+Icon), [^}]+ \} from '\.\/([^']+)\.js'/g)) {
      const [, componentName, moduleName] = match
      exportMap.set(moduleName.replace(/-icon$/, ''), componentName)
    }

    const files = readdirSync(patternflyStaticDir).filter(f => f.endsWith('.svg'))
    let patternflyCount = 0
    for (const file of files) {
      const name = file.replace(/\.svg$/, '')
      const componentName = exportMap.get(name)
      if (!componentName) continue

      output.push({
        id: `patternfly-${name}`,
        name,
        displayName: componentName,
        library: 'patternfly-icons',
        libraryName: 'PatternFly Icons',
        npmPackage: '@patternfly/react-icons',
        license: 'MIT',
        tags: [...toTags(name), 'patternfly', 'red', 'hat', 'enterprise', 'admin', 'console'],
        reactImport: `import { ${componentName} } from '@patternfly/react-icons'`,
        reactUsage: `<${componentName} />`,
        svgUrl: `https://cdn.jsdelivr.net/npm/@patternfly/react-icons@${PATTERNFLY_REACT_ICONS_VERSION}/dist/static/${name}.svg`,
      })
      patternflyCount++
    }
    console.log(`✓ PatternFly Icons: ${patternflyCount} icons`)
  } else {
    console.log('  PatternFly Icons not found')
  }
} catch (e) {
  console.log('PatternFly Icons error:', e.message)
}

// ─── WRITE OUTPUT ─────────────────────────────────────────────
// --- 15. UNTITLED UI ICONS -----------------------------------------------
console.log('Processing Untitled UI Icons...')
try {
  const untitledDir = findDir(['node_modules/@untitledui/icons/dist'])

  if (untitledDir) {
    const publicUntitledDir = join(root, 'public/untitled-ui-icons')
    mkdirSync(publicUntitledDir, { recursive: true })

    const files = readdirSync(untitledDir)
      .filter(f => f.endsWith('.mjs') && f !== 'index.mjs')
      .sort()

    let untitledCount = 0
    for (const file of files) {
      const componentName = file.replace(/\.mjs$/, '')
      const name = pascalToKebab(componentName)
      const moduleUrl = pathToFileURL(join(untitledDir, file)).href
      const mod = await import(moduleUrl)
      const Component = mod[componentName] || mod.default
      if (typeof Component !== 'function') continue

      const svg = normalizeStaticSvg(renderToStaticMarkup(
        React.createElement(Component, { size: 24, color: 'currentColor' })
      ))
      if (!/^<svg\b/i.test(svg)) continue

      writeFileSync(join(publicUntitledDir, `${name}.svg`), svg)

      output.push({
        id: `untitled-ui-${name}`,
        name,
        displayName: componentName,
        library: 'untitled-ui-icons',
        libraryName: 'Untitled UI Icons',
        npmPackage: '@untitledui/icons',
        license: 'MIT',
        tags: [...toTags(name), 'untitled', 'ui', 'design', 'system', 'saas', 'dashboard', 'product', 'interface'],
        reactImport: `import { ${componentName} } from '@untitledui/icons'`,
        reactUsage: `<${componentName} size={24} color="currentColor" />`,
        svgUrl: `https://iconsearch.info/untitled-ui-icons/${name}.svg`,
      })
      untitledCount++
    }
    console.log(`✓ Untitled UI Icons: ${untitledCount} icons`)
  } else {
    console.log('  Untitled UI Icons not found')
  }
} catch (e) {
  console.log('Untitled UI Icons error:', e.message)
}

const outputPath = join(root, 'data/icon-search.json')
const publicPath = join(root, 'public/icon-search.json')
mkdirSync(join(root, 'data'), { recursive: true })
writeFileSync(outputPath, JSON.stringify(output, null, 2))
// Also copy to public/ so Next.js can serve it
writeFileSync(publicPath, JSON.stringify(output, null, 2))
console.log(`\n✅ Done! Total icons: ${output.length}`)
console.log(`📁 Written to: data/icon-search.json`)
console.log(`📁 Copied to:  public/icon-search.json`)
