import RevealSection from './RevealSection'

const STEPS = [
  {
    n: '01',
    title: 'Ask',
    copy: 'Start with a health-information question in your own words.',
  },
  {
    n: '02',
    title: 'Understand',
    copy: 'Explore a structured educational explanation in clearer language.',
  },
  {
    n: '03',
    title: 'Explore',
    copy: 'Continue with follow-up questions, assistants, or documents.',
  },
] as const

export default function HowItWorks() {
  return (
    <RevealSection id="how-it-works" variant="fade-up" className="lp-section lp-how">
      <div className="lp-shell">
        <header className="lp-section-head">
          <p className="lp-eyebrow">How it works</p>
          <h2>Three calm steps from question to clarity</h2>
        </header>

        <ol className="lp-how-steps">
          {STEPS.map((step) => (
            <li key={step.n}>
              <span className="lp-how-num">{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </li>
          ))}
        </ol>
      </div>
    </RevealSection>
  )
}
