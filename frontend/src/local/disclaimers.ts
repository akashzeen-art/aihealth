import type { DisclaimerResponse } from '../types'

/** Static medical safety config — no backend required. */
export const LOCAL_DISCLAIMERS: DisclaimerResponse = {
  version: '2',
  title: 'Health Safety Disclaimers',
  shortBanner:
    'Not medical advice. CareGuide provides educational information only. For emergencies, contact local emergency services. Always consult a qualified clinician for personal care.',
  onboardingLead:
    'Before you continue, please confirm you understand CareGuide is for education only.',
  acknowledgeLabel: 'I understand — continue',
  principles: [
    'Educational information only — not a diagnosis or treatment plan',
    'Not a substitute for professional medical care',
    'Call local emergency services for life-threatening symptoms',
    'Do not rely on AI for medication dosing decisions',
  ],
  items: [
    'CareGuide assistants share general health education, not personalized medical advice.',
    'AI replies can be incomplete or incorrect — verify important decisions with a clinician.',
    'If you have severe, worsening, or emergency symptoms, seek urgent care immediately.',
    'Document explanations depend on readable uploaded text; missing extraction means paste key lines.',
  ],
  contexts: {
    onboarding: true,
    chat: true,
    assistants: true,
  },
  gatedAssistants: [],
}
