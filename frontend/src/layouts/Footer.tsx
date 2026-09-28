import { Link, useLocation } from 'react-router-dom'
import { BRAND } from '../brand'
import '../styles/footer.css'

export default function Footer() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/assistant/')) return null

  const year = new Date().getFullYear()
  return (
    <footer className="site-footer cg-site-footer">
      <div className="cg-footer-glow" aria-hidden="true" />
      <div className="site-footer-inner cg-footer-inner">
        <div className="cg-footer-brand">
          <Link to="/" className="cg-footer-logo" aria-label={`${BRAND.name} home`}>
            <span className="cg-footer-mark" aria-hidden="true">
              <img src="/images/careguidelogo.png" alt="" width={1024} height={720} />
            </span>
          </Link>
          <p className="cg-footer-tagline">{BRAND.tagline}</p>
          <p className="footer-tag cg-footer-disclaimer">
            Educational AI health companion. Not a doctor, diagnosis, or emergency service.
          </p>
        </div>

        <nav className="cg-footer-nav" aria-label="Footer">
          <div className="cg-footer-col">
            <p className="cg-footer-col-title">Explore</p>
            <div className="footer-links cg-footer-links">
              <Link to="/">Home</Link>
              <Link to="/assistants">Assistants</Link>
              <Link to="/tracker">Tracker</Link>
              <Link to="/reminders">Reminders</Link>
              <Link to="/history">History</Link>
              <Link to="/document-reader">Documents</Link>
            </div>
          </div>

          <div className="cg-footer-col">
            <p className="cg-footer-col-title">Trust</p>
            <div className="footer-links cg-footer-links">
              <Link to="/safety">Safety</Link>
              <Link to="/about">About</Link>
              <Link to="/profile">Profile</Link>
            </div>
          </div>
        </nav>
      </div>

      <div className="cg-footer-bar">
        <p className="cg-footer-copy">
          © {year} {BRAND.name}. For learning — not clinical care.
        </p>
        <p className="cg-footer-pill" role="note">
          <span aria-hidden="true">●</span> Educational use only
        </p>
      </div>
    </footer>
  )
}
