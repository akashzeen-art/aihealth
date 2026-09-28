import { useEffect, useState } from 'react'
import { getErrorMessage } from '../utils/errors'
import { getDisclaimers } from '../services/api'
import LoadingSpinner from '../components/common/LoadingSpinner'
import type { DisclaimerResponse } from '../types'

export default function DisclaimersPage() {
  const [data, setData] = useState<DisclaimerResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await getDisclaimers()
        if (!cancelled) setData(res)
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="page-pad narrow animate-fade-up">
      <header className="page-header">
        <h1>{data?.title ?? 'Health Safety Disclaimers'}</h1>
        <p className="muted">
          Please read these limits carefully before relying on any assistant response.
        </p>
      </header>

      {loading && <LoadingSpinner />}
      {error && <p className="form-error">{error}</p>}

      {data && (
        <>
          <p className="disclaimer-lead">{data.shortBanner}</p>

          <h2 className="section-subhead">Safety principles</h2>
          <ul className="disclaimer-list is-bullets">
            {data.principles.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2 className="section-subhead">Full disclaimers</h2>
          <ol className="disclaimer-list">
            {data.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </>
      )}
    </div>
  )
}
