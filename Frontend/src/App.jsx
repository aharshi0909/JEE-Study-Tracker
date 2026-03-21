import { useState, useEffect, useCallback } from 'react'
import StudyTimer from './components/StudyTimer'
import DashboardStats from './components/DashboardStats'
import CoachChat from './components/CoachChat'
import PlannerChat from './components/PlannerChat'
import MockTestChat from './components/MockTestChat'
import ManualStudyEntry from './components/ManualStudyEntry'
import StudyLogs from './components/StudyLogs'
import { getDailyStats, getWeeklyStats, getFocusScore, resetAllData } from './utils/api'

export default function App() {
  const [dailyStats, setDailyStats] = useState(null)
  const [weeklyStats, setWeeklyStats] = useState(null)
  const [focusData, setFocusData] = useState(null)
  const [now, setNow] = useState(new Date())

  const refreshStats = useCallback(async () => {
    try {
      const [daily, weekly, focus] = await Promise.all([getDailyStats(), getWeeklyStats(), getFocusScore()])
      setDailyStats(daily)
      setWeeklyStats(weekly)
      setFocusData(focus)
    } catch (e) { console.error('Stats refresh error:', e.message) }
  }, [])

  useEffect(() => {
    refreshStats()
    const interval = setInterval(refreshStats, 30000)
    return () => clearInterval(interval)
  }, [refreshStats])

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(tick)
  }, [])

  const fmt = (t) => t < 10 ? `0${t}` : `${t}`
  const timeStr = `${fmt(now.getHours())}:${fmt(now.getMinutes())}:${fmt(now.getSeconds())}`
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const displayDaily = dailyStats ? JSON.parse(JSON.stringify(dailyStats)) : null
  const displayWeekly = weeklyStats ? JSON.parse(JSON.stringify(weeklyStats)) : null

  if (displayDaily?.activeSession && now) {
    let totalElapsed = now.getTime() - new Date(displayDaily.activeSession.startTime).getTime()
    let totalPaused = 0
    if (displayDaily.activeSession.pauses) {
      displayDaily.activeSession.pauses.forEach(p => {
        const pStart = new Date(p.pauseTime).getTime()
        const pEnd = p.resumeTime ? new Date(p.resumeTime).getTime() : now.getTime()
        totalPaused += (pEnd - pStart)
      })
    }
    const elapsedSec = Math.floor((totalElapsed - totalPaused) / 1000)
    const activeElapsedHours = Math.max(0, elapsedSec / 3600)
    const subj = displayDaily.activeSession.subject

    displayDaily.totalHours = Math.round((displayDaily.totalHours + activeElapsedHours) * 100) / 100
    displayDaily.remainingHours = Math.max(0, Math.round((displayDaily.requiredHours - displayDaily.totalHours) * 100) / 100)
    displayDaily.percentage = Math.min(100, Math.round((displayDaily.totalHours / displayDaily.requiredHours) * 100))

    if (displayDaily.subjectBreakdown) {
      displayDaily.subjectBreakdown[subj] = (displayDaily.subjectBreakdown[subj] || 0) + activeElapsedHours
    }

    if (displayWeekly?.current) {
      displayWeekly.current.totalHours = Math.round((displayWeekly.current.totalHours + activeElapsedHours) * 100) / 100
      displayWeekly.current.difference = Math.round((displayWeekly.current.totalHours - 70) * 100) / 100
    }
  }

  const handleReset = async () => {
    if (confirm("🚨 WARNING 🚨\n\nAre you sure you want to hard reset all your JEE trackers, chat histories, mock scores, and analytics?\n\nThis cannot be undone!")) {
      try {
        await resetAllData()
        window.location.reload()
      } catch (e) { alert("Failed to reset: " + e.message) }
    }
  }

  const fis = focusData?.today?.focusScore ?? null
  const fisColor = fis === null ? 'text-slate-500' : fis >= 70 ? 'text-emerald-400' : fis >= 40 ? 'text-amber-400' : 'text-rose-400'

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-[#020617]/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-lg font-black">J</div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none">JEE Study Tracker</h1>
              <p className="text-xs text-slate-500 leading-none mt-0.5">Staging Mode</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {displayDaily && (
              <>
                <div className="text-center hidden sm:block">
                  <p className="text-xs text-slate-500">Today</p>
                  <p className="text-sm font-bold text-indigo-400">{displayDaily.totalHours.toFixed(2)}h / {displayDaily.requiredHours}h</p>
                </div>
                <div className="text-center hidden md:block">
                  <p className="text-xs text-slate-500">FIS</p>
                  <p className={`text-sm font-bold ${fisColor}`}>{fis !== null ? `${fis}/100` : '--'}</p>
                </div>
                <div className="text-center hidden lg:block">
                  <p className="text-xs text-slate-500">Week</p>
                  <p className="text-sm font-bold text-violet-400">{(displayWeekly?.current?.totalHours ?? 0).toFixed(2)}h / 70h</p>
                </div>
              </>
            )}
            <div className="text-right">
              <p className="text-lg font-mono font-bold text-white">{timeStr}</p>
              <p className="text-xs text-slate-500 hidden md:block">{dateStr}</p>
            </div>
            <button onClick={handleReset} className="ml-4 btn-danger px-3 py-1.5 text-xs">Clear Data</button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1">
            <StudyTimer onSessionChange={refreshStats} />
          </div>
          <div className="xl:col-span-2">
            <DashboardStats dailyStats={displayDaily} weeklyStats={displayWeekly} focusData={focusData} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CoachChat />
          <PlannerChat />
          <MockTestChat onTestAdded={refreshStats} />
        </div>

        <ManualStudyEntry onEntryAdded={refreshStats} />

        <StudyLogs />
      </main>

      <footer className="text-center py-6 text-xs text-slate-700 border-t border-slate-900 mt-6">
        JEE Study Tracker — Built for serious aspirants. No excuses.
      </footer>
    </div>
  )
}
