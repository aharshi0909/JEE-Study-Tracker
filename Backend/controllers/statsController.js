const { readJSON, writeJSON, getToday, getWeekStart, secondsToHours } = require('../utils/dataUtils')

const getDailyStats = (req, res) => {
  try {
    const today = getToday()
    const sessions = readJSON('study_sessions.json', []).filter(s => s.date === today)
    const manual = readJSON('manual_entries.json', []).filter(e => e.date === today && e.status === 'approved')
    const hourlyLogs = regadJSON('hourly_logs.json', []).filter(l => l.date === today)
    const focusScores = readJSON('focus_scores.json', [])
    const dailyStats = readJSON('daily_stats.json', [])
    const active = readJSON('active_session.json', null)

    const sessionHours = secondsToHours(sessions.reduce((a, s) => a + (s.duration || 0), 0))
    const manualHours = manual.reduce((a, e) => a + (e.approvedTime || 0), 0)
    const totalHours = Math.round((sessionHours + manualHours) * 100) / 100

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const yesterdayData = dailyStats.find(d => d.date === yesterdayStr)
    const carryOver = yesterdayData?.newCarryOver ?? 0
    const requiredHours = 10 + carryOver

    const subjectBreakdown = {}
    sessions.forEach(s => { subjectBreakdown[s.subject] = (subjectBreakdown[s.subject] || 0) + secondsToHours(s.duration || 0) })
    manual.forEach(e => { subjectBreakdown[e.subject] = (subjectBreakdown[e.subject] || 0) + (e.approvedTime || 0) })

    const focusEntry = focusScores.find(f => f.date === today)

    res.json({
      date: today,
      totalHours,
      sessionHours: Math.round(sessionHours * 100) / 100,
      manualHours: Math.round(manualHours * 100) / 100,
      requiredHours: Math.round(requiredHours * 100) / 100,
      carryOver: Math.round(carryOver * 100) / 100,
      remainingHours: Math.max(0, Math.round((requiredHours - totalHours) * 100) / 100),
      percentage: Math.min(100, Math.round((totalHours / requiredHours) * 100)),
      subjectBreakdown,
      focusScore: focusEntry?.focusScore ?? null,
      focusBreakdown: focusEntry?.breakdown ?? null,
      hourlyLogCount: hourlyLogs.length,
      sessionCount: sessions.length,
      isSessionActive: !!(active?.id),
      activeSession: active?.id ? active : null
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const getWeeklyStats = (req, res) => {
  try {
    const weekStart = getWeekStart()
    const today = getToday()
    const weeklyStats = readJSON('weekly_stats.json', [])
    const leaderboard = readJSON('weekly_leaderboard.json', [])
    const current = weeklyStats.find(w => w.weekStart === weekStart) || { weekStart, totalHours: 0, difference: -70 }
    res.json({ current, leaderboard: leaderboard.slice(0, 10), allWeeks: weeklyStats })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const getFocusScore = (req, res) => {
  try {
    const today = getToday()
    const focusScores = readJSON('focus_scores.json', [])
    const todayScore = focusScores.find(f => f.date === today)
    const history = focusScores.slice(-14)
    res.json({ today: todayScore || null, history })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const getStudyLogs = (req, res) => {
  try {
    const sessions = readJSON('study_sessions.json', []).slice(-50).reverse()
    const manual = readJSON('manual_entries.json', []).slice(-30).reverse()
    const hourly = readJSON('hourly_logs.json', []).slice(-50).reverse()
    const mocks = readJSON('mock_tests.json', []).slice(-30).reverse()
    res.json({ sessions, manualEntries: manual, hourlyLogs: hourly, mockTests: mocks })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const resetAllData = (req, res) => {
  try {
    const files = [
      'study_sessions.json', 'hourly_logs.json', 'daily_stats.json',
      'weekly_stats.json', 'weekly_leaderboard.json', 'focus_scores.json',
      'chat_history.json', 'planner_history.json', 'mock_history.json',
      'mock_tests.json', 'planner_logs.json', 'manual_entries.json'
    ]
    files.forEach(f => writeJSON(f, []))
    writeJSON('active_session.json', null)
    res.json({ success: true, message: 'All data cleared' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

module.exports = { getDailyStats, getWeeklyStats, getFocusScore, getStudyLogs, resetAllData }
