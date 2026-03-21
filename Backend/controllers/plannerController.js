const { plannerChat } = require('../services/geminiService')
const { readJSON, writeJSON, getToday } = require('../utils/dataUtils')

const sendPlannerMessage = async (req, res) => {
  try {
    const { message } = req.body
    if (!message?.trim()) return res.status(400).json({ error: 'Message is required' })
    const reply = await plannerChat(message.trim())

    const logs = readJSON('planner_logs.json', [])
    logs.push({ date: getToday(), userMessage: message.trim(), plan: reply, timestamp: new Date().toISOString() })
    writeJSON('planner_logs.json', logs.slice(-30))

    res.json({ reply })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const getPlannerHistory = (req, res) => {
  const history = readJSON('planner_history.json', [])
  const formatted = []
  for (let i = 0; i < history.length; i += 2) {
    if (history[i] && history[i + 1]) {
      formatted.push({ userMessage: history[i].parts[0].text, aiReply: history[i + 1].parts[0].text })
    }
  }
  res.json({ history: formatted })
}

module.exports = { sendPlannerMessage, getPlannerHistory }
