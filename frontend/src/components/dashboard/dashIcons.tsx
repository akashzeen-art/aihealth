import type { ReactNode } from 'react'

/** Compact line icons for dashboard surfaces */
export const dashIcons = {
  spark: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M12 3.5v3.2M12 17.3v3.2M3.5 12h3.2M17.3 12h3.2" strokeLinecap="round" />
      <path d="M6.2 6.2l2.2 2.2M15.6 15.6l2.2 2.2M17.8 6.2l-2.2 2.2M8.4 15.6l-2.2 2.2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2.4" />
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path
        d="M5 18.5 6.2 15A7.5 7.5 0 1 1 9.4 19.2L5 18.5Z"
        strokeLinejoin="round"
      />
      <path d="M9 11h6M9 14h3.5" strokeLinecap="round" />
    </svg>
  ),
  translate: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M4.5 12h15M12 3.5c2.4 2.8 3.6 5.6 3.6 8.5s-1.2 5.7-3.6 8.5c-2.4-2.8-3.6-5.6-3.6-8.5S9.6 6.3 12 3.5Z" />
    </svg>
  ),
  document: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M14 3.5H7.5A2 2 0 0 0 5.5 5.5v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8.5L14 3.5Z" />
      <path d="M14 3.5V8.5h5M9 12.5h6M9 16h4" strokeLinecap="round" />
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.4" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.4" />
    </svg>
  ),
  continue: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M5 12h11.5" strokeLinecap="round" />
      <path d="M13 6.5 18.5 12 13 17.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 7v10" strokeLinecap="round" opacity="0.4" />
    </svg>
  ),
  journey: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <circle cx="6" cy="7" r="2.2" />
      <circle cx="18" cy="12" r="2.2" />
      <circle cx="8" cy="18" r="2.2" />
      <path d="M8 8.5c2.2 1.2 5.2 2.2 7.8 2.8M16.2 13.6c-2 .8-5.2 2.4-6.5 3.2" strokeLinecap="round" />
    </svg>
  ),
  bookmark: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M7 4.5h10a1 1 0 0 1 1 1v14l-6-3.2-6 3.2v-14a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
    </svg>
  ),
  checklist: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M5 7.5h3M5 12h3M5 16.5h3" strokeLinecap="round" />
      <path d="M10.5 7.5H19M10.5 12H19M10.5 16.5H16" strokeLinecap="round" />
      <path d="M5.2 7.2 6.3 8.3 8.2 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  week: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2.2" />
      <path d="M4 9.5h16M9 3.5v3M15 3.5v3" strokeLinecap="round" />
      <circle cx="12" cy="14.5" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path
        d="M12 3.5 19 6.5v5.2c0 4.4-3 7.5-7 8.8-4-1.3-7-4.4-7-8.8V6.5L12 3.5Z"
        strokeLinejoin="round"
      />
      <path d="M9.2 12.2 11 14l3.8-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  compass: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="m14.8 9.2-1.4 4.2-4.2 1.4 1.4-4.2 4.2-1.4Z" strokeLinejoin="round" />
    </svg>
  ),
} as const satisfies Record<string, ReactNode>

export type DashIconKey = keyof typeof dashIcons

export function DashIcon({
  name,
  className = '',
}: {
  name: DashIconKey
  className?: string
}) {
  return (
    <span className={`cg-dash-ico ${className}`.trim()} aria-hidden="true">
      {dashIcons[name]}
    </span>
  )
}
