const { readJSON, writeJSON, getToday, secondsToHours, getWeekStart, getWeekEnd } = require('../utils/dataUtils')

function calculateFocusScore(date) {
  const sessions = readJSON('study_sessions.json', []).filter(s => s.date === date)
  const hourlyLogs = readJSON('hourly_logs.json', []).filter(l => l.date === date)

  if (sessions.length === 0) return { score: 0, breakdown: {} }

  const totalStudyHours = secondsToHours(sessions.reduce((a, s) => a + (s.duration || 0), 0))
  if (totalStudyHours < 0.1) return { score: 0, breakdown: {} }

  let explanationScore = 0
  if (hourlyLogs.length > 0) {
    const avgLen = hourlyLogs.reduce((a, l) => a + (l.explanation?.length || 0), 0) / hourlyLogs.length
    const qualityRatio = Math.min(avgLen / 150, 1)
    const expectedLogs = Math.floor(totalStudyHours)
    const coverageRatio = expectedLogs > 0 ? Math.min(hourlyLogs.length / expectedLogs, 1) : 1
    explanationScore = Math.round(30 * qualityRatio * coverageRatio)
  }

  const subjects = [...new Set(sessions.map(s => s.subject))]
  let focusScore = subjects.length === 1 ? 25 : subjects.length === 2 ? 18 : subjects.length === 3 ? 10 : 5

  let idleScore = 25
  if (totalStudyHours >= 2) {
    const expected = Math.floor(totalStudyHours)
    const missing = Math.max(0, expected - hourlyLogs.length)
    idleScore = Math.max(0, 25 - missing * 8)
  }

  const avgSessionHours = totalStudyHours / sessions.length
  const continuityScore = Math.min(20, Math.round(avgSessionHours * 8))

  const totalScore = Math.min(100, Math.max(0,
    explanationScore + focusScore + idleScore + continuityScore
  ))

  return {
    score: totalScore,
    breakdown: {
      explanationQuality: explanationScore,
      subjectFocus: focusScore,
      idlePenalty: 25 - idleScore,
      sessionContinuity: continuityScore
    }
  }
}

function saveFocusScore(date, hoursStudied) {
  const { score, breakdown } = calculateFocusScore(date)
  const scores = readJSON('focus_scores.json', [])
  const existingIdx = scores.findIndex(f => f.date === date)
  const entry = { date, hoursStudied, focusScore: score, breakdown, updatedAt: new Date().toISOString() }
  if (existingIdx >= 0) scores[existingIdx] = entry
  else scores.push(entry)
  writeJSON('focus_scores.json', scores)
  return entry
}

function updateDailyStats(date) {
  const sessions = readJSON('study_sessions.json', []).filter(s => s.date === date)
  const manualEntries = readJSON('manual_entries.json', []).filter(e => e.date === date && e.status === 'approved')
  const focusScores = readJSON('focus_scores.json', [])

  const sessionHours = secondsToHours(sessions.reduce((a, s) => a + (s.duration || 0), 0))
  const manualHours = manualEntries.reduce((a, e) => a + (e.approvedTime || 0), 0)
  const totalHours = Math.round((sessionHours + manualHours) * 100) / 100

  const dailyStats = readJSON('daily_stats.json', [])
  const yesterday = new Date(date)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  const yesterdayData = dailyStats.find(d => d.date === yesterdayStr)
  const carryOver = yesterdayData?.newCarryOver ?? 0
  const requiredHours = 10 + carryOver
  const newCarryOver = Math.max(0, Math.round((requiredHours - totalHours) * 100) / 100)

  const subjectBreakdown = {}
  sessions.forEach(s => { subjectBreakdown[s.subject] = (subjectBreakdown[s.subject] || 0) + secondsToHours(s.duration || 0) })
  manualEntries.forEach(e => { subjectBreakdown[e.subject] = (subjectBreakdown[e.subject] || 0) + (e.approvedTime || 0) })

  const focusEntry = focusScores.find(f => f.date === date)
  const entry = { date, totalHours, sessionHours, manualHours, requiredHours, carryOver, newCarryOver, subjectBreakdown, focusScore: focusEntry?.focusScore ?? null, updatedAt: new Date().toISOString() }

  const idx = dailyStats.findIndex(d => d.date === date)
  if (idx >= 0) dailyStats[idx] = entry
  else dailyStats.push(entry)
  writeJSON('daily_stats.json', dailyStats)
  return entry
}

function updateWeeklyStats() {
  const today = getToday()
  const weekStart = getWeekStart()
  const sessions = readJSON('study_sessions.json', []).filter(s => s.date >= weekStart && s.date <= today)
  const manualEntries = readJSON('manual_entries.json', []).filter(e => e.date >= weekStart && e.date <= today && e.status === 'approved')

  const sessionHours = secondsToHours(sessions.reduce((a, s) => a + (s.duration || 0), 0))
  const manualHours = manualEntries.reduce((a, e) => a + (e.approvedTime || 0), 0)
  const totalHours = Math.round((sessionHours + manualHours) * 100) / 100

  const subjectBreakdown = {}
  sessions.forEach(s => { subjectBreakdown[s.subject] = (subjectBreakdown[s.subject] || 0) + secondsToHours(s.duration || 0) })

  const weeklyStats = readJSON('weekly_stats.json', [])
  const entry = { weekStart, weekEnd: getWeekEnd(), totalHours, target: 70, difference: Math.round((totalHours - 70) * 100) / 100, subjectBreakdown, updatedAt: new Date().toISOString() }

  const idx = weeklyStats.findIndex(w => w.weekStart === weekStart)
  if (idx >= 0) weeklyStats[idx] = entry
  else weeklyStats.push(entry)
  writeJSON('weekly_stats.json', weeklyStats)

  const sorted = [...weeklyStats].sort((a, b) => b.totalHours - a.totalHours)
  const leaderboard = sorted.map((w, i) => ({ rank: i + 1, weekStart: w.weekStart, totalHours: w.totalHours, difference: w.difference }))
  writeJSON('weekly_leaderboard.json', leaderboard)

  return entry
}

module.exports = { calculateFocusScore, saveFocusScore, updateDailyStats, updateWeeklyStats }
