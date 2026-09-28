import type { ReactNode } from 'react'

export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="cg-empty-state">
      <div className="cg-empty-visual" aria-hidden="true">
        <span className="cg-empty-orb" />
        <span className="cg-empty-ring" />
      </div>
      <h2 className="cg-empty-title">{title}</h2>
      <p className="cg-empty-copy">{description}</p>
      {action ? <div className="cg-empty-action">{action}</div> : null}
    </div>
  )
}

/** Branded copy helpers for common empties */
export const EMPTY_COPY = {
  conversations: {
    title: 'Your CareGuide journey starts here.',
    description: 'Start a companion chat. Your conversations will appear as a calm timeline.',
  },
  documents: {
    title: "Bring a document you'd like to understand.",
    description:
      'Upload a PDF or image. Extracted text stays separate from AI explanation — educational only.',
  },
  recent: {
    title: 'Your recent conversations will appear here.',
    description: 'Pick an assistant to begin. You can return to any chat from History.',
  },
} as const
