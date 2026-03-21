import { useState, useEffect } from 'react'
import { getStudyLogs } from '../utils/api'

const SUBJECT_COLORS = { Physics: 'bg-blue-500/20 text-blue-400 border-blue-500/30', Chemistry: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', Math: 'bg-violet-500/20 text-violet-400 border-violet-500/30', Biology: 'bg-orange-500/20 text-orange-400 border-orange-500/30' }
const getSubjectBadge = (s) => SUBJECT_COLORS[s] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'

const TABS = [
  { key: 'sessions', label: '⏱ Sessions', icon: '⏱' },
  { key: 'hourly', label: '📝 Hourly Logs', icon: '📝' },
  { key: 'manual', label: '✍️ Manual', icon: '✍️' },
  { key: 'mocks', label: '📊 Mock Tests', icon: '📊' },
]

function EmptyState({ icon, message }) {
  return (
    <div className="text-center py-12">
      <p className="text-4xl mb-3">{icon}</p>
      <p className="text-slate-600 text-sm">{message}</p>
    </div>
  )
}

export default function StudyLogs() {
  const [tab, setTab] = useState('sessions')
  const [logs, setLogs] = useState({ sessions: [], hourlyLogs: [], manualEntries: [], mockTests: [] })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getStudyLogs().then(data => { setLogs(data); setIsLoading(false) }).catch(() => setIsLoading(false))
    const interval = setInterval(() => {
      getStudyLogs().then(data => setLogs(data)).catch(() => {})
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const formatDate = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0">
          <span className="text-xl">📚</span>
          Study Logs &amp; Analytics
        </h2>
        <button onClick={() => getStudyLogs().then(data => setLogs(data)).catch(() => {})} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">↻ Refresh</button>
      </div>

      <div className="flex gap-1 mb-4 bg-slate-900/60 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${tab === t.key ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto space-y-2">

          {tab === 'sessions' && (
            logs.sessions.length === 0 ? <EmptyState icon="⏱" message="No study sessions yet. Start your first timer!" /> :
            logs.sessions.map((s, i) => (
              <div key={s.id || i} className="flex items-center gap-3 bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs badge border ${getSubjectBadge(s.subject)}`}>{s.subject}</span>
                    <span className="text-xs text-slate-500">{formatDate(s.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-xs text-slate-500">Start: <span className="text-slate-400">{new Date(s.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></p>
                    {s.endTime && <p className="text-xs text-slate-500">End: <span className="text-slate-400">{new Date(s.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-indigo-400 font-mono">{s.durationFormatted}</p>
                  <p className="text-xs text-slate-600">{s.date}</p>
                </div>
              </div>
            ))
          )}

          {tab === 'hourly' && (
            logs.hourlyLogs.length === 0 ? <EmptyState icon="📝" message="No hourly logs yet. They appear after studying for 1 hour." /> :
            logs.hourlyLogs.map((l, i) => (
              <div key={l.id || i} className="bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs badge border ${getSubjectBadge(l.subject)}`}>{l.subject}</span>
                    <span className="text-xs font-semibold text-slate-300">{l.topic}</span>
                  </div>
                  <span className="text-xs text-slate-500">{formatDate(l.timestamp)}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{l.explanation}</p>
              </div>
            ))
          )}

          {tab === 'manual' && (
            logs.manualEntries.length === 0 ? <EmptyState icon="✍️" message="No manual entries yet. Use the form above for offline study." /> :
            logs.manualEntries.map((e, i) => (
              <div key={e.id || i} className="bg-slate-800/40 border border-amber-500/20 rounded-xl px-4 py-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs badge border ${getSubjectBadge(e.subject)}`}>{e.subject}</span>
                    <span className="text-xs font-semibold text-slate-300">{e.topic}</span>
                    <span className="text-xs badge bg-amber-500/15 text-amber-400 border border-amber-500/30">AI Approved</span>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap ml-2">{e.date}</span>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <p className="text-xs text-slate-500">Claimed: <span className="text-slate-400 font-semibold">{e.requestedTime}h</span></p>
                  <p className="text-xs text-slate-500">Approved: <span className={`font-bold ${e.approvedTime >= e.requestedTime * 0.9 ? 'text-emerald-400' : e.approvedTime >= e.requestedTime * 0.6 ? 'text-amber-400' : 'text-rose-400'}`}>{e.approvedTime}h</span></p>
                  <p className="text-xs text-slate-500">Location: <span className="text-slate-400">{e.location}</span></p>
                </div>
                <p className="text-xs text-slate-500 italic">"{e.aiReason}"</p>
              </div>
            ))
          )}

          {tab === 'mocks' && (
            logs.mockTests.length === 0 ? <EmptyState icon="📊" message="No mock tests logged yet. Use the Mock Test AI panel above." /> :
            logs.mockTests.map((t, i) => (
              <div key={t.id || i} className="flex items-center gap-4 bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs badge border ${getSubjectBadge(t.subject)}`}>{t.subject}</span>
                    <span className="text-sm font-semibold text-slate-200 truncate">{t.testName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-slate-500">{t.date}</p>
                    {t.notes && <p className="text-xs text-slate-600 truncate">• {t.notes}</p>}
                  </div>
                  <div className="progress-bar mt-2">
                    <div className={`progress-fill ${t.percentage >= 80 ? 'bg-emerald-500' : t.percentage >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${t.percentage}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-black ${t.percentage >= 80 ? 'text-emerald-400' : t.percentage >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>{t.percentage}%</p>
                  <p className="text-xs text-slate-500 font-mono">{t.marks}/{t.maxMarks}</p>
                </div>
              </div>
            ))
          )}

        </div>
      )}
    </div>
  )
}
