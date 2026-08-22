'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'

interface SecurePDFViewerCanvasProps {
  pdfUrl: string
  title: string
}

export default function SecurePDFViewerCanvas({ pdfUrl, title }: SecurePDFViewerCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [scale, setScale] = useState(1.5)

  // Load PDF.js library
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

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

  // Load PDF document
  useEffect(() => {
    if (!pdfUrl || typeof window === 'undefined') {
      if (!pdfUrl) {
        setError('لینک فایل PDF موجود نیست. لطفاً با پشتیبانی تماس بگیرید.')
        setLoading(false)
      }
      return
    }

    const loadPDF = async () => {
      try {
        // Wait for PDF.js to load
        let attempts = 0
        while (!(window as any).pdfjsLib && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100))
          attempts++
        }

        if (!(window as any).pdfjsLib) {
          throw new Error('PDF.js failed to load')
        }

        const pdfjsLib = (window as any).pdfjsLib
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

        // Process URL for better compatibility
        let processedUrl = pdfUrl
        
        // Handle Google Drive URLs
        if (pdfUrl.includes('drive.google.com')) {
          let fileId = ''
          if (pdfUrl.includes('/file/d/')) {
            fileId = pdfUrl.split('/file/d/')[1]?.split('/')[0]
          } else if (pdfUrl.includes('id=')) {
            fileId = pdfUrl.split('id=')[1]?.split('&')[0]
          }
          if (fileId) {
            processedUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
          }
        }

        const loadingTask = pdfjsLib.getDocument(processedUrl)
        const pdf = await loadingTask.promise
        
        setPdfDoc(pdf)
        setTotalPages(pdf.numPages)
        setLoading(false)
      } catch (err) {
        console.error('Error loading PDF:', err)
        setError('خطا در بارگذاری PDF. لطفاً لینک فایل را بررسی کنید یا با پشتیبانی تماس بگیرید.')
        setLoading(false)
      }
    }

    loadPDF()
  }, [pdfUrl])

  // Render current page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage)
        const canvas = canvasRef.current!
        const context = canvas.getContext('2d')!

        const viewport = page.getViewport({ scale })
        canvas.height = viewport.height
        canvas.width = viewport.width

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        }

        await page.render(renderContext).promise
      } catch (err) {
        console.error('Error rendering page:', err)
      }
    }

    renderPage()
  }, [pdfDoc, currentPage, scale])

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--ink)',
        borderRadius: '0',
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
              border: '4px solid #0d9488',
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
      {!loading && !error && (
        <div style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--ink)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 5,
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ color: 'var(--paper)', fontWeight: 800 }}>{title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              style={{
                background: currentPage <= 1 ? 'rgba(255,255,255,0.1)' : 'var(--teal)',
                color: currentPage <= 1 ? 'rgba(255,255,255,0.5)' : 'var(--paper)',
                border: 'none',
                borderRadius: '999px',
                padding: '0.5rem 1.25rem',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 700,
                transition: 'all 0.2s ease'
              }}
            >
              <ChevronRight style={{ width: 18, height: 18 }} />
              صفحه قبل
            </button>
            <span style={{ color: 'var(--paper)', fontSize: '0.95rem', fontWeight: 600 }}>
              {currentPage} از {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage >= totalPages}
              style={{
                background: currentPage >= totalPages ? 'rgba(255,255,255,0.1)' : 'var(--teal)',
                color: currentPage >= totalPages ? 'rgba(255,255,255,0.5)' : 'var(--paper)',
                border: 'none',
                borderRadius: '999px',
                padding: '0.5rem 1.25rem',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 700,
                transition: 'all 0.2s ease'
              }}
            >
              صفحه بعد
              <ChevronLeft style={{ width: 18, height: 18 }} />
            </button>
          </div>
        </div>
      )}

      {/* Canvas for PDF rendering */}
      {!loading && !error && (
        <div style={{
          width: '100%',
          flex: 1,
          padding: '1rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          backgroundColor: 'var(--ink-soft)',
          overflow: 'auto',
          minHeight: '60vh'
        }}>
          <canvas
            ref={canvasRef}
            style={{
              maxWidth: '100%',
              height: 'auto',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              borderRadius: '8px',
              userSelect: 'none',
              WebkitUserSelect: 'none'
            }}
          />
        </div>
      )}

      {/* Protection watermark */}
      {!loading && !error && (
        <div style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: '#fff',
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          fontSize: '0.875rem',
          pointerEvents: 'none',
          zIndex: 5
        }}>
          محافظت شده - کپی برداری ممنوع
        </div>
      )}
    </div>
  )
}
