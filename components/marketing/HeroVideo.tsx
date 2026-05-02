'use client'

import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'

interface HeroVideoProps {
  src: string
  poster?: string
  title?: string
}

export function HeroVideo({ src, poster, title }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showPoster, setShowPoster] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let hls: import('hls.js').default | null = null
    let cancelled = false

    async function setup() {
      if (!video) return

      // Native HLS (Safari, iOS)
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src
        return
      }

      // Other browsers — load hls.js dynamically so it doesn't bloat the
      // initial bundle when Safari doesn't need it.
      const HlsModule = await import('hls.js')
      if (cancelled) return

      const Hls = HlsModule.default
      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: false })
        hls.loadSource(src)
        hls.attachMedia(video)
      } else {
        // Last resort: try direct src and let the browser deal with it.
        video.src = src
      }
    }

    setup()

    return () => {
      cancelled = true
      hls?.destroy()
    }
  }, [src])

  function handlePlayClick() {
    const video = videoRef.current
    if (!video) return
    setShowPoster(false)
    video.muted = false
    void video.play().catch(() => {
      video.muted = true
      void video.play()
    })
  }

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5 bg-black">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        playsInline
        muted
        autoPlay
        loop
        poster={poster}
        controls={!showPoster}
      />
      {showPoster ? (
        <button
          type="button"
          onClick={handlePlayClick}
          aria-label={title ?? 'Play video'}
          className="group absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] transition-colors hover:bg-black/30"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-900 shadow-xl transition-transform group-hover:scale-105">
            <Play className="h-7 w-7 fill-current ml-1" />
          </span>
          {title ? (
            <span className="absolute bottom-4 left-4 right-4 rounded-md bg-black/50 px-3 py-1.5 text-sm text-white text-center backdrop-blur-sm">
              {title}
            </span>
          ) : null}
        </button>
      ) : null}
    </div>
  )
}
