import { MetadataRoute } from 'next'
import { icons } from '../lib/icons'
import { getAllPosts } from '../lib/blog'
import { categories } from '../data/categories'
import { useCases } from '../data/usecases'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://iconshub.netlify.app'

  // Static pages
  const staticPages = [
    { url: base, priority: 1.0, changeFrequency: 'weekly' as const },
    { url: `${base}/free-svg-icons`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${base}/react-icons`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${base}/nextjs-icons`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${base}/icon-search`, priority: 0.9, changeFrequency: 'monthly' as const },
    { url: `${base}/compare`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${base}/blog`, priority: 0.8, changeFrequency: 'daily' as const },
    { url: `${base}/contact`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${base}/privacy-policy`, priority: 0.3, changeFrequency: 'monthly' as const },
    { url: `${base}/terms`, priority: 0.3, changeFrequency: 'monthly' as const },
    { url: `${base}/vue-icons`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${base}/svelte-icons`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${base}/tailwind-icons`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${base}/typescript-icons`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${base}/stats`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${base}/best-for-you`, priority: 0.9, changeFrequency: 'monthly' as const },
  ].map(page => ({
    url: page.url,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))

  // Library pages
  const libraryPages = icons.map(icon => ({
    url: `${base}/icons/${icon.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  // Comparison pages
  const comparisonPages = []
  for (let i = 0; i < icons.length; i++) {
    for (let j = i + 1; j < icons.length; j++) {
      comparisonPages.push({
        url: `${base}/compare/${icons[i].slug}-vs-${icons[j].slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })
    }
  }

  // Blog posts
  const posts = getAllPosts()
  const blogPages = posts.map(post => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))


// Category pages
const categoryIndexPage = [{
  url: `${base}/icons/category`,
  lastModified: new Date(),
  changeFrequency: 'weekly' as const,
  priority: 0.8,
}]

const categoryPages = categories.map(cat => ({
  url: `${base}/icons/category/${cat.slug}`,
  lastModified: new Date(),
  changeFrequency: 'monthly' as const,
  priority: 0.75,
}))

const useCaseIndexPage = [{
  url: `${base}/use-cases`,
  lastModified: new Date(),
  changeFrequency: 'weekly' as const,
  priority: 0.8,
}]

const useCasePages = useCases.map(uc => ({
  url: `${base}/use-cases/${uc.slug}`,
  lastModified: new Date(),
  changeFrequency: 'monthly' as const,
  priority: 0.75,
}))

  return [
    ...staticPages,
    ...libraryPages,
    ...comparisonPages,
    ...blogPages,
    ...categoryIndexPage,
    ...categoryPages,
    ...useCaseIndexPage, 
    ...useCasePages,
  ]
}