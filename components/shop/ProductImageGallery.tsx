'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronRight, ChevronLeft, Image as ImageIcon, Maximize2, X } from 'lucide-react'

type Props = {
  images: string[]
  title: string
  isDigital?: boolean
}

export function ProductImageGallery({ images = [], title, isDigital }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({})

  // Deduplicate and filter out empty urls
  const validImages = Array.from(new Set(images.map(s => s?.trim()).filter(Boolean) as string[]))
  const total = validImages.length
  const currentImage = validImages[selectedIndex] || validImages[0]

  const thumbnailsRef = useRef<HTMLDivElement>(null)
  const thumbButtonRefs = useRef<(HTMLButtonElement | null)[]>([])

  const nextImage = useCallback(() => {
    if (total <= 1) return
    setSelectedIndex((prev) => (prev + 1) % total)
  }, [total])

  const prevImage = useCallback(() => {
    if (total <= 1) return
    setSelectedIndex((prev) => (prev - 1 + total) % total)
  }, [total])

  // Scroll active thumbnail into view when selectedIndex changes
  useEffect(() => {
    if (thumbButtonRefs.current[selectedIndex]) {
      thumbButtonRefs.current[selectedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [selectedIndex])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false)
      } else if (e.key === 'ArrowLeft') {
        // In Persian / standard, Left goes next or prev
        nextImage()
      } else if (e.key === 'ArrowRight') {
        prevImage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextImage, prevImage])

  // Mobile swipe gestures
  const minSwipeDistance = 40
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    if (distance > minSwipeDistance) {
      // Swiped left
      nextImage()
    } else if (distance < -minSwipeDistance) {
      // Swiped right
      prevImage()
    }
    setTouchStart(null)
    setTouchEnd(null)
  }

  const handleImageError = (url: string) => {
    setImageErrorMap(prev => ({ ...prev, [url]: true }))
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Main Image Viewport */}
      <div 
        className="aspect-square bg-paper border border-line-soft rounded-2xl overflow-hidden relative shadow-sm group select-none flex items-center justify-center"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {currentImage && !imageErrorMap[currentImage] ? (
          <img
            key={currentImage}
            src={currentImage}
            alt={title}
            onError={() => handleImageError(currentImage)}
            className="w-full h-full object-contain p-2 sm:p-4 transition-all duration-300 cursor-zoom-in"
            onClick={() => setLightboxOpen(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-ink-soft opacity-40 gap-2">
            <ImageIcon className="w-20 h-20" />
            <span className="text-xs">تصویر در دسترس نیست</span>
          </div>
        )}

        {/* Digital Badge */}
        {isDigital && (
          <div className="absolute top-4 right-4 badge bg-teal text-paper shadow-md scale-in z-10 font-bold">
            محصول دیجیتال
          </div>
        )}

        {/* Counter Badge */}
        {total > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg z-10 pointer-events-none">
            <span className="text-sm">📷</span>
            <span dir="ltr">{selectedIndex + 1} / {total}</span>
          </div>
        )}

        {/* Zoom button */}
        {currentImage && !imageErrorMap[currentImage] && (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-paper/90 backdrop-blur-md border border-line-soft text-ink hover:text-teal hover:bg-paper flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10 cursor-pointer"
            aria-label="بزرگنمایی تصویر"
            title="بزرگنمایی"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}

        {/* Slider Controls (Next / Prev buttons) */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-paper/90 backdrop-blur-md border border-line-soft text-ink hover:bg-teal hover:text-white flex items-center justify-center shadow-md transition-all z-10 opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="عکس بعدی"
              title="عکس بعدی"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-paper/90 backdrop-blur-md border border-line-soft text-ink hover:bg-teal hover:text-white flex items-center justify-center shadow-md transition-all z-10 opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="عکس قبلی"
              title="عکس قبلی"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Picture Selector Under the Picture */}
      {total > 1 && (
        <div 
          ref={thumbnailsRef}
          className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 px-1 custom-scrollbar"
        >
          {validImages.map((img, idx) => (
            <button
              key={idx}
              ref={(el) => { thumbButtonRefs.current[idx] = el }}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-paper p-1.5 cursor-pointer ${
                selectedIndex === idx
                  ? 'border-teal ring-4 ring-teal/20 shadow-md scale-105 opacity-100'
                  : 'border-line-soft hover:border-teal/50 opacity-60 hover:opacity-100'
              }`}
              aria-label={`انتخاب تصویر ${idx + 1}`}
            >
              {!imageErrorMap[img] ? (
                <img
                  src={img}
                  alt=""
                  onError={() => handleImageError(img)}
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-cream/50 rounded-xl text-ink-soft">
                  <ImageIcon className="w-6 h-6 opacity-40" />
                </div>
              )}
              {selectedIndex === idx && (
                <div className="absolute inset-0 bg-teal/10 rounded-xl pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox / Fullscreen Modal */}
      {lightboxOpen && currentImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Header row in lightbox */}
          <div className="absolute top-5 inset-x-5 flex items-center justify-between z-50 pointer-events-none">
            {total > 1 && (
              <div className="bg-white/15 backdrop-blur-md text-white text-sm font-bold px-3.5 py-1.5 rounded-full flex items-center gap-2">
                <span>📷</span>
                <span dir="ltr">{selectedIndex + 1} / {total}</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors cursor-pointer pointer-events-auto ml-auto"
              aria-label="بستن"
              title="بستن (Esc)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div 
            className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImage}
              alt={title}
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />

            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
                  aria-label="عکس بعدی"
                  title="عکس بعدی (فلش راست)"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
                  aria-label="عکس قبلی"
                  title="عکس قبلی (فلش چپ)"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
