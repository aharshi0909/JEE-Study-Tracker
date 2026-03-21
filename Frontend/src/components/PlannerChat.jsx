import { useState, useEffect, useRef } from 'react'
import { sendPlannerMessage, getPlannerHistory } from '../utils/api'

function PlanBlock({ text }) {
  const lines = (text || '').split('\n')
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const isHeader = line.startsWith('#') || line.startsWith('**')
        const isItem = line.match(/^[-•*]|\d+\.|→|--/)
        const isTimeline = line.includes('→') || line.includes('h)') || line.includes('min)')
        return (
          <p key={i} className={`text-sm ${isHeader ? 'font-bold text-indigo-300 mt-2' : isTimeline ? 'text-emerald-300 font-mono text-xs' : isItem ? 'text-slate-300 pl-2' : 'text-slate-400'}`}>
            {line || ' '}
          </p>
        )
      })}
    </div>
  )
}

export default function PlannerChat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    getPlannerHistory().then(({ history }) => setMessages(history || [])).catch(() => {})
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isLoading])

  const handleSend = async () => {
    const msg = input.trim()
    if (!msg || isLoading) return
    setInput('')
    setIsLoading(true)
    setError('')
    setMessages(prev => [...prev, { userMessage: msg, aiReply: null }])
    try {
      const { reply } = await sendPlannerMessage(msg)
      setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { userMessage: msg, aiReply: reply } : m))
    } catch (e) {
      setError(e.message)
      setMessages(prev => prev.slice(0, -1))
    }
    setIsLoading(false)
  }

  const SUGGESTIONS = ["Plan tomorrow's study schedule", "What should I prioritize this week?", "Build a revision plan for my weak subjects"]

  return (
    <div className="card flex flex-col h-[520px]">
      <h2 className="section-title mb-3">
        <span className="text-xl">📅</span>
        <span>Daily Planner AI</span>
        <span className="ml-1 text-xs badge bg-violet-500/20 text-violet-400 border border-violet-500/30">Smart</span>
      </h2>

      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm font-semibold text-slate-300">AI-powered JEE study planner.</p>
          <p className="text-xs text-slate-600 mt-1">Uses your mock scores, weak subjects & past patterns.</p>
          <div className="mt-4 space-y-1">
            {SUGGESTIONS.map(q => (
              <button key={q} onClick={() => setInput(q)} className="block w-full text-xs bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-400 text-left transition-all">
                "{q}"
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((m, i) => (
          <div key={i} className="space-y-3">
            <div className="flex justify-end">
              <div className="chat-bubble-user">{m.userMessage}</div>
            </div>
            {m.aiReply && (
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 text-sm max-w-[95%]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📅</span>
                  <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">Study Plan</span>
                </div>
                <PlanBlock text={m.aiReply} />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
            <span className="text-sm">📅</span>
            <div className="flex gap-1">
              {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400 typing-dot" style={{ animationDelay: `${i*0.2}s` }} />)}
            </div>
            <span className="text-xs text-slate-500">Building your plan...</span>
          </div>
        )}
        {error && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-800">
        <input type="text" className="input-field flex-1" placeholder="Plan my study day..." value={input}
          onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
        <button onClick={handleSend} disabled={isLoading || !input.trim()} className="btn-primary px-4">
          {isLoading ? '...' : '↑'}
        </button>
      </div>
    </div>
  )
}
