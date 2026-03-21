const { mockChat } = require('../services/geminiService')
const { readJSON, writeJSON, getToday } = require('../utils/dataUtils')

const addMockTest = async (req, res) => {
  try {
    const { subject, testName, marks, maxMarks, date, notes } = req.body
    if (!subject || !testName || marks === undefined || !maxMarks) {
      return res.status(400).json({ error: 'subject, testName, marks, maxMarks are required' })
    }
    const test = {
      id: Date.now().toString(),
      subject, testName,
      marks: Number(marks),
      maxMarks: Number(maxMarks),
      percentage: Math.round((marks / maxMarks) * 100),
      date: date || getToday(),
      notes: notes || '',
      timestamp: new Date().toISOString()
    }
    const tests = readJSON('mock_tests.json', [])
    tests.push(test)
    writeJSON('mock_tests.json', tests)

    const analysis = await mockChat(`I just completed a mock test. Analyze this result and give me specific improvement advice.`, test)
    res.json({ success: true, test, analysis })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const sendMockMessage = async (req, res) => {
  try {
    const { message } = req.body
    if (!message?.trim()) return res.status(400).json({ error: 'Message is required' })
    const reply = await mockChat(message.trim())
    res.json({ reply })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const getMockTests = (req, res) => {
  const tests = readJSON('mock_tests.json', [])
  const history = readJSON('mock_history.json', [])
  const formatted = []
  for (let i = 0; i < history.length; i += 2) {
    if (history[i] && history[i + 1]) {
      formatted.push({ userMessage: history[i].parts[0].text, aiReply: history[i + 1].parts[0].text })
    }
  }
  res.json({ tests: tests.slice(-20).reverse(), chatHistory: formatted })
}

module.exports = { addMockTest, sendMockMessage, getMockTests }
