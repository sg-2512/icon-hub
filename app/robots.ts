import type { MetadataRoute } from 'next'
import { SITE_URL } from '../lib/seo'

const allowPaths = [
  '/',
  '/api/svg/',
  '/api/icon-search',
  '/api/icons',
]
const disallowPaths = ['/api/', '/auth/', '/icon-search?']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: allowPaths,
        disallow: disallowPaths,
      },
      {
        userAgent: '*',
        allow: allowPaths,
        disallow: disallowPaths,
      },
    ],
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/icons/sitemap.xml`,
    ],
    host: SITE_URL,
  }
}
