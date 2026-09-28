import { Link } from 'react-router-dom'
import type { DocumentItem } from '../../types'

export default function DocumentPreview({
  document,
  onDelete,
}: {
  document: DocumentItem
  onDelete?: (id: string) => void
}) {
  return (
    <article className="cg-docs-item" aria-label={document.originalFilename}>
      <div className="cg-docs-item-icon" aria-hidden="true">
        ▤
      </div>
      <div className="cg-docs-item-body">
        <h3>{document.originalFilename}</h3>
        <p className="cg-docs-item-meta">
          {document.contentType}
          {document.processingStatus ? ` · ${document.processingStatus}` : ''} ·{' '}
          {new Date(document.uploadedAt).toLocaleString()}
        </p>
        <p className="cg-docs-item-excerpt">
          {document.extractionPreview || 'No text extracted yet.'}
        </p>
        <div className="cg-docs-item-actions">
          <Link
            to="/assistant/document-reader"
            state={{
              suggestExplain: true,
              documentName: document.originalFilename,
            }}
            className="cg-btn cg-btn-primary cg-btn-sm"
          >
            Explain in chat
            <span aria-hidden="true">→</span>
          </Link>
          {onDelete ? (
            <button
              type="button"
              className="cg-btn cg-btn-danger cg-btn-sm"
              aria-label={`Delete ${document.originalFilename}`}
              onClick={() => onDelete(document.id)}
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}
