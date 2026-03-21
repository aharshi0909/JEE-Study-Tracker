const SUBJECT_COLORS = {
  Physics: { bar: 'bg-blue-500', text: 'text-blue-400', badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  Chemistry: { bar: 'bg-emerald-500', text: 'text-emerald-400', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  Math: { bar: 'bg-violet-500', text: 'text-violet-400', badge: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
  Biology: { bar: 'bg-orange-500', text: 'text-orange-400', badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
}
const getSubjectColor = (s) => SUBJECT_COLORS[s] || { bar: 'bg-slate-500', text: 'text-slate-400', badge: 'bg-slate-500/15 text-slate-400 border-slate-500/30' }

function ScoreRing({ score, size = 120 }) {
  const r = 44, circumference = 2 * Math.PI * r
  const offset = circumference * (1 - (score || 0) / 100)
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          transform="rotate(-90 50 50)" className="score-ring" />
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-bold text-white leading-none">{score ?? '--'}</p>
        <p className="text-[9px] text-slate-500 uppercase tracking-wider">FIS</p>
      </div>
    </div>
  )
}

function WeekLeaderboard({ leaderboard }) {
  if (!leaderboard?.length) return <p className="text-xs text-slate-600 italic">No week data yet.</p>
  const medals = ['🥇', '🥈', '🥉']
  return (
    <div className="space-y-2">
      {leaderboard.slice(0, 5).map((w, i) => (
        <div key={w.weekStart} className="flex items-center gap-3 py-2 border-b border-slate-800/50 last:border-0">
          <span className="text-base w-6 text-center">{medals[i] || `#${i + 1}`}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400">Week of {w.weekStart}</p>
            <div className="progress-bar mt-1">
              <div className="progress-fill bg-indigo-500" style={{ width: `${Math.min((w.totalHours / 70) * 100, 100)}%` }} />
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-white font-mono">{w.totalHours}h</p>
            <p className={`text-xs font-semibold ${w.difference >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {w.difference >= 0 ? `+${w.difference}h` : `${w.difference}h`}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function DashboardStats({ dailyStats, weeklyStats, focusData }) {
  if (!dailyStats) return (
    <div className="card h-full flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 text-sm">Loading stats...</p>
      </div>
    </div>
  )

  const { totalHours, requiredHours, remainingHours, percentage, subjectBreakdown, carryOver, manualHours, sessionCount } = dailyStats
  const weekCurrent = weeklyStats?.current || {}
  const weeklyPct = Math.min(((weekCurrent.totalHours || 0) / 70) * 100, 100)
  const fis = focusData?.today?.focusScore ?? null
  const fisBreakdown = focusData?.today?.breakdown

  const subjects = Object.entries(subjectBreakdown || {})
  const maxSubjectHours = subjects.length ? Math.max(...subjects.map(([, h]) => h)) : 1

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">

      <div className="stat-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Today's Progress</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-black text-white">{totalHours}</span>
              <span className="text-slate-500 text-sm">/ {requiredHours}h</span>
            </div>
            {carryOver > 0 && <p className="text-xs text-amber-400 mt-1">⚠ +{carryOver}h carry-over from yesterday</p>}
          </div>
          <div className="text-right">
            <p className={`text-2xl font-black ${percentage >= 100 ? 'text-emerald-400' : percentage >= 60 ? 'text-indigo-400' : 'text-rose-400'}`}>{percentage}%</p>
            <p className="text-xs text-slate-500">{sessionCount} session{sessionCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="progress-bar mt-3">
          <div className={`progress-fill ${percentage >= 100 ? 'bg-emerald-500' : percentage >= 60 ? 'bg-indigo-500' : 'bg-rose-500'}`}
            style={{ width: `${percentage}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-slate-500">Remaining: <span className="text-white font-semibold">{remainingHours}h</span></span>
          {manualHours > 0 && <span className="text-amber-400">+{manualHours}h manual</span>}
        </div>
        {subjects.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Subjects</p>
            {subjects.map(([subj, hours]) => {
              const colors = getSubjectColor(subj)
              return (
                <div key={subj} className="flex items-center gap-3">
                  <span className={`text-xs font-semibold w-24 truncate ${colors.text}`}>{subj}</span>
                  <div className="flex-1 progress-bar">
                    <div className={`progress-fill ${colors.bar}`} style={{ width: `${(hours / maxSubjectHours) * 100}%` }} />
                  </div>
                  <span className="text-xs text-slate-400 font-mono w-12 text-right">{hours.toFixed(1)}h</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="stat-card">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Weekly Target</p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-4xl font-black text-white">{weekCurrent.totalHours ?? 0}</span>
          <span className="text-slate-500 text-sm">/ 70h</span>
          <span className={`ml-auto text-sm font-bold px-2 py-0.5 rounded-lg ${(weekCurrent.difference || -70) >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
            {(weekCurrent.difference || -70) >= 0 ? `+${weekCurrent.difference}h` : `${(weekCurrent.difference ?? -70).toFixed(1)}h`}
          </span>
        </div>
        <div className="progress-bar mt-3">
          <div className="progress-fill bg-violet-500" style={{ width: `${weeklyPct}%` }} />
        </div>
        <div className="text-xs text-slate-500 mt-1.5">
          {Math.round(70 - (weekCurrent.totalHours || 0))}h remaining this week (Mon–Sun)
        </div>
        <div className="mt-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">🏆 Personal Leaderboard</p>
          <WeekLeaderboard leaderboard={weeklyStats?.leaderboard} />
        </div>
      </div>

      <div className="stat-card md:col-span-1">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Focus Integrity Score</p>
        <div className="flex items-center gap-6">
          <ScoreRing score={fis} />
          <div className="flex-1 space-y-2">
            {fisBreakdown ? (
              <>
                <FISBar label="Explanation Quality" value={fisBreakdown.explanationQuality} max={30} />
                <FISBar label="Subject Focus" value={fisBreakdown.subjectFocus} max={25} />
                <FISBar label="Session Continuity" value={fisBreakdown.sessionContinuity} max={20} />
                <FISBar label="Idle Penalty" value={25 - (fisBreakdown.idlePenalty || 0)} max={25} isGood={false} />
              </>
            ) : (
              <p className="text-xs text-slate-600 italic">Study to calculate your FIS score.</p>
            )}
          </div>
        </div>
      </div>

      <div className="stat-card md:col-span-1">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">📈 FIS History (14 days)</p>
        {focusData?.history?.length > 0 ? (
          <div className="flex items-end gap-1 h-16">
            {focusData.history.map((d, i) => {
              const h = Math.max(4, (d.focusScore / 100) * 64)
              const color = d.focusScore >= 70 ? 'bg-emerald-500' : d.focusScore >= 40 ? 'bg-amber-500' : 'bg-rose-500'
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1" title={`${d.date}: ${d.focusScore}`}>
                  <div className={`w-full rounded-sm ${color} opacity-80`} style={{ height: h }} />
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-600 italic">No FIS history yet. Start studying!</p>
        )}
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>14d ago</span>
          <span>Today</span>
        </div>
      </div>

    </div>
  )
}

function FISBar({ label, value, max, isGood = true }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-slate-500">{label}</span>
        <span className={`font-mono ${isGood ? (value >= max * 0.66 ? 'text-emerald-400' : value >= max * 0.33 ? 'text-amber-400' : 'text-rose-400') : 'text-slate-400'}`}>{value}/{max}</span>
      </div>
      <div className="progress-bar">
        <div className={`progress-fill ${isGood ? (value >= max * 0.66 ? 'bg-emerald-500' : value >= max * 0.33 ? 'bg-amber-500' : 'bg-rose-500') : 'bg-slate-500'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
