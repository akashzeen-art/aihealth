import { useState } from 'react'
import RevealSection from './RevealSection'

const LINES = [
  { code: 'en', dir: 'ltr' as const, label: 'English', text: 'Explain this simply.' },
  { code: 'hi', dir: 'ltr' as const, label: 'Hindi', text: 'इसे आसान भाषा में समझाइए।' },
  { code: 'fr', dir: 'ltr' as const, label: 'French', text: 'Expliquez-le simplement.' },
  { code: 'sw', dir: 'ltr' as const, label: 'Swahili', text: 'Eleza hii kwa urahisi.' },
  { code: 'ar', dir: 'rtl' as const, label: 'Arabic', text: 'اشرح ذلك ببساطة.' },
] as const

export default function LanguageShowcase() {
  const [active, setActive] = useState<(typeof LINES)[number]['code']>('en')
  const current = LINES.find((l) => l.code === active) ?? LINES[0]

  return (
    <RevealSection id="languages" variant="fade-up" className="lp-section lp-lang">
      <div className="lp-shell lp-lang-grid">
        <header className="lp-section-head">
          <p className="lp-eyebrow">Languages</p>
          <h2>Meet people in the language they prefer</h2>
          <p className="lp-section-lead">
            CareGuide can respond in English, Hindi, French, Swahili, or Arabic. Translations are
            educational aids — clinical meaning should still be confirmed with your care team.
          </p>
        </header>

        <div className="lp-lang-panel">
          <div className="lp-lang-tabs" role="tablist" aria-label="Languages">
            {LINES.map((l) => (
              <button
                key={l.code}
                type="button"
                role="tab"
                aria-selected={l.code === active}
                className={l.code === active ? 'is-active' : undefined}
                onClick={() => setActive(l.code)}
              >
                {l.label}
              </button>
            ))}
          </div>

          <div
            className="lp-lang-stage"
            role="tabpanel"
            lang={current.code}
            dir={current.dir}
          >
            <p className="lp-lang-label">{current.label}</p>
            <p className="lp-lang-phrase">{current.text}</p>
          </div>

          <ol className="lp-lang-stack" aria-hidden="true">
            {LINES.map((l) => (
              <li key={l.code} lang={l.code} dir={l.dir}>
                <span>{l.label}</span>
                <strong>{l.text}</strong>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </RevealSection>
  )
}
