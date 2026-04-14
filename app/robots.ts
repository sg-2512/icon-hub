import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: 'https://www.iconhub.dev/sitemap.xml',
    host: 'https://www.iconhub.dev',
  }
}
