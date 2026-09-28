import type { ReactNode } from 'react'

export default function ErrorMessage({
  children,
  id,
}: {
  children: ReactNode
  id?: string
}) {
  if (!children) return null
  return (
    <p id={id} className="form-error" role="alert">
      {children}
    </p>
  )
}
