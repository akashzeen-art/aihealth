import { Link } from 'react-router-dom'
import ProductPreview from './ProductPreview'
import RevealSection from './RevealSection'

export default function FinalCTA() {
  return (
    <RevealSection variant="fade-up" className="lp-section lp-final">
      <div className="lp-shell lp-final-grid">
        <div className="lp-final-copy">
          <h2>Start with a question.</h2>
          <p>Explore CareGuide and find a clearer way to understand health information.</p>
          <Link to="/dashboard" className="lp-btn lp-btn-primary">
            Get Started →
          </Link>
        </div>
        <div className="lp-final-visual">
          <ProductPreview enableTilt={false} className="is-compact" />
        </div>
      </div>
    </RevealSection>
  )
}
