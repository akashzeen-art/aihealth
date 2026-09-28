import { useRef, useState, type DragEvent } from 'react'
import Button from '../ui/Button'
import { DOCUMENT_UPLOAD_ACCEPT, isAllowedMedicalDocument } from '../../utils/assistants'

export default function FileUploader({
  onFile,
  uploading,
  label = 'Attach',
  className = '',
  dropzone = false,
}: {
  onFile: (file: File) => void
  uploading?: boolean
  label?: string
  className?: string
  /** Larger drag-and-drop surface for document reader */
  dropzone?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  function takeFile(file: File | undefined) {
    if (!file) return
    if (!isAllowedMedicalDocument(file)) return
    onFile(file)
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragOver(false)
    takeFile(e.dataTransfer.files?.[0])
  }

  if (dropzone) {
    return (
      <div
        className={`cg-dropzone ${dragOver ? 'is-dragover' : ''} ${uploading ? 'is-uploading' : ''} ${className}`.trim()}
        onDragEnter={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={DOCUMENT_UPLOAD_ACCEPT}
          id="cg-doc-upload"
          onChange={(e) => {
            takeFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        <div className="cg-dropzone-visual" aria-hidden="true">
          <span className="cg-dropzone-icon" />
          {uploading && <span className="cg-dropzone-scan" />}
        </div>
        <p className="cg-dropzone-title">
          {uploading ? 'Reading document content…' : 'Drop a PDF or image here'}
        </p>
        <p className="cg-dropzone-hint">
          {uploading
            ? 'Preparing a plain-language explanation path…'
            : 'Blood reports, prescriptions, lab reports, discharge summaries'}
        </p>
        <Button
          variant="primary"
          size="sm"
          className="cg-btn cg-btn-primary cg-btn-sm"
          disabled={uploading}
          aria-label="Upload medical document"
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? 'Extracting…' : label}
          {!uploading ? <span aria-hidden="true"> ↑</span> : null}
        </Button>
      </div>
    )
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={DOCUMENT_UPLOAD_ACCEPT}
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          takeFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      <Button
        variant="secondary"
        size="sm"
        className={`chat-attach-btn ${className}`.trim()}
        disabled={uploading}
        aria-label="Upload medical document"
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? 'Uploading…' : label}
      </Button>
    </>
  )
}
