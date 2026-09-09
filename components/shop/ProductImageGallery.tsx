'use client'

import { useState } from 'react'
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

  // Deduplicate and filter out empty urls
  const validImages = Array.from(new Set(images.filter(Boolean)))
  const total = validImages.length
  const currentImage = validImages[selectedIndex] || validImages[0]

  const nextImage = () => {
    if (total <= 1) return
    setSelectedIndex((prev) => (prev + 1) % total)
  }

  const prevImage = () => {
    if (total <= 1) return
    setSelectedIndex((prev) => (prev - 1 + total) % total)
  }

  // Swipe handlers for mobile
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
      // Swipe left -> next
      nextImage()
    } else if (distance < -minSwipeDistance) {
      // Swipe right -> prev
      prevImage()
    }
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
        {currentImage ? (
          <img
            key={currentImage}
            src={currentImage}
            alt={title}
            className="w-full h-full object-contain p-2 sm:p-4 transition-all duration-300 cursor-zoom-in"
            onClick={() => setLightboxOpen(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-soft opacity-30">
            <ImageIcon className="w-24 h-24" />
          </div>
        )}

        {/* Digital Badge */}
        {isDigital && (
          <div className="absolute top-4 right-4 badge bg-teal text-paper shadow-md scale-in z-10">
            محصول دیجیتال
          </div>
        )}

        {/* Counter Badge (matching example image style) */}
        {total > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/65 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg z-10 pointer-events-none">
            <span className="text-sm">📷</span>
            <span dir="ltr">{selectedIndex + 1} / {total}</span>
          </div>
        )}

        {/* Zoom button */}
        {currentImage && (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute top-4 left-4 w-9 h-9 rounded-xl bg-paper/80 backdrop-blur-md border border-line-soft text-ink-soft hover:text-teal hover:bg-paper flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
            aria-label="بزرگنمایی تصویر"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}

        {/* Slider Controls (Previous / Next buttons) */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-paper/90 backdrop-blur-md border border-line-soft text-ink hover:bg-teal hover:text-white flex items-center justify-center shadow-md transition-all z-10 opacity-70 group-hover:opacity-100 hover:scale-105 active:scale-95"
              aria-label="عکس بعدی"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-paper/90 backdrop-blur-md border border-line-soft text-ink hover:bg-teal hover:text-white flex items-center justify-center shadow-md transition-all z-10 opacity-70 group-hover:opacity-100 hover:scale-105 active:scale-95"
              aria-label="عکس قبلی"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Picture Selector Under the Picture */}
      {total > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 px-1 hide-scrollbar">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-paper p-1.5 cursor-pointer ${
                selectedIndex === idx
                  ? 'border-teal ring-4 ring-teal/20 shadow-md scale-105 opacity-100'
                  : 'border-line-soft hover:border-teal/40 opacity-60 hover:opacity-100'
              }`}
              aria-label={`انتخاب تصویر ${idx + 1}`}
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-contain rounded-xl"
              />
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
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 left-6 text-white/80 hover:text-white bg-white/10 p-2.5 rounded-full z-50 transition-colors"
            aria-label="بستن"
          >
            <X className="w-6 h-6" />
          </button>

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
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all"
                  aria-label="عکس بعدی"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all"
                  aria-label="عکس قبلی"
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
