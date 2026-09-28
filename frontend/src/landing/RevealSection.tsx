import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

export type RevealVariant =
  | 'fade-up'
  | 'fade-in'
  | 'slide-in'
  | 'scale-in'
  | 'calm'
  | 'energy'
  | 'parallax'

export default function RevealSection({
  id,
  className = '',
  variant = 'parallax',
  stagger = false,
  children,
}: {
  id?: string
  className?: string
  variant?: RevealVariant
  /** Stagger direct children with data-stagger items via CSS */
  stagger?: boolean
  children: ReactNode
}) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const [visible, setVisible] = useState(reduced)

  useEffect(() => {
    if (reduced) {
      setVisible(true)
      return
    }
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.14, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  return (
    <section
      ref={ref}
      id={id}
      data-reveal={variant}
      data-stagger={stagger ? 'true' : undefined}
      className={`cg-reveal reveal-${variant} lp-reveal ${visible ? 'is-visible' : ''} ${className}`.trim()}
    >
      {children}
    </section>
  )
}
