import axios from 'axios'

const api = axios.create({ baseURL: '/api', timeout: 30000 })

api.interceptors.response.use(
  res => res.data,
  err => { throw new Error(err.response?.data?.error || err.message || 'Request failed') }
)

export const startSession = (subject) => api.post('/start-session', { subject })
export const endSession = () => api.post('/end-session')
export const getActiveSession = () => api.get('/active-session')
export const pauseSession = () => api.post('/pause-session')
export const resumeSession = () => api.post('/resume-session')
export const addHourlyLog = (data) => api.post('/hourly-log', data)

export const getDailyStats = () => api.get('/daily-stats')
export const getWeeklyStats = () => api.get('/weekly-stats')
export const getFocusScore = () => api.get('/focus-score')
export const getStudyLogs = () => api.get('/study-logs')
export const resetAllData = () => api.post('/reset-all')

export const sendCoachMessage = (message) => api.post('/coach-chat', { message })
export const getCoachHistory = () => api.get('/coach-chat/history')
export const clearCoachHistory = () => api.delete('/coach-chat/history')

export const sendPlannerMessage = (message) => api.post('/planner-chat', { message })
export const getPlannerHistory = () => api.get('/planner-chat/history')

export const addMockTest = (data) => api.post('/mock-test', data)
export const sendMockMessage = (message) => api.post('/mock-chat', { message })
export const getMockTests = () => api.get('/mock-tests')

export const submitManualEntry = (data) => api.post('/manual-entry', data)

export default api
