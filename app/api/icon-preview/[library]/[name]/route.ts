import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const SVG_HEADERS = {
  'Content-Type': 'image/svg+xml; charset=utf-8',
  'Cache-Control': 'public, max-age=31536000, immutable',
  'Access-Control-Allow-Origin': '*',
}

function normalizeName(name: string) {
  return name
    .replace(/\.svg$/i, '')
    .replace(/_/g, '-')
    .trim()
}

function isSafeSegment(value: string) {
  return /^[a-z0-9][a-z0-9._-]*$/i.test(value)
}

function resolveWithin(root: string, fileName: string) {
  const resolvedRoot = path.resolve(root)
  const resolvedFile = path.resolve(resolvedRoot, fileName)
  const rootPrefix = `${resolvedRoot}${path.sep}`.toLowerCase()
  return resolvedFile.toLowerCase().startsWith(rootPrefix) ? resolvedFile : ''
}

function findPreviewFile(library: string, name: string) {
  if (library === 'patternfly-icons') {
    const root = path.join(process.cwd(), 'node_modules', '@patternfly', 'react-icons', 'dist', 'static')
    const candidate = resolveWithin(root, `${name}.svg`)
    return candidate && existsSync(candidate) ? candidate : ''
  }

  if (library === 'bootstrap-icons') {
    const root = path.join(process.cwd(), 'node_modules', 'bootstrap-icons', 'icons')
    const candidate = resolveWithin(root, `${name}.svg`)
    return candidate && existsSync(candidate) ? candidate : ''
  }

  return ''
}

function normalizeSvgForImage(svg: string) {
  if (!/^<svg\b/i.test(svg)) return svg

  let normalized = svg
  if (!/\sxmlns=/.test(normalized)) {
    normalized = normalized.replace(/^<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"')
  }

  return normalized
    .replace(/\swidth="1em"/i, ' width="24"')
    .replace(/\sheight="1em"/i, ' height="24"')
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ library: string; name: string }> }
) {
  const { library, name: rawName } = await context.params
  const name = normalizeName(rawName)

  if (!isSafeSegment(library) || !isSafeSegment(name)) {
    return NextResponse.json({ error: 'Invalid icon preview path' }, { status: 400 })
  }

  const previewPath = findPreviewFile(library, name)
  if (!previewPath) {
    return NextResponse.json({ error: 'Icon preview not found' }, { status: 404 })
  }

  return new NextResponse(normalizeSvgForImage(readFileSync(previewPath, 'utf8')), {
    status: 200,
    headers: SVG_HEADERS,
  })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: SVG_HEADERS,
  })
}
