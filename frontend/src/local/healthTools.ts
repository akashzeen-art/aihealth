import { requireCurrentUser, safeSetItem } from './db'
import { newId } from './ids'
import { VACCINATION_STAGES } from './vaccinationSchedule'

const TOOLS_PREFIX = 'careguide_tools_v1_'
const MAX_READINGS = 400
const REMINDER_GRACE_MS = 6 * 60 * 60 * 1000

export type ReminderKind = 'medication' | 'appointment' | 'vaccination' | 'measurement' | 'other'
export type ReminderRepeat = 'once' | 'daily' | 'weekly'

export interface Reminder {
  id: string
  kind: ReminderKind
  title: string
  notes?: string
  /** HH:MM, 24h local time */
  time: string
  /** YYYY-MM-DD — the date for one-off reminders, the start date (and weekday) otherwise */
  date: string
  repeat: ReminderRepeat
  active: boolean
  lastFiredAt?: string
  createdAt: string
}

export interface BpReading {
  id: string
  systolic: number
  diastolic: number
  pulse?: number
  note?: string
  takenAt: string
}

export type GlucoseContext = 'fasting' | 'before-meal' | 'after-meal' | 'bedtime' | 'random'

export interface GlucoseReading {
  id: string
  /** mg/dL */
  value: number
  context: GlucoseContext
  note?: string
  takenAt: string
}

export interface ToolsData {
  reminders: Reminder[]
  bp: BpReading[]
  glucose: GlucoseReading[]
}

export const REMINDER_KIND_LABELS: Record<ReminderKind, string> = {
  medication: 'Medication',
  appointment: 'Appointment',
  vaccination: 'Vaccination',
  measurement: 'Measurement',
  other: 'Other',
}

export const GLUCOSE_CONTEXT_LABELS: Record<GlucoseContext, string> = {
  fasting: 'Fasting',
  'before-meal': 'Before meal',
  'after-meal': '2h after meal',
  bedtime: 'Bedtime',
  random: 'Random',
}

function key(userId: string) {
  return `${TOOLS_PREFIX}${userId}`
}

export function readTools(userId = requireCurrentUser().id): ToolsData {
  try {
    const raw = localStorage.getItem(key(userId))
    const parsed = raw ? (JSON.parse(raw) as Partial<ToolsData>) : {}
    return {
      reminders: parsed.reminders ?? [],
      bp: parsed.bp ?? [],
      glucose: parsed.glucose ?? [],
    }
  } catch {
    return { reminders: [], bp: [], glucose: [] }
  }
}

export function writeTools(data: ToolsData, userId = requireCurrentUser().id) {
  const trimmed: ToolsData = {
    reminders: data.reminders,
    bp: [...data.bp].sort((a, b) => b.takenAt.localeCompare(a.takenAt)).slice(0, MAX_READINGS),
    glucose: [...data.glucose]
      .sort((a, b) => b.takenAt.localeCompare(a.takenAt))
      .slice(0, MAX_READINGS),
  }
  safeSetItem(key(userId), JSON.stringify(trimmed))
  window.dispatchEvent(new Event('careguide:tools'))
}

function update(mutator: (data: ToolsData) => void): ToolsData {
  const data = readTools()
  mutator(data)
  writeTools(data)
  return readTools()
}

/* ── Reminders ── */

export function addReminder(input: Omit<Reminder, 'id' | 'createdAt' | 'active'>): ToolsData {
  return update((d) => {
    d.reminders.push({
      ...input,
      title: input.title.trim(),
      notes: input.notes?.trim() || undefined,
      id: newId('rem'),
      active: true,
      createdAt: new Date().toISOString(),
    })
  })
}

export function addReminders(inputs: Omit<Reminder, 'id' | 'createdAt' | 'active'>[]): ToolsData {
  return update((d) => {
    const createdAt = new Date().toISOString()
    for (const input of inputs) {
      d.reminders.push({ ...input, id: newId('rem'), active: true, createdAt })
    }
  })
}

export function toggleReminder(id: string): ToolsData {
  return update((d) => {
    const r = d.reminders.find((x) => x.id === id)
    if (r) r.active = !r.active
  })
}

export function deleteReminder(id: string): ToolsData {
  return update((d) => {
    d.reminders = d.reminders.filter((x) => x.id !== id)
  })
}

export function markReminderFired(id: string, at = new Date()): void {
  update((d) => {
    const r = d.reminders.find((x) => x.id === id)
    if (r) r.lastFiredAt = at.toISOString()
  })
}

function atTime(date: Date, time: string): Date {
  const [h, m] = time.split(':').map(Number)
  const d = new Date(date)
  d.setHours(h || 0, m || 0, 0, 0)
  return d
}

function parseLocalDate(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

/** Most recent scheduled occurrence at or before `now`, or null if none yet. */
export function lastOccurrence(r: Reminder, now = new Date()): Date | null {
  const start = atTime(parseLocalDate(r.date), r.time)
  if (start > now) return null
  if (r.repeat === 'once') return start
  const step = r.repeat === 'daily' ? 1 : 7
  let candidate = atTime(now, r.time)
  if (r.repeat === 'weekly') {
    const diff = (now.getDay() - start.getDay() + 7) % 7
    candidate.setDate(candidate.getDate() - diff)
  }
  if (candidate > now) candidate = new Date(candidate.getTime() - step * 86400000)
  return candidate >= start ? candidate : null
}

/** Next scheduled occurrence after `now`, or null when a one-off reminder has passed. */
export function nextOccurrence(r: Reminder, now = new Date()): Date | null {
  const start = atTime(parseLocalDate(r.date), r.time)
  if (start > now) return start
  if (r.repeat === 'once') return null
  const last = lastOccurrence(r, now) ?? start
  const step = r.repeat === 'daily' ? 1 : 7
  const next = new Date(last)
  next.setDate(next.getDate() + step)
  return next
}

export function dueReminders(now = new Date()): Reminder[] {
  let data: ToolsData
  try {
    data = readTools()
  } catch {
    return []
  }
  return data.reminders.filter((r) => {
    if (!r.active) return false
    const occ = lastOccurrence(r, now)
    if (!occ) return false
    if (now.getTime() - occ.getTime() > REMINDER_GRACE_MS) return false
    const since = new Date(r.lastFiredAt ?? r.createdAt)
    return occ > since
  })
}

const CHILD_VISIT_MILESTONES = VACCINATION_STAGES.filter((s) => s.days > 0).map((s) => ({
  label: s.age,
  days: s.days,
  vaccines: [...s.national, ...s.additional],
}))

function toYmd(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function buildChildVisitReminders(childName: string, birthDate: string, time = '09:00') {
  const birth = parseLocalDate(birthDate)
  const today = parseLocalDate(toYmd(new Date()))
  return CHILD_VISIT_MILESTONES.map((m) => {
    const d = new Date(birth)
    d.setDate(d.getDate() + m.days)
    return { milestone: m, date: d }
  })
    .filter(({ date }) => date >= today)
    .map(({ milestone, date }) => ({
      kind: 'vaccination' as const,
      title: `${childName.trim() || 'Child'} — ${milestone.label} vaccination visit`,
      notes: `Usually: ${milestone.vaccines.slice(0, 4).join(', ')}${milestone.vaccines.length > 4 ? '…' : ''}. Confirm with your clinic vaccination card.`.slice(0, 200),
      time,
      date: toYmd(date),
      repeat: 'once' as const,
    }))
}

export { toYmd }

/* ── Readings ── */

export function addBp(input: Omit<BpReading, 'id'>): ToolsData {
  return update((d) => {
    d.bp.push({ ...input, id: newId('bp') })
  })
}

export function deleteBp(id: string): ToolsData {
  return update((d) => {
    d.bp = d.bp.filter((x) => x.id !== id)
  })
}

export function addGlucose(input: Omit<GlucoseReading, 'id'>): ToolsData {
  return update((d) => {
    d.glucose.push({ ...input, id: newId('glu') })
  })
}

export function deleteGlucose(id: string): ToolsData {
  return update((d) => {
    d.glucose = d.glucose.filter((x) => x.id !== id)
  })
}

export type Level = 'low' | 'normal' | 'elevated' | 'high' | 'very-high' | 'severe'

export function bpCategory(sys: number, dia: number): { label: string; level: Level } {
  if (sys >= 180 || dia >= 120) return { label: 'Severe — seek care', level: 'severe' }
  if (sys >= 140 || dia >= 90) return { label: 'Stage 2', level: 'very-high' }
  if (sys >= 130 || dia >= 80) return { label: 'Stage 1', level: 'high' }
  if (sys >= 120) return { label: 'Elevated', level: 'elevated' }
  if (sys < 90 || dia < 60) return { label: 'Low', level: 'low' }
  return { label: 'Normal', level: 'normal' }
}

export function glucoseCategory(
  value: number,
  context: GlucoseContext,
): { label: string; level: Level } {
  if (value < 54) return { label: 'Very low — act now', level: 'severe' }
  if (value < 70) return { label: 'Low', level: 'low' }
  if (value > 300) return { label: 'Very high', level: 'severe' }
  if (context === 'fasting' || context === 'before-meal') {
    if (value >= 126) return { label: 'High', level: 'very-high' }
    if (value >= 100) return { label: 'Above typical', level: 'elevated' }
    return { label: 'Typical', level: 'normal' }
  }
  if (value >= 200) return { label: 'High', level: 'very-high' }
  if (value >= 140) return { label: 'Above typical', level: 'elevated' }
  return { label: 'Typical', level: 'normal' }
}

function avg(nums: number[]): number {
  return nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function bpStats(readings: BpReading[], days = 7) {
  const cutoff = Date.now() - days * 86400000
  const recent = readings.filter((r) => new Date(r.takenAt).getTime() >= cutoff)
  return {
    count: recent.length,
    sys: avg(recent.map((r) => r.systolic)),
    dia: avg(recent.map((r) => r.diastolic)),
  }
}

export function glucoseStats(readings: GlucoseReading[], days = 7) {
  const cutoff = Date.now() - days * 86400000
  const recent = readings.filter((r) => new Date(r.takenAt).getTime() >= cutoff)
  return {
    count: recent.length,
    avg: avg(recent.map((r) => r.value)),
    fasting: avg(recent.filter((r) => r.context === 'fasting').map((r) => r.value)),
    lows: recent.filter((r) => r.value < 70).length,
    highs: recent.filter((r) => glucoseCategory(r.value, r.context).level === 'very-high' || r.value > 300).length,
  }
}

/** Plain-text summary of the user's logged data for the assistant's system prompt. */
export function userDataContextFor(assistantCode: string, userId: string): string | null {
  const code = assistantCode.trim().toUpperCase()
  const data = readTools(userId)
  const parts: string[] = []

  if (code === 'BLOOD_PRESSURE' && data.bp.length) {
    const sorted = [...data.bp].sort((a, b) => b.takenAt.localeCompare(a.takenAt))
    const s7 = bpStats(sorted, 7)
    const s30 = bpStats(sorted, 30)
    parts.push(
      `Blood pressure log (${sorted.length} readings total). 7-day average: ${s7.count ? `${s7.sys}/${s7.dia} from ${s7.count} readings` : 'no readings'}. 30-day average: ${s30.count ? `${s30.sys}/${s30.dia} from ${s30.count} readings` : 'no readings'}.`,
      'Most recent readings (newest first):',
      ...sorted
        .slice(0, 25)
        .map(
          (r) =>
            `- ${fmtDate(r.takenAt)}: ${r.systolic}/${r.diastolic} mmHg${r.pulse ? `, pulse ${r.pulse}` : ''} (${bpCategory(r.systolic, r.diastolic).label})${r.note ? ` — ${r.note}` : ''}`,
        ),
    )
  }

  if (code === 'DIABETES' && data.glucose.length) {
    const sorted = [...data.glucose].sort((a, b) => b.takenAt.localeCompare(a.takenAt))
    const s7 = glucoseStats(sorted, 7)
    parts.push(
      `Glucose log in mg/dL (${sorted.length} readings total). Last 7 days: ${s7.count} readings, average ${s7.avg || 'n/a'}, fasting average ${s7.fasting || 'n/a'}, ${s7.lows} low, ${s7.highs} high.`,
      'Most recent readings (newest first):',
      ...sorted
        .slice(0, 30)
        .map(
          (r) =>
            `- ${fmtDate(r.takenAt)}: ${r.value} mg/dL, ${GLUCOSE_CONTEXT_LABELS[r.context]} (${glucoseCategory(r.value, r.context).label})${r.note ? ` — ${r.note}` : ''}`,
        ),
    )
  }

  const reminderKinds: Record<string, ReminderKind[] | 'all'> = {
    REMINDERS: 'all',
    MEDICATION: ['medication'],
    CHILD_HEALTH: ['vaccination', 'appointment'],
    DIABETES: ['medication', 'measurement'],
    BLOOD_PRESSURE: ['medication', 'measurement'],
  }
  const kinds = reminderKinds[code]
  if (kinds) {
    const list = data.reminders.filter((r) => kinds === 'all' || kinds.includes(r.kind))
    if (list.length) {
      parts.push(
        `Reminders set in CareGuide (${list.length}):`,
        ...list.map(
          (r) =>
            `- [${REMINDER_KIND_LABELS[r.kind]}] ${r.title} — ${r.time}, ${r.repeat === 'once' ? `on ${r.date}` : r.repeat}${r.active ? '' : ' (paused)'}${r.notes ? ` — ${r.notes}` : ''}`,
        ),
      )
    }
  }

  return parts.length ? parts.join('\n') : null
}
