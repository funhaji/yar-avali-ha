'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { AlertCircle, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from 'lucide-react'

interface SecurePDFViewerCanvasProps {
  pdfUrl: string
  title: string
}

export default function SecurePDFViewerCanvas({ pdfUrl, title }: SecurePDFViewerCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [scale, setScale] = useState(1.5)
  const [rendering, setRendering] = useState(false)
  const renderTaskRef = useRef<any>(null)

  // Load PDF.js library
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  // Disable right-click, screenshots, printing, and dev tools
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    const preventKeyboardShortcuts = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') { e.preventDefault(); return false }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); return false }
      if (e.key === 'PrintScreen' || ((e.metaKey || e.ctrlKey) && e.shiftKey && ['3', '4', '5'].includes(e.key))) {
        e.preventDefault(); return false
      }
      if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key))) {
        e.preventDefault(); return false
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

        const loadingTask = pdfjsLib.getDocument({
          url: processedUrl,
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/',
        })
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
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || rendering) return

    setRendering(true)
    
    // Cancel any previous render task
    if (renderTaskRef.current) {
      try { renderTaskRef.current.cancel() } catch {}
    }

    try {
      const page = await pdfDoc.getPage(currentPage)
      const canvas = canvasRef.current!
      const context = canvas.getContext('2d')!

      const viewport = page.getViewport({ scale })
      
      // Use device pixel ratio for sharper rendering
      const outputScale = window.devicePixelRatio || 1
      canvas.width = Math.floor(viewport.width * outputScale)
      canvas.height = Math.floor(viewport.height * outputScale)
      canvas.style.width = Math.floor(viewport.width) + 'px'
      canvas.style.height = Math.floor(viewport.height) + 'px'

      const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        transform: transform,
      }

      renderTaskRef.current = page.render(renderContext)
      await renderTaskRef.current.promise
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('Error rendering page:', err)
      }
    } finally {
      setRendering(false)
    }
  }, [pdfDoc, currentPage, scale, rendering])

  useEffect(() => {
    renderPage()
  }, [pdfDoc, currentPage, scale])

  // Scroll to top when page changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0
    }
  }, [currentPage])

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3))
  }

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5))
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        goToNextPage()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        goToPrevPage()
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        zoomIn()
      } else if (e.key === '-') {
        e.preventDefault()
        zoomOut()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPage, totalPages])

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex flex-col bg-ink overflow-hidden select-none"
      style={{ WebkitUserSelect: 'none' }}
    >
      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink z-10">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-teal animate-spin mx-auto mb-4" />
            <p className="text-paper text-lg font-medium">در حال بارگذاری سند...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink z-10">
          <div className="text-center max-w-md p-8">
            <AlertCircle className="w-12 h-12 text-berry mx-auto mb-4" />
            <p className="text-paper text-lg mb-4">{error}</p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      {!loading && !error && (
        <div className="sticky top-0 z-20 bg-ink/95 backdrop-blur-md border-b border-white/10 px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Title */}
            <h3 className="text-paper font-bold text-sm truncate max-w-[200px]">{title}</h3>

            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevPage}
                disabled={currentPage <= 1}
                className={`p-2 rounded-lg transition-all ${currentPage <= 1 ? 'text-white/30 cursor-not-allowed' : 'text-paper hover:bg-white/10 active:bg-white/20'}`}
                aria-label="صفحه قبل"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5">
                <span className="text-paper text-sm font-bold">{currentPage}</span>
                <span className="text-white/40 text-sm">از</span>
                <span className="text-paper text-sm font-bold">{totalPages}</span>
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage >= totalPages}
                className={`p-2 rounded-lg transition-all ${currentPage >= totalPages ? 'text-white/30 cursor-not-allowed' : 'text-paper hover:bg-white/10 active:bg-white/20'}`}
                aria-label="صفحه بعد"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={zoomOut}
                disabled={scale <= 0.5}
                className={`p-2 rounded-lg transition-all ${scale <= 0.5 ? 'text-white/30 cursor-not-allowed' : 'text-paper hover:bg-white/10 active:bg-white/20'}`}
                aria-label="کوچکتر"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-white/60 text-xs font-bold min-w-[40px] text-center">{Math.round(scale * 100)}%</span>
              <button
                onClick={zoomIn}
                disabled={scale >= 3}
                className={`p-2 rounded-lg transition-all ${scale >= 3 ? 'text-white/30 cursor-not-allowed' : 'text-paper hover:bg-white/10 active:bg-white/20'}`}
                aria-label="بزرگتر"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Canvas Area */}
      {!loading && !error && (
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-auto bg-[#525659]"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex justify-center p-4 md:p-8 min-h-full">
            <canvas
              ref={canvasRef}
              className="shadow-2xl select-none"
              style={{
                maxWidth: scale <= 1 ? '100%' : undefined,
                backgroundColor: '#fff',
                userSelect: 'none',
                WebkitUserSelect: 'none',
              }}
            />
          </div>
        </div>
      )}

      {/* Protection watermark */}
      {!loading && !error && (
        <div className="fixed bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white/80 px-3 py-1.5 rounded-lg text-xs font-medium pointer-events-none z-30 border border-white/10">
          محافظت شده - کپی برداری ممنوع
        </div>
      )}
    </div>
  )
}
