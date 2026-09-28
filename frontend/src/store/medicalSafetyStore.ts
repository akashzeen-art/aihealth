import { create } from 'zustand'
import { getDisclaimers } from '../services/api'
import type { AssistantType, DisclaimerResponse } from '../types'

const ONBOARDING_KEY = 'aihealth_safety_onboarding_version'
const ASSISTANT_KEY = 'aihealth_safety_assistant_ack'

function readAssistantAcks(): Record<string, string> {
  try {
    const raw = localStorage.getItem(ASSISTANT_KEY)
    return raw ? (JSON.parse(raw) as Record<string, string>) : {}
  } catch {
    return {}
  }
}

interface MedicalSafetyState {
  config: DisclaimerResponse | null
  loading: boolean
  error: string | null
  load: () => Promise<void>
  hasOnboardingAck: () => boolean
  acknowledgeOnboarding: () => void
  needsAssistantGate: (assistantType: AssistantType) => boolean
  acknowledgeAssistant: (assistantType: AssistantType) => void
}

export const useMedicalSafetyStore = create<MedicalSafetyState>((set, get) => ({
  config: null,
  loading: false,
  error: null,

  load: async () => {
    if (get().config || get().loading) return
    set({ loading: true, error: null })
    try {
      const config = await getDisclaimers()
      set({ config, loading: false })
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load safety information',
      })
    }
  },

  hasOnboardingAck: () => {
    const config = get().config
    if (!config?.contexts.onboarding) return true
    return localStorage.getItem(ONBOARDING_KEY) === config.version
  },

  acknowledgeOnboarding: () => {
    const config = get().config
    if (!config) return
    localStorage.setItem(ONBOARDING_KEY, config.version)
    set({ config: { ...config } })
  },

  needsAssistantGate: (assistantType) => {
    const config = get().config
    if (!config?.contexts.assistants) return false
    const gated = config.gatedAssistants
    const requiresGate =
      gated.length === 0 || gated.includes(assistantType)
    if (!requiresGate) return false
    const acks = readAssistantAcks()
    return acks[assistantType] !== config.version
  },

  acknowledgeAssistant: (assistantType) => {
    const config = get().config
    if (!config) return
    const acks = readAssistantAcks()
    acks[assistantType] = config.version
    localStorage.setItem(ASSISTANT_KEY, JSON.stringify(acks))
    set({ config: { ...config } })
  },
}))
