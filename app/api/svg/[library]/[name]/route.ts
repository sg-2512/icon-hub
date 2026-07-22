import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'
import { publicOptions, publicJson } from '@/lib/device-auth'
import { readExtensionSession } from '@/lib/extension-session'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const SVG_HEADERS = {
  'Content-Type': 'image/svg+xml; charset=utf-8',
  'Cache-Control': 'private, max-age=86400',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-iconsearch-product',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

const CACHE_DIR = process.env.VERCEL
  ? path.join('/tmp', '.cache', 'svgs')
  : path.join(process.cwd(), '.cache', 'svgs')

function isSafeSegment(value: string) {
  return /^[a-z0-9][a-z0-9._-]*$/i.test(value)
}

function normalizeName(name: string) {
  return name.replace(/\.svg$/i, '').replace(/_/g, '-').trim()
}

function resolveWithin(root: string, fileName: string) {
  const resolvedRoot = path.resolve(root)
  const resolvedFile = path.resolve(resolvedRoot, fileName)
  const rootPrefix = `${resolvedRoot}${path.sep}`.toLowerCase()
  return resolvedFile.toLowerCase().startsWith(rootPrefix) ? resolvedFile : ''
}

function sanitizeSvg(svg: string): string {
  if (!/^<svg\b/i.test(svg.trim())) return ''

  let clean = svg
    .replace(/<\?[\s\S]*?\?>/g, '')
    .replace(/<!doctype[\s\S]*?>/gi, '')
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<foreignObject\b[\s\S]*?<\/foreignObject\s*>/gi, '')
    .replace(/<link\b[\s\S]*?>/gi, '')
    .replace(/\s(on[a-z]+)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s(?:href|xlink:href)\s*=\s*(["'])\s*javascript:[\s\S]*?\1/gi, '')
    .trim()

  if (!/\sxmlns=/.test(clean)) {
    clean = clean.replace(/^<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"')
  }

  return clean
}

function findLocalSvgFile(library: string, name: string): string {
  if (library === 'patternfly-icons') {
    const root = path.join(process.cwd(), 'node_modules', '@patternfly', 'react-icons', 'dist', 'static')
    const candidate = resolveWithin(root, `${name}.svg`)
    if (candidate && existsSync(candidate)) return candidate
  }

  if (library === 'bootstrap-icons') {
    const root = path.join(process.cwd(), 'node_modules', 'bootstrap-icons', 'icons')
    const candidate = resolveWithin(root, `${name}.svg`)
    if (candidate && existsSync(candidate)) return candidate
  }

  if (library === 'untitled-ui-icons') {
    const root = path.join(process.cwd(), 'public', 'untitled-ui-icons')
    const candidate = resolveWithin(root, `${name}.svg`)
    if (candidate && existsSync(candidate)) return candidate
  }

  return ''
}

function getUpstreamCandidateUrls(library: string, name: string): string[] {
  const candidates = new Set<string>()
  const rawVariants = Array.from(new Set([name, name.replace(/_/g, '-'), name.replace(/-/g, '_')]))
  const variants: string[] = []
  for (const v of rawVariants) {
    variants.push(v)
    if (!v.endsWith('-outline') && !v.endsWith('-solid') && !v.endsWith('-regular') && !v.endsWith('-filled')) {
      variants.push(`${v}-outline`, `${v}-solid`, `${v}-regular`, `${v}-filled`, `${v}-line`, `${v}-fill`)
    }
  }

  const add = (url: string) => candidates.add(url)

  if (library.startsWith('iconify-')) {
    const prefix = library.replace(/^iconify-/, '')
    for (const v of variants) {
      add(`https://api.iconify.design/${prefix}/${v}.svg`)
    }
  } else if (library === 'elusive-icons') {
    for (const v of variants) {
      add(`https://api.iconify.design/el/${v}.svg`)
      add(`https://api.iconify.design/elusive/${v}.svg`)
    }
  } else if (library === 'teenyicons') {
    for (const v of variants) {
      add(`https://api.iconify.design/teenyicons/${v}.svg`)
      add(`https://api.iconify.design/teeny/${v}.svg`)
    }
  } else if (library === 'circum-icons') {
    for (const v of variants) {
      add(`https://api.iconify.design/circum/${v}.svg`)
    }
  } else if (library === 'radix-icons') {
    for (const v of variants) {
      add(`https://api.iconify.design/radix-icons/${v}.svg`)
      add(`https://api.iconify.design/radix-ui/${v}.svg`)
      add(`https://api.iconify.design/radix/${v}.svg`)
    }
  } else if (library === 'devicons') {
    for (const v of variants) {
      add(`https://api.iconify.design/devicon/${v}.svg`)
      add(`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${v}/${v}-original.svg`)
    }
  } else if (library === 'lucide-icons') {
    for (const v of variants) {
      add(`https://cdn.jsdelivr.net/npm/lucide-static/icons/${v}.svg`)
      add(`https://api.iconify.design/lucide/${v}.svg`)
    }
  } else if (library === 'tabler-icons') {
    for (const v of variants) {
      add(`https://cdn.jsdelivr.net/npm/@tabler/icons/icons/${v}.svg`)
      add(`https://api.iconify.design/tabler/${v}.svg`)
    }
  } else if (library === 'phosphor-icons') {
    for (const v of variants) {
      add(`https://cdn.jsdelivr.net/npm/@phosphor-icons/core/assets/regular/${v}.svg`)
      add(`https://api.iconify.design/ph/${v}.svg`)
    }
  } else if (library === 'heroicons') {
    for (const v of variants) {
      add(`https://api.iconify.design/heroicons/${v}.svg`)
      add(`https://api.iconify.design/heroicons-outline/${v}.svg`)
      add(`https://api.iconify.design/heroicons-solid/${v}.svg`)
    }
  } else if (library === 'feather-icons') {
    for (const v of variants) {
      add(`https://unpkg.com/feather-icons/dist/icons/${v}.svg`)
      add(`https://api.iconify.design/feather/${v}.svg`)
    }
  } else if (library === 'remix-icon') {
    for (const v of variants) {
      add(`https://api.iconify.design/ri/${v}.svg`)
    }
  } else if (library === 'iconoir') {
    for (const v of variants) {
      add(`https://api.iconify.design/iconoir/${v}.svg`)
    }
  } else if (library === 'ionicons') {
    for (const v of variants) {
      add(`https://api.iconify.design/ion/${v}.svg`)
    }
  } else if (library === 'octicons') {
    for (const v of variants) {
      add(`https://api.iconify.design/octicon/${v}.svg`)
    }
  } else if (library === 'ant-design-icons') {
    for (const v of variants) {
      add(`https://api.iconify.design/ant-design/${v}.svg`)
      add(`https://api.iconify.design/ant-design/${v}-outlined.svg`)
      add(`https://api.iconify.design/ant-design/${v}-filled.svg`)
    }
  } else {
    const prefix = library.replace(/-icons?$/, '').replace(/_/g, '-')
    for (const v of variants) {
      add(`https://api.iconify.design/${prefix}/${v}.svg`)
    }
  }

  return Array.from(candidates)
}

async function fetchAndCacheUpstream(library: string, name: string): Promise<string> {
  const candidates = getUpstreamCandidateUrls(library, name)
  for (const url of candidates) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'IconSearch-Server/1.0' },
        signal: AbortSignal.timeout(5000),
      })
      if (!response.ok) continue
      const text = await response.text()
      const cleanSvg = sanitizeSvg(text)
      if (!cleanSvg) continue

      try {
        const libDir = path.join(CACHE_DIR, library)
        if (!existsSync(libDir)) {
          mkdirSync(libDir, { recursive: true })
        }
        const cachePath = path.join(libDir, `${name}.svg`)
        writeFileSync(cachePath, cleanSvg, 'utf8')
      } catch {
        // Disk write failed (e.g. read-only serverless filesystem), safely ignore
      }

      return cleanSvg
    } catch {
      // Continue to next candidate
    }
  }

  return ''
}


export function OPTIONS() {
  return publicOptions()
}

export async function GET(
  request: Request,
  context: { params: Promise<{ library: string; name: string }> }
) {
  // Validate route parameters
  const { library, name: rawName } = await context.params
  const name = normalizeName(rawName)

  if (!isSafeSegment(library) || !isSafeSegment(name)) {
    return publicJson({ error: 'Invalid icon path parameters.' }, { status: 400 })
  }


  // 3. Resolve from local package / public directory
  const localFile = findLocalSvgFile(library, name)
  if (localFile) {
    const rawContent = readFileSync(localFile, 'utf8')
    return new NextResponse(sanitizeSvg(rawContent), { status: 200, headers: SVG_HEADERS })
  }

  // 4. Resolve from server disk cache
  const cachePath = path.join(CACHE_DIR, library, `${name}.svg`)
  if (existsSync(cachePath)) {
    const cachedContent = readFileSync(cachePath, 'utf8')
    return new NextResponse(cachedContent, { status: 200, headers: SVG_HEADERS })
  }

  // 5. Upstream server-side fetch & cache
  const fetchedContent = await fetchAndCacheUpstream(library, name)
  if (fetchedContent) {
    return new NextResponse(fetchedContent, { status: 200, headers: SVG_HEADERS })
  }

  return publicJson({ error: 'Icon SVG not found.' }, { status: 404 })
}
