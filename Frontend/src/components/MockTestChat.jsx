import { useState, useEffect, useRef } from 'react'
import { addMockTest, sendMockMessage, getMockTests } from '../utils/api'

const SUBJECTS = ['Physics', 'Chemistry', 'Math', 'Biology']
const SUBJECT_COLORS = { Physics: 'text-blue-400', Chemistry: 'text-emerald-400', Math: 'text-violet-400', Biology: 'text-orange-400' }

export default function MockTestChat({ onTestAdded }) {
  const [tab, setTab] = useState('chat')
  const [messages, setMessages] = useState([])
  const [tests, setTests] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ subject: 'Physics', testName: '', marks: '', maxMarks: '', date: new Date().toISOString().split('T')[0], notes: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    getMockTests().then(({ tests: t, chatHistory }) => {
      setTests(t || [])
      setMessages(chatHistory || [])
    }).catch(() => {})
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isLoading])

  const handleTestSubmit = async (e) => {
    e.preventDefault()
    if (!form.testName || !form.marks || !form.maxMarks) return
    setIsSubmitting(true)
    setError('')
    try {
      const { test, analysis } = await addMockTest({ ...form, marks: Number(form.marks), maxMarks: Number(form.maxMarks) })
      setTests(prev => [test, ...prev])
      setMessages(prev => [...prev, { userMessage: `Added: ${form.testName} (${form.subject})`, aiReply: analysis }])
      setForm(f => ({ ...f, testName: '', marks: '', maxMarks: '', notes: '' }))
      setTab('chat')
      if (onTestAdded) onTestAdded()
    } catch (e) { setError(e.message) }
    setIsSubmitting(false)
  }

  const handleChat = async () => {
    const msg = input.trim()
    if (!msg || isLoading) return
    setInput('')
    setIsLoading(true)
    setMessages(prev => [...prev, { userMessage: msg, aiReply: null }])
    try {
      const { reply } = await sendMockMessage(msg)
      setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { userMessage: msg, aiReply: reply } : m))
    } catch (e) {
      setError(e.message)
      setMessages(prev => prev.slice(0, -1))
    }
    setIsLoading(false)
  }

  const getScoreColor = (pct) => pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-rose-400'

  return (
    <div className="card flex flex-col h-[520px]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title mb-0">
          <span className="text-xl">📊</span>
          <span>Mock Test AI</span>
          {tests.length > 0 && <span className="ml-2 text-xs badge bg-blue-500/20 text-blue-400 border border-blue-500/30">{tests.length} tests</span>}
        </h2>
        <div className="flex gap-1">
          {['chat', 'add', 'history'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${tab === t ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
              {t === 'chat' ? '💬' : t === 'add' ? '➕ Add' : '📋 Logs'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'add' && (
        <form onSubmit={handleTestSubmit} className="flex-1 overflow-y-auto space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Subject</label>
              <select className="select-field" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Date</label>
              <input type="date" className="input-field" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Test Name *</label>
            <input type="text" className="input-field" placeholder="e.g., JEE Mock #12 – Physics Full" required value={form.testName} onChange={e => setForm(f => ({ ...f, testName: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Marks *</label>
              <input type="number" className="input-field" placeholder="68" required value={form.marks} onChange={e => setForm(f => ({ ...f, marks: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Max Marks *</label>
              <input type="number" className="input-field" placeholder="120" required value={form.maxMarks} onChange={e => setForm(f => ({ ...f, maxMarks: e.target.value }))} />
            </div>
          </div>
          {form.marks && form.maxMarks && (
            <div className={`text-sm font-bold px-3 py-2 rounded-lg bg-slate-800/60 ${getScoreColor(Math.round(Number(form.marks)/Number(form.maxMarks)*100))}`}>
              Score: {Math.round((Number(form.marks) / Number(form.maxMarks)) * 100)}%
            </div>
          )}
          <div>
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Notes</label>
            <textarea rows={2} className="input-field resize-none" placeholder="Weak areas, time management..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          {error && <p className="text-rose-400 text-xs">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Analyzing with AI...' : '📊 Submit & Get AI Analysis'}
          </button>
        </form>
      )}

      {tab === 'history' && (
        <div className="flex-1 overflow-y-auto space-y-2">
          {tests.length === 0 ? (
            <p className="text-xs text-slate-600 italic text-center py-8">No mock tests recorded yet.</p>
          ) : tests.map(t => (
            <div key={t.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl px-3 py-2.5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-slate-200">{t.testName}</p>
                  <p className={`text-xs ${SUBJECT_COLORS[t.subject] || 'text-slate-400'}`}>{t.subject} · {t.date}</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-black ${getScoreColor(t.percentage)}`}>{t.percentage}%</p>
                  <p className="text-xs text-slate-500">{t.marks}/{t.maxMarks}</p>
                </div>
              </div>
              <div className="progress-bar mt-2">
                <div className={`progress-fill ${t.percentage >= 80 ? 'bg-emerald-500' : t.percentage >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${t.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'chat' && (
        <>
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <p className="text-4xl mb-3">📊</p>
              <p className="text-sm font-semibold text-slate-300">Mock test analysis AI.</p>
              <p className="text-xs text-slate-600 mt-1">Add a test to get instant AI feedback.</p>
              <button onClick={() => setTab('add')} className="btn-primary mt-4 text-sm py-2">+ Add Test Result</button>
            </div>
          )}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.map((m, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-end">
                  <div className="chat-bubble-user">{m.userMessage}</div>
                </div>
                {m.aiReply && (
                  <div className="chat-bubble-ai">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">📊</span>
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Analysis</span>
                    </div>
                    {m.aiReply}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="chat-bubble-ai flex items-center gap-2">
                <span className="text-sm">📊</span>
                <div className="flex gap-1">
                  {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400 typing-dot" style={{ animationDelay: `${i*0.2}s` }} />)}
                </div>
              </div>
            )}
            {error && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{error}</p>}
            <div ref={bottomRef} />
          </div>
          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-800">
            <input type="text" className="input-field flex-1" placeholder="Ask about your performance..." value={input}
              onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChat()} />
            <button onClick={handleChat} disabled={isLoading || !input.trim()} className="btn-primary px-4">
              {isLoading ? '...' : '↑'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
