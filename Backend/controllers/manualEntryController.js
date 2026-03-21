const { verifyManualEntry } = require('../services/geminiService')
const { readJSON, writeJSON, getToday, secondsToHours } = require('../utils/dataUtils')
const { saveFocusScore, updateDailyStats, updateWeeklyStats } = require('../services/focusScoreService')

const submitManualEntry = async (req, res) => {
  try {
    const { subject, topic, location, estimatedTime, description, problemsSolved } = req.body
    if (!subject || !topic || !location || !estimatedTime || !description) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const entryData = { subject, topic, location, estimatedTime: Number(estimatedTime), description, problemsSolved: problemsSolved || 0 }
    const { approvedTime, aiReason } = await verifyManualEntry(entryData)

    const today = getToday()
    const entry = {
      id: Date.now().toString(), date: today,
      subject, topic, location,
      requestedTime: Number(estimatedTime),
      approvedTime: Math.round(approvedTime * 100) / 100,
      description, problemsSolved: Number(problemsSolved) || 0,
      aiReason, status: 'approved',
      timestamp: new Date().toISOString()
    }

    const entries = readJSON('manual_entries.json', [])
    entries.push(entry)
    writeJSON('manual_entries.json', entries)

    const sessions = readJSON('study_sessions.json', []).filter(s => s.date === today)
    const todayHours = secondsToHours(sessions.reduce((a, s) => a + (s.duration || 0), 0)) + approvedTime
    saveFocusScore(today, todayHours)
    updateDailyStats(today)
    updateWeeklyStats()

    res.json({ success: true, entry })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const getManualEntries = (req, res) => {
  const entries = readJSON('manual_entries.json', [])
  res.json({ entries: entries.slice(-30).reverse() })
}

module.exports = { submitManualEntry, getManualEntries }
