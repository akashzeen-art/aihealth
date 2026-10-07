import { Link } from 'react-router-dom'
import { BRAND } from '../brand'
import { EducationalDisclaimer, TrustSignals } from '../components/ai/SafetyPrimitives'
import AiPresence from '../components/ai/AiPresence'

const STEPS = [
  { title: 'Question', copy: 'You bring a health topic you want to understand.' },
  { title: 'Understand', copy: 'Care+ clarifies language and context.' },
  { title: 'Explore', copy: 'Specialized companions match the kind of question.' },
  { title: 'Learn', copy: 'Plain-language education with clear boundaries.' },
  { title: 'Next step', copy: 'Know when to ask a clinician or seek urgent care.' },
] as const

export default function AboutPage() {
  return (
    <div className="page-pad animate-fade-up prose-page cg-about">
      <header className="page-header">
        <p className="eyebrow">Product philosophy</p>
        <div className="cg-about-hero">
          <AiPresence state="idle" size="md" />
          <div>
            <h1>About {BRAND.name}</h1>
            <p className="muted">{BRAND.shortDescription}</p>
          </div>
        </div>
      </header>

      <EducationalDisclaimer>
        {BRAND.name} provides educational health information. It is not a diagnosis, treatment plan,
        or emergency service.
      </EducationalDisclaimer>

      <section className="cg-about-journey" aria-label="How Care+ helps">
        <h2>How understanding unfolds</h2>
        <ol className="cg-about-steps">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <span className="cg-about-step-num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{s.title}</h3>
              <p>{s.copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2>What we build</h2>
        <p>
          {BRAND.name} is a multi-companion platform covering general health education, first-aid
          guidance, mother &amp; baby topics, nutrition with local foods, medical terminology
          translation, and medical document explanation.
        </p>
      </section>

      <section>
        <h2>Safety first</h2>
        <p>
          Responses are educational. Companions ask clarifying questions, avoid false certainty, and
          escalate emergencies toward local emergency services. Read our{' '}
          <Link to="/safety">safety disclaimers</Link> before chatting.
        </p>
      </section>

      <TrustSignals />

      <section>
        <h2>Get started</h2>
        <p>
          <Link to="/" className="btn btn-primary btn-sm">
            Open Care+
          </Link>{' '}
          — no account needed. <Link to="/signup">Sign up</Link> if you want Care+ to know your
          name, language and country. Everything stays in this browser.
        </p>
      </section>
    </div>
  )
}
