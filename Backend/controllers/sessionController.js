const { readJSON, writeJSON, getToday, secondsToHours, formatDuration } = require('../utils/dataUtils')
const { saveFocusScore, updateDailyStats, updateWeeklyStats } = require('../services/focusScoreService')

const startSession = (req, res) => {
  try {
    const { subject } = req.body
    if (!subject) return res.status(400).json({ error: 'Subject is required' })

    const active = readJSON('active_session.json', null)
    if (active && active.id) return res.status(409).json({ error: 'A session is already active. Stop it first.' })

    const session = { id: Date.now().toString(), subject, startTime: new Date().toISOString(), date: getToday(), status: 'active', pauses: [] }
    writeJSON('active_session.json', session)
    return res.json({ success: true, session })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const endSession = (req, res) => {
  try {
    const active = readJSON('active_session.json', null)
    if (!active || !active.id) return res.status(400).json({ error: 'No active session found' })

    const endTime = new Date().toISOString()

    let totalElapsed = new Date(endTime).getTime() - new Date(active.startTime).getTime()
    let totalPaused = 0
    if (active.pauses) {
      active.pauses.forEach(p => {
        const pStart = new Date(p.pauseTime).getTime()
        const pEnd = p.resumeTime ? new Date(p.resumeTime).getTime() : new Date(endTime).getTime()
        totalPaused += (pEnd - pStart)
      })
    }

    const duration = Math.max(0, Math.floor((totalElapsed - totalPaused) / 1000))

    const completedSession = { ...active, endTime, duration, durationFormatted: formatDuration(duration), status: 'completed' }

    const sessions = readJSON('study_sessions.json', [])
    sessions.push(completedSession)
    writeJSON('study_sessions.json', sessions)
    writeJSON('active_session.json', null)

    const todayHours = secondsToHours(
      sessions.filter(s => s.date === active.date).reduce((a, s) => a + (s.duration || 0), 0)
    )
    saveFocusScore(active.date, todayHours)
    updateDailyStats(active.date)
    updateWeeklyStats()

    return res.json({ success: true, session: completedSession })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const getActiveSession = (req, res) => {
  const active = readJSON('active_session.json', null)
  res.json({ active: active?.id ? active : null })
}

const pauseSession = (req, res) => {
  try {
    const active = readJSON('active_session.json', null)
    if (!active || !active.id) return res.status(400).json({ error: 'No active session found' })
    if (active.status === 'paused') return res.status(400).json({ error: 'Session already paused' })

    active.status = 'paused'
    active.pauses = active.pauses || []
    active.pauses.push({ pauseTime: new Date().toISOString(), resumeTime: null })
    writeJSON('active_session.json', active)
    return res.json({ success: true, session: active })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const resumeSession = (req, res) => {
  try {
    const active = readJSON('active_session.json', null)
    if (!active || !active.id) return res.status(400).json({ error: 'No active session found' })
    if (active.status !== 'paused') return res.status(400).json({ error: 'Session is not paused' })

    active.status = 'active'
    if (active.pauses && active.pauses.length > 0) {
      active.pauses[active.pauses.length - 1].resumeTime = new Date().toISOString()
    }
    writeJSON('active_session.json', active)
    return res.json({ success: true, session: active })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const addHourlyLog = (req, res) => {
  try {
    const { subject, topic, explanation } = req.body
    if (!subject || !topic || !explanation) return res.status(400).json({ error: 'All fields required' })

    const log = { id: Date.now().toString(), date: getToday(), subject, topic, explanation, timestamp: new Date().toISOString() }
    const logs = readJSON('hourly_logs.json', [])
    logs.push(log)
    writeJSON('hourly_logs.json', logs)

    const today = getToday()
    const sessions = readJSON('study_sessions.json', []).filter(s => s.date === today)
    const todayHours = secondsToHours(sessions.reduce((a, s) => a + (s.duration || 0), 0))
    saveFocusScore(today, todayHours)

    return res.json({ success: true, log })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

module.exports = { startSession, endSession, getActiveSession, pauseSession, resumeSession, addHourlyLog }
