import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import '../styles/chat.css'
import { getErrorMessage } from '../utils/errors'
import {
  createConversation,
  deleteConversation,
  getConversation,
  listConversations,
  sendMessage,
  uploadDocument,
  updateProfile,
} from '../services/api'
import { resolveConversationId } from '../services/conversationService'
import { assistantIcons } from '../components/assistants/assistantIcons'
import ConversationSidebar from '../components/chat/ConversationSidebar'
import ChatWindow from '../components/chat/ChatWindow'
import AssistantSafetyGate from '../components/common/AssistantSafetyGate'
import { EmergencyCallout } from '../components/ai/SafetyPrimitives'
import ContextualHeader from '../components/ai/ContextualHeader'
import ErrorMessage from '../components/common/ErrorMessage'
import FileUploader from '../components/common/FileUploader'
import LanguageSelector from '../components/common/LanguageSelector'
import Button from '../components/ui/Button'
import { useAuthStore } from '../store/authStore'
import { useEngagementStore } from '../store/engagementStore'
import {
  isAllowedMedicalDocument,
  assistantPath,
  getAssistantBySlug,
} from '../utils/assistants'
import { getExperience } from '../utils/assistantExperience'
import { buildClinicianBrief, copyText, downloadTextFile } from '../utils/engagement'
import { validateChatInput } from '../utils/errors'
import type { ConversationSummary, Message } from '../types'

type ChatNavState = {
  suggestExplain?: boolean
  documentName?: string
  starter?: string
}

export default function AssistantDetailPage() {
  const { assistantType: slug = '', conversationId: urlConversationId } = useParams()
  const conversationId = useMemo(
    () => resolveConversationId(urlConversationId),
    [urlConversationId],
  )
  const navigate = useNavigate()
  const location = useLocation()
  const justCreatedRef = useRef<string | null>(null)
  const catalog = getAssistantBySlug(slug)
  const experience = getExperience(slug)

  useEffect(() => {
    if (!catalog || !conversationId || !urlConversationId) return
    const short = assistantPath(catalog.slug, conversationId)
    if (location.pathname !== short) {
      navigate(short, { replace: true, state: location.state })
    }
  }, [catalog, conversationId, urlConversationId, location.pathname, location.state, navigate])
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [chatLoading, setChatLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [input, setInput] = useState('')
  const [language, setLanguage] = useState(user?.preferredLanguage || 'en')
  const [langSaving, setLangSaving] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [lastFailed, setLastFailed] = useState<string | null>(null)
  const [briefStatus, setBriefStatus] = useState('')
  const completeChecklist = useEngagementStore((s) => s.completeChecklist)
  const togglePinned = useEngagementStore((s) => s.togglePinnedConversation)
  const isPinned = useEngagementStore((s) =>
    conversationId ? s.isPinnedConversation(conversationId) : false,
  )

  useEffect(() => {
    const state = location.state as ChatNavState | null
    if (!state) return
    if (state.starter?.trim()) {
      setInput(state.starter.trim())
      navigate(location.pathname, { replace: true, state: null })
      return
    }
    if (!catalog?.supportsDocuments || !state.suggestExplain) return
    const name = state.documentName?.trim()
    setInput(
      name
        ? `Please explain “${name}” in simple language. What does it say, and what should I ask my clinician about?`
        : 'Please explain my uploaded medical document in simple language. What does it say, and what should I ask my clinician about?',
    )
    navigate(location.pathname, { replace: true, state: null })
  }, [catalog?.supportsDocuments, location.pathname, location.state, navigate])

  const refreshList = useCallback(async () => {
    if (!catalog) return
    setListLoading(true)
    try {
      const list = await listConversations(catalog.id)
      setConversations(list)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setListLoading(false)
    }
  }, [catalog])

  useEffect(() => {
    void refreshList()
  }, [refreshList])

  useEffect(() => {
    setLanguage(user?.preferredLanguage || 'en')
  }, [user?.preferredLanguage])

  useEffect(() => {
    if (!conversationId || !catalog) {
      setMessages([])
      return
    }
    if (justCreatedRef.current === conversationId) {
      justCreatedRef.current = null
      return
    }
    let cancelled = false
    ;(async () => {
      setChatLoading(true)
      setError('')
      try {
        const conv = await getConversation(conversationId)
        if (!cancelled) setMessages(conv.messages)
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      } finally {
        if (!cancelled) setChatLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [conversationId, catalog])

  async function handleNewChat() {
    if (!catalog) return
    setError('')
    try {
      const created = await createConversation(catalog.id)
      setConversations((prev) => [created, ...prev])
      setMessages([])
      navigate(assistantPath(catalog.slug, created.id))
    } catch (err) {
      setError(getErrorMessage(err, 'Could not start chat'))
    }
  }

  async function handleDelete(id: string) {
    setError('')
    try {
      await deleteConversation(id)
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (conversationId === id) {
        setMessages([])
        navigate(assistantPath(catalog!.slug))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete conversation'))
    }
  }

  async function handleClearConversation() {
    if (conversationId) {
      await handleDelete(conversationId)
      return
    }
    setMessages([])
  }

  async function handleLanguageChange(next: string) {
    setLanguage(next)
    setLangSaving(true)
    setError('')
    try {
      const updated = await updateProfile({
        preferredLanguage: next,
        name: user?.name,
        phone: user?.phone || undefined,
        country: user?.country || undefined,
      })
      setUser(updated)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update language'))
    } finally {
      setLangSaving(false)
    }
  }

  async function handleAttach(file: File) {
    if (!catalog?.supportsDocuments) return
    if (!isAllowedMedicalDocument(file)) {
      setError('Only PDF, JPG, JPEG, and PNG files are supported.')
      return
    }
    setUploading(true)
    setError('')
    try {
      await uploadDocument(file, conversationId)
      setMessages((prev) => [
        ...prev,
        {
          id: `attach-${Date.now()}`,
          role: 'SYSTEM',
          content: `Attached “${file.name}” for this conversation. Ask a question about the document when you are ready.`,
          createdAt: new Date().toISOString(),
        },
      ])
    } catch (err) {
      setError(getErrorMessage(err, "We couldn't extract enough text from this file."))
    } finally {
      setUploading(false)
    }
  }

  async function sendContent(content: string) {
    if (!catalog) return
    const validationError = validateChatInput(content)
    if (validationError) {
      setError(validationError)
      return
    }
    if (sending) return

    setError('')
    setLastFailed(null)
    setSending(true)
    setInput('')
    try {
      let activeId = conversationId
      if (!activeId) {
        const created = await createConversation(catalog.id, content.slice(0, 60))
        setConversations((prev) => [created, ...prev])
        activeId = created.id
        justCreatedRef.current = created.id
        navigate(assistantPath(catalog.slug, created.id), { replace: true })
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          role: 'USER',
          content,
          createdAt: new Date().toISOString(),
        },
      ])

      await sendMessage(activeId, content, language)
      const conv = await getConversation(activeId)
      setMessages(conv.messages)
      completeChecklist('chat')
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? { ...c, title: conv.title, updatedAt: conv.updatedAt }
            : c,
        ),
      )
    } catch (err) {
      setLastFailed(content)
      setError(
        getErrorMessage(err, "CareGuide couldn't connect to the AI service."),
      )
      if (conversationId) {
        try {
          const conv = await getConversation(conversationId)
          setMessages(conv.messages)
        } catch {
          /* ignore */
        }
      }
    } finally {
      setSending(false)
    }
  }

  async function handleSend(e?: FormEvent) {
    e?.preventDefault()
    await sendContent(input.trim())
  }

  async function handleExportBrief(mode: 'download' | 'copy') {
    if (!conversationId) return
    setBriefStatus('')
    try {
      const conv = await getConversation(conversationId)
      const text = buildClinicianBrief(conv)
      if (mode === 'copy') {
        const ok = await copyText(text)
        setBriefStatus(ok ? 'Brief copied' : 'Could not copy')
        return
      }
      downloadTextFile(`careguide-brief-${conversationId.slice(-8)}.txt`, text)
      setBriefStatus('Brief downloaded')
    } catch (err) {
      setBriefStatus(getErrorMessage(err, 'Could not prepare brief'))
    }
  }

  function handlePickSuggestion(text: string) {
    setInput(text)
  }

  if (!catalog) {
    return (
      <div className="page-pad">
        <ErrorMessage>Unknown assistant.</ErrorMessage>
        <Link to="/" className="btn btn-secondary">
          Back to assistants
        </Link>
      </div>
    )
  }

  const icon = assistantIcons[catalog.iconKey] ?? assistantIcons['heart-pulse']
  const dir = language === 'ar' ? 'rtl' : 'ltr'
  const conversationState = sending
    ? 'processing'
    : messages.length > 0
      ? 'active'
      : 'ready'

  return (
    <AssistantSafetyGate assistantType={catalog.id} assistantName={catalog.name}>
      <div
        className={`assistant-detail cg-chat-page accent-${catalog.accent} personality-${catalog.slug} animate-fade-up`}
        data-assistant={catalog.slug}
      >
        <header className="assistant-mobile-bar">
          <Link to="/assistants" className="assistant-mobile-back">
            ← Back
          </Link>
          <div className="assistant-mobile-title">
            <span className="assistant-mobile-icon" aria-hidden="true">
              {icon}
            </span>
            <div>
              <h1>{catalog.name}</h1>
              <p className="assistant-mobile-safety">{catalog.safetyInfo}</p>
            </div>
          </div>
          <div className="assistant-mobile-actions">
            <Button
              variant="secondary"
              size="sm"
              className="cg-btn cg-btn-secondary cg-btn-sm"
              onClick={() => setHistoryOpen((v) => !v)}
            >
              {historyOpen ? 'Hide chats' : 'Chats'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="cg-btn cg-btn-primary cg-btn-sm"
              onClick={() => void handleNewChat()}
            >
              New
            </Button>
          </div>
        </header>

        <ConversationSidebar
          className={historyOpen ? 'is-mobile-open' : ''}
          conversations={conversations}
          activeId={conversationId}
          loading={listLoading}
          title="Your timeline"
          onNew={() => {
            setHistoryOpen(false)
            void handleNewChat()
          }}
          onSelect={(id) => {
            setHistoryOpen(false)
            navigate(assistantPath(catalog.slug, id))
          }}
          onDelete={(id) => void handleDelete(id)}
          identity={
            <div className="assistant-detail-identity">
              <div className="assistant-feature-icon" aria-hidden="true">
                {icon}
              </div>
              <h1>{catalog.name}</h1>
              <p>{experience.purpose}</p>
              <div className="assistant-detail-safety" role="note">
                <strong>Safety</strong>
                <p>{catalog.safetyInfo}</p>
              </div>
            </div>
          }
          footer={
            <Link to="/assistants" className="assistant-detail-back">
              ← All assistants
            </Link>
          }
        />

        <ChatWindow
          messages={messages}
          loading={chatLoading}
          sending={sending}
          error={error}
          input={input}
          onInputChange={setInput}
          onSend={(e) => void handleSend(e)}
          onPickSuggestion={handlePickSuggestion}
          emptyTitle={experience.emptyTitle}
          starters={experience.starters}
          chips={experience.chips}
          followUps={experience.followUps}
          processingLabel={experience.processing}
          presenceState={sending ? 'processing' : input ? 'listening' : 'idle'}
          dir={dir}
          conversationId={conversationId}
          assistantType={catalog.id}
          assistantSlug={catalog.slug}
          onRetry={
            lastFailed
              ? () => {
                  void sendContent(lastFailed)
                }
              : undefined
          }
          banner={
            catalog.showEmergencyWarning ? (
              <EmergencyCallout>
                If someone is in immediate danger, call your local emergency number now. This guide
                is educational and not a substitute for emergency services.
              </EmergencyCallout>
            ) : null
          }
          contextHeader={
            <ContextualHeader
              assistantName={catalog.name}
              purpose={experience.purpose}
              icon={icon}
              language={language}
              conversationState={conversationState}
              country={user?.country}
            />
          }
          languageControl={
            <LanguageSelector
              value={language}
              disabled={langSaving}
              onChange={(next) => {
                completeChecklist('language')
                void handleLanguageChange(next)
              }}
            />
          }
          toolbar={
            catalog.tool || catalog.supportsDocuments || conversationId || messages.length > 0 || briefStatus ? (
            <header className="assistant-detail-toolbar">
              <div className="toolbar-actions">
                {catalog.tool ? (
                  <Link to={catalog.tool.to} className="cg-btn cg-btn-secondary cg-btn-sm">
                    {catalog.tool.label}
                  </Link>
                ) : null}
                {catalog.supportsDocuments && (
                  <FileUploader
                    uploading={uploading}
                    onFile={(file) => void handleAttach(file)}
                  />
                )}
                {conversationId ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="cg-btn cg-btn-ghost cg-btn-sm"
                      onClick={() => togglePinned(conversationId)}
                      aria-pressed={isPinned}
                    >
                      {isPinned ? 'Unpin' : 'Pin'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="cg-btn cg-btn-ghost cg-btn-sm"
                      onClick={() => void handleExportBrief('copy')}
                      disabled={messages.length === 0}
                    >
                      Copy brief
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="cg-btn cg-btn-secondary cg-btn-sm"
                      onClick={() => void handleExportBrief('download')}
                      disabled={messages.length === 0}
                    >
                      Export brief
                    </Button>
                  </>
                ) : null}
                {conversationId || messages.length > 0 ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="cg-btn cg-btn-ghost cg-btn-sm"
                    onClick={() => void handleClearConversation()}
                    aria-label="Clear conversation"
                  >
                    Clear
                  </Button>
                ) : null}
              </div>
              {briefStatus ? (
                <p className="cg-brief-status" role="status">
                  {briefStatus}
                </p>
              ) : null}
            </header>
            ) : null
          }
          attachControl={
            catalog.supportsDocuments ? (
              <FileUploader
                label="+"
                className="chat-attach-inline"
                uploading={uploading || sending}
                onFile={(file) => void handleAttach(file)}
              />
            ) : null
          }
        />
      </div>
    </AssistantSafetyGate>
  )
}
