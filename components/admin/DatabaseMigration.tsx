'use client'

import { useState } from 'react'
import { Database, Loader2 } from 'lucide-react'

export function DatabaseMigration() {
  const [migrating, setMigrating] = useState(false)
  const [message, setMessage] = useState('')

  const runMigrations = async () => {
    setMigrating(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/migrate', { method: 'POST' })
      const data = await response.json()
      
      if (data.success) {
        setMessage('✅ ' + data.message)
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        setMessage('❌ خطا: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Migration error:', error)
      setMessage('❌ خطا در اجرای مایگریشن')
    } finally {
      setMigrating(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
      <button
        onClick={runMigrations}
        disabled={migrating}
        className="button button-primary flex items-center gap-2"
      >
        {migrating ? (
          <Loader2 className="animate-spin" style={{ width: 18 }} />
        ) : (
          <Database style={{ width: 18 }} />
        )}
        {migrating ? 'در حال به‌روزرسانی...' : 'به‌روزرسانی پایگاه داده'}
      </button>

      {message && (
        <span style={{ fontWeight: 600, fontSize: '.95rem' }}>
          {message}
        </span>
      )}
    </div>
  )
}
