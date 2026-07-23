'use client'

import { useEffect, useRef, useState } from 'react'

interface VideoPlayerProps {
  contentId: string
  videoToken: string
  watermark: string
  startPosition: number
  title: string
}

export default function VideoPlayer({ 
  contentId, 
  videoToken, 
  watermark, 
  startPosition,
  title 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasStarted, setHasStarted] = useState(false)
  
  // Disable right-click context menu
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }
    
    const videoElement = videoRef.current
    if (videoElement) {
      videoElement.addEventListener('contextmenu', handleContextMenu)
      return () => {
        videoElement.removeEventListener('contextmenu', handleContextMenu)
      }
    }
  }, [])
  
  // Set initial position
  useEffect(() => {
    if (videoRef.current && startPosition > 0 && !hasStarted) {
      videoRef.current.currentTime = startPosition
    }
  }, [startPosition, hasStarted])
  
  // Track progress
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return
    
    const handlePlay = () => setHasStarted(true)
    
    const handleTimeUpdate = async () => {
      const currentTime = Math.floor(videoElement.currentTime)
      const duration = Math.floor(videoElement.duration)
      
      // Save progress every 5 seconds
      if (currentTime % 5 === 0) {
        try {
          await fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contentId,
              progress: currentTime,
              completed: currentTime >= duration - 10 // Consider completed if within 10s of end
            })
          })
        } catch (error) {
          console.error('Failed to save progress:', error)
        }
      }
    }
    
    videoElement.addEventListener('play', handlePlay)
    videoElement.addEventListener('timeupdate', handleTimeUpdate)
    
    return () => {
      videoElement.removeEventListener('play', handlePlay)
      videoElement.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [contentId])
  
  // Disable keyboard shortcuts that could be used to download
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable Ctrl+S (save)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        return false
      }
      // Disable F12 (devtools) - note: this can be bypassed easily
      if (e.key === 'F12') {
        e.preventDefault()
        return false
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
  
  const videoUrl = `/api/watch/${videoToken}`
  
  return (
    <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        controlsList="nodownload"
        className="w-full h-full no-context-menu"
        preload="metadata"
        playsInline
      >
        <track kind="captions" />
      </video>
      
      {/* Watermark overlay */}
      <div className="video-watermark">
        {watermark}
      </div>
      
      {/* Notice about content protection */}
      <div className="absolute bottom-16 left-4 right-4 bg-black bg-opacity-70 text-white text-xs p-2 rounded pointer-events-none opacity-50">
        این محتوا محافظت شده است. ضبط یا اشتراک‌گذاری غیرمجاز ممنوع است.
      </div>
    </div>
  )
}
