import RevealSection from './RevealSection'

export default function ClaritySection() {
  return (
    <RevealSection id="clarity" variant="fade-up" className="lp-section lp-clarity">
      <div className="lp-shell lp-clarity-inner">
        <h2 className="lp-clarity-statement">
          Health information can be difficult to understand.
          <span>CareGuide helps you explore it more clearly.</span>
        </h2>

        <ol className="lp-transform" aria-label="How understanding improves">
          <li>
            <span className="lp-transform-label">Complex information</span>
            <p>Dense terms, mixed documents, and unfamiliar wording.</p>
          </li>
          <li className="lp-transform-arrow" aria-hidden="true">
            →
          </li>
          <li>
            <span className="lp-transform-label">Simplified explanation</span>
            <p>Plain-language educational guidance you can follow.</p>
          </li>
          <li className="lp-transform-arrow" aria-hidden="true">
            →
          </li>
          <li>
            <span className="lp-transform-label">Follow-up question</span>
            <p>Continue exploring, or prepare questions for a clinician.</p>
          </li>
        </ol>
      </div>
    </RevealSection>
  )
}
