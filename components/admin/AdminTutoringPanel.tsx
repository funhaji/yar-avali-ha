'use client'

import { useState } from 'react'
import { Users, Layers, MessageSquareText } from 'lucide-react'
import { TeacherManager } from '@/components/TeacherManager'
import { TutoringTaxonomyManager } from '@/components/admin/TutoringTaxonomyManager'
import { TutoringRequestsManager } from '@/components/admin/TutoringRequestsManager'
import { Teacher } from '@/lib/teachers'

interface AdminTutoringPanelProps {
  initialTeachers: Teacher[]
}

export function AdminTutoringPanel({ initialTeachers }: AdminTutoringPanelProps) {
  const [activeTab, setActiveTab] = useState<'teachers' | 'taxonomies' | 'requests'>('teachers')

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      {/* Master Tab Switcher */}
      <div className="bg-slate-200/90 p-1.5 sm:p-2 rounded-2xl border-2 border-slate-300 shadow-sm flex items-center gap-1.5 sm:gap-2 max-w-xl w-full overflow-x-auto scroll-smooth">
        <button
          type="button"
          onClick={() => setActiveTab('teachers')}
          className={`flex-1 min-w-[110px] sm:min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm transition-all border-2 whitespace-nowrap shrink-0 sm:shrink ${
            activeTab === 'teachers'
              ? 'bg-teal text-white border-teal-700 shadow-md font-black'
              : 'bg-white/90 text-slate-800 border-slate-300 hover:bg-white hover:border-slate-400 hover:text-slate-900 font-bold shadow-xs'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>اساتید و معلمان</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('taxonomies')}
          className={`flex-1 min-w-[100px] sm:min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm transition-all border-2 whitespace-nowrap shrink-0 sm:shrink ${
            activeTab === 'taxonomies'
              ? 'bg-teal text-white border-teal-700 shadow-md font-black'
              : 'bg-white/90 text-slate-800 border-slate-300 hover:bg-white hover:border-slate-400 hover:text-slate-900 font-bold shadow-xs'
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          <span>پایه‌ها و دروس</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`flex-1 min-w-[120px] sm:min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm transition-all border-2 whitespace-nowrap shrink-0 sm:shrink ${
            activeTab === 'requests'
              ? 'bg-teal text-white border-teal-700 shadow-md font-black'
              : 'bg-white/90 text-slate-800 border-slate-300 hover:bg-white hover:border-slate-400 hover:text-slate-900 font-bold shadow-xs'
          }`}
        >
          <MessageSquareText className="w-4 h-4 shrink-0" />
          <span>درخواست‌های تدریس</span>
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'teachers' && (
          <TeacherManager initial={initialTeachers} />
        )}
        {activeTab === 'taxonomies' && (
          <TutoringTaxonomyManager />
        )}
        {activeTab === 'requests' && (
          <TutoringRequestsManager />
        )}
      </div>
    </div>
  )
}
