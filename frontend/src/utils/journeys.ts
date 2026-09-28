import type { AssistantSlug } from './assistants'

export interface GuidedJourney {
  id: string
  title: string
  blurb: string
  assistantSlug: AssistantSlug
  starter: string
  accent: string
}

/** Short educational paths — not clinical protocols. */
export const GUIDED_JOURNEYS: GuidedJourney[] = [
  {
    id: 'lab-terms',
    title: 'Understanding lab terms',
    blurb: 'Learn what common report words mean in plain language.',
    assistantSlug: 'health',
    starter:
      'Help me understand common lab report terms in simple language. What should I ask my clinician about?',
    accent: 'teal',
  },
  {
    id: 'clinician-questions',
    title: 'Questions for my clinician',
    blurb: 'Build a short list of clear questions before an appointment.',
    assistantSlug: 'health',
    starter:
      'Help me prepare 5 clear questions I could ask a clinician about a health topic I am learning about.',
    accent: 'sky',
  },
  {
    id: 'fever-ask',
    title: 'Child fever — what to ask',
    blurb: 'Educational prompts for caregivers — not emergency care.',
    assistantSlug: 'mother-baby',
    starter:
      'What educational questions should a caregiver ask a clinician about a child with fever? Include when to seek urgent care.',
    accent: 'rose',
  },
  {
    id: 'rx-label',
    title: 'Reading a prescription label',
    blurb: 'Practice reading labels carefully with educational guidance.',
    assistantSlug: 'document-reader',
    starter:
      'Explain how to read a prescription label carefully in plain language. What should I double-check with a pharmacist?',
    accent: 'slate',
  },
  {
    id: 'local-foods',
    title: 'Healthy eating with local foods',
    blurb: 'Explore balanced meals using foods available near you.',
    assistantSlug: 'nutrition',
    starter:
      'Suggest educational tips for balanced meals using common local foods. Keep it general — not a medical diet plan.',
    accent: 'leaf',
  },
  {
    id: 'first-aid-basics',
    title: 'First-aid basics education',
    blurb: 'Learn when to act, when to call for help, and what to ask.',
    assistantSlug: 'first-aid',
    starter:
      'Teach me educational first-aid basics: safety first, when to call emergency services, and what to prepare for responders.',
    accent: 'coral',
  },
]
