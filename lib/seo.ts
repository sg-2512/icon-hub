import type { Metadata } from 'next'

export const SITE_NAME = 'IconSearch'
export const SITE_URL = 'https://iconsearch.info'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph-image`
export const DEFAULT_TWITTER_IMAGE = `${SITE_URL}/twitter-image`

type PageMetadataOptions = {
  title: string
  description: string
  path: `/${string}` | '/'
  type?: 'website' | 'article'
  image?: string
  imageAlt?: string
  imageWidth?: number
  imageHeight?: number
}

export function createPageMetadata({
  title,
  description,
  path,
  type = 'website',
  image = DEFAULT_OG_IMAGE,
  imageAlt = 'IconSearch — search, customize, and download open-source SVG icons',
  imageWidth = 1200,
  imageHeight = 630,
}: PageMetadataOptions): Metadata {
  const canonical = new URL(path, SITE_URL).toString()

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: 'en_US',
      type,
      images: [
        {
          url: image,
          width: imageWidth,
          height: imageHeight,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@IconSearchinfo',
      creator: '@IconSearchinfo',
      title,
      description,
      images: [image === DEFAULT_OG_IMAGE ? DEFAULT_TWITTER_IMAGE : image],
    },
  }
}
