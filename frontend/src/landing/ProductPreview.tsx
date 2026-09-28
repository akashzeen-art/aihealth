import { useEffect, useRef, useState } from 'react'
import { usePointerParallax } from '../hooks/usePointerParallax'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { BRAND } from '../brand'

/**
 * Healthcare-oriented CareGuide workspace mockup for the landing hero.
 * Decorative only — not interactive chat. No fake vitals or scores.
 */
export default function ProductPreview({
  className = '',
  enableTilt = true,
}: {
  className?: string
  enableTilt?: boolean
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [chatStep, setChatStep] = useState(reduced ? 3 : 0)
  usePointerParallax(wrapRef, enableTilt && !reduced, 0.42)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const t = window.setTimeout(() => el.classList.add('is-entered'), reduced ? 0 : 120)
    return () => window.clearTimeout(t)
  }, [reduced])

  useEffect(() => {
    if (reduced) {
      setChatStep(3)
      return
    }
    setChatStep(0)
    const timers = [
      window.setTimeout(() => setChatStep(1), 700),
      window.setTimeout(() => setChatStep(2), 1500),
      window.setTimeout(() => setChatStep(3), 2400),
    ]
    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [reduced])

  return (
    <div
      ref={wrapRef}
      className={`lp-product-stage lp-health-ui lp-product-live ${reduced ? 'is-entered' : ''} ${className}`.trim()}
      data-chat={chatStep}
    >
      <div className="lp-product-glow" aria-hidden="true" />
      <div className="lp-product-frame" aria-hidden="true">
        <header className="lp-product-bar">
          <div className="lp-product-brand">
            <span className="lp-product-mark" />
            <span>{BRAND.name}</span>
          </div>
          <span className="lp-product-assistant">
            <span className="lp-live-dot" />
            Health Companion
          </span>
        </header>

        <div className="lp-health-layout">
          <aside className="lp-health-rail">
            <p className="lp-health-rail-label">Care areas</p>
            <ul>
              <li className="is-active">General health</li>
              <li>First aid</li>
              <li>Mother &amp; baby</li>
              <li>Nutrition</li>
              <li>Translator</li>
              <li>Documents</li>
            </ul>
          </aside>

          <div className="lp-health-main">
            <p className="lp-product-prompt">What would you like to understand today?</p>

            <div className={`lp-bubble lp-bubble-user${chatStep >= 1 ? ' is-on' : ''}`}>
              <span className="lp-bubble-label">You</span>
              <p>What does “hypertension” mean simply?</p>
            </div>

            <div className={`lp-typing${chatStep === 2 ? ' is-on' : ''}`}>
              <span />
              <span />
              <span />
            </div>

            <div className={`lp-bubble lp-bubble-ai${chatStep >= 3 ? ' is-on' : ''}`}>
              <span className="lp-bubble-label">{BRAND.name}</span>
              <p>
                It usually means blood pressure that stays higher than typical ranges — educational
                wording, not a diagnosis.
              </p>
              <div className="lp-bubble-actions">
                <span>Explain more simply</span>
                <span>What should I ask?</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lp-product-composer">
          <span>Ask a health question…</span>
          <span className="lp-product-send" aria-hidden="true">
            →
          </span>
        </div>
      </div>

      <ul className="lp-product-badges">
        <li className="lp-badge lp-badge-a">
          <span className="lp-badge-icon" aria-hidden="true">
            +
          </span>
          Plain-language care
        </li>
        <li className="lp-badge lp-badge-b">
          <span className="lp-badge-icon" aria-hidden="true">
            ◇
          </span>
          5 languages
        </li>
        <li className="lp-badge lp-badge-c">
          <span className="lp-badge-icon" aria-hidden="true">
            ▤
          </span>
          Report explanations
        </li>
      </ul>
    </div>
  )
}
