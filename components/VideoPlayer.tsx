'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, AlertCircle, RotateCcw, RotateCw } from 'lucide-react'

interface VideoPlayerProps {
  contentId: string
  storageProvider: string
  videoUrl: string
  startPosition: number
  title: string
}

// Extract YouTube video ID from various URL formats
function getYouTubeVideoId(url: string): string | null {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// Extract Google Drive file ID
function getGoogleDriveId(input: string): string | null {
  if (!input) return null
  const match = input.match(/\/d\/([^\/\?]+)/) || input.match(/id=([^\&]+)/)
  if (match) return match[1]
  const trimmed = input.trim()
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) return trimmed
  return null
}

// Convert Google Drive ID or URL to direct stream URL
function getGoogleDriveDirectUrl(input: string): string {
  if (input.includes('drive.usercontent.google.com')) return input
  const fileId = getGoogleDriveId(input)
  if (fileId) {
    return `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`
  }
  return input
}

// Extract Mega.nz file link
function getMegaLink(url: string): string | null {
  if (!url) return null
  if (url.includes('mega.nz') || url.includes('mega.co.nz')) {
    return url
  }
  return null
}

// Declare YouTube IFrame API types
declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export default function VideoPlayer({ 
  contentId, 
  storageProvider,
  videoUrl,
  startPosition,
  title 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const youtubePlayerRef = useRef<any>(null)
  const youtubeContainerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [youtubeReady, setYoutubeReady] = useState(false)
  const [useIframeFallback, setUseIframeFallback] = useState(false)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Determine player type
  const isYouTube = storageProvider === 'youtube'
  const isGoogleDrive = storageProvider === 'gdrive'
  const isMega = storageProvider === 'mega'
  const isEmbedded = isMega || (isGoogleDrive && useIframeFallback)
  
  const youtubeVideoId = isYouTube ? getYouTubeVideoId(videoUrl) : null
  const activeVideoSrc = isGoogleDrive ? getGoogleDriveDirectUrl(videoUrl) : videoUrl
  const megaEmbedUrl = isMega && getMegaLink(videoUrl) ? getMegaLink(videoUrl)!.replace('/file/', '/embed/') : null

  // Load YouTube IFrame API
  useEffect(() => {
    if (!isYouTube || !youtubeVideoId) return
    
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
      
      window.onYouTubeIframeAPIReady = () => {
        setYoutubeReady(true)
      }
    } else {
      setYoutubeReady(true)
    }
  }, [isYouTube, youtubeVideoId])
  
  // Initialize YouTube Player
  useEffect(() => {
    if (!isYouTube || !youtubeReady || !youtubeVideoId || !youtubeContainerRef.current) return
    
    youtubePlayerRef.current = new window.YT.Player(youtubeContainerRef.current, {
      videoId: youtubeVideoId,
      width: '100%',
      height: '100%',
      playerVars: {
        controls: 0,
        modestbranding: 1,
        rel: 0,
        fs: 1,
        iv_load_policy: 3,
        cc_load_policy: 0,
        disablekb: 1,
        playsinline: 1,
        start: Math.floor(startPosition)
      },
      events: {
        onReady: (event: any) => {
          setLoading(false)
          setDuration(event.target.getDuration())
          
          progressIntervalRef.current = setInterval(() => {
            if (youtubePlayerRef.current && youtubePlayerRef.current.getCurrentTime) {
              const current = youtubePlayerRef.current.getCurrentTime()
              setCurrentTime(current)
              
              const currentSeconds = Math.floor(current)
              if (currentSeconds % 10 === 0 && currentSeconds > 0) {
                fetch('/api/progress', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contentId,
                    progress: currentSeconds,
                    completed: currentSeconds >= Math.floor(event.target.getDuration()) - 10
                  })
                }).catch(() => {})
              }
            }
          }, 500)
        },
        onStateChange: (event: any) => {
          const playerState = event.data
          setIsPlaying(playerState === 1)
          if (playerState === 1) {
            setHasStarted(true)
          }
        },
        onError: () => {
          setError('خطا در بارگذاری ویدیو از یوتیوب')
          setLoading(false)
        }
      }
    })
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      if (youtubePlayerRef.current && youtubePlayerRef.current.destroy) {
        youtubePlayerRef.current.destroy()
      }
    }
  }, [isYouTube, youtubeReady, youtubeVideoId, contentId, startPosition])
  
  // Track progress and handle events for HTML5 video
  useEffect(() => {
    if (isEmbedded || isYouTube) return
    
    const videoElement = videoRef.current
    if (!videoElement) return
    
    const handlePlay = () => {
      setHasStarted(true)
      setIsPlaying(true)
      setError(null)
      setLoading(false)
    }
    
    const handlePause = () => {
      setIsPlaying(false)
    }
    
    const handleLoadStart = () => {
      setLoading(true)
      setError(null)
    }
    
    const handleLoadedData = () => {
      setLoading(false)
      setError(null)
    }
    
    const handleError = (e: Event) => {
      if (isGoogleDrive && !useIframeFallback) {
        console.warn('Google Drive direct stream encountered an error, falling back to iframe...')
        setUseIframeFallback(true)
        setLoading(false)
        return
      }
      setLoading(false)
      const videoError = (e.target as HTMLVideoElement).error
      if (videoError) {
        console.error('Video error:', videoError)
        setError(`خطا در بارگذاری ویدیو: ${videoError.message || 'لطفاً دوباره تلاش کنید'}`)
      } else {
        setError('خطا در بارگذاری ویدیو. لطفاً دوباره تلاش کنید')
      }
    }
    
    const handleTimeUpdate = async () => {
      setCurrentTime(videoElement.currentTime)
      const currentSeconds = Math.floor(videoElement.currentTime)
      const totalDuration = Math.floor(videoElement.duration)
      
      if (currentSeconds % 10 === 0 && currentSeconds > 0) {
        try {
          await fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contentId,
              progress: currentSeconds,
              completed: currentSeconds >= totalDuration - 10
            })
          })
        } catch {
          // Silent fail
        }
      }
    }
    
    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration)
      if (startPosition > 0 && videoElement.currentTime === 0) {
        videoElement.currentTime = startPosition
      }
    }
    
    videoElement.addEventListener('play', handlePlay)
    videoElement.addEventListener('pause', handlePause)
    videoElement.addEventListener('loadstart', handleLoadStart)
    videoElement.addEventListener('loadeddata', handleLoadedData)
    videoElement.addEventListener('error', handleError)
    videoElement.addEventListener('timeupdate', handleTimeUpdate)
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata)
    
    return () => {
      videoElement.removeEventListener('play', handlePlay)
      videoElement.removeEventListener('pause', handlePause)
      videoElement.removeEventListener('loadstart', handleLoadStart)
      videoElement.removeEventListener('loadeddata', handleLoadedData)
      videoElement.removeEventListener('error', handleError)
      videoElement.removeEventListener('timeupdate', handleTimeUpdate)
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [contentId, isEmbedded, isYouTube, isGoogleDrive, useIframeFallback, startPosition])
  
  // Controls activity timer
  const handleUserActivity = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
        setShowSettings(false)
      }
    }, 3500)
  }

  useEffect(() => {
    if (isPlaying) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
        setShowSettings(false)
      }, 3500)
    } else {
      setShowControls(true)
    }
  }, [isPlaying])

  // Prevent inspect shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
      }
      if (e.key === 'F12') {
        e.preventDefault()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
  
  const togglePlay = () => {
    if (isYouTube && youtubePlayerRef.current) {
      if (isPlaying) {
        youtubePlayerRef.current.pauseVideo()
      } else {
        youtubePlayerRef.current.playVideo()
      }
    } else if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch(() => {})
      }
    }
  }
  
  const toggleMute = () => {
    if (isYouTube && youtubePlayerRef.current) {
      if (isMuted) {
        youtubePlayerRef.current.unMute()
      } else {
        youtubePlayerRef.current.mute()
      }
      setIsMuted(!isMuted)
    } else if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (isYouTube && youtubePlayerRef.current) {
      youtubePlayerRef.current.seekTo(time, true)
      setCurrentTime(time)
    } else if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const seekRelative = (seconds: number) => {
    if (isYouTube && youtubePlayerRef.current) {
      const current = youtubePlayerRef.current.getCurrentTime ? youtubePlayerRef.current.getCurrentTime() : currentTime
      const target = Math.max(0, Math.min(duration, current + seconds))
      youtubePlayerRef.current.seekTo(target, true)
      setCurrentTime(target)
    } else if (videoRef.current) {
      const current = videoRef.current.currentTime
      const target = Math.max(0, Math.min(duration, current + seconds))
      videoRef.current.currentTime = target
      setCurrentTime(target)
    }
    handleUserActivity()
  }

  const handleContainerTap = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('button, input, select, [role="button"], .controls-bar, .settings-menu')) {
      return
    }

    if (!showControls) {
      setShowControls(true)
      handleUserActivity()
    } else {
      if (isPlaying) {
        setShowControls(false)
        setShowSettings(false)
      } else {
        togglePlay()
      }
    }
  }

  const toggleFullscreen = () => {
    const container = containerRef.current as any
    const video = videoRef.current as any
    if (!container) return

    const isFs = document.fullscreenElement || 
                 (document as any).webkitFullscreenElement || 
                 (document as any).mozFullScreenElement || 
                 (document as any).msFullscreenElement

    if (!isFs) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(() => {
          if (video && video.webkitEnterFullscreen) video.webkitEnterFullscreen()
        })
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen()
      } else if (video && video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen()
      }
    }
  }
  
  const changePlaybackRate = (rate: number) => {
    if (isYouTube && youtubePlayerRef.current) {
      youtubePlayerRef.current.setPlaybackRate(rate)
      setPlaybackRate(rate)
      setShowSettings(false)
    } else if (videoRef.current) {
      videoRef.current.playbackRate = rate
      setPlaybackRate(rate)
      setShowSettings(false)
    }
  }
  
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  return (
    <div 
      ref={containerRef}
      className="relative bg-black w-full h-full max-w-full overflow-hidden select-none video-player-container group" 
      style={{ aspectRatio: '16/9' }}
      onMouseMove={handleUserActivity}
      onTouchStart={handleUserActivity}
      onClick={handleContainerTap}
    >
      {/* YouTube Player */}
      {isYouTube && youtubeVideoId ? (
        <>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-teal-500 border-t-transparent mb-4"></div>
                <p className="text-white text-sm sm:text-lg">در حال بارگذاری...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
              <div className="text-center max-w-md p-6">
                <AlertCircle className="mx-auto mb-4 text-red-500" size={40} />
                <p className="text-white text-base mb-6">{error}</p>
              </div>
            </div>
          )}
          
          <div 
            ref={youtubeContainerRef} 
            className="w-full h-full"
          />
        </>
      ) : isMega && megaEmbedUrl ? (
        /* Mega.nz - iframe embed */
        <div className="relative w-full h-full mega-container">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-14 w-14 border-4 border-teal-500 border-t-transparent mb-4"></div>
                <p className="text-white text-base">در حال بارگذاری از Mega.nz...</p>
              </div>
            </div>
          )}
          
          <iframe
            src={megaEmbedUrl}
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
            style={{ border: 'none' }}
            onLoad={() => setLoading(false)}
          />
          <div className="mega-button-blocker" />
        </div>
      ) : isGoogleDrive && useIframeFallback ? (
        /* Google Drive Fallback iframe */
        <div className="relative w-full h-full gdrive-container">
          <iframe
            src={`https://drive.google.com/file/d/${getGoogleDriveId(videoUrl)}/preview`}
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
            style={{ border: 'none' }}
            onLoad={() => setLoading(false)}
          />
          <div className="gdrive-button-blocker" />
        </div>
      ) : (
        /* Native HTML5 Video */
        <>
          {loading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/75 z-10 pointer-events-none">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-teal-500 border-t-transparent mb-4"></div>
                <p className="text-white text-sm sm:text-base">در حال بارگذاری...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
              <div className="text-center max-w-md p-6 sm:p-8">
                <AlertCircle className="mx-auto mb-4 text-red-500" size={44} />
                <p className="text-white text-base sm:text-lg mb-6">{error}</p>
                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    setLoading(true)
                    if (videoRef.current) {
                      videoRef.current.load()
                    }
                  }}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl transition-colors font-bold shadow-lg"
                >
                  تلاش مجدد
                </button>
              </div>
            </div>
          )}
          
          <video
            ref={videoRef}
            src={activeVideoSrc}
            className="w-full h-full object-contain"
            preload="metadata"
            playsInline
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
          >
            <track kind="captions" />
          </video>
        </>
      )}

      {/* Custom Controls (Rendered for both native HTML5 video and YouTube) */}
      {(!isMega || !megaEmbedUrl) && !(isGoogleDrive && useIframeFallback) && (
        <>
          {/* Center Quick Action Controls (Rewind 10s / Big Play / Forward 10s) */}
          <div 
            className={`absolute inset-0 flex items-center justify-center gap-5 sm:gap-10 pointer-events-none transition-opacity duration-300 z-10 ${
              showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Rewind 10s */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                seekRelative(-10)
              }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-black/80 active:scale-90 text-white flex flex-col items-center justify-center backdrop-blur-sm pointer-events-auto transition-transform shadow-lg border border-white/15"
              aria-label="10 ثانیه به عقب"
              title="10 ثانیه به عقب"
            >
              <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[10px] font-bold mt-0.5 leading-none tracking-tighter">10-</span>
            </button>

            {/* Big Center Play / Pause */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                togglePlay()
              }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-teal-500 hover:bg-teal-400 active:scale-95 text-white flex items-center justify-center pointer-events-auto transition-transform shadow-2xl border-2 border-white/20 backdrop-blur-sm"
              aria-label={isPlaying ? 'توقف موقت' : 'پخش'}
              title={isPlaying ? 'توقف موقت' : 'پخش'}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 sm:w-10 sm:h-10" fill="currentColor" />
              ) : (
                <Play className="w-8 h-8 sm:w-10 sm:h-10 translate-x-0.5" fill="currentColor" />
              )}
            </button>

            {/* Fast Forward 10s */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                seekRelative(10)
              }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-black/80 active:scale-90 text-white flex flex-col items-center justify-center backdrop-blur-sm pointer-events-auto transition-transform shadow-lg border border-white/15"
              aria-label="10 ثانیه به جلو"
              title="10 ثانیه به جلو"
            >
              <RotateCw className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[10px] font-bold mt-0.5 leading-none tracking-tighter">10+</span>
            </button>
          </div>

          {/* Bottom Controls Bar */}
          <div 
            className={`controls-bar absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 transition-opacity duration-300 z-20 ${
              showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress Slider */}
            <div className="relative w-full py-2 flex items-center cursor-pointer">
              <input
                type="range"
                min="0"
                max={duration || 0}
                step="any"
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 sm:h-2 rounded-lg appearance-none cursor-pointer focus:outline-none"
                style={{
                  background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${
                    duration > 0 ? (currentTime / duration) * 100 : 0
                  }%, rgba(255,255,255,0.25) ${
                    duration > 0 ? (currentTime / duration) * 100 : 0
                  }%, rgba(255,255,255,0.25) 100%)`,
                }}
                aria-label="نوار زمان ویدیو"
              />
            </div>
            
            {/* Controls Row */}
            <div className="flex items-center justify-between text-white gap-2 w-full max-w-full">
              {/* Left Controls */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0 min-w-0">
                <button 
                  type="button"
                  onClick={togglePlay} 
                  className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center hover:text-teal-400 transition-colors hover:bg-white/10 rounded-full active:scale-95"
                  aria-label={isPlaying ? 'توقف' : 'پخش'}
                >
                  {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" />}
                </button>
                
                <button 
                  type="button"
                  onClick={toggleMute} 
                  className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center hover:text-teal-400 transition-colors hover:bg-white/10 rounded-full active:scale-95"
                  aria-label={isMuted ? 'صدادار کردن' : 'بی‌صدا کردن'}
                >
                  {isMuted ? <VolumeX className="w-5 h-5 sm:w-5 sm:h-5" /> : <Volume2 className="w-5 h-5 sm:w-5 sm:h-5" />}
                </button>
                
                <span className="text-xs sm:text-sm font-medium tracking-tight whitespace-nowrap dir-ltr px-1">
                  {formatTime(currentTime)} <span className="opacity-60">/</span> {formatTime(duration)}
                </span>
              </div>
              
              {/* Right Controls */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <div className="relative">
                  <button 
                    type="button"
                    onClick={() => setShowSettings(!showSettings)}
                    className="h-10 px-2.5 sm:px-3 flex items-center gap-1 hover:text-teal-400 transition-colors hover:bg-white/10 rounded-lg text-xs sm:text-sm font-medium active:scale-95"
                    aria-label="سرعت پخش"
                  >
                    <Settings className="w-4 h-4" />
                    <span>{playbackRate}x</span>
                  </button>
                  
                  {showSettings && (
                    <div className="settings-menu absolute bottom-full left-0 sm:left-auto sm:right-0 mb-2 bg-gray-900/95 backdrop-blur-md rounded-xl py-1.5 min-w-[130px] shadow-2xl border border-white/10 z-30">
                      <div className="px-3 py-1 text-[11px] text-gray-400 font-medium">سرعت پخش</div>
                      {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                        <button
                          type="button"
                          key={rate}
                          onClick={() => changePlaybackRate(rate)}
                          className={`w-full px-3 py-2 text-xs sm:text-sm text-right hover:bg-teal-600/20 transition-colors ${
                            playbackRate === rate ? 'text-teal-400 bg-teal-600/10 font-bold' : 'text-white'
                          }`}
                        >
                          {rate === 1 ? 'عادی (1x)' : `${rate}x`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <button 
                  type="button"
                  onClick={toggleFullscreen} 
                  className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center hover:text-teal-400 transition-colors hover:bg-white/10 rounded-full active:scale-95"
                  aria-label="تمام‌صفحه"
                >
                  <Maximize className="w-5 h-5 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
