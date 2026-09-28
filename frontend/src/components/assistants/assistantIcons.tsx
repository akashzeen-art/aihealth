import type { ReactNode } from 'react'

export const assistantIcons: Record<string, ReactNode> = {
  'heart-pulse': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M3 12h3l2.5-5 3 10 2.5-5H21" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M19.5 7.5a3.5 3.5 0 0 0-5.7-2.7L12 6.2l-1.8-1.4A3.5 3.5 0 0 0 4.5 7.5c0 4.2 7.5 9 7.5 9s7.5-4.8 7.5-9Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.35"
      />
    </svg>
  ),
  cross: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M12 7v10M7 12h10" strokeLinecap="round" />
    </svg>
  ),
  baby: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="9" r="4" />
      <path d="M6 20c1.5-3 4-4.5 6-4.5S16.5 17 18 20" strokeLinecap="round" />
      <circle cx="10.2" cy="8.8" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="13.8" cy="8.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  ),
  apple: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path
        d="M12 7c1-2 2.5-3 4-3-.2 1.8-1 3-2.5 4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 9.5c2.2 1 3.5 3.2 3.5 5.7 0 3.4-2.7 6.3-6 6.3-.7 0-1.4-.1-2-.4-.6.3-1.3.4-2 .4-3.3 0-6-2.9-6-6.3 0-2.5 1.3-4.7 3.5-5.7 1.1 1.4 2.7 2.3 4.5 2.3s3.4-.9 4.5-2.3Z"
        strokeLinejoin="round"
      />
    </svg>
  ),
  languages: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 3 3.8 6 3.8 9s-1.3 6-3.8 9c-2.5-3-3.8-6-3.8-9s1.3-6 3.8-9Z" />
    </svg>
  ),
  'file-text': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" strokeLinecap="round" />
    </svg>
  ),
  stethoscope: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3v5a4 4 0 0 0 8 0V3" />
      <path d="M10 12v2a5 5 0 0 0 10 0v-1" />
      <circle cx="20" cy="11" r="2" />
    </svg>
  ),
  child: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="2.5" />
      <path d="M12 8v7M8 10l4 2 4-2M9.5 21l2.5-6 2.5 6" />
    </svg>
  ),
  pill: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-45 12 12)" />
      <path d="m8.5 8.5 7 7" />
    </svg>
  ),
  mind: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21c-4-2.5-7-5.5-7-9.5A4.5 4.5 0 0 1 12 8a4.5 4.5 0 0 1 7 3.5c0 4-3 7-7 9.5Z" />
      <path d="M12 8V3M9 4.5 12 3l3 1.5" />
    </svg>
  ),
  drop: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />
      <path d="M9.5 15a2.5 2.5 0 0 0 2.5 2.5" />
    </svg>
  ),
  gauge: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 17a8 8 0 1 1 16 0" />
      <path d="m12 17 4-5" />
      <circle cx="12" cy="17" r="1.2" fill="currentColor" />
    </svg>
  ),
  dumbbell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />
    </svg>
  ),
  compass: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="3" />
      <path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11Z" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16Z" />
      <path d="M10 20.5a2 2 0 0 0 4 0" />
    </svg>
  ),
}
