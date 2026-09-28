export default function ContentSkeleton({
  variant = 'chat',
}: {
  variant?: 'chat' | 'cards' | 'document' | 'list' | 'dashboard'
}) {
  if (variant === 'dashboard') {
    return (
      <div className="cg-skeleton-dashboard" aria-hidden="true">
        <span className="cg-skel skel-line w-50" />
        <span className="cg-skel skel-block" />
        <span className="cg-skel skel-row" />
        <span className="cg-skel skel-row" />
        <span className="cg-skel skel-row" />
      </div>
    )
  }
  if (variant === 'cards') {
    return (
      <div className="cg-skeleton-grid" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="cg-skeleton-card">
            <span className="cg-skel skel-icon" />
            <span className="cg-skel skel-line w-70" />
            <span className="cg-skel skel-line w-90" />
            <span className="cg-skel skel-line w-50" />
          </div>
        ))}
      </div>
    )
  }
  if (variant === 'document') {
    return (
      <div className="cg-skeleton-doc" aria-hidden="true">
        <span className="cg-skel skel-block" />
        <span className="cg-skel skel-line w-80" />
        <span className="cg-skel skel-line w-60" />
        <span className="cg-skel skel-line w-70" />
      </div>
    )
  }
  if (variant === 'list') {
    return (
      <div className="cg-skeleton-list" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} className="cg-skel skel-row" />
        ))}
      </div>
    )
  }
  return (
    <div className="cg-skeleton-chat" aria-hidden="true">
      <span className="cg-skel skel-bubble left" />
      <span className="cg-skel skel-bubble right" />
      <span className="cg-skel skel-bubble left wide" />
    </div>
  )
}
