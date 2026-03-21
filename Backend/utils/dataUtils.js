const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '../data')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function readJSON(filename, defaultValue = []) {
  ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8')
      return defaultValue
    }
    const raw = fs.readFileSync(filePath, 'utf-8').trim()
    if (!raw) return defaultValue
    const parsed = JSON.parse(raw)
    return (parsed !== null && parsed !== undefined) ? parsed : defaultValue
  } catch (e) {
    console.error(`[dataUtils] Error reading ${filename}:`, e.message)
    return defaultValue
  }
}

function writeJSON(filename, data) {
  ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (e) {
    console.error(`[dataUtils] Error writing ${filename}:`, e.message)
    return false
  }
}

function getISTDate(date = new Date()) {
  const utc = typeof date === 'string' ? new Date(date).getTime() : date.getTime() + (date.getTimezoneOffset() * 60000)
  return new Date(utc + (3600000 * 5.5))
}

function getToday() {
  return getISTDate().toISOString().split('T')[0]
}

function getWeekStart(dateStr = null) {
  const d = dateStr ? new Date(dateStr) : getISTDate()
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const diffToMonday = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - diffToMonday)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function getWeekEnd(dateStr = null) {
  const d = dateStr ? new Date(dateStr) : getISTDate()
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const diffToSunday = day === 0 ? 0 : 7 - day
  d.setDate(d.getDate() + diffToSunday)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function secondsToHours(s) { return Math.round((s / 3600) * 100) / 100 }

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

function getDateDaysAgo(n) {
  const d = getISTDate()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

module.exports = { readJSON, writeJSON, getToday, getWeekStart, getWeekEnd, secondsToHours, formatDuration, getDateDaysAgo }
