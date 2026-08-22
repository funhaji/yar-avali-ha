'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import ContentFilter from './ContentFilter'

type FilterOption = 'all' | 'free' | 'premium'

type Props = {
  byGrade: Record<string, any[]>
  hasSubscription: boolean
  initialQuery?: string
  grades: string[]
  gradeNames: Record<string, string>
}

export function CurriculumContent({ byGrade, hasSubscription, initialQuery, grades, gradeNames }: Props) {
  const [searchQuery, setSearchQuery] = useState(initialQuery || '')
  const [tierFilter, setTierFilter] = useState<FilterOption>('all')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/curriculum?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/curriculum')
    }
  }

  // Filter content based on tier
  const filterContentByTier = (content: any[]) => {
    if (tierFilter === 'all') return content
    if (tierFilter === 'free') return content.filter((item: any) => item.tier_requirement === 'free')
    if (tierFilter === 'premium') return content.filter((item: any) => item.tier_requirement !== 'free')
    return content
  }

  return (
    <>
      {/* Search Bar */}
      <div className="mb-8 max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی درس‌ها، موضوع یا دسته‌بندی..."
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
                router.push('/curriculum')
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 text-sm"
            >
              پاک کردن
            </button>
          )}
        </form>
        {initialQuery && (
          <p className="text-sm text-gray-600 mt-2 text-center">
            نتایج جستجو برای: <strong>{initialQuery}</strong>
          </p>
        )}
      </div>

      {/* Content Filter */}
      <ContentFilter 
        onFilterChange={setTierFilter}
        currentFilter={tierFilter}
      />

      {!hasSubscription && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-6 rounded-xl mb-8">
          <h2 className="text-xl font-bold mb-2">
            🎁 با اشتراک ویژه به همه دسترسی داشته باشید
          </h2>
          <p className="mb-4">
            فقط محتوای رایگان را می‌بینید. با خرید اشتراک به تمام درس‌ها دسترسی پیدا کنید
          </p>
          <Link href="/subscription" className="inline-block bg-white text-orange-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100">
            خرید اشتراک
          </Link>
        </div>
      )}

      {/* Content by Grade */}
      {grades.map(grade => (
        <section key={grade} className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="bg-pink-400 text-white w-12 h-12 rounded-full flex items-center justify-center">
              {grade.split('-')[1]}
            </span>
            {gradeNames[grade]} - درس‌های ویدیویی
          </h2>
          
          {byGrade[grade] && byGrade[grade].length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {filterContentByTier(byGrade[grade]).map((item: any) => {
                const isLocked = item.tier_requirement !== 'free' && !hasSubscription
                
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                  >
                    <div className="relative" style={{ aspectRatio: '2/3' }}>
                      <img
                        src={item.thumbnail_url || '/placeholder.jpg'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      {isLocked && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                          <div className="text-white text-center">
                            <div className="text-2xl mb-1">🔒</div>
                            <div className="text-xs">نیاز به اشتراک</div>
                          </div>
                        </div>
                      )}
                      {item.tier_requirement === 'free' && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                          رایگان
                        </div>
                      )}
                    </div>
                    
                    <div className="p-2.5 flex flex-col flex-1">
                      <div className="flex items-center gap-1 mb-1 flex-wrap">
                        {item.category && (
                          <span className="bg-teal-100 text-teal-700 text-xs px-1.5 py-0.5 rounded">
                            {item.category}
                          </span>
                        )}
                        {item.content_type === 'reading' && (
                          <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded">
                            روان‌خوانی
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-bold text-gray-800 mb-1 line-clamp-2 text-xs">
                        {item.title}
                      </h3>
                      
                      <p className="text-xs text-gray-600 mb-2 line-clamp-1 flex-1">
                        {item.description}
                      </p>
                      
                      {isLocked ? (
                        <Link
                          href="/subscription"
                          className="block w-full text-center py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-xs font-medium transition-colors mt-auto"
                        >
                          خرید اشتراک
                        </Link>
                      ) : (
                        <Link
                          href={`/watch/${item.id}`}
                          className="block w-full text-center py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-xs font-medium transition-colors mt-auto"
                        >
                          مشاهده
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {initialQuery ? 'نتیجه‌ای برای این جستجو یافت نشد' : 'محتوایی برای این پایه موجود نیست'}
            </div>
          )}
        </section>
      ))}

      {initialQuery && Object.values(byGrade).every(arr => arr.length === 0) && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">نتیجه‌ای یافت نشد</h3>
          <p className="text-gray-600 mb-6">
            برای "<strong>{initialQuery}</strong>" محتوایی پیدا نشد. کلمات دیگری را امتحان کنید.
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              router.push('/curriculum')
            }}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700"
          >
            مشاهده همه محتوا
          </button>
        </div>
      )}
    </>
  )
}
