import RevealSection from './RevealSection'

export default function DocumentShowcase() {
  return (
    <RevealSection id="documents" variant="fade-up" className="lp-section lp-docs">
      <div className="lp-shell">
        <header className="lp-section-head">
          <p className="lp-eyebrow">Document Reader</p>
          <h2>Understand a document in three clear steps</h2>
          <p className="lp-section-lead">
            Upload a report, extract readable text, then explore a plain-language educational
            explanation — visually separate from the source.
          </p>
        </header>

        <div className="lp-docs-flow" aria-hidden="true">
          <span>Document</span>
          <span>→</span>
          <span>Understand</span>
          <span>→</span>
          <span>Explain</span>
        </div>

        <div className="lp-docs-split">
          <article className="lp-docs-source" aria-label="Document preview">
            <header>
              <span className="lp-docs-tag">Source</span>
              <strong>Sample lab summary.pdf</strong>
            </header>
            <div className="lp-docs-lines">
              <span className="w-90" />
              <span className="w-70" />
              <span className="w-80" />
              <span className="w-55" />
              <span className="w-75" />
              <span className="w-60" />
            </div>
            <p className="lp-docs-caption">Extracted text stays linked to the uploaded file.</p>
          </article>

          <article className="lp-docs-explain" aria-label="AI explanation preview">
            <header>
              <span className="lp-docs-tag is-ai">CareGuide</span>
              <strong>Plain-language explanation</strong>
            </header>
            <p>
              Based on the extracted text, here is a clearer educational overview of what the
              document appears to say — and questions you can bring to a clinician.
            </p>
            <ul>
              <li>What the document seems to cover</li>
              <li>Terms that may need clarifying</li>
              <li>What CareGuide does not conclude</li>
            </ul>
            <p className="lp-docs-note">
              Educational only — not clinical validation of values or results.
            </p>
          </article>
        </div>
      </div>
    </RevealSection>
  )
}
