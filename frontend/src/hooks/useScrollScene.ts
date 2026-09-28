import { useEffect, useRef, type RefObject } from 'react'
import { useReducedMotion } from './useReducedMotion'

/**
 * Writes --sy (px scrolled) and --sp (0–1 exit progress) on the element via rAF.
 * Avoids React re-renders on scroll for parallax layers.
 */
export function useScrollScene(
  ref: RefObject<HTMLElement | null>,
  enabled = true,
) {
  const reduced = useReducedMotion()
  const frame = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled || reduced) {
      if (el) {
        el.style.setProperty('--sy', '0')
        el.style.setProperty('--sp', '0')
      }
      return
    }

    const measure = () => {
      const rect = el.getBoundingClientRect()
      // Page scroll so depth starts on the first wheel tick when hero is at top.
      const y = Math.max(0, window.scrollY || -rect.top)
      const progress = Math.min(
        1,
        Math.max(0, y / Math.max(rect.height * 0.75, 1)),
      )
      el.style.setProperty('--sy', y.toFixed(2))
      el.style.setProperty('--sp', progress.toFixed(4))
    }

    const onScroll = () => {
      cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame.current)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ref, enabled, reduced])
}
