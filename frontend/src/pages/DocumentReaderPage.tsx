import { Link } from 'react-router-dom'
import DocumentsPage from './DocumentsPage'
import { EducationalDisclaimer } from '../components/ai/SafetyPrimitives'

const FLOW = [
  { step: '01', label: 'Upload', hint: 'PDF or image' },
  { step: '02', label: 'Extract', hint: 'Readable text' },
  { step: '03', label: 'Explain', hint: 'Plain language' },
] as const

/** Document → Extract → Explain workspace */
export default function DocumentReaderPage() {
  return (
    <div className="page-pad cg-docs-page animate-fade-up">
      <div className="cg-docs-glow" aria-hidden="true" />

      <header className="cg-docs-hero">
        <p className="cg-docs-kicker">
          <span className="cg-docs-kicker-dot" aria-hidden="true" />
          Document workspace
        </p>
        <h1>Understand a document clearly</h1>
        <p className="cg-docs-lead">
          Upload a blood report, prescription, lab report, or discharge summary. Text is extracted
          in your browser when possible — then explore a plain-language educational explanation.
        </p>
      </header>

      <ol className="cg-docs-flow" aria-label="How Document Reader works">
        {FLOW.map((item, i) => (
          <li key={item.step} className="cg-docs-flow-item">
            <span className="cg-docs-flow-step">{item.step}</span>
            <span className="cg-docs-flow-copy">
              <strong>{item.label}</strong>
              <span>{item.hint}</span>
            </span>
            {i < FLOW.length - 1 ? (
              <span className="cg-docs-flow-arrow" aria-hidden="true">
                →
              </span>
            ) : null}
          </li>
        ))}
      </ol>

      <EducationalDisclaimer>
        Based on the text available. Some content may not have been extracted correctly. Review the
        original document for exact wording. This is not a clinical validation.
      </EducationalDisclaimer>

      <div className="cg-docs-grid">
        <section className="cg-docs-pane" aria-labelledby="doc-upload-heading">
          <div className="cg-docs-pane-head">
            <h2 id="doc-upload-heading">Source document</h2>
            <p>Your file stays local to this browser profile.</p>
          </div>
          <DocumentsPage embedded />
        </section>

        <aside className="cg-docs-pane cg-docs-aside" aria-labelledby="doc-explain-heading">
          <div className="cg-docs-pane-head">
            <h2 id="doc-explain-heading">Next: explain</h2>
            <p>Continue in chat after upload. Source text stays separate from AI wording.</p>
          </div>

          <ul className="cg-docs-aside-list">
            <li>Upload PDF, JPG, or PNG</li>
            <li>Preview extracted text</li>
            <li>Ask for a simple explanation</li>
          </ul>

          <Link
            to="/assistant/document-reader"
            state={{ suggestExplain: true }}
            className="cg-btn cg-btn-primary cg-btn-block"
          >
            Continue in chat
            <span aria-hidden="true">→</span>
          </Link>

          <Link to="/assistants" className="cg-btn cg-btn-ghost cg-btn-block">
            Browse other assistants
          </Link>
        </aside>
      </div>
    </div>
  )
}
