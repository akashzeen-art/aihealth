import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { ASSISTANT_CATALOG, assistantPath, type AssistantSlug } from '../utils/assistants'
import { getExperience } from '../utils/assistantExperience'
import { BRAND } from '../brand'
import RevealSection from './RevealSection'

const SAMPLES: Partial<Record<AssistantSlug, { user: string; assistant: string }>> = {
  health: {
    user: 'Can you explain this simply?',
    assistant: "Let's break the information down into clearer language — and note what to ask a clinician.",
  },
  'first-aid': {
    user: 'What should I know about first-aid safety?',
    assistant:
      'Educational overview: keep the scene safe, follow clear steps, and know when to seek urgent help.',
  },
  'mother-baby': {
    user: 'Explain a pregnancy-related term simply.',
    assistant:
      'Here is a calmer educational explanation of the wording, with a reminder to confirm personal advice with a clinician.',
  },
  nutrition: {
    user: 'Give me simple meal ideas.',
    assistant:
      'Practical educational meal ideas using everyday foods — not a medical diet plan.',
  },
  translator: {
    user: 'Explain this medical term.',
    assistant:
      'Meaning → simple explanation → why clinicians use the term → what it does not automatically mean.',
  },
  'document-reader': {
    user: 'Explain this document simply.',
    assistant:
      'Based on extracted text: what the document appears to say, key lines present, and questions for your clinician.',
  },
}

export default function AssistantShowcase() {
  const [slug, setSlug] = useState<AssistantSlug>('health')
  const baseId = useId()
  const selected = ASSISTANT_CATALOG.find((a) => a.slug === slug)!
  const experience = getExperience(slug)
  const sample = SAMPLES[slug] ?? {
    user: experience.starters[0],
    assistant: selected.description,
  }

  return (
    <RevealSection id="assistants" variant="fade-up" className="lp-section lp-assistants">
      <div className="lp-shell">
        <header className="lp-section-head">
          <p className="lp-eyebrow">Assistants</p>
          <h2>Choose how you&apos;d like to explore</h2>
          <p className="lp-section-lead">
            Each CareGuide assistant supports a different kind of health-information journey — with
            the same educational boundaries.
          </p>
        </header>

        <div className="lp-assist-layout">
          <div
            className="lp-assist-list"
            role="tablist"
            aria-orientation="vertical"
            aria-label="CareGuide assistants"
          >
            {ASSISTANT_CATALOG.map((a) => {
              const active = a.slug === slug
              return (
                <button
                  key={a.id}
                  type="button"
                  role="tab"
                  id={`${baseId}-tab-${a.slug}`}
                  aria-selected={active}
                  aria-controls={`${baseId}-panel`}
                  className={`lp-assist-item${active ? ' is-active' : ''}`}
                  onClick={() => setSlug(a.slug)}
                  onFocus={() => setSlug(a.slug)}
                >
                  <strong>{a.name}</strong>
                  <span>{getExperience(a.slug).purpose}</span>
                </button>
              )
            })}
          </div>

          <div
            className="lp-assist-preview"
            role="tabpanel"
            id={`${baseId}-panel`}
            aria-labelledby={`${baseId}-tab-${slug}`}
          >
            <p className="lp-assist-kicker">{experience.purpose}</p>
            <h3>{selected.name}</h3>
            <p className="lp-assist-desc">{selected.description}</p>

            <div className="lp-mini-chat" aria-label="Sample conversation">
              <div className="lp-mini-user">
                <span>You</span>
                <p>{sample.user}</p>
              </div>
              <div className="lp-mini-ai">
                <span>{BRAND.name}</span>
                <p>{sample.assistant}</p>
              </div>
            </div>

            <p className="lp-assist-safety">{selected.safetyInfo}</p>

            <div className="lp-assist-actions">
              <Link to={assistantPath(selected.slug)} className="lp-btn lp-btn-primary">
                Explore assistant
              </Link>
              <Link to="/assistants" className="lp-btn lp-btn-secondary">
                Ask another question
              </Link>
            </div>
          </div>
        </div>
      </div>
    </RevealSection>
  )
}
