import { useEffect } from 'react'
import { useMedicalSafetyStore } from '../store/medicalSafetyStore'

/** Loads medical safety config once and exposes acknowledgment helpers. */
export function useMedicalSafety() {
  const config = useMedicalSafetyStore((s) => s.config)
  const loading = useMedicalSafetyStore((s) => s.loading)
  const error = useMedicalSafetyStore((s) => s.error)
  const load = useMedicalSafetyStore((s) => s.load)
  const hasOnboardingAck = useMedicalSafetyStore((s) => s.hasOnboardingAck)
  const acknowledgeOnboarding = useMedicalSafetyStore((s) => s.acknowledgeOnboarding)
  const needsAssistantGate = useMedicalSafetyStore((s) => s.needsAssistantGate)
  const acknowledgeAssistant = useMedicalSafetyStore((s) => s.acknowledgeAssistant)

  useEffect(() => {
    void load()
  }, [load])

  return {
    config,
    loading,
    error,
    hasOnboardingAck,
    acknowledgeOnboarding,
    needsAssistantGate,
    acknowledgeAssistant,
  }
}
