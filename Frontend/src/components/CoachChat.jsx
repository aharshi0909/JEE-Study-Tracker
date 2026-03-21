import { useState, useEffect, useRef } from 'react'
import { sendCoachMessage, getCoachHistory, clearCoachHistory } from '../utils/api'

function ChatMessage({ msg }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <div className="chat-bubble-user">{msg.userMessage}</div>
      </div>
      <div className="flex justify-start">
        <div className="chat-bubble-ai">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🤖</span>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">AI Coach</span>
          </div>
          {msg.aiReply}
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2">
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
        <span className="text-sm">🤖</span>
        <div className="flex gap-1">
          {[0,1,2].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full bg-indigo-400 typing-dot`} style={{ animationDelay: `${i*0.2}s` }} />)}
        </div>
      </div>
    </div>
  )
}

export default function CoachChat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    getCoachHistory().then(({ history }) => setMessages(history || [])).catch(() => {})
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = async () => {
    const msg = input.trim()
    if (!msg || isLoading) return
    setInput('')
    setIsLoading(true)
    setError('')
    const optimistic = { userMessage: msg, aiReply: null }
    setMessages(prev => [...prev, optimistic])
    try {
      const { reply } = await sendCoachMessage(msg)
      setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { userMessage: msg, aiReply: reply } : m))
    } catch (e) {
      setError(e.message)
      setMessages(prev => prev.slice(0, -1))
    }
    setIsLoading(false)
  }

  const handleClear = async () => {
    if (!confirm('Clear entire coach chat history?')) return
    await clearCoachHistory()
    setMessages([])
  }

  return (
    <div className="card flex flex-col h-[520px]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title mb-0">
          <span className="text-xl">🧠</span>
          <span>AI Coach</span>
          <span className="ml-1 text-xs badge bg-rose-500/20 text-rose-400 border border-rose-500/30">Strict</span>
        </h2>
        <button onClick={handleClear} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Clear</button>
      </div>

      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <p className="text-4xl mb-3">🔥</p>
          <p className="text-sm font-semibold text-slate-300">Your accountability coach is ready.</p>
          <p className="text-xs text-slate-600 mt-1">Ask about your progress, get brutal feedback, or request a pep talk.</p>
          <div className="mt-4 space-y-1">
            {["How am I doing today?", "What should I focus on?", "Rate my week honestly"].map(q => (
              <button key={q} onClick={() => setInput(q)} className="block w-full text-xs bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-400 text-left transition-all">
                "{q}"
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((m, i) => <ChatMessage key={i} msg={m} />)}
        {isLoading && <TypingIndicator />}
        {error && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-800">
        <input type="text" className="input-field flex-1" placeholder="Talk to your coach..." value={input}
          onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
        <button onClick={handleSend} disabled={isLoading || !input.trim()} className="btn-primary px-4">
          {isLoading ? '...' : '↑'}
        </button>
      </div>
    </div>
  )
}
