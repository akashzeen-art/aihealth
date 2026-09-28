import { useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/**
 * Subtle enter transition for route content. Does not block rendering.
 */
/** Chat URLs differ only by conversation id; keep them as one page so an in-flight reply is not lost. */
function pageKey(pathname: string): string {
  const chat = pathname.match(/^\/assistant\/[^/]+/)
  return chat ? chat[0] : pathname
}

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = pageKey(useLocation().pathname)
  const reduced = useReducedMotion()
  const [key, setKey] = useState(pathname)
  const [phase, setPhase] = useState<'in' | 'idle'>('in')

  useEffect(() => {
    setKey(pathname)
    if (reduced) {
      setPhase('idle')
      return
    }
    setPhase('in')
    const t = window.setTimeout(() => setPhase('idle'), 320)
    return () => window.clearTimeout(t)
  }, [pathname, reduced])

  return (
    <div
      key={key}
      className={`cg-page-transition ${reduced ? 'is-reduced' : ''} ${phase === 'in' ? 'is-entering' : ''}`.trim()}
    >
      {children}
    </div>
  )
}
