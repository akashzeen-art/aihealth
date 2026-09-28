import ClaritySection from './ClaritySection'
import FeatureCards from './FeatureCards'
import HowItWorks from './HowItWorks'
import AssistantShowcase from './AssistantShowcase'
import DocumentShowcase from './DocumentShowcase'
import LanguageShowcase from './LanguageShowcase'
import SafetySection from './SafetySection'
import FinalCTA from './FinalCTA'

export default function LandingStory() {
  return (
    <div className="lp-story">
      <ClaritySection />
      <FeatureCards />
      <HowItWorks />
      <AssistantShowcase />
      <DocumentShowcase />
      <LanguageShowcase />
      <SafetySection />
      <FinalCTA />
    </div>
  )
}
