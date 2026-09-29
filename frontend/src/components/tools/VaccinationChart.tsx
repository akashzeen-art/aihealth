import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import '../../styles/vaccination.css'
import {
  VACCINATION_STAGES,
  stageDate,
  stageStatus,
  type StageStatus,
  type VaccineStage,
} from '../../local/vaccinationSchedule'

const STATUS_LABEL: Record<StageStatus, string> = {
  past: 'Given / past',
  due: 'Due now',
  upcoming: 'Upcoming',
}

function parseYmd(value?: string): Date | null {
  if (!value) return null
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function StageNode({ stage, birth, id }: { stage: VaccineStage; birth: Date | null; id?: string }) {
  const status = birth ? stageStatus(birth, stage) : null
  const date = birth ? stageDate(birth, stage) : null
  return (
    <li id={id} className={`vx-node${status ? ` is-${status}` : ''}`}>
      <div className="vx-node-age">
        <strong>{stage.age}</strong>
        {date ? (
          <span>
            {date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        ) : null}
        {status ? <em className={`vx-status is-${status}`}>{STATUS_LABEL[status]}</em> : null}
      </div>
      <div className="vx-node-body">
        {stage.national.length ? (
          <div className="vx-group">
            <span className="vx-group-label">National schedule</span>
            <ul className="vx-chips">
              {stage.national.map((v) => (
                <li key={v} className="vx-chip is-national">{v}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {stage.additional.length ? (
          <div className="vx-group">
            <span className="vx-group-label">Often advised (IAP)</span>
            <ul className="vx-chips">
              {stage.additional.map((v) => (
                <li key={v} className="vx-chip is-extra">{v}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {stage.note ? <p className="vx-note">{stage.note}</p> : null}
      </div>
    </li>
  )
}

export default function VaccinationChart({
  birthDate,
  childName,
  compact = false,
}: {
  birthDate?: string
  childName?: string
  compact?: boolean
}) {
  const birth = useMemo(() => parseYmd(birthDate), [birthDate])
  const [selected, setSelected] = useState(0)

  function pick(index: number) {
    if (compact) {
      setSelected(index)
      return
    }
    document
      .getElementById(`vx-${VACCINATION_STAGES[index].id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const steps = (
    <ol className="vx-steps" aria-label="Vaccination ages">
      {VACCINATION_STAGES.map((stage, i) => {
        const status = birth ? stageStatus(birth, stage) : null
        const isSelected = compact && i === selected
        return (
          <li
            key={stage.id}
            className={`${status ? `is-${status}` : ''}${isSelected ? ' is-selected' : ''}`.trim()}
          >
            <button type="button" onClick={() => pick(i)} aria-pressed={compact ? isSelected : undefined}>
              <span className="vx-step-dot">{i + 1}</span>
              <span className="vx-step-label">{stage.short}</span>
            </button>
          </li>
        )
      })}
    </ol>
  )

  if (compact) {
    return (
      <div className="vx-chart is-compact">
        <div className="vx-compact-head">
          <strong>💉 Vaccination timeline · birth to 5 years</strong>
          <span>Tap an age</span>
        </div>
        {steps}
        <ol className="vx-flow">
          <StageNode stage={VACCINATION_STAGES[selected]} birth={birth} />
        </ol>
        <Link to="/reminders#vaccination-chart" className="vx-compact-link">
          Open full chart &amp; add reminders →
        </Link>
      </div>
    )
  }

  return (
    <div className="vx-chart">
      {steps}
      <ol className="vx-flow">
        {VACCINATION_STAGES.map((stage) => (
          <StageNode key={stage.id} stage={stage} birth={birth} id={`vx-${stage.id}`} />
        ))}
      </ol>

      <div className="vx-legend">
        <span><i className="vx-chip is-national" /> National schedule (free at government centres)</span>
        <span><i className="vx-chip is-extra" /> Often advised by paediatricians (IAP)</span>
        {birth ? (
          <span>
            Dates for {childName?.trim() || 'your child'} are approximate from the date of birth.
          </span>
        ) : null}
      </div>
      <p className="vx-disclaimer">
        Educational overview based on India&apos;s national immunization schedule. Schedules differ
        by country — always follow your doctor and your child&apos;s vaccination card.
      </p>
    </div>
  )
}
