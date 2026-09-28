import { Link } from 'react-router-dom'
import RevealSection from './RevealSection'

export default function SafetySection() {
  return (
    <RevealSection id="safety" variant="fade-up" className="lp-section lp-safety">
      <div className="lp-shell">
        <header className="lp-section-head lp-section-head-center">
          <p className="lp-eyebrow">Safety</p>
          <h2>Helpful information needs clear boundaries.</h2>
        </header>

        <div className="lp-safety-grid">
          <article>
            <h3>CareGuide can</h3>
            <ul>
              <li>Provide general health education</li>
              <li>Offer plain-language explanations</li>
              <li>Explain document text educationally</li>
            </ul>
          </article>
          <article>
            <h3>CareGuide is not</h3>
            <ul>
              <li>A doctor</li>
              <li>A diagnosis tool</li>
              <li>Emergency care</li>
            </ul>
          </article>
          <article>
            <h3>When it matters</h3>
            <p>
              For severe or emergency situations, seek appropriate professional or local emergency
              help.
            </p>
            <Link to="/safety" className="lp-text-link">
              Read full safety information →
            </Link>
          </article>
        </div>
      </div>
    </RevealSection>
  )
}
