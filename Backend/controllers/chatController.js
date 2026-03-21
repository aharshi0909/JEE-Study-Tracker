const { coachChat } = require('../services/geminiService')
const { readJSON, writeJSON } = require('../utils/dataUtils')

const sendCoachMessage = async (req, res) => {
  try {
    const { message } = req.body
    if (!message?.trim()) return res.status(400).json({ error: 'Message is required' })
    const reply = await coachChat(message.trim())
    const history = readJSON('chat_history.json', [])
    res.json({ reply, messageCount: history.length })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const getChatHistory = (req, res) => {
  const history = readJSON('chat_history.json', [])
  const formatted = []
  for (let i = 0; i < history.length; i += 2) {
    if (history[i] && history[i + 1]) {
      formatted.push({ userMessage: history[i].parts[0].text, aiReply: history[i + 1].parts[0].text })
    }
  }
  res.json({ history: formatted })
}

const clearChatHistory = (req, res) => {
  writeJSON('chat_history.json', [])
  res.json({ success: true })
}

module.exports = { sendCoachMessage, getChatHistory, clearChatHistory }
