'use client'

import { useState } from 'react'
import { Filter } from 'lucide-react'

type FilterOption = 'all' | 'free' | 'premium'

interface ContentFilterProps {
  onFilterChange: (filter: FilterOption) => void
  currentFilter?: FilterOption
}

export default function ContentFilter({ onFilterChange, currentFilter = 'all' }: ContentFilterProps) {
  const [filter, setFilter] = useState<FilterOption>(currentFilter)

  const handleFilterChange = (newFilter: FilterOption) => {
    setFilter(newFilter)
    onFilterChange(newFilter)
  }

  return (
    <div className="content-filter-bar">
      <div className="content-filter-label">
        <Filter size={18} />
        <span>نمایش:</span>
      </div>
      <div className="content-filter-buttons">
        <button
          className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterChange('all')}
        >
          همه ویدیوها
        </button>
        <button
          className={`filter-button ${filter === 'free' ? 'active' : ''}`}
          onClick={() => handleFilterChange('free')}
        >
          فقط رایگان
        </button>
        <button
          className={`filter-button ${filter === 'premium' ? 'active' : ''}`}
          onClick={() => handleFilterChange('premium')}
        >
          فقط اشتراکی
        </button>
      </div>
    </div>
  )
}
