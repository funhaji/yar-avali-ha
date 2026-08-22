'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertCircle } from 'lucide-react'

interface SecurePDFViewerProps {
  pdfUrl: string
  title: string
}

export default function SecurePDFViewer({ pdfUrl, title }: SecurePDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Disable right-click, screenshots, printing, and dev tools
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    const preventKeyboardShortcuts = (e: KeyboardEvent) => {
      // Prevent Print (Ctrl+P, Cmd+P)
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        return false
      }
      // Prevent Save (Ctrl+S, Cmd+S)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        return false
      }
      // Prevent Screenshot shortcuts
      if (
        e.key === 'PrintScreen' ||
        ((e.metaKey || e.ctrlKey) && e.shiftKey && ['3', '4', '5'].includes(e.key))
      ) {
        e.preventDefault()
        return false
      }
      // Prevent Dev Tools
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c'))
      ) {
        e.preventDefault()
        return false
      }
    }

    const preventSelectAndCopy = (e: Event) => {
      e.preventDefault()
      return false
    }

    document.addEventListener('contextmenu', preventContextMenu)
    document.addEventListener('keydown', preventKeyboardShortcuts)
    document.addEventListener('copy', preventSelectAndCopy)
    document.addEventListener('cut', preventSelectAndCopy)

    if (containerRef.current) {
      containerRef.current.style.userSelect = 'none'
      containerRef.current.style.webkitUserSelect = 'none'
    }

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu)
      document.removeEventListener('keydown', preventKeyboardShortcuts)
      document.removeEventListener('copy', preventSelectAndCopy)
      document.removeEventListener('cut', preventSelectAndCopy)
    }
  }, [])

  // Handle loading timeout
  useEffect(() => {
    if (!pdfUrl) {
      setError('لینک فایل PDF موجود نیست. لطفاً با پشتیبانی تماس بگیرید.')
      setLoading(false)
      return
    }

    // Set a timeout for loading
    const loadTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false)
        // Don't set error, just hide loading - the PDF might still load
      }
    }, 8000) // 8 seconds timeout

    return () => clearTimeout(loadTimeout)
  }, [pdfUrl, loading])

  // Process PDF URL based on storage provider
  const getViewerUrl = () => {
    if (!pdfUrl) return ''
    
    // If it's a Google Drive URL, use the preview format
    if (pdfUrl.includes('drive.google.com')) {
      // Extract file ID from various Google Drive URL formats
      let fileId = ''
      
      if (pdfUrl.includes('/file/d/')) {
        fileId = pdfUrl.split('/file/d/')[1]?.split('/')[0]
      } else if (pdfUrl.includes('id=')) {
        fileId = pdfUrl.split('id=')[1]?.split('&')[0]
      }
      
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`
      }
    }
    
    // For direct URLs, use as-is
    return pdfUrl
  }

  const viewerUrl = getViewerUrl()

  return (
    <div 
      ref={containerRef}
      className="secure-pdf-viewer"
      style={{
        position: 'relative',
        width: '100%',
        height: '80vh',
        backgroundColor: '#2a2a2a',
        borderRadius: '12px',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      {loading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
          color: '#fff',
          zIndex: 10
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="animate-spin" style={{
              width: '4rem',
              height: '4rem',
              border: '4px solid #9333ea',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              margin: '0 auto 1rem'
            }}></div>
            <p style={{ fontSize: '1.125rem' }}>در حال بارگذاری سند...</p>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
          color: '#fff',
          zIndex: 10
        }}>
          <div style={{ textAlign: 'center', maxWidth: '32rem', padding: '2rem' }}>
            <AlertCircle style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', color: '#ef4444' }} />
            <p style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>{error}</p>
          </div>
        </div>
      )}

      {/* PDF Controls */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 5
      }}>
        <div style={{ color: '#fff', fontWeight: 600 }}>{title}</div>
      </div>

      {/* PDF Viewer using iframe */}
      {viewerUrl && !error && (
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          paddingTop: '60px'
        }}>
          <iframe
            ref={iframeRef}
            src={viewerUrl}
            style={{
              width: '100%',
              height: 'calc(100% - 60px)',
              border: 'none',
              backgroundColor: '#2a2a2a'
            }}
            title={title}
            onLoad={() => {
              console.log('PDF loaded successfully')
              setLoading(false)
            }}
            onError={(e) => {
              console.error('PDF load error:', e)
              setError('خطا در بارگذاری سند. لطفاً دوباره تلاش کنید.')
              setLoading(false)
            }}
            allow="autoplay"
          />
        </div>
      )}

      {/* Protection watermark */}
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        right: '1rem',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: '#fff',
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        fontSize: '0.875rem',
        pointerEvents: 'none',
        zIndex: 5
      }}>
        محافظت شده - کپی برداری ممنوع
      </div>
    </div>
  )
}
