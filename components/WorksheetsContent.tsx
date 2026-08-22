'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, FileText, Download } from 'lucide-react'
import ContentFilter from './ContentFilter'

type FilterOption = 'all' | 'free' | 'premium'

type Props = {
  byGrade: Record<string, any[]>
  hasSubscription: boolean
  initialQuery?: string
  grades: string[]
  gradeNames: Record<string, string>
}

export function WorksheetsContent({ byGrade, hasSubscription, initialQuery, grades, gradeNames }: Props) {
  const [searchQuery, setSearchQuery] = useState(initialQuery || '')
  const [tierFilter, setTierFilter] = useState<FilterOption>('all')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/worksheets?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/worksheets')
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
            placeholder="جستجوی کاربرگ‌ها، موضوع یا دسته‌بندی..."
            className="w-full px-6 py-4 pr-14 text-lg border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
            style={{ direction: 'rtl' }}
          />
          <button
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600 transition-colors"
          >
            <Search className="w-6 h-6" />
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                router.push('/worksheets')
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

      {/* No worksheets at all - show admin guidance */}
      {Object.values(byGrade).every(arr => !arr || arr.length === 0) && !initialQuery && (
        <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-orange-300 mb-8">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">هنوز کاربرگی اضافه نشده</h3>
          <p className="text-gray-600 mb-4">
            برای نمایش کاربرگ‌ها، ابتدا باید از طریق پنل مدیریت فایل‌های PDF را اضافه کنید.
          </p>
          <div className="bg-orange-50 rounded-lg p-4 text-right max-w-2xl mx-auto">
            <h4 className="font-bold text-orange-800 mb-2">راهنمای افزودن کاربرگ:</h4>
            <ol className="text-sm text-gray-700 space-y-1" style={{ listStyle: 'decimal', paddingRight: '1.5rem' }}>
              <li>به پنل مدیریت محتوا بروید</li>
              <li>محتوای جدید ایجاد کنید</li>
              <li>نوع محتوا را "pdf" یا "image" انتخاب کنید</li>
              <li>لینک فایل را در فیلد "Video URL" وارد کنید (می‌توانید از Google Drive استفاده کنید)</li>
              <li>عکس کوچک، عنوان، توضیحات و پایه تحصیلی را مشخص کنید</li>
              <li>وضعیت انتشار را فعال کنید</li>
            </ol>
          </div>
        </div>
      )}



      {/* Content by Grade */}
      {grades.map(grade => (
        <section key={grade} className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="bg-orange-400 text-white w-12 h-12 rounded-full flex items-center justify-center">
              {grade.split('-')[1]}
            </span>
            {gradeNames[grade]}
          </h2>
          
          {byGrade[grade] && byGrade[grade].length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filterContentByTier(byGrade[grade]).map((item: any) => {
                const isLocked = false // All worksheets are open
                
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col border border-gray-200"
                  >
                    <div className="relative" style={{ aspectRatio: '3/4' }}>
                      {item.thumbnail_url ? (
                        <img
                          src={item.thumbnail_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center">
                          <FileText className="w-16 h-16 text-white" />
                        </div>
                      )}
                      
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        رایگان
                      </div>
                      <div className="absolute bottom-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        PDF
                      </div>
                    </div>
                    
                    <div className="p-3 flex flex-col flex-1">
                      <div className="flex items-center gap-1 mb-2 flex-wrap">
                        {item.category && (
                          <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded">
                            {item.category}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 text-sm">
                        {item.title}
                      </h3>
                      
                      {item.description && (
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2 flex-1">
                          {item.description}
                        </p>
                      )}
                      
                      <Link
                        href={`/watch/${item.id}`}
                        className="block w-full text-center py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium transition-colors mt-auto flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        مشاهده PDF
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 bg-white rounded-lg">
              {initialQuery ? 'نتیجه‌ای برای این جستجو یافت نشد' : 'فایلی برای این پایه موجود نیست'}
            </div>
          )}
        </section>
      ))}

      {initialQuery && Object.values(byGrade).every(arr => arr.length === 0) && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">نتیجه‌ای یافت نشد</h3>
          <p className="text-gray-600 mb-6">
            برای "<strong>{initialQuery}</strong>" فایلی پیدا نشد. کلمات دیگری را امتحان کنید.
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              router.push('/worksheets')
            }}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700"
          >
            مشاهده همه فایل‌ها
          </button>
        </div>
      )}
    </>
  )
}
