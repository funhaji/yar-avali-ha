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
    <div className="flex flex-col gap-6">
      {/* Tab Switcher */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-2 max-w-xl">
        <button
          type="button"
          onClick={() => setActiveTab('teachers')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all ${
            activeTab === 'teachers'
              ? 'bg-teal text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>اساتید و معلمان</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('taxonomies')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all ${
            activeTab === 'taxonomies'
              ? 'bg-teal text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>پایه‌ها و دروس</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all ${
            activeTab === 'requests'
              ? 'bg-teal text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MessageSquareText className="w-4 h-4" />
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
