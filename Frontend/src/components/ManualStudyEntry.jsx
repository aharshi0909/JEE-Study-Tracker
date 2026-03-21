import { useState } from 'react'
import { submitManualEntry } from '../utils/api'

const SUBJECTS = ['Physics', 'Chemistry', 'Math', 'Biology', 'Other']

export default function ManualStudyEntry({ onEntryAdded }) {
  const [form, setForm] = useState({
    subject: 'Physics', topic: '', location: '', estimatedTime: '', description: '', problemsSolved: ''
  })
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.topic || !form.location || !form.estimatedTime || !form.description) return
    setIsLoading(true)
    setError('')
    setResult(null)
    try {
      const { entry } = await submitManualEntry(form)
      setResult(entry)
      setForm({ subject: 'Physics', topic: '', location: '', estimatedTime: '', description: '', problemsSolved: '' })
      if (onEntryAdded) onEntryAdded()
    } catch (e) { setError(e.message) }
    setIsLoading(false)
  }

  const approvalPct = result ? Math.round((result.approvedTime / result.requestedTime) * 100) : 0
  const approvalColor = approvalPct >= 90 ? 'text-emerald-400' : approvalPct >= 60 ? 'text-amber-400' : 'text-rose-400'
  const borderColor = approvalPct >= 90 ? 'border-emerald-500/40' : approvalPct >= 60 ? 'border-amber-500/40' : 'border-rose-500/40'
  const bgColor = approvalPct >= 90 ? 'bg-emerald-500/10' : approvalPct >= 60 ? 'bg-amber-500/10' : 'bg-rose-500/10'

  return (
    <div className="card">
      <h2 className="section-title">
        <span className="text-xl">✍️</span>
        AI-Verified Manual Study Entry
        <span className="ml-1 text-xs badge bg-amber-500/20 text-amber-400 border border-amber-500/30">Strict Verification</span>
      </h2>
      <p className="text-xs text-slate-500 -mt-2 mb-4">Studied away from your laptop? Submit details for strict AI verification. Exaggerated claims will be penalized.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">Subject *</label>
              <select className="select-field" value={form.subject} onChange={e => update('subject', e.target.value)}>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">Claimed Time (hrs) *</label>
              <input type="number" step="0.25" min="0.25" max="12" className="input-field" placeholder="2.5" required
                value={form.estimatedTime} onChange={e => update('estimatedTime', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">Topic Studied *</label>
            <input type="text" className="input-field" placeholder="e.g., Electrostatics – Gauss Law & Numericals" required
              value={form.topic} onChange={e => update('topic', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">Location *</label>
            <input type="text" className="input-field" placeholder="e.g., Coaching center, Library, Home" required
              value={form.location} onChange={e => update('location', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">Detailed Description * <span className="text-slate-600 normal-case">(be specific — AI will verify)</span></label>
            <textarea rows={4} className="input-field resize-none" required
              placeholder="Describe exactly what you studied. Include chapter names, formulas revised, specific numericals solved, doubts cleared, etc. Vague answers will be penalized."
              value={form.description} onChange={e => update('description', e.target.value)} />
            <p className="text-xs text-slate-600 mt-1">{form.description.length} chars — aim for 200+ for full approval</p>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">Problems Solved</label>
            <input type="number" min="0" className="input-field" placeholder="0"
              value={form.problemsSolved} onChange={e => update('problemsSolved', e.target.value)} />
          </div>
          {error && <p className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                AI Verifying...
              </span>
            ) : '🤖 Submit for AI Verification'}
          </button>
        </form>

        <div className="flex flex-col gap-4">
          {result ? (
            <div className={`border rounded-2xl p-5 ${bgColor} ${borderColor}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-white">AI Verification Result</h3>
                <span className={`text-2xl font-black ${approvalColor}`}>{approvalPct}% approved</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">You claimed:</span>
                  <span className="font-semibold text-white">{result.requestedTime}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">AI approved:</span>
                  <span className={`font-bold text-lg ${approvalColor}`}>{result.approvedTime}h</span>
                </div>
                <div className="progress-bar">
                  <div className={`progress-fill ${approvalPct >= 90 ? 'bg-emerald-500' : approvalPct >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${approvalPct}%` }} />
                </div>
                <div className="bg-black/20 rounded-xl p-3 mt-2">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">AI Reasoning</p>
                  <p className="text-sm text-slate-300 italic">{result.aiReason}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div className="bg-slate-800/50 rounded-lg p-2">
                    <p className="text-slate-500">Subject</p>
                    <p className="font-semibold text-slate-200">{result.subject}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-2">
                    <p className="text-slate-500">Date</p>
                    <p className="font-semibold text-slate-200">{result.date}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">✓ Included in daily & weekly hour counts</p>
              </div>
            </div>
          ) : (
            <div className="border border-slate-800 rounded-2xl p-5 flex-1 flex flex-col items-center justify-center text-center">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-sm font-semibold text-slate-400">Fill in the form and submit.</p>
              <p className="text-xs text-slate-600 mt-2">The AI will analyze your claim against your study history, detail level, and consistency. Be honest — exaggeration reduces your trust score.</p>
              <div className="mt-6 space-y-2 text-left w-full max-w-xs">
                <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">What the AI evaluates:</p>
                {['Detail and specificity of description', 'Consistency with past study patterns', 'Realistic duration for the topic', 'Number of problems vs time claimed'].map(item => (
                  <p key={item} className="text-xs text-slate-500 flex gap-2"><span className="text-indigo-500">›</span>{item}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
