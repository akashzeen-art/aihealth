import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '../utils/errors'
import { getProfile, updateProfile } from '../services/api'
import ContentSkeleton from '../components/ai/ContentSkeleton'
import { EducationalDisclaimer, SafetyBadge } from '../components/ai/SafetyPrimitives'
import { useAuthStore } from '../store/authStore'
import { useMedicalSafetyStore } from '../store/medicalSafetyStore'
import { LANGUAGE_OPTIONS } from '../utils/assistants'
import { languageLabel, profileInitials } from '../utils/assistantExperience'
import { BRAND } from '../brand'

export default function ProfilePage() {
  const setUser = useAuthStore((s) => s.setUser)
  const { hasOnboardingAck, load } = useMedicalSafetyStore()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('')
  const [preferredLanguage, setPreferredLanguage] = useState('en')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      try {
        const profile = await getProfile({ signal: controller.signal })
        if (controller.signal.aborted) return
        setName(profile.name)
        setPhone(profile.phone || '')
        setCountry(profile.country || '')
        setPreferredLanguage(profile.preferredLanguage || 'en')
        setEmail(profile.email)
      } catch (err) {
        if (controller.signal.aborted) return
        setError(getErrorMessage(err, 'Profile data unavailable'))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    })()
    return () => controller.abort()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.')
      return
    }
    setSaving(true)
    try {
      const updated = await updateProfile({
        name: name.trim(),
        preferredLanguage,
        phone: phone.trim() || undefined,
        country: country.trim() || undefined,
      })
      setUser(updated)
      setSuccess('Preferences saved.')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="page-pad cg-profile-page">
        <ContentSkeleton variant="document" />
      </div>
    )
  }

  if (error && !name) {
    return (
      <div className="page-pad cg-profile-page">
        <div className="cg-error-panel" role="alert">
          <p className="cg-error-title">Profile data unavailable</p>
          <p className="cg-error-copy">{error}</p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
          <Link to="/" className="btn btn-ghost btn-sm">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const initials = profileInitials(name || 'Care+')
  const rawFirst = name.trim().split(/\s+/)[0]
  const firstName = rawFirst && rawFirst !== 'Friend' ? rawFirst : 'there'
  const safetyOk = hasOnboardingAck()

  return (
    <div className="page-pad cg-profile-page animate-fade-up">
      <div className="cg-profile-glow" aria-hidden="true" />

      <header className="cg-profile-hero">
        <div className="cg-profile-avatar" aria-hidden="true">
          <span>{initials}</span>
        </div>
        <div className="cg-profile-hero-copy">
          <p className="cg-profile-kicker">
            <span className="cg-profile-kicker-dot" aria-hidden="true" />
            Your {BRAND.shortName} space
          </p>
          <h1>Hello, {firstName}</h1>
          <p className="cg-profile-lead">
            Preferences for how Care+ addresses you — safety rules stay the same.
          </p>
          <div className="cg-profile-hero-meta">
            <span className="cg-profile-pill">
              <span>Language</span>
              <strong>{languageLabel(preferredLanguage)}</strong>
            </span>
            <span className={`cg-profile-pill${safetyOk ? '' : ' is-warn'}`}>
              <span>Safety</span>
              <strong>{safetyOk ? 'Acknowledged' : 'Pending'}</strong>
            </span>
          </div>
        </div>
      </header>

      <form className="cg-profile-form" onSubmit={handleSubmit} noValidate>
        {error ? (
          <p className="cg-profile-alert is-error" role="alert">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="cg-profile-alert is-success" role="status">
            {success}
          </p>
        ) : null}

        <div className="cg-profile-grid">
          <section className="cg-profile-card" aria-labelledby="profile-info-heading">
            <div className="cg-profile-card-head">
              <h2 id="profile-info-heading">Profile</h2>
              <p>How you appear in Care+</p>
            </div>

            <label className="cg-profile-field">
              <span>Display name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                autoComplete="name"
              />
            </label>

            <div className="cg-profile-field-row">
              <label className="cg-profile-field">
                <span>Phone</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  inputMode="tel"
                />
              </label>
              <label className="cg-profile-field">
                <span>Country</span>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  autoComplete="country-name"
                />
              </label>
            </div>

            {email ? (
              <p className="cg-profile-account">
                Account <strong>{email}</strong>
              </p>
            ) : null}
          </section>

          <section className="cg-profile-card" aria-labelledby="prefs-heading">
            <div className="cg-profile-card-head">
              <h2 id="prefs-heading">Language</h2>
              <p>Preferred reply language</p>
            </div>

            <div className="cg-profile-lang-grid" role="radiogroup" aria-label="Preferred language">
              {LANGUAGE_OPTIONS.map((l) => {
                const selected = preferredLanguage === l.code
                return (
                  <button
                    key={l.code}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`cg-profile-lang${selected ? ' is-selected' : ''}`}
                    onClick={() => setPreferredLanguage(l.code)}
                  >
                    <strong>{l.label}</strong>
                    <span>{l.code.toUpperCase()}</span>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="cg-profile-card cg-profile-card-safety" aria-labelledby="safety-heading">
            <div className="cg-profile-card-head">
              <h2 id="safety-heading">Safety</h2>
              <p>Educational boundaries</p>
            </div>
            <div className="cg-profile-safety">
              <SafetyBadge label={safetyOk ? 'Acknowledged' : 'Pending'} />
              <p>
                {safetyOk
                  ? 'You confirmed Care+ is educational only.'
                  : 'Safety acknowledgement will appear when required.'}
              </p>
            </div>
            <Link to="/safety" className="cg-profile-text-link">
              Review full disclaimers
              <span aria-hidden="true">→</span>
            </Link>
          </section>

          <section className="cg-profile-card" aria-labelledby="data-heading">
            <div className="cg-profile-card-head">
              <h2 id="data-heading">Data</h2>
              <p>Demo storage in this browser</p>
            </div>
            <EducationalDisclaimer>
              Your Care+ demo data is stored locally. Clearing site data removes conversations
              and documents stored in this browser. This is not a clinic record.
            </EducationalDisclaimer>
          </section>
        </div>

        <div className="cg-profile-footer">
          <button type="submit" className="cg-profile-save" disabled={saving}>
            {saving ? 'Saving…' : 'Save preferences'}
          </button>
        </div>
      </form>
    </div>
  )
}
