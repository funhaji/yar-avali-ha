import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/dashboard/', '/api/', '/shop/checkout/'],
    },
    sitemap: 'https://yar-avali-ha.vercel.app/sitemap.xml',
  }
}
