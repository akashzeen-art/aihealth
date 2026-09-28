import { useEffect, useRef, useState, type RefObject } from 'react'
import { useReducedMotion } from './useReducedMotion'

export interface ParallaxOffset {
  /** 0 at top of element in view, increases as user scrolls down */
  progress: number
  /** Rough viewport-relative Y in px for the element center */
  y: number
}

/**
 * Scroll-linked parallax progress for a container.
 * Uses rAF + scroll/resize listeners; no per-frame React updates when reduced motion is on.
 */
export function useParallax(
  ref: RefObject<HTMLElement | null>,
  enabled = true,
): ParallaxOffset {
  const reduced = useReducedMotion()
  const [offset, setOffset] = useState<ParallaxOffset>({ progress: 0, y: 0 })
  const frame = useRef(0)

  useEffect(() => {
    if (!enabled || reduced) {
      setOffset({ progress: 0, y: 0 })
      return
    }

    const el = ref.current
    if (!el) return

    const measure = () => {
      const rect = el.getBoundingClientRect()
      const viewH = window.innerHeight || 1
      const center = rect.top + rect.height / 2
      const y = center - viewH / 2
      const progress = Math.min(1, Math.max(0, 1 - (rect.bottom / (viewH + rect.height))))
      setOffset({ progress, y })
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

  return offset
}

/** Map a parallax y offset into a CSS translate3d string. */
export function parallaxTranslate(y: number, factor: number): string {
  return `translate3d(0, ${(-y * factor).toFixed(2)}px, 0)`
}
