'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, AlertCircle } from 'lucide-react'

interface VideoPlayerProps {
  contentId: string
  storageProvider: string
  videoUrl: string
  startPosition: number
  title: string
}

// Extract YouTube video ID from various URL formats
function getYouTubeVideoId(url: string): string | null {
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
  const match = input.match(/\/d\/([^\/]+)/)
  if (match) return match[1]
  // If it's already just an ID
  if (/^[a-zA-Z0-9_-]{20,}$/.test(input)) return input
  return null
}

// Extract Mega.nz file link
function getMegaLink(url: string): string | null {
  // Mega links: https://mega.nz/file/abc123xyz#key or https://mega.nz/#!abc!key
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
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Determine player type
  const isYouTube = storageProvider === 'youtube'
  const isGoogleDrive = storageProvider === 'gdrive'
  const isMega = storageProvider === 'mega'
  const isEmbedded = isGoogleDrive // Only Google Drive uses simple iframe
  
  const youtubeVideoId = isYouTube ? getYouTubeVideoId(videoUrl) : null
  
  // Get Google Drive streaming URL
  const getGoogleDriveStreamUrl = (): string | null => {
    if (!isGoogleDrive) return null
    const fileId = getGoogleDriveId(videoUrl)
    if (!fileId) return null
    
    // Use direct streaming URL instead of preview
    return `https://drive.google.com/uc?export=download&id=${fileId}`
  }
  
  // Get Mega.nz embed URL
  const getMegaEmbedUrl = (): string | null => {
    if (!isMega) return null
    const megaLink = getMegaLink(videoUrl)
    if (!megaLink) return null
    
    // Mega.nz supports direct embedding with /embed/ path
    return megaLink.replace('/file/', '/embed/')
  }
  
  const gdriveStreamUrl = getGoogleDriveStreamUrl()
  const megaEmbedUrl = getMegaEmbedUrl()
  
  // Load YouTube IFrame API
  useEffect(() => {
    if (!isYouTube || !youtubeVideoId) return
    
    // Load YouTube API script
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
      playerVars: {
        controls: 0,           // Hide YouTube controls
        modestbranding: 1,     // Minimal branding
        rel: 0,                // No related videos
        fs: 1,                 // Allow fullscreen
        iv_load_policy: 3,     // Hide annotations
        cc_load_policy: 0,     // No captions by default
        disablekb: 1,          // Disable keyboard (we'll handle it)
        playsinline: 1,        // Play inline on iOS
        start: Math.floor(startPosition)
      },
      events: {
        onReady: (event: any) => {
          setLoading(false)
          setDuration(event.target.getDuration())
          
          // Start progress tracking
          progressIntervalRef.current = setInterval(() => {
            if (youtubePlayerRef.current && youtubePlayerRef.current.getCurrentTime) {
              const current = youtubePlayerRef.current.getCurrentTime()
              setCurrentTime(current)
              
              // Save progress every 10 seconds
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
          // 1 = playing, 2 = paused, 0 = ended
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
  
  // Track progress and handle events (only for non-embedded videos)
  useEffect(() => {
    if (isEmbedded) return
    
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
      
      // Save progress every 10 seconds
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
        } catch (error) {
          // Silent fail
        }
      }
    }
    
    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration)
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
  }, [contentId, isEmbedded])
  
  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false)
        }, 3000)
      }
    }
    
    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      return () => {
        container.removeEventListener('mousemove', handleMouseMove)
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current)
        }
      }
    }
  }, [isPlaying])
  
  // Disable keyboard shortcuts that could be used to download
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        return false
      }
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
        videoRef.current.play()
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
  
  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen()
      } else {
        document.exitFullscreen()
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
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  return (
    <div 
      ref={containerRef}
      className="relative bg-black" 
      style={{ aspectRatio: '16/9' }}
      onMouseMove={() => setShowControls(true)}
    >
      {/* YouTube Player with Custom Controls */}
      {isYouTube && youtubeVideoId ? (
        <>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mb-4"></div>
                <p className="text-white text-lg">در حال بارگذاری...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
              <div className="text-center max-w-md p-8">
                <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
                <p className="text-white text-lg mb-6">{error}</p>
              </div>
            </div>
          )}
          
          <div 
            ref={youtubeContainerRef} 
            className="w-full h-full"
            onClick={togglePlay}
          />
          
          {/* Custom Controls Overlay */}
          <div 
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
            style={{ pointerEvents: showControls || !isPlaying ? 'auto' : 'none' }}
          >
            {/* Progress Bar */}
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full mb-4 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #9333ea 0%, #9333ea ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) 100%)`,
              }}
            />
            
            {/* Controls Row */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-6">
                <button 
                  onClick={togglePlay} 
                  className="hover:text-teal-400 transition-colors p-2 hover:bg-white/10 rounded-full"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                </button>
                
                <button 
                  onClick={toggleMute} 
                  className="hover:text-teal-400 transition-colors p-2 hover:bg-white/10 rounded-full"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
                
                <span className="text-sm font-medium">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className="hover:text-teal-400 transition-colors flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg"
                  >
                    <Settings size={20} />
                    <span className="text-sm font-medium">{playbackRate}x</span>
                  </button>
                  
                  {showSettings && (
                    <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-sm rounded-xl py-2 min-w-[140px] shadow-2xl border border-white/10">
                      <div className="px-4 py-2 text-xs text-gray-400 font-medium">سرعت پخش</div>
                      {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                        <button
                          key={rate}
                          onClick={() => changePlaybackRate(rate)}
                          className={`w-full px-4 py-2.5 text-sm text-right hover:bg-teal-600/20 transition-colors ${
                            playbackRate === rate ? 'text-teal-400 bg-teal-600/10' : 'text-white'
                          }`}
                        >
                          {rate === 1 ? 'عادی' : `${rate}x`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={toggleFullscreen} 
                  className="hover:text-teal-400 transition-colors p-2 hover:bg-white/10 rounded-full"
                  aria-label="Fullscreen"
                >
                  <Maximize size={22} />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : isMega && megaEmbedUrl ? (
        /* Mega.nz - Use iframe embed */
        <div className="relative w-full h-full mega-container">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mb-4"></div>
                <p className="text-white text-lg">در حال بارگذاری از Mega.nz...</p>
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
          {/* Overlay to hide Mega.nz branding/external buttons */}
          <div className="mega-button-blocker" />
        </div>
      ) : isEmbedded ? (
        /* Google Drive - Use iframe for better compatibility */
        <div className="relative w-full h-full gdrive-container">
          <iframe
            src={`https://drive.google.com/file/d/${getGoogleDriveId(videoUrl)}/preview`}
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
            style={{ border: 'none' }}
          />
          {/* Overlay to hide Google Drive "Open in Drive" button */}
          <div className="gdrive-button-blocker" />
        </div>
      ) : (
        /* Regular video tag for other providers */
        <>
          {loading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mb-4"></div>
                <p className="text-white text-lg">در حال بارگذاری...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 z-10">
              <div className="text-center max-w-md p-8">
                <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
                <p className="text-white text-lg mb-6">{error}</p>
                <button
                  onClick={() => {
                    setError(null)
                    setLoading(true)
                    if (videoRef.current) {
                      videoRef.current.load()
                    }
                  }}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg transition-colors font-medium"
                >
                  تلاش مجدد
                </button>
              </div>
            </div>
          )}
          
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full"
            preload="metadata"
            playsInline
            onClick={togglePlay}
            crossOrigin="anonymous"
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
          >
            <track kind="captions" />
          </video>
          
          {/* Custom Controls Overlay */}
          <div 
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
            style={{ pointerEvents: showControls || !isPlaying ? 'auto' : 'none' }}
            onMouseMove={() => setShowControls(true)}
          >
            {/* Progress Bar */}
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full mb-4 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #9333ea 0%, #9333ea ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) 100%)`,
              }}
            />
            
            {/* Controls Row */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-6">
                <button 
                  onClick={togglePlay} 
                  className="hover:text-teal-400 transition-colors p-2 hover:bg-white/10 rounded-full"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                </button>
                
                <button 
                  onClick={toggleMute} 
                  className="hover:text-teal-400 transition-colors p-2 hover:bg-white/10 rounded-full"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
                
                <span className="text-sm font-medium">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className="hover:text-teal-400 transition-colors flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg"
                  >
                    <Settings size={20} />
                    <span className="text-sm font-medium">{playbackRate}x</span>
                  </button>
                  
                  {showSettings && (
                    <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-sm rounded-xl py-2 min-w-[140px] shadow-2xl border border-white/10">
                      <div className="px-4 py-2 text-xs text-gray-400 font-medium">سرعت پخش</div>
                      {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                        <button
                          key={rate}
                          onClick={() => changePlaybackRate(rate)}
                          className={`w-full px-4 py-2.5 text-sm text-right hover:bg-teal-600/20 transition-colors ${
                            playbackRate === rate ? 'text-teal-400 bg-teal-600/10' : 'text-white'
                          }`}
                        >
                          {rate === 1 ? 'عادی' : `${rate}x`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={toggleFullscreen} 
                  className="hover:text-teal-400 transition-colors p-2 hover:bg-white/10 rounded-full"
                  aria-label="Fullscreen"
                >
                  <Maximize size={22} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
