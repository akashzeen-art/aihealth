/**
 * Educational overview of childhood vaccines from birth to 5 years, based on India's
 * Universal Immunization Programme (UIP) with commonly advised IAP additions.
 * Schedules vary by country and clinic — the child's vaccination card is the source of truth.
 */
export type VaccineStage = {
  id: string
  age: string
  short: string
  /** Days after birth used for dates and reminders. */
  days: number
  national: string[]
  additional: string[]
  note?: string
}

export const VACCINATION_STAGES: VaccineStage[] = [
  {
    id: 'birth',
    age: 'At birth',
    short: 'Birth',
    days: 0,
    national: ['BCG', 'OPV-0 (oral polio)', 'Hepatitis B — birth dose'],
    additional: [],
    note: 'Best given within 24 hours of birth, before leaving hospital.',
  },
  {
    id: '6w',
    age: '6 weeks',
    short: '6 wk',
    days: 42,
    national: [
      'OPV-1',
      'Pentavalent-1 (DPT + Hep B + Hib)',
      'Rotavirus-1',
      'fIPV-1 (injectable polio)',
      'PCV-1 (pneumococcal)',
    ],
    additional: [],
  },
  {
    id: '10w',
    age: '10 weeks',
    short: '10 wk',
    days: 70,
    national: ['OPV-2', 'Pentavalent-2', 'Rotavirus-2'],
    additional: ['IPV-2', 'PCV-2 (in 3-dose private schedules)'],
  },
  {
    id: '14w',
    age: '14 weeks',
    short: '14 wk',
    days: 98,
    national: ['OPV-3', 'Pentavalent-3', 'Rotavirus-3', 'fIPV-2', 'PCV-2'],
    additional: [],
  },
  {
    id: '6m',
    age: '6 months',
    short: '6 mo',
    days: 182,
    national: [],
    additional: ['Influenza — 1st dose (2nd dose after 4 weeks, then yearly till 5 years)', 'Typhoid conjugate (6–9 months)'],
  },
  {
    id: '9m',
    age: '9 months',
    short: '9 mo',
    days: 274,
    national: ['MR-1 (measles-rubella)', 'fIPV-3', 'PCV booster', 'JE-1 (in JE-endemic districts)', 'Vitamin A — 1st dose'],
    additional: ['MMR-1 (instead of MR in private clinics)'],
  },
  {
    id: '12m',
    age: '12 months',
    short: '12 mo',
    days: 365,
    national: [],
    additional: ['Hepatitis A-1'],
  },
  {
    id: '15m',
    age: '15 months',
    short: '15 mo',
    days: 456,
    national: [],
    additional: ['MMR-2', 'Varicella-1 (chickenpox)'],
  },
  {
    id: '16m',
    age: '16–24 months',
    short: '16–24 mo',
    days: 487,
    national: [
      'MR-2',
      'DPT booster-1',
      'OPV booster',
      'JE-2 (in JE-endemic districts)',
      'Vitamin A — 2nd dose (then every 6 months till 5 years)',
    ],
    additional: ['Hib + IPV booster', 'Hepatitis A-2', 'Varicella-2'],
  },
  {
    id: '5y',
    age: '4–6 years',
    short: '4–6 yr',
    days: 1461,
    national: ['DPT booster-2 (at 5–6 years)'],
    additional: ['MMR-3', 'IPV / OPV booster'],
  },
]

export type StageStatus = 'past' | 'due' | 'upcoming'

const DAY_MS = 24 * 60 * 60 * 1000
/** A stage counts as "due" from its date until this many days later. */
const DUE_WINDOW_DAYS = 28

export function stageDate(birth: Date, stage: VaccineStage): Date {
  const d = new Date(birth)
  d.setDate(d.getDate() + stage.days)
  return d
}

export function stageStatus(birth: Date, stage: VaccineStage, today = new Date()): StageStatus {
  const start = stageDate(birth, stage).getTime()
  const now = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  if (now < start) return 'upcoming'
  if (now - start <= DUE_WINDOW_DAYS * DAY_MS) return 'due'
  return 'past'
}
