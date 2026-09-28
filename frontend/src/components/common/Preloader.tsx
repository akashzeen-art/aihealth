import { useCallback, useEffect, useRef, useState } from 'react'
import { BRAND } from '../../brand'

const PRELOADER_VIDEO =
  'https://vz-8b335ac6-acc.b-cdn.net/d55ac4f5-7cfa-4512-95ae-ec6f03a5af0d/play_720p.mp4'
const START_TIMEOUT_MS = 6000
const MAX_MS = 20000
const PRELOADER_KEY = 'careguide_preloader_seen'

export function hasSeenPreloader(): boolean {
  try {
    return localStorage.getItem(PRELOADER_KEY) === '1'
  } catch {
    return false
  }
}

function markPreloaderSeen() {
  try {
    localStorage.setItem(PRELOADER_KEY, '1')
  } catch {
    /* ignore quota / private mode */
  }
}

/** Full-screen video splash — shown once on first website visit. */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false)
  const [started, setStarted] = useState(false)
  const doneRef = useRef(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    setLeaving(true)
    markPreloaderSeen()
    window.setTimeout(onDone, 500)
  }, [onDone])

  useEffect(() => {
    const maxTimer = window.setTimeout(finish, MAX_MS)
    return () => window.clearTimeout(maxTimer)
  }, [finish])

  useEffect(() => {
    if (started) return
    const startTimer = window.setTimeout(finish, START_TIMEOUT_MS)
    return () => window.clearTimeout(startTimer)
  }, [started, finish])

  useEffect(() => {
    videoRef.current?.play().catch(finish)
  }, [finish])

  return (
    <div
      className={`preloader preloader-video ${leaving ? 'is-leaving' : ''}`}
      role="status"
      aria-live="polite"
    >
      <video
        ref={videoRef}
        className="preloader-video-media"
        src={PRELOADER_VIDEO}
        autoPlay
        muted
        playsInline
        preload="auto"
        onPlaying={() => setStarted(true)}
        onEnded={finish}
        onError={finish}
        aria-hidden="true"
      />
      {!started && <span className="preloader-video-spinner" aria-hidden="true" />}
      <button type="button" className="preloader-skip" onClick={finish}>
        Skip
        <span aria-hidden="true"> →</span>
      </button>
      <span className="sr-only">Loading {BRAND.name}</span>
    </div>
  )
}
