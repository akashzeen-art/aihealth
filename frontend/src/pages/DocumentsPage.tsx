import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '../utils/errors'
import { deleteDocument, listDocuments, uploadDocument } from '../services/api'
import DocumentPreview from '../components/common/DocumentPreview'
import ErrorMessage from '../components/common/ErrorMessage'
import FileUploader from '../components/common/FileUploader'
import LoadingSpinner from '../components/common/LoadingSpinner'
import type { DocumentItem } from '../types'
import { isAllowedMedicalDocument } from '../utils/assistants'
import { useEngagementStore } from '../store/engagementStore'

export default function DocumentsPage({ embedded = false }: { embedded?: boolean }) {
  const [docs, setDocs] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [lastUploaded, setLastUploaded] = useState<DocumentItem | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const completeChecklist = useEngagementStore((s) => s.completeChecklist)
  const addDocumentInsight = useEngagementStore((s) => s.addDocumentInsight)
  const documentInsights = useEngagementStore((s) => s.documentInsights)
  const removeDocumentInsight = useEngagementStore((s) => s.removeDocumentInsight)

  async function refresh() {
    const data = await listDocuments()
    setDocs(data)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await refresh()
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleUpload(file: File) {
    setError('')
    setSuccess('')
    setLastUploaded(null)
    if (!isAllowedMedicalDocument(file)) {
      setError('Only PDF, JPG, JPEG, and PNG files are supported.')
      return
    }
    setUploading(true)
    try {
      const uploaded = await uploadDocument(file)
      setLastUploaded(uploaded)
      completeChecklist('document')
      if (uploaded.extractionPreview || uploaded.extractedText) {
        addDocumentInsight({
          documentId: uploaded.id,
          documentName: uploaded.originalFilename,
          summary:
            uploaded.extractionPreview ||
            (uploaded.extractedText || '').slice(0, 280) ||
            'Document saved for educational review.',
          questions:
            'What does this document say in simple language? What should I ask my clinician about?',
        })
      }
      setSuccess(
        uploaded.extractedText
          ? `Saved “${file.name}” and extracted readable text — continue in chat for a simple explanation.`
          : `Saved “${file.name}”. Little text could be read from this file — paste key lines in chat for a better explanation.`,
      )
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err, 'Upload failed'))
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    setError('')
    try {
      await deleteDocument(id)
      if (lastUploaded?.id === id) setLastUploaded(null)
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete document'))
    }
  }

  return (
    <div className={embedded ? 'cg-docs-embed' : 'page-pad cg-docs-page animate-fade-up'}>
      {!embedded && (
        <header className="cg-docs-hero">
          <p className="cg-docs-kicker">
            <span className="cg-docs-kicker-dot" aria-hidden="true" />
            Documents
          </p>
          <h1>Your uploads</h1>
          <p className="cg-docs-lead">
            Upload blood reports, prescriptions, lab reports, or discharge summaries. Files stay
            private to this browser — explanations are educational, not a diagnosis.
          </p>
        </header>
      )}

      <form
        ref={formRef}
        className="cg-docs-upload"
        onSubmit={(e: FormEvent) => e.preventDefault()}
      >
        <ErrorMessage>{error}</ErrorMessage>
        {success ? (
          <p className="cg-docs-banner is-success" role="status">
            {success}
          </p>
        ) : null}

        {uploading ? (
          <div className="cg-docs-pipeline" role="status" aria-live="polite">
            <div className="cg-docs-pipeline-track" aria-hidden="true">
              <span className="is-done">Upload</span>
              <span className="is-active">Extract</span>
              <span>Explain</span>
            </div>
            <p>Reading document content…</p>
          </div>
        ) : null}

        <FileUploader
          dropzone
          uploading={uploading}
          label={uploading ? 'Extracting…' : 'Choose PDF or image'}
          onFile={(file) => void handleUpload(file)}
        />

        {lastUploaded ? (
          <div className="cg-docs-after-upload">
            <Link
              to="/assistant/document-reader"
              state={{
                suggestExplain: true,
                documentName: lastUploaded.originalFilename,
              }}
              className="cg-btn cg-btn-primary cg-btn-lg"
            >
              Get simple AI explanation
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : null}
      </form>

      {documentInsights.length > 0 ? (
        <section className="cg-engage-doc-insights" aria-labelledby="doc-insights-heading">
          <div className="cg-docs-pane-head">
            <h2 id="doc-insights-heading">Document notes</h2>
            <p>Short educational notes saved from your uploads.</p>
          </div>
          <ul className="cg-engage-insight-list">
            {documentInsights.map((d) => (
              <li key={d.id} className="cg-engage-insight-item">
                <div className="cg-engage-insight-row">
                  <strong>{d.documentName}</strong>
                  <span>{d.summary}</span>
                  {d.questions ? <em>{d.questions}</em> : null}
                </div>
                <button
                  type="button"
                  className="cg-btn cg-btn-ghost cg-btn-sm"
                  onClick={() => removeDocumentInsight(d.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {loading ? (
        <LoadingSpinner />
      ) : docs.length === 0 ? (
        <div className="cg-docs-empty">
          <div className="cg-docs-empty-icon" aria-hidden="true">
            ▤
          </div>
          <h2>Bring a document you&apos;d like to understand</h2>
          <p>Upload a PDF or image above. Extracted text stays separate from AI explanation.</p>
        </div>
      ) : (
        <ul className="cg-docs-list" aria-label="Uploaded documents">
          {docs.map((d) => (
            <li key={d.id}>
              <DocumentPreview document={d} onDelete={(id) => void handleDelete(id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
