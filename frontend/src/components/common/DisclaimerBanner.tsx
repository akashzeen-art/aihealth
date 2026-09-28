import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BRAND } from '../../brand'
import { useMedicalSafetyStore } from '../../store/medicalSafetyStore'
import { SafetyNotice } from '../ai/SafetyPrimitives'

export default function DisclaimerBanner({
  compact = false,
}: {
  compact?: boolean
}) {
  const { config, load } = useMedicalSafetyStore()

  useEffect(() => {
    void load()
  }, [load])

  if (config && !config.contexts.chat) {
    return null
  }

  const text =
    config?.shortBanner ??
    `Not medical advice. ${BRAND.name} provides educational information only. For emergencies, contact local emergency services. Always consult a qualified clinician.`

  return (
    <div className={compact ? 'is-compact' : undefined}>
      <SafetyNotice>
        {text} <Link to="/safety">Full disclaimers</Link>
      </SafetyNotice>
    </div>
  )
}
