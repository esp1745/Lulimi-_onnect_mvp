'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

const ZAMBIAN_LANGUAGES = ['Bemba', 'Nyanja', 'Tonga', 'Lozi', 'Kaonde', 'Luvale', 'Lunda', 'Tumbuka', 'Other']
const LEVELS = ['beginner', 'intermediate', 'advanced']

const QUICK_PROMPTS = [
  { prompt_type: 'lesson_ideas', label: 'Lesson ideas', needs_topic: true },
  { prompt_type: 'vocabulary', label: 'Vocabulary list', needs_topic: true },
  { prompt_type: 'pronunciation', label: 'Pronunciation prompts', needs_topic: false },
  { prompt_type: 'quiz', label: 'Quiz / test', needs_topic: true },
  { prompt_type: 'homework', label: 'Homework', needs_topic: true },
  { prompt_type: 'phrase_practice', label: 'Phrase practice', needs_topic: true },
]

interface Props {
  role?: 'teacher' | 'learner'
  onSaveAsResource?: (content: string) => void
}

export default function AIAssistant({ role = 'teacher', onSaveAsResource }: Props) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<typeof QUICK_PROMPTS[0] | null>(null)
  const [language, setLanguage] = useState('Bemba')
  const [level, setLevel] = useState('beginner')
  const [topic, setTopic] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [result, setResult] = useState('')
  const [edited, setEdited] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    setResult('')
    setEdited('')
    try {
      const payload: Record<string, string> = { language, level }
      if (customPrompt) {
        payload.custom_prompt = customPrompt
      } else if (selected) {
        payload.prompt_type = selected.prompt_type
        if (selected.needs_topic) payload.topic = topic
      } else {
        toast.error('Select a prompt type or enter a custom prompt.')
        setLoading(false)
        return
      }
      const { data } = await api.post('/api/ai/generate/', payload)
      setResult(data.result)
      setEdited(data.result)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'AI generation failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(edited)
    toast.success('Copied to clipboard.')
  }

  const handleSave = () => {
    if (onSaveAsResource) {
      onSaveAsResource(edited)
      toast.success('Content copied to new resource draft.')
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Panel */}
      {open && (
        <div className="w-[360px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-purple-100 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">AI Teaching Assistant</span>
              <Badge className="bg-white/20 text-white border-0 text-xs">Beta</Badge>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white text-lg leading-none">×</button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 p-4 space-y-4">
            {/* Quick actions */}
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium">Quick actions</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS
                  .filter((p) => role === 'learner' ? ['phrase_practice', 'vocabulary'].includes(p.prompt_type) : true)
                  .map((p) => (
                    <button
                      key={p.prompt_type}
                      onClick={() => { setSelected(p); setCustomPrompt('') }}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        selected?.prompt_type === p.prompt_type
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
              </div>
            </div>

            {/* Language + Level */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full border rounded-md px-2 py-1.5 text-xs bg-white">
                  {ZAMBIAN_LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Level</label>
                <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full border rounded-md px-2 py-1.5 text-xs bg-white capitalize">
                  {LEVELS.map((l) => <option key={l} className="capitalize">{l}</option>)}
                </select>
              </div>
            </div>

            {/* Topic */}
            {(selected?.needs_topic || !selected) && !customPrompt && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Topic</label>
                <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. greetings, family members…" className="text-xs h-8" />
              </div>
            )}

            {/* Custom prompt */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Or write your own prompt</label>
              <Textarea
                value={customPrompt}
                onChange={(e) => { setCustomPrompt(e.target.value); if (e.target.value) setSelected(null) }}
                placeholder="e.g. Write a dialogue for two people meeting in Bemba…"
                rows={2}
                className="text-xs resize-none"
              />
            </div>

            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white w-full"
              onClick={handleGenerate}
              disabled={loading || (!selected && !customPrompt)}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  Generating…
                </span>
              ) : 'Generate'}
            </Button>

            {/* Result */}
            {result && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-600">Result — edit before using</p>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={handleCopy}>Copy</Button>
                    {onSaveAsResource && (
                      <Button size="sm" className="h-6 text-xs px-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSave}>Save</Button>
                    )}
                  </div>
                </div>
                <Textarea value={edited} onChange={(e) => setEdited(e.target.value)} rows={8} className="text-xs font-mono resize-none" />
                <p className="text-xs text-gray-400">⚠️ Review before sharing with students.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-14 w-14 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        aria-label="AI Assistant"
      >
        <span className="text-sm font-bold tracking-wide">{open ? '✕' : 'AI'}</span>
      </button>
    </div>
  )
}
