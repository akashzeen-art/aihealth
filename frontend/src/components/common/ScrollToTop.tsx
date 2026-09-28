import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

function jumpToTop() {
  const root = document.documentElement
  const previous = root.style.scrollBehavior
  root.style.scrollBehavior = 'auto'
  window.scrollTo(0, 0)
  root.scrollTop = 0
  document.body.scrollTop = 0
  root.style.scrollBehavior = previous
}

/**
 * Resets window scroll to the top on every route change.
 * Hash links (e.g. /#assistants) scroll to that section instead.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useLayoutEffect(() => {
    if (hash) {
      const id = hash.replace('#', '')
      requestAnimationFrame(() => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return
        }
        jumpToTop()
      })
      return
    }

    jumpToTop()
    // Lazy/async content can shift the page after the first paint.
    const frame = requestAnimationFrame(jumpToTop)
    const timer = window.setTimeout(jumpToTop, 120)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [pathname, hash])

  return null
}
