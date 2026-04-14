import { getPostBySlug } from '../../../../lib/blog'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params
  const post = getPostBySlug(slug)
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(post)
}