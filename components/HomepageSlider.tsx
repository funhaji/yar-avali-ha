'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Slide = {
  id: string
  image_url: string
  title?: string
  link_url?: string
  display_order: number
}

type Props = {
  slides: Slide[]
}

export function HomepageSlider({ slides }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [prevIndex, setPrevIndex] = useState<number | null>(null)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const DURATION = 5000

  const startProgress = () => {
    setProgress(0)
    if (progressRef.current) clearInterval(progressRef.current)
    const step = 100 / (DURATION / 50)
    progressRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(progressRef.current!); return 100 }
        return p + step
      })
    }, 50)
  }

  const advance = (nextFn: (prev: number) => number) => {
    setCurrentIndex(prev => {
      const next = nextFn(prev)
      setPrevIndex(prev)
      return next
    })
    startProgress()
  }

  useEffect(() => {
    startProgress()
    return () => {
      if (progressRef.current) clearInterval(progressRef.current)
    }
  }, [])

  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return
    intervalRef.current = setInterval(() => {
      advance(prev => (prev + 1) % slides.length)
    }, DURATION)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isAutoPlaying, slides.length, currentIndex])

  const goToSlide = (index: number) => {
    setPrevIndex(currentIndex)
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    startProgress()
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToPrevious = () => {
    advance(prev => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToNext = () => {
    advance(prev => (prev + 1) % slides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  if (!slides || slides.length === 0) return null

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-900 select-none"
      style={{ aspectRatio: '16 / 7', minHeight: '160px' }}
    >
      {/* All slides stacked — cross-fade via opacity */}
      {slides.map((slide, index) => {
        const isActive = index === currentIndex
        return (
          <div
            key={slide.id}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: isActive ? 1 : 0, zIndex: isActive ? 2 : 1 }}
            aria-hidden={!isActive}
          >
            <img
              src={slide.image_url}
              alt={slide.title || 'اسلاید'}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                transform: isActive ? 'scale(1.04)' : 'scale(1)',
                transition: 'transform 5.5s ease-out',
              }}
            />
            {slide.title && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex items-end">
                <div
                  className="p-4 md:p-6 w-full"
                  style={{
                    transform: isActive ? 'translateY(0)' : 'translateY(10px)',
                    opacity: isActive ? 1 : 0,
                    transition: 'transform 0.6s ease 0.15s, opacity 0.6s ease 0.15s',
                  }}
                >
                  <h2 className="text-white text-lg md:text-2xl font-bold drop-shadow-lg">
                    {slide.title}
                  </h2>
                </div>
              </div>
            )}
            {/* Make it clickable if it has a link */}
            {slide.link_url && (
              <Link href={slide.link_url} className="absolute inset-0 z-10" aria-label={slide.title || 'مشاهده'} />
            )}
          </div>
        )
      })}

      {/* Progress bar */}
      {slides.length > 1 && (
        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white/20 z-20">
          <div
            className="h-full bg-white/70"
            style={{ width: `${progress}%`, transition: 'width 0.05s linear' }}
          />
        </div>
      )}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-slate-800 rounded-full shadow-lg transition-all duration-200 hover:scale-110 min-w-[44px] min-h-[44px] flex items-center justify-center backdrop-blur-sm"
            aria-label="اسلاید قبلی"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-slate-800 rounded-full shadow-lg transition-all duration-200 hover:scale-110 min-w-[44px] min-h-[44px] flex items-center justify-center backdrop-blur-sm"
            aria-label="اسلاید بعدی"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="h-2 rounded-full transition-all duration-300 ease-out"
              style={{
                width: index === currentIndex ? '2rem' : '0.6rem',
                background: index === currentIndex ? 'white' : 'rgba(255,255,255,0.45)',
              }}
              aria-label={`اسلاید ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
