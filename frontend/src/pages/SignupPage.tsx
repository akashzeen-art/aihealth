import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import '../styles/tools.css'
import { updateProfile } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { LANGUAGE_OPTIONS } from '../utils/assistants'
import { getErrorMessage } from '../utils/errors'
import { BRAND } from '../brand'

type SignupNavState = { from?: string } | null

export default function SignupPage() {
  const navigate = useNavigate()
  const navState = useLocation().state as SignupNavState
  const returnTo =
    navState?.from && navState.from.startsWith('/') && navState.from !== '/signup'
      ? navState.from
      : '/'
  const user = useAuthStore((s) => s.user)
  const signedUp = useAuthStore((s) => s.signedUp)
  const completeSignup = useAuthStore((s) => s.completeSignup)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState(user.phone || '')
  const [country, setCountry] = useState(user.country || '')
  const [language, setLanguage] = useState(user.preferredLanguage || 'en')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Only redirect people who were already signed up when they opened this page;
  // otherwise completing the form would bounce them to Profile instead of returnTo.
  const [signedUpOnArrival] = useState(signedUp)
  if (signedUpOnArrival) return <Navigate to="/profile" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (name.trim().length < 2) {
      setError('Please enter your name (at least 2 characters).')
      return
    }
    const digits = phone.replace(/\D/g, '')
    if (phone.trim() && (digits.length < 10 || digits.length > 15)) {
      setError('Enter a valid mobile number (10–15 digits) or leave it empty.')
      return
    }
    setSaving(true)
    try {
      const updated = await updateProfile({
        name: name.trim(),
        phone: digits || undefined,
        country: country.trim() || undefined,
        preferredLanguage: language,
      })
      completeSignup(updated)
      navigate(returnTo, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Could not complete sign up'))
      setSaving(false)
    }
  }

  return (
    <div className="page-pad cg-tools-page cg-signup-page animate-fade-up">
      <header className="cg-tools-hero">
        <p className="cg-tools-kicker">Sign up</p>
        <h1>Make {BRAND.name} yours</h1>
        <p className="cg-tools-lead">
          Optional — you can already use every feature. Signing up lets assistants greet you by name,
          reply in your language, and use local examples for your country. Your details stay in this
          browser.
        </p>
      </header>

      <section className="cg-tools-card">
        <form className="cg-tools-form" onSubmit={handleSubmit} noValidate>
          <label>
            <span>Your name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Demo"
              autoComplete="name"
              maxLength={60}
              required
            />
          </label>
          <div className="cg-tools-row">
            <label>
              <span>Mobile number (optional)</span>
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                autoComplete="tel"
              />
            </label>
            <label>
              <span>Country (optional)</span>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. India"
                autoComplete="country-name"
                maxLength={60}
              />
            </label>
            <label>
              <span>Preferred language</span>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                {LANGUAGE_OPTIONS.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {error ? <p className="cg-tools-error" role="alert">{error}</p> : null}
          <div className="cg-signup-actions">
            <button type="submit" className="cg-btn cg-btn-primary" disabled={saving}>
              {saving ? 'Signing up…' : 'Sign up'}
            </button>
            <button
              type="button"
              className="cg-btn cg-btn-ghost"
              onClick={() => navigate(returnTo, { replace: true })}
              disabled={saving}
            >
              Skip for now
            </button>
          </div>
        </form>
        <p className="cg-tools-muted cg-tools-tip">
          You can sign up any time from the <strong>Sign up</strong> button in the top bar.
        </p>
      </section>
    </div>
  )
}
