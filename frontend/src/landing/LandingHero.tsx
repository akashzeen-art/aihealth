import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import ProductPreview from './ProductPreview'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useScrollScene } from '../hooks/useScrollScene'
import { usePointerParallax } from '../hooks/usePointerParallax'

export default function LandingHero() {
  const heroRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  useScrollScene(heroRef, !reduced)
  usePointerParallax(heroRef, !reduced, 0.55)

  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const id = window.requestAnimationFrame(() => {
      el.classList.add('is-ready')
    })
    return () => window.cancelAnimationFrame(id)
  }, [])

  return (
    <section
      ref={heroRef}
      className={`lp-hero lp-hero-health lp-hero-fx lp-hero-clean lp-hero-parallax${reduced ? ' is-ready prefers-reduced' : ''}`}
      aria-labelledby="landing-headline"
    >
      <div className="lp-hero-bg" aria-hidden="true" data-parallax="far">
        <span className="lp-hero-orb lp-hero-orb-a" />
        <span className="lp-hero-orb lp-hero-orb-b" />
        <span className="lp-hero-orb lp-hero-orb-c" />
        <span className="lp-hero-grid-fade" />
      </div>

      <div className="lp-shell lp-hero-grid">
        <div className="lp-hero-copy" data-parallax="mid">
          <p className="lp-eyebrow lp-hero-in" style={{ ['--d' as string]: '0ms' }}>
            <span className="lp-eyebrow-dot" aria-hidden="true" />
            Care+
          </p>
          <h1 id="landing-headline" className="lp-hero-in" style={{ ['--d' as string]: '70ms' }}>
            Clearer answers
            <span className="lp-hero-break">
              for health <em>questions.</em>
            </span>
          </h1>
          <p className="lp-hero-lead lp-hero-in" style={{ ['--d' as string]: '140ms' }}>
            Plain-language health education — with safety built in.
          </p>

          <div className="lp-hero-actions lp-hero-in" style={{ ['--d' as string]: '220ms' }}>
            <Link to="/dashboard" className="lp-btn lp-btn-primary lp-btn-shine">
              Get Started
            </Link>
            <a href="#assistants" className="lp-btn lp-btn-secondary">
              Explore Assistants
              <span className="lp-btn-arrow" aria-hidden="true">
                →
              </span>
            </a>
          </div>
          <p className="lp-hero-safety lp-hero-in" style={{ ['--d' as string]: '300ms' }}>
            Not a doctor or emergency service
          </p>
        </div>

        <div className="lp-hero-visual" data-parallax="near">
          <ProductPreview />
        </div>
      </div>

      <a href="#clarity" className="lp-hero-scroll" aria-label="Scroll to next section">
        <span />
        Explore
      </a>
    </section>
  )
}
