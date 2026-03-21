import { useState, useEffect, useRef } from 'react'
import { startSession, endSession, getActiveSession, pauseSession, resumeSession, addHourlyLog } from '../utils/api'
import yaySound from '../assets/kids-saying-yay-sound-effect_3.mp3'

const SUBJECTS = ['Physics', 'Chemistry', 'Math']
const SUBJECT_COLORS = { Physics: 'bg-blue-500/20 text-blue-400 border-blue-500/30', Chemistry: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', Math: 'bg-violet-500/20 text-violet-400 border-violet-500/30', Biology: 'bg-orange-500/20 text-orange-400 border-orange-500/30', Other: 'bg-slate-500/20 text-slate-400 border-slate-500/30' }

function formatTime(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

export default function StudyTimer({ onSessionChange }) {
  const [subject, setSubject] = useState('Physics')
  const [customSubject, setCustomSubject] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [lastHourCheck, setLastHourCheck] = useState(0)
  const [showHourlyModal, setShowHourlyModal] = useState(false)
  const [hourlyTopic, setHourlyTopic] = useState('')
  const [hourlyExplanation, setHourlyExplanation] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isPaused, setIsPaused] = useState(false)
  const [isEndingSession, setIsEndingSession] = useState(false)
  const [sessionLog, setSessionLog] = useState([])
  const intervalRef = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission()
      }
    }
  }, [])

  useEffect(() => {
    if (showHourlyModal) {
      const audio = new Audio(yaySound)
      audio.play().catch(e => console.error("Audio play failed:", e))

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification("Study Checkpoint! ⏱", {
          body: isEndingSession ? "Phase complete. Time for the final log!" : "One hour completed! Please log your topics.",
          icon: "/vite.svg"
        })
      }
    }
  }, [showHourlyModal, isEndingSession])

  useEffect(() => {
    getActiveSession().then((res) => {
      const active = res?.active || res?.data?.active || (res?.id ? res : null)
      if (active && active.status) {
        let totalElapsed = Date.now() - new Date(active.startTime).getTime()
        let totalPaused = 0
        if (Array.isArray(active.pauses)) {
          active.pauses.forEach(p => {
             const pStart = new Date(p.pauseTime).getTime()
             const pEnd = p.resumeTime ? new Date(p.resumeTime).getTime() : Date.now()
             if (!isNaN(pStart) && !isNaN(pEnd)) {
               totalPaused += (pEnd - pStart)
             }
          })
        }
        const calcElapsed = Math.max(0, Math.floor((totalElapsed - totalPaused) / 1000))
        setIsRunning(true)
        setIsPaused(active.status === 'paused')
        setSubject(active.subject || 'Physics')
        setElapsed(calcElapsed)
        setLastHourCheck(Math.floor(calcElapsed / 3600) * 3600)
        setStartTime(new Date(active.startTime))
      }
    }).catch(err => {
      console.error("Failed to recover active session:", err)
    })
  }, [])

  useEffect(() => {
    let lastTick = Date.now()
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        const now = Date.now()
        const deltaSecs = Math.floor((now - lastTick) / 1000)

        if (deltaSecs >= 1) {
          setElapsed(prev => {
            const next = prev + deltaSecs
            if (next - lastHourCheck >= 3600 && !showHourlyModal && !isEndingSession) {
              setShowHourlyModal(true)
            }
            return next
          })
          lastTick += deltaSecs * 1000
        }
      }, 500)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning, isPaused, lastHourCheck, showHourlyModal, isEndingSession])

  const effectiveSubject = subject === 'Other' ? (customSubject || 'Other') : subject

  const handleStart = async () => {
    setError('')
    setIsLoading(true)
    try {
      await startSession(effectiveSubject)
      setIsRunning(true)
      setElapsed(0)
      setLastHourCheck(0)
      setStartTime(new Date())
      if (onSessionChange) onSessionChange()
    } catch (e) { setError(e.message) }
    setIsLoading(false)
  }

  const handlePause = async () => {
    setIsLoading(true)
    setError('')
    try {
      await pauseSession()
      setIsPaused(true)
    } catch (e) { setError(e.message) }
    setIsLoading(false)
  }

  const handleResume = async () => {
    setIsLoading(true)
    setError('')
    try {
      await resumeSession()
      setIsPaused(false)
    } catch (e) { setError(e.message) }
    setIsLoading(false)
  }

  const handleStop = async () => {
    setError('')
    setIsLoading(true)
    try {
      const result = await endSession()
      setIsRunning(false)
      setIsPaused(false)
      setIsEndingSession(false)
      setElapsed(0)
      setLastHourCheck(0)
      setShowHourlyModal(false)
      setSessionLog(prev => [{ ...result.session, id: result.session.id }, ...prev].slice(0, 5))
      if (onSessionChange) onSessionChange()
    } catch (e) {
      setError(e.message)
      setIsLoading(false)
    }
  }

  const triggerEndSession = () => {
    const fractionalSeconds = elapsed - lastHourCheck
    if (fractionalSeconds >= 600) {
      setIsEndingSession(true)
      setShowHourlyModal(true)
    } else {
      handleStop()
    }
  }

  const handleHourlySubmit = async () => {
    if (!hourlyTopic.trim() || !hourlyExplanation.trim()) return
    setIsLoading(true)
    try {
      await addHourlyLog({ subject: effectiveSubject, topic: hourlyTopic.trim(), explanation: hourlyExplanation.trim() })
      setLastHourCheck(elapsed)
      setShowHourlyModal(false)
      setHourlyTopic('')
      setHourlyExplanation('')
      if (onSessionChange) onSessionChange()
      if (isEndingSession) {
        await handleStop()
      } else {
        setIsLoading(false)
      }
    } catch (e) {
      setError(e.message)
      setIsLoading(false)
    }
  }

  const handleSkipHourly = async () => {
    setShowHourlyModal(false)
    if (isEndingSession) {
      await handleStop()
    }
  }

  const circumference = 2 * Math.PI * 90
  const hourProgress = Math.min((elapsed - lastHourCheck) / 3600, 1)
  const dashOffset = circumference * (1 - hourProgress)
  const subjectColor = SUBJECT_COLORS[subject] || SUBJECT_COLORS.Other

  return (
    <div className="card h-full flex flex-col gap-4">
      <h2 className="section-title">
        <span className="text-2xl">⏱</span> Study Timer
        {isRunning && !isPaused && <span className="ml-auto text-xs badge bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">LIVE</span>}
        {isPaused && <span className="ml-auto text-xs badge bg-amber-500/20 text-amber-400 border border-amber-500/30">PAUSED</span>}
      </h2>

      <div className="flex justify-center">
        <div className={`relative ${isRunning ? 'timer-glow' : ''}`}>
          <svg width="220" height="220" viewBox="0 0 220 220">
            <circle cx="110" cy="110" r="90" fill="none" stroke="#1e293b" strokeWidth="10" />
            <circle cx="110" cy="110" r="90" fill="none"
              stroke={isRunning ? (isPaused ? '#f59e0b' : '#6366f1') : '#334155'}
              strokeWidth="10" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={isRunning ? dashOffset : circumference}
              transform="rotate(-90 110 110)"
              className="timer-ring"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-mono font-bold text-white">{formatTime(elapsed)}</span>
            <span className={`mt-1 text-xs px-3 py-1 rounded-full border ${subjectColor}`}>{effectiveSubject}</span>
            {isRunning && <span className="mt-1 text-xs text-slate-500">{Math.round((elapsed - lastHourCheck) / 60)} min to next log</span>}
          </div>
        </div>
      </div>

      {!isRunning && (
        <div className="space-y-2">
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Select Subject</label>
          <div className="grid grid-cols-3 gap-2">
            {SUBJECTS.map(s => (
              <button key={s} onClick={() => setSubject(s)}
                className={`py-2 px-3 rounded-xl text-sm font-semibold border transition-all duration-200 ${subject === s ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'}`}>
                {s}
              </button>
            ))}
          </div>
          {subject === 'Other' && (
            <input type="text" placeholder="Enter custom subject..." className="input-field mt-1" value={customSubject} onChange={e => setCustomSubject(e.target.value)} />
          )}
        </div>
      )}

      <div className="flex gap-3 mt-auto">
        {!isRunning ? (
          <button onClick={handleStart} disabled={isLoading} className="btn-primary flex-1 py-3 text-base">
            {isLoading ? 'Starting...' : '▶ Start Session'}
          </button>
        ) : (
          <>
            {!isPaused ? (
              <button onClick={handlePause} disabled={isLoading || isEndingSession} className="btn-secondary flex-1 py-3 text-base bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700">
                ⏸ Pause
              </button>
            ) : (
              <button onClick={handleResume} disabled={isLoading || isEndingSession} className="btn-primary flex-1 py-3 text-base">
                ▶ Resume
              </button>
            )}
            <button onClick={triggerEndSession} disabled={isLoading || isEndingSession} className="btn-danger flex-1 py-3 text-base">
              {(isLoading && isEndingSession) ? 'Saving...' : '⏹ End Session'}
            </button>
          </>
        )}
      </div>

      {error && <p className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{error}</p>}

      {sessionLog.length > 0 && (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Today's Sessions</p>
          {sessionLog.map(s => (
            <div key={s.id} className="flex justify-between text-xs bg-slate-800/40 rounded-lg px-3 py-2 border border-slate-700/50">
              <span className="text-slate-400">{s.subject}</span>
              <span className="text-indigo-400 font-mono">{s.durationFormatted}</span>
            </div>
          ))}
        </div>
      )}

      {showHourlyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-indigo-500/50 rounded-2xl p-6 max-w-lg w-full shadow-2xl shadow-indigo-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-xl">🔔</div>
              <div>
                <h3 className="text-base font-bold text-white">{isEndingSession ? 'Final Session Log' : '1 Hour Checkpoint'}</h3>
                <p className="text-xs text-slate-400">Subject: <span className="text-indigo-400 font-semibold">{effectiveSubject}</span></p>
              </div>
              <div className="ml-auto text-xs text-rose-400 font-semibold uppercase">Required</div>
            </div>
            <p className="text-sm text-slate-300 mb-4 italic">
              {isEndingSession ? `"What did you study in the final ${Math.round((elapsed - lastHourCheck) / 60)} minutes?"` : `"What exactly did you study in the past hour?"`}
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">Topic Covered *</label>
                <input type="text" className="input-field" placeholder="e.g., Newton's Laws of Motion" value={hourlyTopic} onChange={e => setHourlyTopic(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">Detailed Explanation *</label>
                <textarea rows={4} className="input-field resize-none" placeholder="Explain in detail what you learned, problems solved, concepts revised..." value={hourlyExplanation} onChange={e => setHourlyExplanation(e.target.value)} />
                <p className="text-xs text-slate-600 mt-1">Min 50 chars for good FIS score. Current: {hourlyExplanation.length}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleHourlySubmit} disabled={isLoading || !hourlyTopic.trim() || !hourlyExplanation.trim()} className="btn-primary flex-1">
                {isLoading ? 'Saving...' : 'Submit Log'}
              </button>
              <button onClick={handleSkipHourly} className="btn-secondary">Skip (Penalizes FIS)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
