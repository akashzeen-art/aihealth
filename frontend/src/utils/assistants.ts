import type { AssistantType } from '../types'

export type AssistantSlug =
  | 'health'
  | 'symptom-checker'
  | 'mother-baby'
  | 'child-health'
  | 'medication'
  | 'mental-wellness'
  | 'nutrition'
  | 'diabetes'
  | 'blood-pressure'
  | 'fitness'
  | 'first-aid'
  | 'translator'
  | 'document-reader'
  | 'doctor-finder'
  | 'reminders'

export interface AssistantTool {
  label: string
  to: string
}

export interface AssistantCatalogItem {
  id: AssistantType
  slug: AssistantSlug
  name: string
  description: string
  target: string
  iconKey: string
  accent: string
  supportsDocuments?: boolean
  showEmergencyWarning?: boolean
  tool?: AssistantTool
  safetyInfo: string
}

const REMINDERS_TOOL: AssistantTool = { label: 'Open reminders', to: '/reminders' }

export const ASSISTANT_CATALOG: AssistantCatalogItem[] = [
  {
    id: 'HEALTH',
    slug: 'health',
    name: 'Health Assistant',
    description:
      'Answers general health questions and guides you toward appropriate care.',
    target: 'Everyone',
    iconKey: 'heart-pulse',
    accent: 'teal',
    safetyInfo:
      'Educational guidance only — not a diagnosis. Seek a clinician for personal medical decisions.',
  },
  {
    id: 'SYMPTOM_CHECKER',
    slug: 'symptom-checker',
    name: 'Symptom Checker',
    description:
      'Describe your symptoms to explore possible causes and how urgently to seek care.',
    target: 'Everyone',
    iconKey: 'stethoscope',
    accent: 'coral',
    showEmergencyWarning: true,
    safetyInfo:
      'Possible causes are educational, not a diagnosis. Emergency signs need emergency services now.',
  },
  {
    id: 'MOTHER_BABY',
    slug: 'mother-baby',
    name: 'Mother & Baby',
    description:
      'Pregnancy, newborn, breastfeeding and parenting education with clear care escalation.',
    target: 'Mothers',
    iconKey: 'baby',
    accent: 'rose',
    safetyInfo:
      'General education only. Urgent pregnancy or newborn concerns need a qualified clinician right away.',
  },
  {
    id: 'CHILD_HEALTH',
    slug: 'child-health',
    name: 'Child Health',
    description:
      'General child-health guidance, growth and development education, and vaccination reminders.',
    target: 'Parents',
    iconKey: 'child',
    accent: 'sky',
    tool: { label: 'Vaccination reminders', to: '/reminders#vaccination' },
    safetyInfo:
      'General education only. A sick or unusually drowsy child should be seen by a clinician promptly.',
  },
  {
    id: 'MEDICATION',
    slug: 'medication',
    name: 'Medication Assistant',
    description:
      'Explains what medicines are for, how to keep a schedule, and helps set dose reminders.',
    target: 'Patients',
    iconKey: 'pill',
    accent: 'slate',
    tool: { label: 'Medication reminders', to: '/reminders#medication' },
    safetyInfo:
      'Never change a dose or stop a medicine without your doctor or pharmacist.',
  },
  {
    id: 'MENTAL_WELLNESS',
    slug: 'mental-wellness',
    name: 'Mental Wellness',
    description:
      'Supportive conversations about stress, sleep, mindfulness and emotional wellbeing.',
    target: 'Youth & adults',
    iconKey: 'mind',
    accent: 'sky',
    safetyInfo:
      'Not therapy or crisis care. If you may harm yourself or others, contact emergency services or a crisis line now.',
  },
  {
    id: 'NUTRITION',
    slug: 'nutrition',
    name: 'Nutrition Coach',
    description:
      'Personalized healthy eating guidance using local foods, preferences and cultural eating patterns.',
    target: 'Everyone',
    iconKey: 'apple',
    accent: 'leaf',
    safetyInfo:
      'Not a therapeutic diet prescription. Confirm allergy or medical diet needs with a professional.',
  },
  {
    id: 'DIABETES',
    slug: 'diabetes',
    name: 'Diabetes Coach',
    description:
      'Lifestyle education, glucose logging with trend explanations, and reminders.',
    target: 'People with diabetes',
    iconKey: 'drop',
    accent: 'coral',
    tool: { label: 'Open glucose log', to: '/tracker?tab=glucose' },
    safetyInfo:
      'Does not adjust insulin or medicines. Very high or low readings with symptoms need urgent care.',
  },
  {
    id: 'BLOOD_PRESSURE',
    slug: 'blood-pressure',
    name: 'Blood Pressure Coach',
    description:
      'Log blood pressure readings, understand your trends, and set measurement reminders.',
    target: 'Adults',
    iconKey: 'gauge',
    accent: 'rose',
    tool: { label: 'Open BP log', to: '/tracker?tab=bp' },
    safetyInfo:
      'Readings of 180/120 or higher, especially with symptoms, need urgent medical care.',
  },
  {
    id: 'FITNESS',
    slug: 'fitness',
    name: 'Fitness Coach',
    description:
      'Personalized exercise plans that match your goals, fitness level and available time.',
    target: 'Young adults',
    iconKey: 'dumbbell',
    accent: 'leaf',
    safetyInfo:
      'Stop exercising and seek care for chest pain, fainting or severe breathlessness.',
  },
  {
    id: 'FIRST_AID',
    slug: 'first-aid',
    name: 'First-Aid Guide',
    description:
      'Step-by-step educational first-aid: safety first, clear steps, and when to seek urgent help.',
    target: 'Everyone',
    iconKey: 'cross',
    accent: 'coral',
    showEmergencyWarning: true,
    safetyInfo:
      'For life-threatening emergencies, call local emergency services immediately before using this guide.',
  },
  {
    id: 'TRANSLATOR',
    slug: 'translator',
    name: 'Health Translator',
    description:
      'Explains medical terms in plain language with optional translation (EN, HI, FR, SW, AR).',
    target: 'Everyone',
    iconKey: 'languages',
    accent: 'sky',
    safetyInfo:
      'Translations are educational. Clinical meaning should be confirmed with your care team.',
  },
  {
    id: 'DOCUMENT_READER',
    slug: 'document-reader',
    name: 'Document Reader',
    description: 'Explains medical reports and prescriptions in simple language.',
    target: 'Patients',
    iconKey: 'file-text',
    accent: 'slate',
    supportsDocuments: true,
    safetyInfo:
      'Explanations may be incomplete if text extraction fails. Never invent values that are not in the document.',
  },
  {
    id: 'DOCTOR_FINDER',
    slug: 'doctor-finder',
    name: 'Doctor Finder',
    description:
      'Helps you work out which type of healthcare professional or service to see for your concern.',
    target: 'Everyone',
    iconKey: 'compass',
    accent: 'teal',
    safetyInfo:
      'Suggestions are general. Emergencies go to emergency services, not a routine appointment.',
  },
  {
    id: 'REMINDERS',
    slug: 'reminders',
    name: 'Health Reminder',
    description:
      'Plan medication, appointment and vaccination reminders for you and your family.',
    target: 'Patients & families',
    iconKey: 'bell',
    accent: 'slate',
    tool: REMINDERS_TOOL,
    safetyInfo:
      'Reminders work while CareGuide is open in your browser — keep a backup alarm for critical doses.',
  },
]

const ACCEPTED_DOCUMENT_TYPES =
  '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png'

export const DOCUMENT_UPLOAD_ACCEPT = ACCEPTED_DOCUMENT_TYPES

export function isAllowedMedicalDocument(file: File): boolean {
  const name = file.name.toLowerCase()
  const type = (file.type || '').toLowerCase()
  return (
    type === 'application/pdf' ||
    type === 'image/jpeg' ||
    type === 'image/jpg' ||
    type === 'image/png' ||
    name.endsWith('.pdf') ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.png')
  )
}

const slugMap = Object.fromEntries(
  ASSISTANT_CATALOG.map((a) => [a.slug, a]),
) as Record<AssistantSlug, AssistantCatalogItem>

const idMap = Object.fromEntries(
  ASSISTANT_CATALOG.map((a) => [a.id, a]),
) as Record<AssistantType, AssistantCatalogItem>

export function isAssistantSlug(value: string): value is AssistantSlug {
  return value in slugMap
}

export function getAssistantBySlug(slug: string): AssistantCatalogItem | undefined {
  return isAssistantSlug(slug) ? slugMap[slug] : undefined
}

export function getAssistantById(id: string): AssistantCatalogItem | undefined {
  const normalized = normalizeAssistantType(id) || id
  const known = idMap[normalized as keyof typeof idMap]
  if (known) return known
  // Future assistants: synthesize metadata from API id until frontend catalog is extended
  if (!id) return undefined
  const slug = id.trim().toLowerCase().replace(/_/g, '-') as AssistantSlug
  return {
    id: id.toUpperCase().replace(/-/g, '_'),
    slug,
    name: id.replace(/[_-]/g, ' '),
    description: 'Educational CareGuide companion.',
    target: 'Everyone',
    iconKey: 'heart-pulse',
    accent: 'teal',
    safetyInfo: 'Educational guidance only — not a diagnosis.',
  }
}

export function normalizeAssistantType(value: string): string | null {
  const upper = value.trim().toUpperCase().replace(/-/g, '_')
  const code = upper === 'HEALTH_ASSISTANT' ? 'HEALTH' : upper
  if (code in idMap) return code
  return code || null
}

/** Short form of a conversation id for URLs; older `conv_<uuid>` ids use their first 8 characters. */
export function conversationUrlId(id: string): string {
  return id.startsWith('conv_') ? id.slice(5, 13) : id
}

export function assistantPath(slug: AssistantSlug, conversationId?: string): string {
  return conversationId
    ? `/assistant/${slug}/${conversationUrlId(conversationId)}`
    : `/assistant/${slug}`
}

export const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'fr', label: 'French' },
  { code: 'sw', label: 'Swahili' },
  { code: 'ar', label: 'Arabic' },
] as const
