import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { BRAND } from '../brand'
import { useAuthStore } from '../store/authStore'

const appLinks = [
  { label: 'Home', to: '/' },
  { label: 'Assistants', to: '/assistants' },
  { label: 'Tracker', to: '/tracker' },
  { label: 'Reminders', to: '/reminders' },
  { label: 'History', to: '/history' },
  { label: 'Documents', to: '/document-reader' },
] as const

function BrandMark({ to }: { to: string }) {
  return (
    <Link to={to} className="cg-nav-brand" aria-label={`${BRAND.name} home`}>
      <img
        src="/images/careguidelogo.png"
        alt=""
        className="cg-nav-logo"
        width={1024}
        height={720}
      />
    </Link>
  )
}

export default function Navbar() {
  const user = useAuthStore((s) => s.user)
  const signedUp = useAuthStore((s) => s.signedUp)
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const firstName = user?.name?.trim().split(/\s+/)[0]
  const initials = (user?.name || 'CG')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')

  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.classList.add('cg-nav-lock')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('cg-nav-lock')
    }
  }, [open])

  return (
    <header
      id="top"
      className={[
        'cg-nav',
        'is-app',
        'is-authed',
        scrolled ? 'is-scrolled' : '',
        open ? 'is-open' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="cg-nav-inner">
        <BrandMark to="/" />

        <button
          type="button"
          className={`cg-nav-toggle${open ? ' is-open' : ''}`}
          aria-expanded={open}
          aria-controls="cg-primary-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span className="cg-nav-toggle-bars" aria-hidden="true" />
        </button>

        <nav
          id="cg-primary-nav"
          className={`cg-nav-panel${open ? ' is-open' : ''}`}
          aria-label="Primary"
        >
          <div className="cg-nav-links" role="list">
            {appLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                role="listitem"
                className={({ isActive }) => `cg-nav-link${isActive ? ' is-active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          <div className="cg-nav-actions">
            {signedUp ? (
              <Link to="/profile" className="cg-nav-user" title="Profile">
                <span className="cg-nav-avatar" aria-hidden="true">
                  {initials || 'CG'}
                </span>
                <span className="cg-nav-user-meta">
                  <span className="cg-nav-user-label">Profile</span>
                  <strong>{firstName || 'You'}</strong>
                </span>
              </Link>
            ) : (
              <Link to="/signup" className="cg-nav-cta">
                Sign up
              </Link>
            )}
          </div>
        </nav>
      </div>

      {open ? (
        <button
          type="button"
          className="cg-nav-backdrop"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </header>
  )
}
