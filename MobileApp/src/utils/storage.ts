import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
  ACTIVE_SESSION: 'active_session',
  STUDY_SESSIONS: 'study_sessions',
  HOURLY_LOGS: 'hourly_logs',
  DAILY_STATS: 'daily_stats',
  WEEKLY_STATS: 'weekly_stats',
  FOCUS_SCORES: 'focus_scores',
  MOCK_TESTS: 'mock_tests',
  MANUAL_ENTRIES: 'manual_entries',
  CHAT_HISTORY: 'chat_history',
  PLANNER_HISTORY: 'planner_history',
  MOCK_HISTORY: 'mock_history',
  GEMINI_API_KEY: 'gemini_api_key',
};

const getToday = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

const getWeekStart = () => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split('T')[0];
};

const secondsToHours = (seconds: number) => {
  return Math.round((seconds / 3600) * 100) / 100;
};

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const readJSON = async (key: string, defaultValue: any = null) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key}:`, e);
    return defaultValue;
  }
};

const writeJSON = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key}:`, e);
  }
};

const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    console.error('Error clearing storage:', e);
  }
};

export {
  STORAGE_KEYS,
  getToday,
  getWeekStart,
  secondsToHours,
  formatDuration,
  readJSON,
  writeJSON,
  clearAllData,
};
