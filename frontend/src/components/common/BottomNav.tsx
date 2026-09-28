import { NavLink } from 'react-router-dom'
const links = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/assistants', label: 'Assistants', icon: 'grid', end: false },
  { to: '/history', label: 'History', icon: 'clock', end: false },
  { to: '/document-reader', label: 'Docs', icon: 'file', end: false },
  { to: '/profile', label: 'Profile', icon: 'user', end: false },
] as const

function Icon({ name }: { name: (typeof links)[number]['icon'] }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  }
  switch (name) {
    case 'home':
      return (
        <svg {...common}>
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
        </svg>
      )
    case 'grid':
      return (
        <svg {...common}>
          <rect x="4" y="4" width="7" height="7" rx="1.5" />
          <rect x="13" y="4" width="7" height="7" rx="1.5" />
          <rect x="4" y="13" width="7" height="7" rx="1.5" />
          <rect x="13" y="13" width="7" height="7" rx="1.5" />
        </svg>
      )
    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l2.5 2.5" />
        </svg>
      )
    case 'file':
      return (
        <svg {...common}>
          <path d="M8 4h6l4 4v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
          <path d="M14 4v4h4" />
        </svg>
      )
    case 'user':
      return (
        <svg {...common}>
          <circle cx="12" cy="9" r="3.5" />
          <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
        </svg>
      )
  }
}

export default function BottomNav() {
  return (
    <nav className="bottom-nav cg-bottom-nav" aria-label="Mobile primary">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            `bottom-nav-item${isActive ? ' is-active active' : ''}`
          }
        >
          <span className="bottom-nav-icon">
            <Icon name={link.icon} />
          </span>
          <span className="bottom-nav-label">{link.label}</span>
          <span className="bottom-nav-indicator" aria-hidden="true" />
        </NavLink>
      ))}
    </nav>
  )
}
