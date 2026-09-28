import { useEffect, useState } from 'react'
import { BRAND } from '../../brand'

const MIN_MS = 5000
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

/** Full-screen splash — shown once on first website visit. */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const start = Date.now()
    const finish = () => {
      const wait = Math.max(0, MIN_MS - (Date.now() - start))
      window.setTimeout(() => {
        setLeaving(true)
        markPreloaderSeen()
        window.setTimeout(onDone, 420)
      }, wait)
    }

    if (document.readyState === 'complete') {
      finish()
    } else {
      window.addEventListener('load', finish, { once: true })
      window.setTimeout(finish, MIN_MS + 400)
    }
  }, [onDone])

  return (
    <div className={`preloader ${leaving ? 'is-leaving' : ''}`} role="status" aria-live="polite">
      <div className="loading-window" aria-hidden="true">
        <div className="ambulance-scene">
          <div className="ambulance">
            <div className="strike" />
            <div className="strike strike2" />
            <div className="strike strike3" />
            <div className="strike strike4" />
            <div className="strike strike5" />
            <div className="strike strike6" />

            <div className="ambulance-detail light" />
            <div className="ambulance-detail light-glow" />
            <div className="ambulance-detail roof" />
            <div className="ambulance-detail body" />
            <div className="ambulance-detail cabin" />
            <div className="ambulance-detail hood" />
            <div className="ambulance-detail window" />
            <div className="ambulance-detail window-line" />
            <div className="ambulance-detail bumper" />
            <div className="ambulance-detail grill" />
            <div className="ambulance-detail cross-badge" />
            <div className="ambulance-detail cross-v" />
            <div className="ambulance-detail cross-h" />
            <div className="ambulance-detail door-line" />
            <div className="ambulance-detail wheel wheel1" />
            <div className="ambulance-detail wheel wheel2" />
            <div className="ambulance-detail hub hub1" />
            <div className="ambulance-detail hub hub2" />
          </div>
          <div className="ambulance-road" />
        </div>

        <div className="loading-text">
          <span>Loading</span>
          <span className="dots">...</span>
        </div>
      </div>

      <p className="preloader-brand">{BRAND.name}</p>
      <p className="preloader-hint">Getting your care space ready</p>
      <span className="sr-only">Loading {BRAND.name}</span>
    </div>
  )
}
