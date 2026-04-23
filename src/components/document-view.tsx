'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import type { Document, ChatMessage } from '@/types/database'
import type { ExtractedSpecs } from '@/lib/specs/schema'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader } from './ui/card'
import {
  ArrowLeft, Download, MessageSquare, FileText, RefreshCw, Play,
  Send, Bot, User, Lock, Loader, ChevronDown, ChevronUp, Hash,
  Sparkles, Copy, Check, Zap, X,
} from 'lucide-react'
import { formatDate, formatBytes } from '@/lib/utils'

interface Props {
  doc: Document
  initialMessages: ChatMessage[]
  isPro: boolean
  canChat: boolean
  chunkCount: number
}

type Tab = 'specs' | 'text' | 'chat'

export function DocumentView({ doc, initialMessages, isPro, canChat, chunkCount }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('specs')
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [processLoading, setProcessLoading] = useState(false)
  const [extractLoading, setExtractLoading] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Auto-refresh while the server is processing
  useEffect(() => {
    if (doc.status !== 'processing') return
    const interval = setInterval(() => router.refresh(), 3000)
    return () => clearInterval(interval)
  }, [doc.status, router])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleProcess() {
    setProcessLoading(true)
    try {
      const res = await fetch(`/api/documents/${doc.id}/process`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`Processed: ${data.chunkCount} chunks created`)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Processing failed')
    } finally {
      setProcessLoading(false)
    }
  }

  async function handleExtractSpecs() {
    setExtractLoading(true)
    try {
      const res = await fetch(`/api/documents/${doc.id}/extract-specs`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Specs extracted successfully')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Extraction failed')
    } finally {
      setExtractLoading(false)
    }
  }

  async function handleExport() {
    setExportLoading(true)
    try {
      const res = await fetch(`/api/documents/${doc.id}/export`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `spec-report-${doc.filename.replace(/\.[^.]+$/, '')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Report downloaded!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExportLoading(false)
    }
  }

  const MAX_QUESTION_LEN = 1_000

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || chatLoading) return
    if (input.length > MAX_QUESTION_LEN) {
      toast.error(`Message too long — max ${MAX_QUESTION_LEN} characters`)
      return
    }

    const userMsg = input.trim()
    setInput('')
    setChatLoading(true)

    const optimistic: ChatMessage = {
      id: `temp-${Date.now()}`,
      document_id: doc.id,
      user_id: '',
      role: 'user',
      content: userMsg,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])

    try {
      const res = await fetch(`/api/documents/${doc.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setMessages(prev => [...prev, {
        id: `temp-assistant-${Date.now()}`,
        document_id: doc.id,
        user_id: '',
        role: 'assistant',
        content: data.message,
        created_at: new Date().toISOString(),
      }])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Chat failed')
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
    } finally {
      setChatLoading(false)
    }
  }

  const specs = doc.extracted_specs as ExtractedSpecs | null
  const isProcessing = doc.status === 'processing'
  const isUploaded = doc.status === 'uploaded'
  const hasText = !!doc.extracted_text
  // Vision extraction works directly from storage — don't require text extraction first
  const canExtract = !!doc.storage_path || hasText

  return (
    <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/dashboard" prefetch={false}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900 truncate">{doc.filename}</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {doc.file_size ? formatBytes(doc.file_size) : ''}
              {doc.page_count ? ` · ${doc.page_count} pages` : ''}
              {chunkCount > 0 ? ` · ${chunkCount} chunks` : ''}
              {' · '}{formatDate(doc.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={doc.status} />
          <Button
            variant="outline" size="sm"
            onClick={handleProcess}
            loading={processLoading}
            disabled={isProcessing}
          >
            <Play className="h-4 w-4" />
            Process
          </Button>
          <Button
            variant="outline" size="sm"
            onClick={handleExtractSpecs}
            loading={extractLoading}
            disabled={isProcessing || !canExtract}
            title={!canExtract ? 'Upload a document first' : undefined}
          >
            <Sparkles className="h-4 w-4" />
            Extract specs
          </Button>
          <Button
            size="sm"
            onClick={isPro ? handleExport : () => setShowUpgradeModal(true)}
            loading={exportLoading}
            disabled={isProcessing || (isPro && !specs)}
            title={
              !isPro ? 'Upgrade to Pro to export PDF reports'
              : !specs ? 'Extract specs first to enable PDF export'
              : undefined
            }
          >
            {!isPro && <Lock className="h-4 w-4" />}
            {isPro && <Download className="h-4 w-4" />}
            Export PDF
          </Button>
        </div>
      </div>

      {/* Prompt banner for freshly uploaded docs */}
      {isUploaded && (
        <div className="mb-6 flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <Play className="h-5 w-5 text-blue-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">Document uploaded — ready to process</p>
            <p className="text-xs text-blue-700 mt-0.5">
              Click <strong>Process</strong> to extract text, then <strong>Extract specs</strong> to run AI analysis.
            </p>
          </div>
          <Button size="sm" onClick={handleProcess} loading={processLoading}>
            <Play className="h-4 w-4" />
            Process now
          </Button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {(['specs', 'text', 'chat'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'specs' && (
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />Specifications
              </span>
            )}
            {tab === 'text' && (
              <span className="flex items-center gap-2">
                <Hash className="h-4 w-4" />Extracted Text
                {chunkCount > 0 && (
                  <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{chunkCount}</span>
                )}
              </span>
            )}
            {tab === 'chat' && (
              <span className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />Chat
                {!canChat && <Lock className="h-3 w-3 text-slate-400" />}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Specs Tab */}
      {activeTab === 'specs' && (
        <div className="space-y-4">
          {isProcessing && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <Loader className="h-5 w-5 text-amber-600 animate-spin" />
              <p className="text-amber-800 text-sm font-medium">Processing… refreshing automatically.</p>
            </div>
          )}
          {doc.status === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-4">
              <p className="text-red-800 text-sm font-medium">Processing failed. Try again.</p>
              <Button size="sm" variant="outline" onClick={handleProcess} loading={processLoading}>Retry</Button>
            </div>
          )}

          {specs ? (
            <SpecsPanel specs={specs} docFilename={doc.filename} />
          ) : canExtract ? (
            <div className="text-center py-16 text-slate-400">
              <Sparkles className="h-10 w-10 mx-auto mb-3" />
              <p className="mb-1 font-medium text-slate-600">No specs extracted yet</p>
              <p className="text-sm mb-6">Click &quot;Extract specs&quot; to run AI analysis on your document.</p>
              <Button onClick={handleExtractSpecs} loading={extractLoading}>
                <Sparkles className="h-4 w-4" />Extract specs
              </Button>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <Sparkles className="h-10 w-10 mx-auto mb-3" />
              <p className="mb-1 font-medium text-slate-600">No specs extracted yet</p>
              <p className="text-sm mb-6">Upload a document to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Extracted Text Tab */}
      {activeTab === 'text' && (
        <div className="space-y-4">
          {!doc.extracted_text && !isProcessing && (
            <div className="text-center py-16 text-slate-400">
              <Hash className="h-10 w-10 mx-auto mb-3" />
              <p className="mb-4">No text extracted yet.</p>
              <Button onClick={handleProcess} loading={processLoading}>
                <Play className="h-4 w-4" />Process document
              </Button>
            </div>
          )}
          {isProcessing && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <Loader className="h-5 w-5 text-amber-600 animate-spin" />
              <p className="text-amber-800 text-sm font-medium">Extracting text… refreshing automatically.</p>
            </div>
          )}
          {doc.extracted_text && (
            <>
              <div className="flex items-center gap-4 flex-wrap text-sm text-slate-500">
                <span><strong className="text-slate-900">{chunkCount}</strong> chunks</span>
                <span><strong className="text-slate-900">{doc.extracted_text.length.toLocaleString()}</strong> characters</span>
                {doc.page_count && <span><strong className="text-slate-900">{doc.page_count}</strong> pages</span>}
              </div>
              <Card>
                <CardHeader>
                  <h2 className="font-semibold text-slate-900">Text Preview</h2>
                  <p className="text-xs text-slate-400 mt-0.5">First 2,000 characters</p>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-mono bg-slate-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    {doc.extracted_text.slice(0, 2000)}
                    {doc.extracted_text.length > 2000 && (
                      <span className="text-slate-400">{'\n\n… '}{(doc.extracted_text.length - 2000).toLocaleString()} more characters</span>
                    )}
                  </pre>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div>
          {!canChat ? (
            <div className="text-center py-16">
              <Lock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">Chat requires Professional or Enterprise</h3>
              <p className="text-slate-500 text-sm mb-6">Upgrade to Professional or Enterprise to unlock AI chat with your engineering documents.</p>
              <Link href="/billing"><Button><Zap className="h-4 w-4" />View plans</Button></Link>
            </div>
          ) : (
            <ChatPanel
              doc={doc}
              messages={messages}
              setMessages={setMessages}
              input={input}
              setInput={setInput}
              chatLoading={chatLoading}
              setChatLoading={setChatLoading}
              chunkCount={chunkCount}
              chatEndRef={chatEndRef}
              handleSendMessage={handleSendMessage}
              maxLen={MAX_QUESTION_LEN}
            />
          )}
        </div>
      )}
      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </main>
  )
}

// ---------------------------------------------------------------------------
// UpgradeModal
// ---------------------------------------------------------------------------
function UpgradeModal({ onClose }: { onClose: () => void }) {
  async function handleUpgrade() {
    try {
      const res = await fetch('/api/billing/checkout', { method: 'POST' })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start checkout')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <Download className="h-7 w-7 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">PDF Export requires a paid plan</h2>
          <p className="text-slate-500 text-sm">
            Upgrade to download a formatted Spec Summary Report for this document.
          </p>
        </div>

        <ul className="space-y-2 mb-6">
          {[
            'Unlimited document uploads',
            'AI chat with your documents',
            'PDF report export',
            'Priority processing',
          ].map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
              <Check className="h-4 w-4 text-blue-500 shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        <Button className="w-full mb-3" onClick={handleUpgrade}>
          <Zap className="h-4 w-4" />
          Upgrade — from $79/mo
        </Button>
        <Link href="/billing" className="block text-center text-xs text-slate-400 hover:text-slate-600">
          View plan details
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ChatPanel
// ---------------------------------------------------------------------------
interface ChatPanelProps {
  doc: Document
  messages: ChatMessage[]
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  input: string
  setInput: React.Dispatch<React.SetStateAction<string>>
  chatLoading: boolean
  setChatLoading: React.Dispatch<React.SetStateAction<boolean>>
  chunkCount: number
  chatEndRef: React.RefObject<HTMLDivElement | null>
  handleSendMessage: (e: React.FormEvent) => Promise<void>
  maxLen: number
}

function ChatPanel({
  doc, messages, input, setInput, chatLoading, chunkCount,
  chatEndRef, handleSendMessage, maxLen,
}: ChatPanelProps) {
  const overLimit = input.length > maxLen

  return (
    <div className="flex flex-col h-[65vh] max-h-160">
      {/* No-chunks warning */}
      {chunkCount === 0 && (
        <div className="mb-3 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <Loader className="h-4 w-4 shrink-0" />
          <span>Process the document first so the chat has content to search.</span>
        </div>
      )}

      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Bot className="h-10 w-10 mx-auto mb-3" />
            <p className="text-sm font-medium">Ask anything about this document.</p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {[
                'What is the material specification?',
                'List all thread call-outs',
                'What surface finish is required?',
                'Are there any heat treatment requirements?',
              ].map(q => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-blue-600" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
            }`}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-slate-600" />
              </div>
            )}
          </div>
        ))}

        {chatLoading && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-blue-600" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl rounded-bl-none px-4 py-3">
              <Loader className="h-4 w-4 text-slate-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="space-y-1.5">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage(e as unknown as React.FormEvent)
              }
            }}
            placeholder="Ask about this document… (Enter to send, Shift+Enter for new line)"
            rows={2}
            className={`flex-1 px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 resize-none ${
              overLimit
                ? 'border-red-400 focus:ring-red-400'
                : 'border-slate-300 focus:ring-blue-500'
            }`}
            disabled={chatLoading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || chatLoading || overLimit}
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex justify-between text-xs text-slate-400 px-1">
          <span>↑ Retrieves top {Math.min(6, chunkCount || 6)} relevant chunks from {chunkCount} total</span>
          <span className={overLimit ? 'text-red-500 font-medium' : ''}>
            {input.length}/{maxLen}
          </span>
        </div>
      </form>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SpecsPanel
// ---------------------------------------------------------------------------
function SpecsPanel({ specs, docFilename }: { specs: ExtractedSpecs; docFilename: string }) {
  const [copied, setCopied] = useState(false)

  function copyJson() {
    navigator.clipboard.writeText(JSON.stringify(specs, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const confidence = Math.round((specs.confidence ?? 0) * 100)
  const confidenceColor =
    confidence >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
    confidence >= 50 ? 'text-amber-700 bg-amber-50 border-amber-200' :
                      'text-red-700 bg-red-50 border-red-200'

  const identificationFields: { key: keyof ExtractedSpecs; label: string }[] = [
    { key: 'part_number',    label: 'Part Number' },
    { key: 'drawing_number', label: 'Drawing No.' },
    { key: 'revision',       label: 'Revision' },
    { key: 'title',          label: 'Title' },
  ]

  const propertyFields: { key: keyof ExtractedSpecs; label: string }[] = [
    { key: 'material',          label: 'Material' },
    { key: 'heat_treatment',    label: 'Heat Treatment' },
    { key: 'coating_finish',    label: 'Coating / Finish' },
    { key: 'surface_finish',    label: 'Surface Finish' },
    { key: 'tolerance_general', label: 'General Tolerance' },
    { key: 'weight',            label: 'Weight' },
  ]

  const hasIdentification = identificationFields.some(f => specs[f.key])

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Extraction confidence:</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${confidenceColor}`}>
            {confidence}%
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={copyJson}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy JSON'}
        </Button>
      </div>

      {/* Identification */}
      {hasIdentification && (
        <Card>
          <CardHeader><h2 className="font-semibold text-slate-900">Identification</h2></CardHeader>
          <CardContent>
            <dl className="divide-y divide-slate-50">
              {identificationFields.map(({ key, label }) => {
                const val = specs[key] as string | null
                if (!val) return null
                return (
                  <div key={key} className="flex gap-4 py-2.5 first:pt-0 last:pb-0">
                    <dt className="w-24 sm:w-36 shrink-0 text-xs font-medium text-slate-500 uppercase tracking-wide pt-0.5">{label}</dt>
                    <dd className="text-sm text-slate-900 flex-1">{val}</dd>
                  </div>
                )
              })}
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Properties */}
      <Card>
        <CardHeader><h2 className="font-semibold text-slate-900">Properties</h2></CardHeader>
        <CardContent>
          <dl className="divide-y divide-slate-50">
            {propertyFields.map(({ key, label }) => {
              const val = specs[key] as string | null
              return (
                <div key={key} className="flex gap-4 py-2.5 first:pt-0 last:pb-0">
                  <dt className="w-36 shrink-0 text-xs font-medium text-slate-500 uppercase tracking-wide pt-0.5">{label}</dt>
                  <dd className="text-sm text-slate-900 flex-1">{val ?? <span className="text-slate-300 italic">—</span>}</dd>
                </div>
              )
            })}
          </dl>
        </CardContent>
      </Card>

      {/* Critical dimensions */}
      {specs.critical_dimensions.length > 0 && (
        <CollapsibleCard title="Critical Dimensions">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left pb-2 pr-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Name</th>
                <th className="text-left pb-2 text-xs font-medium text-slate-500 uppercase tracking-wide">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {specs.critical_dimensions.map((d, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-2 pr-4 text-slate-700 font-medium">{d.name}</td>
                  <td className="py-2 font-mono text-slate-900">{d.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CollapsibleCard>
      )}

      {/* Threads */}
      {specs.threads.length > 0 && (
        <CollapsibleCard title="Threads">
          <ul className="space-y-1.5">
            {specs.threads.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-800">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                <span className="font-mono">{t}</span>
              </li>
            ))}
          </ul>
        </CollapsibleCard>
      )}

      {/* Process requirements */}
      {specs.process_requirements.length > 0 && (
        <CollapsibleCard title="Process Requirements">
          <ul className="space-y-1.5">
            {specs.process_requirements.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </CollapsibleCard>
      )}

      {/* Test requirements */}
      {specs.test_requirements.length > 0 && (
        <CollapsibleCard title="Test & Inspection Requirements">
          <ul className="space-y-1.5">
            {specs.test_requirements.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </CollapsibleCard>
      )}

      {/* Operating conditions */}
      {specs.operating_conditions.length > 0 && (
        <CollapsibleCard title="Operating Conditions">
          <ul className="space-y-1.5">
            {specs.operating_conditions.map((o, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-400 shrink-0" />
                {o}
              </li>
            ))}
          </ul>
        </CollapsibleCard>
      )}

      {/* Standards */}
      {specs.standards.length > 0 && (
        <CollapsibleCard title="Referenced Standards">
          <div className="flex flex-wrap gap-2">
            {specs.standards.map((s, i) => (
              <span key={i} className="text-xs font-mono font-medium px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
                {s}
              </span>
            ))}
          </div>
        </CollapsibleCard>
      )}

      {/* Notes */}
      {specs.notes.length > 0 && (
        <CollapsibleCard title="Engineering Notes">
          <ol className="space-y-2">
            {specs.notes.map((note, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-700">
                <span className="text-slate-400 shrink-0 tabular-nums">{i + 1}.</span>
                {note}
              </li>
            ))}
          </ol>
        </CollapsibleCard>
      )}

      {/* Raw JSON (collapsed by default) */}
      <CollapsibleCard title="Raw JSON" defaultExpanded={false}>
        <pre className="text-xs font-mono text-slate-700 bg-slate-50 rounded-lg p-4 overflow-x-auto max-h-64 overflow-y-auto leading-relaxed">
          {JSON.stringify(specs, null, 2)}
        </pre>
      </CollapsibleCard>
    </div>
  )
}

function CollapsibleCard({
  title,
  children,
  defaultExpanded = true,
}: {
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  return (
    <Card>
      <CardHeader>
        <button
          className="flex items-center justify-between w-full"
          onClick={() => setExpanded(!expanded)}
        >
          <h2 className="font-semibold text-slate-900">{title}</h2>
          {expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </button>
      </CardHeader>
      {expanded && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    uploaded: 'info',
    processing: 'warning',
    ready: 'success',
    error: 'danger',
  }
  return <Badge variant={map[status] ?? 'default'}>{status}</Badge>
}
