const express = require('express')
const router = express.Router()

const { startSession, endSession, getActiveSession, pauseSession, resumeSession, addHourlyLog } = require('../controllers/sessionController')
const { getDailyStats, getWeeklyStats, getFocusScore, getStudyLogs, resetAllData } = require('../controllers/statsController')
const { sendCoachMessage, getChatHistory, clearChatHistory } = require('../controllers/chatController')
const { sendPlannerMessage, getPlannerHistory } = require('../controllers/plannerController')
const { addMockTest, sendMockMessage, getMockTests } = require('../controllers/mockTestController')
const { submitManualEntry, getManualEntries } = require('../controllers/manualEntryController')

router.post('/start-session', startSession)
router.post('/end-session', endSession)
router.get('/active-session', getActiveSession)
router.post('/pause-session', pauseSession)
router.post('/resume-session', resumeSession)
router.post('/hourly-log', addHourlyLog)

router.get('/daily-stats', getDailyStats)
router.get('/weekly-stats', getWeeklyStats)
router.get('/focus-score', getFocusScore)
router.get('/study-logs', getStudyLogs)
router.post('/reset-all', resetAllData)

router.post('/coach-chat', sendCoachMessage)
router.get('/coach-chat/history', getChatHistory)
router.delete('/coach-chat/history', clearChatHistory)

router.post('/planner-chat', sendPlannerMessage)
router.get('/planner-chat/history', getPlannerHistory)

router.post('/mock-test', addMockTest)
router.post('/mock-chat', sendMockMessage)
router.get('/mock-tests', getMockTests)

router.post('/manual-entry', submitManualEntry)
router.get('/manual-entries', getManualEntries)

module.exports = router
