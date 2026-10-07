import type { AssistantSlug } from './assistants'

export interface AssistantExperience {
  purpose: string
  emptyTitle: string
  starters: string[]
  chips: string[]
  followUps: string[]
  processing: string
}

export const ASSISTANT_EXPERIENCE: Record<AssistantSlug, AssistantExperience> = {
  health: {
    purpose: 'General health education',
    emptyTitle: "Let's explore your health question.",
    starters: [
      'Explain a health term simply',
      'Help me understand some health information',
      'What questions could I ask a clinician?',
    ],
    chips: ['Explain simply', 'Summarize', 'What does this mean?'],
    followUps: [
      'Explain that more simply',
      'What should I ask a clinician?',
      'Give me an example',
    ],
    processing: 'Preparing an educational explanation…',
  },
  'first-aid': {
    purpose: 'Educational first-aid guidance',
    emptyTitle: 'Start with what happened — we will organize clear steps.',
    starters: [
      'Explain basic first-aid information',
      'What should I know about first-aid safety?',
      'When should emergency help be considered?',
    ],
    chips: ['Immediate steps', 'What NOT to do', 'When to seek help'],
    followUps: [
      'Show the steps as a checklist',
      'When should I seek urgent help?',
      'Explain that more simply',
    ],
    processing: 'Organizing the safety information…',
  },
  'mother-baby': {
    purpose: 'Pregnancy & early-care education',
    emptyTitle: 'Ask about pregnancy, newborn, or parenting topics.',
    starters: [
      'Explain a pregnancy-related term',
      'Help me understand newborn information',
      'Explain a parenting topic simply',
    ],
    chips: ['Explain gently', 'Warning signs', 'Questions for clinician'],
    followUps: [
      'What warning signs matter here?',
      'Explain that more simply',
      'What should I ask a clinician?',
    ],
    processing: 'Preparing an educational response…',
  },
  nutrition: {
    purpose: 'Healthy eating education',
    emptyTitle: 'Explore meals, labels, and nutrition terms.',
    starters: [
      'Explain a nutrition term',
      'Give me simple meal ideas',
      'Help me understand food information',
    ],
    chips: ['Meal ideas', 'Easy swaps', 'Explain simply'],
    followUps: [
      'Suggest another meal idea',
      'Explain that more simply',
      'Show me easy swaps',
    ],
    processing: 'Preparing practical information…',
  },
  translator: {
    purpose: 'Plain-language medical terms',
    emptyTitle: 'Paste a term or phrase to make it clearer.',
    starters: [
      'Explain this medical term',
      'Simplify this sentence',
      'Translate this health information',
    ],
    chips: ['Explain simply', 'Translate', 'Simplify'],
    followUps: [
      'Translate this',
      'Explain that more simply',
      'Show a short example sentence',
    ],
    processing: 'Preparing a plain-language explanation…',
  },
  'document-reader': {
    purpose: 'Document explanation',
    emptyTitle: 'Upload a report, then ask what it appears to say.',
    starters: [
      'Explain this document simply',
      'Help me understand a section',
      'Explain unfamiliar terms',
    ],
    chips: ['Explain simply', 'Key findings', 'What to ask clinician'],
    followUps: [
      'Explain unfamiliar terms',
      'What should I ask a clinician?',
      'Summarize in fewer sentences',
    ],
    processing: 'Reviewing the document content…',
  },
  'symptom-checker': {
    purpose: 'Possible causes & urgency guidance',
    emptyTitle: 'Describe what you are feeling — we will ask a few questions first.',
    starters: [
      'I have had a headache and fever for two days',
      'My child has a cough and runny nose',
      'I feel dizzy when I stand up',
    ],
    chips: ['How urgent is this?', 'Possible causes', 'Who should I see?'],
    followUps: [
      'How urgent is this?',
      'What signs mean I should go sooner?',
      'What can I do at home for now?',
    ],
    processing: 'Checking urgency and possible causes…',
  },
  'child-health': {
    purpose: 'Child health & vaccinations',
    emptyTitle: "Ask about your child's health, growth, or vaccinations.",
    starters: [
      'My 2-year-old has a fever — what should I watch for?',
      'Why are childhood vaccinations important?',
      'What milestones are typical at 12 months?',
    ],
    chips: ['Warning signs', 'Home care', 'Vaccination reminders'],
    followUps: [
      'When should I see a doctor?',
      'How do I set vaccination reminders?',
      'Explain that more simply',
    ],
    processing: 'Preparing child-health guidance…',
  },
  medication: {
    purpose: 'Medicine information & schedules',
    emptyTitle: 'Ask about a medicine or build your dose schedule.',
    starters: [
      'What is metformin usually used for?',
      'Help me plan a schedule for twice-daily tablets',
      'Tips so I never miss a dose',
    ],
    chips: ['Side effects', 'Make a schedule', 'Ask my pharmacist'],
    followUps: [
      'Turn this into reminders',
      'What should I ask my pharmacist?',
      'Explain that more simply',
    ],
    processing: 'Looking up medicine information…',
  },
  'mental-wellness': {
    purpose: 'Stress, sleep & emotional support',
    emptyTitle: "This is a calm space. What's on your mind today?",
    starters: [
      'I feel stressed and overwhelmed lately',
      "I can't fall asleep at night",
      'Guide me through a short breathing exercise',
    ],
    chips: ['Breathing exercise', 'Sleep tips', 'Just listen'],
    followUps: [
      'Can you guide me through that step by step?',
      'Give me another idea',
      'When should I talk to a professional?',
    ],
    processing: 'Thinking this through with you…',
  },
  diabetes: {
    purpose: 'Diabetes lifestyle & glucose trends',
    emptyTitle: 'Ask about diabetes, or have your glucose log explained.',
    starters: [
      'Explain my glucose log trends',
      'What should a diabetes-friendly breakfast look like?',
      'What should I do if my sugar goes low?',
    ],
    chips: ['Explain my readings', 'Meal ideas', 'Low sugar steps'],
    followUps: [
      'Explain my recent readings',
      'What should I ask my care team?',
      'Suggest reminders for checking glucose',
    ],
    processing: 'Reviewing your glucose information…',
  },
  'blood-pressure': {
    purpose: 'BP logging & trend explanations',
    emptyTitle: 'Log readings in the BP tracker, then ask me what they mean.',
    starters: [
      'Explain my blood pressure trends',
      'How do I measure BP correctly at home?',
      'Lifestyle changes that help lower BP',
    ],
    chips: ['Explain my trend', 'Measure correctly', 'Lower salt tips'],
    followUps: [
      'Explain my latest readings',
      'What should I ask my doctor?',
      'Suggest a measurement reminder schedule',
    ],
    processing: 'Reviewing your blood pressure log…',
  },
  fitness: {
    purpose: 'Personalized exercise plans',
    emptyTitle: 'Tell me your goal and time — I will build a plan.',
    starters: [
      'Make me a 3-day home workout plan for beginners',
      'I want to build stamina for running',
      'A 20-minute routine with no equipment',
    ],
    chips: ['Weekly plan', 'No equipment', 'Beginner friendly'],
    followUps: [
      'Make it a little harder',
      'Swap exercises I can do at home',
      'How do I progress next week?',
    ],
    processing: 'Building your exercise plan…',
  },
  'doctor-finder': {
    purpose: 'Which professional to see',
    emptyTitle: 'Describe your concern — I will suggest the right kind of care.',
    starters: [
      'Which doctor should I see for skin rashes?',
      'I have knee pain after running — who do I see?',
      'Do I need a specialist for thyroid problems?',
    ],
    chips: ['Who should I see?', 'Do I need a referral?', 'How to prepare'],
    followUps: [
      'How should I prepare for the appointment?',
      'What questions should I ask?',
      'Is this urgent?',
    ],
    processing: 'Matching your concern to the right care…',
  },
  reminders: {
    purpose: 'Medication, appointment & vaccine reminders',
    emptyTitle: 'Tell me what you need to remember — I will plan the reminders.',
    starters: [
      'Plan reminders for tablets at 8am and 8pm',
      'Review my current reminders',
      'What reminders help after a doctor visit?',
    ],
    chips: ['Plan reminders', 'Review my reminders', 'Family reminders'],
    followUps: [
      'How do I add these in Care+?',
      'Add a refill reminder too',
      'Summarize my day',
    ],
    processing: 'Planning your reminders…',
  },
}

export function getExperience(slug: string): AssistantExperience {
  return (
    ASSISTANT_EXPERIENCE[slug as AssistantSlug] ?? ASSISTANT_EXPERIENCE.health
  )
}

export function languageLabel(code: string): string {
  const map: Record<string, string> = {
    en: 'English',
    hi: 'Hindi',
    fr: 'French',
    sw: 'Swahili',
    ar: 'Arabic',
  }
  return map[code] || code
}

export function greetingForNow(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function groupConversationsByDay<T extends { updatedAt: string }>(
  items: T[],
): { label: string; items: T[] }[] {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const today = startOfDay(new Date())
  const yesterday = today - 86400000
  const weekAgo = today - 6 * 86400000
  const buckets: Record<string, T[]> = {
    TODAY: [],
    YESTERDAY: [],
    'THIS WEEK': [],
    EARLIER: [],
  }

  for (const item of items) {
    const t = startOfDay(new Date(item.updatedAt))
    if (t === today) buckets.TODAY.push(item)
    else if (t === yesterday) buckets.YESTERDAY.push(item)
    else if (t >= weekAgo) buckets['THIS WEEK'].push(item)
    else buckets.EARLIER.push(item)
  }

  return (['TODAY', 'YESTERDAY', 'THIS WEEK', 'EARLIER'] as const)
    .filter((k) => buckets[k].length > 0)
    .map((label) => ({ label, items: buckets[label] }))
}

export function dayAtmosphere(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

export function profileInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'CG'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export function displayConversationTitle(title: string, assistantName?: string): string {
  const t = title?.trim()
  if (!t || t === 'New chat') {
    return assistantName ? `${assistantName} conversation` : 'Untitled conversation'
  }
  return t
}
