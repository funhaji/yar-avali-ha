'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight } from 'lucide-react'
import ContentFilter from './ContentFilter'
import { getEmbedUrl } from '@/lib/video'

type FilterOption = 'all' | 'free' | 'premium'

type Props = {
  byType: Record<string, any[]>
  hasSubscription: boolean
  initialQuery?: string
  initialCategory?: string
  types: string[]
  typeNames: Record<string, string>
  categoryMedia?: Record<string, string | null>
}

export function EntertainmentContent({ byType, hasSubscription, initialQuery, initialCategory, types, typeNames, categoryMedia }: Props) {
  const CATEGORY_CARDS = [
    { id: 'لوحه نویسی', title: 'لوحه نویسی', icon: '📝', bg: categoryMedia?.ent_cat1_image ? `linear-gradient(135deg, rgba(20,184,166,0.6), rgba(15,118,110,0.8)), url(${categoryMedia.ent_cat1_image}) center/cover` : 'linear-gradient(135deg, #14b8a6, #0f766e)' },
    { id: 'نشانه های ۱/۲', title: 'نشانه های ۱/۲', icon: '🔤', bg: categoryMedia?.ent_cat2_image ? `linear-gradient(135deg, rgba(245,158,11,0.6), rgba(180,83,9,0.8)), url(${categoryMedia.ent_cat2_image}) center/cover` : 'linear-gradient(135deg, #f59e0b, #b45309)' },
    { id: 'علوم', title: 'علوم', icon: '🔬', bg: categoryMedia?.ent_cat3_image ? `linear-gradient(135deg, rgba(59,130,246,0.6), rgba(29,78,216,0.8)), url(${categoryMedia.ent_cat3_image}) center/cover` : 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }
  ]
  const [searchQuery, setSearchQuery] = useState(initialQuery || '')
  const [tierFilter, setTierFilter] = useState<FilterOption>('all')
  const [activeSubCategory, setActiveSubCategory] = useState<string>('all')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    let url = '/entertainment'
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('q', searchQuery.trim())
    if (initialCategory) params.set('c', initialCategory)
    
    if (params.toString()) {
      url += '?' + params.toString()
    }
    router.push(url)
  }

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/entertainment?c=${encodeURIComponent(categoryId)}`)
  }

  const handleBackToCategories = () => {
    setSearchQuery('')
    router.push('/entertainment')
  }

  // Filter content based on tier
  const filterContentByTier = (content: any[]) => {
    if (tierFilter === 'all') return content
    if (tierFilter === 'free') return content.filter((item: any) => item.tier_requirement === 'free')
    if (tierFilter === 'premium') return content.filter((item: any) => item.tier_requirement !== 'free')
    return content
  }

  // If no category is selected, show the 4 big cards
  if (!initialCategory && !initialQuery) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {CATEGORY_CARDS.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCategoryClick(card.id)}
            className="card card-hover p-8 relative overflow-hidden group min-h-[250px] flex flex-col justify-end text-right transition-transform hover:-translate-y-1"
            style={{ 
              background: card.bg,
              border: 'none',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)'
            }}
          >
            <div className="absolute top-6 right-6 text-5xl opacity-80 group-hover:scale-110 transition-transform duration-300">
              {card.icon}
            </div>
            <div className="relative z-10 text-white w-full">
              <span className="badge bg-white/20 text-white backdrop-blur-sm mb-3 inline-block px-3 py-1 rounded-full text-sm font-medium">بخش آموزشی</span>
              <h3 className="text-3xl font-bold mb-2 text-white drop-shadow-md">{card.title}</h3>
              <p className="text-white/90 line-clamp-2">
                مشاهده ویدیوها و محتوای مربوط به {card.title}
              </p>
            </div>
          </button>
        ))}
      </div>
    )
  }

  const categoriesToRender = initialCategory ? [initialCategory] : types

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back Button */}
      {initialCategory && (
        <button 
          onClick={handleBackToCategories}
          className="flex items-center gap-2 text-teal font-bold mb-8 transition-colors bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-line-soft shadow-sm hover:border-teal w-fit"
        >
          <ArrowRight className="w-5 h-5" />
          بازگشت به دسته‌بندی‌ها
        </button>
      )}

      {/* Category Teaser Video */}
      {initialCategory && (
        <div className="mb-12 bg-paper border border-line-soft rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-1/2 aspect-video bg-black rounded-xl overflow-hidden shadow-md relative">
            {initialCategory === 'لوحه نویسی' && categoryMedia?.ent_cat1_video ? (
              <iframe src={getEmbedUrl(categoryMedia.ent_cat1_video)} className="absolute inset-0 w-full h-full border-none" allowFullScreen allow="autoplay; fullscreen" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>
            ) : initialCategory === 'نشانه های ۱/۲' && categoryMedia?.ent_cat2_video ? (
              <iframe src={getEmbedUrl(categoryMedia.ent_cat2_video)} className="absolute inset-0 w-full h-full border-none" allowFullScreen allow="autoplay; fullscreen" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>
            ) : initialCategory === 'علوم' && categoryMedia?.ent_cat3_video ? (
              <iframe src={getEmbedUrl(categoryMedia.ent_cat3_video)} className="absolute inset-0 w-full h-full border-none" allowFullScreen allow="autoplay; fullscreen" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">
                ویدیویی برای این بخش تنظیم نشده است
              </div>
            )}
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl font-black mb-4 text-ink">محتوای آموزشی {initialCategory}</h2>
            <p className="text-lg text-ink-soft leading-relaxed">
              در این بخش می‌توانید تمامی ویدیوها و محتوای آموزشی مرتبط با {initialCategory} را مشاهده کنید. 
              این آموزش‌ها به گونه‌ای طراحی شده‌اند که یادگیری را برای دانش‌آموزان جذاب و ماندگار کنند.
            </p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-8 max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={initialCategory ? `جستجو در ${initialCategory}...` : "جستجوی انیمه، فیلم یا ژانر..."}
            className="w-full px-6 py-4 pr-14 text-lg border-2 border-gray-300 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
            style={{ direction: 'rtl' }}
          />
          <button
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
          >
            <Search className="w-6 h-6" />
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                let url = '/entertainment'
                if (initialCategory) url += `?c=${encodeURIComponent(initialCategory)}`
                router.push(url)
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 text-sm font-medium bg-gray-100 px-2 py-1 rounded"
            >
              پاک کردن
            </button>
          )}
        </form>
        {initialQuery && (
          <p className="text-sm text-gray-600 mt-3 text-center">
            نتایج جستجو برای: <strong className="text-teal-700">{initialQuery}</strong>
          </p>
        )}
      </div>

      {/* Content Filter */}
      <ContentFilter 
        onFilterChange={setTierFilter}
        currentFilter={tierFilter}
      />

      {!hasSubscription && (
        <div className="bg-gradient-to-r from-teal-500 to-emerald-400 text-white p-6 rounded-2xl mb-8 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <span className="text-2xl">🎁</span> دسترسی نامحدود به همه محتوا
            </h2>
            <p className="text-white/90">
              با تهیه اشتراک ویژه، تمام ویدیوهای آموزشی و سرگرمی برای شما باز خواهد شد.
            </p>
          </div>
          <Link href="/subscription" className="shrink-0 bg-white text-teal-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm">
            خرید اشتراک ویژه
          </Link>
        </div>
      )}

      {/* Content by Type */}
      {categoriesToRender.map(type => {
        if (!types.includes(type)) return null; // Protect against invalid categories in URL
        
        let sectionItems = byType[type] || []
        
        // Extract sub-categories (using genre) for 'نشانه های ۱/۲'
        const hasSubCategories = type === 'نشانه های ۱/۲' && initialCategory
        const subCategories = hasSubCategories 
          ? Array.from(new Set(sectionItems.map((item: any) => item.genre).filter(Boolean))) as string[]
          : []
          
        if (hasSubCategories && activeSubCategory !== 'all') {
          sectionItems = sectionItems.filter((item: any) => item.genre === activeSubCategory)
        }
        
        return (
          <section key={type} className="mb-12">
            {!initialCategory && (
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <span className="bg-teal-400 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm">
                  {type === 'لوحه نویسی' ? '📝' : type === 'نشانه های ۱/۲' ? '🔤' : type === 'علوم' ? '🔬' : '🎬'}
                </span>
                {typeNames[type]}
              </h2>
            )}
            
            {initialCategory && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <span className="bg-teal-500 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md rotate-3">
                    {type === 'لوحه نویسی' ? '📝' : type === 'نشانه های ۱/۲' ? '🔤' : type === 'علوم' ? '🔬' : '🎬'}
                  </span>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">{typeNames[type]}</h2>
                    <p className="text-gray-500 mt-1">{byType[type]?.length || 0} ویدیوی آموزشی</p>
                  </div>
                </div>
              </div>
            )}
            
            {hasSubCategories && subCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                <button
                  onClick={() => setActiveSubCategory('all')}
                  className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${activeSubCategory === 'all' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200 hover:border-teal-400'}`}
                >
                  همه موارد
                </button>
                {subCategories.map(subCat => (
                  <button
                    key={subCat}
                    onClick={() => setActiveSubCategory(subCat)}
                    className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${activeSubCategory === subCat ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200 hover:border-teal-400'}`}
                  >
                    {subCat}
                  </button>
                ))}
              </div>
            )}
            
            {sectionItems && sectionItems.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {filterContentByTier(sectionItems).map((item: any) => {
                  const isLocked = item.tier_requirement !== 'free' && !hasSubscription
                  
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
                    >
                      <div className="relative overflow-hidden" style={{ aspectRatio: '2/3' }}>
                        <img
                          src={item.thumbnail_url || '/placeholder.jpg'}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Gradient overlay at bottom for text contrast if needed */}
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent"></div>
                        
                        {isLocked && (
                          <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center transition-opacity">
                            <div className="text-white text-center transform group-hover:scale-110 transition-transform">
                              <div className="text-3xl mb-2 drop-shadow-lg">🔒</div>
                              <div className="text-sm font-medium">نیاز به اشتراک</div>
                            </div>
                          </div>
                        )}
                        {item.tier_requirement === 'free' && (
                          <div className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                            رایگان
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 flex flex-col flex-1 bg-white">
                        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                          {item.genre && (
                            <span className="bg-teal-50 text-teal-700 text-[11px] font-bold px-2 py-1 rounded-md border border-teal-100">
                              {item.genre}
                            </span>
                          )}
                          {item.age_tag && (
                            <span className="bg-pink-50 text-pink-700 text-[11px] font-bold px-2 py-1 rounded-md border border-pink-100">
                              {item.age_tag}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-bold text-gray-800 mb-1.5 line-clamp-2 text-sm leading-tight group-hover:text-teal-700 transition-colors">
                          {item.title}
                        </h3>
                        
                        <p className="text-xs text-gray-500 mb-4 line-clamp-2 flex-1 leading-relaxed">
                          {item.description}
                        </p>
                        
                        {isLocked ? (
                          <Link
                            href="/subscription"
                            className="block w-full text-center py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 hover:text-gray-900 text-sm font-bold transition-colors mt-auto"
                          >
                            خرید اشتراک
                          </Link>
                        ) : (
                          <Link
                            href={`/watch/${item.id}`}
                            className="block w-full text-center py-2 bg-teal-50 text-teal-700 border border-teal-100 rounded-lg hover:bg-teal-600 hover:text-white text-sm font-bold transition-all mt-auto shadow-sm"
                          >
                            مشاهده ویدیو
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-100 rounded-2xl text-center py-16 text-gray-500 flex flex-col items-center justify-center">
                <div className="text-5xl mb-4 opacity-50">📂</div>
                <h3 className="text-lg font-bold text-gray-700 mb-1">
                  {initialQuery ? 'نتیجه‌ای برای این جستجو یافت نشد' : 'محتوایی در این بخش موجود نیست'}
                </h3>
                <p className="text-sm text-gray-500">به زودی ویدیوهای جدیدی اضافه خواهد شد</p>
              </div>
            )}
          </section>
        )
      })}

      {initialQuery && Object.values(byType).every(arr => arr.length === 0) && (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
          <div className="text-6xl mb-4 opacity-80">🔍</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">نتیجه‌ای یافت نشد</h3>
          <p className="text-gray-500 mb-8">
            برای "<strong>{initialQuery}</strong>" محتوایی پیدا نشد. کلمات دیگری را امتحان کنید.
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              let url = '/entertainment'
              if (initialCategory) url += `?c=${encodeURIComponent(initialCategory)}`
              router.push(url)
            }}
            className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 shadow-md hover:shadow-lg transition-all"
          >
            مشاهده همه محتوا
          </button>
        </div>
      )}
    </div>
  )
}
