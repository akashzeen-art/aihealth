import { useEffect, useRef, type RefObject } from 'react'
import { useFinePointer } from './useFinePointer'
import { useReducedMotion } from './useReducedMotion'

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/**
 * Writes --px / --py (−1…1, lerped) on the target for CSS parallax layers.
 * Uses rAF; no React state updates per frame. Disabled on touch / reduced motion.
 */
export function usePointerParallax(
  ref: RefObject<HTMLElement | null>,
  enabled = true,
  strength = 1,
) {
  const reduced = useReducedMotion()
  const fine = useFinePointer()
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })
  const frame = useRef(0)
  const active = useRef(false)

  useEffect(() => {
    const el = ref.current
    const on = enabled && !reduced && fine && Boolean(el)
    if (!on || !el) {
      if (el) {
        el.style.setProperty('--px', '0')
        el.style.setProperty('--py', '0')
      }
      return
    }

    const tick = () => {
      current.current.x = lerp(current.current.x, target.current.x, 0.08)
      current.current.y = lerp(current.current.y, target.current.y, 0.08)
      el.style.setProperty('--px', (current.current.x * strength).toFixed(4))
      el.style.setProperty('--py', (current.current.y * strength).toFixed(4))
      if (
        active.current ||
        Math.abs(current.current.x - target.current.x) > 0.001 ||
        Math.abs(current.current.y - target.current.y) > 0.001
      ) {
        frame.current = requestAnimationFrame(tick)
      }
    }

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      if (rect.width < 1 || rect.height < 1) return
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1
      target.current.x = Math.max(-1, Math.min(1, nx))
      target.current.y = Math.max(-1, Math.min(1, ny))
      if (!active.current) {
        active.current = true
        frame.current = requestAnimationFrame(tick)
      }
    }

    const onLeave = () => {
      target.current.x = 0
      target.current.y = 0
      active.current = true
      frame.current = requestAnimationFrame(tick)
      window.setTimeout(() => {
        active.current = false
      }, 600)
    }

    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame.current)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      el.style.setProperty('--px', '0')
      el.style.setProperty('--py', '0')
    }
  }, [ref, enabled, reduced, fine, strength])
}
