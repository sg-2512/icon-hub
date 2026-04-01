import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export type BlogPost = {
  slug: string
  title: string
  description: string
  date: string
  author: string
  category: string
  tags: string[]
  featured: boolean
}

export function getAllPosts(): BlogPost[] {
  const blogDir = path.join(process.cwd(), 'content/blog')
  
  if (!fs.existsSync(blogDir)) return []
  
  const files = fs.readdirSync(blogDir)
  
  const posts = files
    .filter(f => f.endsWith('.md'))
    .map(filename => {
      const slug = filename.replace('.md', '')
      const filePath = path.join(blogDir, filename)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data } = matter(fileContent)
      
      return {
        slug,
        title: data.title || '',
        description: data.description || '',
        date: data.date || '',
        author: data.author || 'IconHub Team',
        category: data.category || 'General',
        tags: data.tags || [],
        featured: data.featured || false,
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return posts
}

export function getPostBySlug(slug: string) {
  const filePath = path.join(process.cwd(), 'content/blog', `${slug}.md`)
  if (!fs.existsSync(filePath)) return null
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(fileContent)
  return {
    slug,
    title: data.title || '',
    description: data.description || '',
    date: data.date || '',
    author: data.author || 'IconHub Team',
    category: data.category || 'General',
    tags: data.tags || [],
    featured: data.featured || false,
    content,
  }
}