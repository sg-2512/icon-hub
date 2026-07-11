import {MetadataRoute} from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules:[
      {
        userAgent: '*',
        allow: [
          '/',
          '/api/icon-search',
          '/api/icons',
        ],
        disallow: ['/api/'],
      },
    ],
    sitemap: 'https://iconsearch.info/sitemap.xml'
  }
}
