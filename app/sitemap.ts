export const dynamic = 'force-dynamic'
import { MetadataRoute } from 'next'
import { query } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.yaravaliha.ir'

  // Fetch all dynamic routes
  const [contentItems, storeItems, blogPosts, teachers] = await Promise.all([
    query<any>('SELECT id, updated_at FROM yar_content_items WHERE published = true'),
    query<any>('SELECT id, created_at as updated_at FROM yar_store_items WHERE is_published = true'),
    query<any>('SELECT slug, updated_at FROM yar_blog_posts WHERE published = true'),
    query<any>('SELECT id, created_at as updated_at FROM yar_teachers WHERE is_visible = true'),
  ])

  const sitemapEntries: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/books`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/entertainment`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/worksheets`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/teacher-training`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/teachers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]

  // Add Watch routes
  contentItems.forEach((item) => {
    sitemapEntries.push({
      url: `${baseUrl}/watch/${item.id}`,
      lastModified: item.updated_at || new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    })
  })

  // Add Store routes
  storeItems.forEach((item) => {
    sitemapEntries.push({
      url: `${baseUrl}/shop/${item.id}`,
      lastModified: item.updated_at || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  })

  // Add Blog routes
  blogPosts.forEach((post) => {
    sitemapEntries.push({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updated_at || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  })

  // Add Teacher routes
  teachers.forEach((teacher) => {
    sitemapEntries.push({
      url: `${baseUrl}/teachers/${teacher.id}`,
      lastModified: teacher.updated_at || new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  })

  return sitemapEntries
}
