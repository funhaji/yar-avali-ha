'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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

const DURATION = 5000   // ms per slide
const TICK     = 40     // ms per progress tick (~25fps)
const STEP     = (100 / DURATION) * TICK  // progress units per tick

export function HomepageSlider({ slides }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const resumeRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const slidesLen  = slides.length

  // Single master tick — progress drives the slide advance
  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  const resetProgress = useCallback(() => {
    setProgress(0)
  }, [])

  const nextSlide = useCallback((idx: number) => {
    return (idx + 1) % slidesLen
  }, [slidesLen])

  const prevSlide = useCallback((idx: number) => {
    return (idx - 1 + slidesLen) % slidesLen
  }, [slidesLen])

  // Start/restart the autoplay timer
  const startTimer = useCallback(() => {
    stopTimer()
    setProgress(0)
    timerRef.current = setInterval(() => {
      setProgress(p => {
        const next = p + STEP
        if (next >= 100) {
          // Progress filled — advance slide, reset
          setCurrentIndex(i => (i + 1) % slidesLen)
          return 0
        }
        return next
      })
    }, TICK)
  }, [stopTimer, slidesLen])

  // Boot autoplay
  useEffect(() => {
    if (slidesLen <= 1) return
    if (isAutoPlaying) startTimer()
    return stopTimer
  }, [isAutoPlaying, slidesLen, startTimer, stopTimer])

  // Manual nav — pause, then resume after 10s
  const pauseAndResume = useCallback(() => {
    stopTimer()
    setIsAutoPlaying(false)
    if (resumeRef.current) clearTimeout(resumeRef.current)
    resumeRef.current = setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [stopTimer])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
    resetProgress()
    pauseAndResume()
  }, [resetProgress, pauseAndResume])

  const goToPrevious = useCallback(() => {
    setCurrentIndex(i => prevSlide(i))
    resetProgress()
    pauseAndResume()
  }, [prevSlide, resetProgress, pauseAndResume])

  const goToNext = useCallback(() => {
    setCurrentIndex(i => nextSlide(i))
    resetProgress()
    pauseAndResume()
  }, [nextSlide, resetProgress, pauseAndResume])

  if (!slides || slidesLen === 0) return null

  const nextIndex = nextSlide(currentIndex)

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
            className="absolute inset-0"
            style={{
              opacity: isActive ? 1 : 0,
              zIndex: isActive ? 2 : 1,
              transition: 'opacity 0.75s ease-in-out',
            }}
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
              loading={isActive ? 'eager' : 'lazy'}
              fetchPriority={isActive ? 'high' : 'low'}
              decoding="async"
            />
            {slide.title && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex items-end">
                <div
                  className="p-4 md:p-6 w-full"
                  style={{
                    transform: isActive ? 'translateY(0)' : 'translateY(10px)',
                    opacity: isActive ? 1 : 0,
                    transition: 'transform 0.6s ease 0.2s, opacity 0.6s ease 0.2s',
                  }}
                >
                  <h2 className="text-white text-lg md:text-2xl font-bold drop-shadow-lg">
                    {slide.title}
                  </h2>
                </div>
              </div>
            )}
            {slide.link_url && (
              <Link
                href={slide.link_url}
                className="absolute inset-0 z-10"
                aria-label={slide.title || 'مشاهده'}
              />
            )}
          </div>
        )
      })}

      {/* Progress bar — drives the slide advance */}
      {slidesLen > 1 && (
        <div className="absolute bottom-0 inset-x-0 h-[3px] bg-white/20 z-20">
          <div
            className="h-full bg-white/80 rounded-full"
            style={{ width: `${progress}%`, transition: `width ${TICK}ms linear` }}
          />
        </div>
      )}

      {/* Navigation Arrows */}
      {slidesLen > 1 && (
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
      {slidesLen > 1 && (
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
