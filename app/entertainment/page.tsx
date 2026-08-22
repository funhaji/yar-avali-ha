import { cookies } from 'next/headers'
import Link from 'next/link'
import { query } from '@/lib/db'
import { hasActiveSubscription } from '@/lib/subscriptions'
import { validateSession } from '@/lib/auth'
import { EntertainmentContent } from '@/components/EntertainmentContent'
import { getSettings } from '@/lib/settings'
import { SiteHeader } from '@/components/SiteHeader'
import { getCachedContent, getCachedSettings } from '@/lib/cache'

async function getEntertainmentContent(userId?: string, searchQuery?: string) {
  const hasSubscription = userId ? await hasActiveSubscription(userId) : false
  
  // Get all content from cache
  const allContent = await getCachedContent()
  
  // The admin uploads 'lesson' or other video types to these categories
  let content = allContent.filter(item => item.content_type !== 'pdf' && item.content_type !== 'image')
  
  // Apply search filter if provided
  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.trim().toLowerCase()
    content = content.filter(item => 
      (item.title && item.title.toLowerCase().includes(query)) ||
      (item.series_title && item.series_title.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.genre && item.genre.toLowerCase().includes(query))
    )
  }
  
  // Group by specific categories
  const byCategory: Record<string, any[]> = {
    'لوحه نویسی': [],
    'نشانه های ۱/۲': [],
    'علوم': [],
    'سایر': []
  }
  
  content.forEach((item: any) => {
    const cat = item.category?.trim() || ''
    if (cat === 'لوحه نویسی') {
      byCategory['لوحه نویسی'].push(item)
    } else if (cat === 'نشانه های 1/2' || cat === 'نشانه های ۱/۲' || cat.includes('نشانه')) {
      byCategory['نشانه های ۱/۲'].push(item)
    } else if (cat === 'علوم') {
      byCategory['علوم'].push(item)
    } else {
      byCategory['سایر'].push(item)
    }
  })
  
  return { byCategory, hasSubscription }
}

export default async function EntertainmentPage({ searchParams }: { searchParams: Promise<{ q?: string, c?: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value
  
  let user = null;
  if (token) {
    user = await validateSession(token)
  }
  
  const params = await searchParams
  const searchQuery = params.q
  const categoryParam = params.c
  
  const [{ byCategory, hasSubscription }, settings] = await Promise.all([
    getEntertainmentContent(user?.id, searchQuery),
    getCachedSettings(['site_logo_url', 'site_name', 'ent_cat1_image', 'ent_cat2_image', 'ent_cat3_image', 'ent_cat4_image']),
  ])
  
  const siteName = settings.site_name || 'یار اولی‌ها'
  
  const types = ['لوحه نویسی', 'نشانه های ۱/۲', 'علوم', 'سایر']
  const typeNames: Record<string, string> = {
    'لوحه نویسی': 'لوحه نویسی',
    'نشانه های ۱/۲': 'نشانه های ۱/۲',
    'علوم': 'علوم',
    'سایر': 'سایر'
  }
  
  const categoryImages = {
    ent_cat1_image: settings.ent_cat1_image,
    ent_cat2_image: settings.ent_cat2_image,
    ent_cat3_image: settings.ent_cat3_image,
    ent_cat4_image: settings.ent_cat4_image,
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <SiteHeader userName={user?.name} isAdmin={user?.role === 'admin'} siteName={siteName} siteLogo={settings.site_logo_url || undefined} />

      <main className="container mx-auto px-4 py-8">
        <EntertainmentContent 
          byType={byCategory}
          hasSubscription={hasSubscription}
          initialQuery={searchQuery}
          initialCategory={categoryParam}
          types={types}
          typeNames={typeNames}
          categoryImages={categoryImages as Record<string, string | null>}
        />
      </main>
    </div>
  )
}
