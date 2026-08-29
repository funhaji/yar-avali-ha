'use client'

import { useState, useEffect } from 'react'
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
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-rotate slides every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, slides.length])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  if (!slides || slides.length === 0) {
    return null
  }

  const currentSlide = slides[currentIndex]

  const SlideContent = () => (
    <div className="relative w-full rounded-xl overflow-hidden bg-cream border border-line-soft">
      <img
        src={currentSlide.image_url}
        alt={currentSlide.title || 'اسلاید'}
        className="w-full h-auto object-contain"
      />
      {currentSlide.title && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end">
          <div className="p-4 md:p-6 w-full">
            <h2 className="text-white text-lg md:text-2xl font-bold">{currentSlide.title}</h2>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="relative">
      {/* Main Slide */}
      {currentSlide.link_url ? (
        <Link href={currentSlide.link_url}>
          <SlideContent />
        </Link>
      ) : (
        <SlideContent />
      )}

      {/* Navigation Arrows - only show if more than 1 slide */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all z-10"
            aria-label="اسلاید قبلی"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all z-10"
            aria-label="اسلاید بعدی"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator - only show if more than 1 slide */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`اسلاید ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
