import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToday, getWeekStart, secondsToHours, readJSON, writeJSON, STORAGE_KEYS } from './storage';

const saveFocusScore = async (date: string, todayHours: number) => {
  const focusScores = await readJSON(STORAGE_KEYS.FOCUS_SCORES, []);
  const hourlyLogs = await readJSON(STORAGE_KEYS.HOURLY_LOGS, []);
  const todayLogs = hourlyLogs.filter((l: any) => l.date === date);

  const baseScore = Math.min(100, Math.floor(todayHours * 10));
  const logQuality = Math.min(50, todayLogs.length * 10);
  const consistency = Math.min(20, focusScores.filter((f: any) => f.focusScore >= 50).length);

  let focusScore = Math.max(0, Math.min(100, baseScore + logQuality + consistency - 30));

  if (todayLogs.length === 0 && todayHours > 0) {
    focusScore = Math.max(0, focusScore - 20);
  }

  const existing = focusScores.findIndex((f: any) => f.date === date);
  const scoreEntry = { date, focusScore, timestamp: new Date().toISOString() };

  if (existing >= 0) {
    focusScores[existing] = scoreEntry;
  } else {
    focusScores.push(scoreEntry);
  }

  await writeJSON(STORAGE_KEYS.FOCUS_SCORES, focusScores);
};

const updateDailyStats = async (date: string) => {
  const sessions = await readJSON(STORAGE_KEYS.STUDY_SESSIONS, []);
  const manualEntries = await readJSON(STORAGE_KEYS.MANUAL_ENTRIES, []);
  const dailyStats = await readJSON(STORAGE_KEYS.DAILY_STATS, []);

  const daySessions = sessions.filter((s: any) => s.date === date);
  const dayManual = manualEntries.filter((e: any) => e.date === date && e.status === 'approved');

  const sessionHours = secondsToHours(daySessions.reduce((a: number, s: any) => a + (s.duration || 0), 0));
  const manualHours = dayManual.reduce((a: number, e: any) => a + (e.approvedTime || 0), 0);
  const totalHours = Math.round((sessionHours + manualHours) * 100) / 100;

  const requiredHours = 10;
  const percentage = Math.min(100, Math.round((totalHours / requiredHours) * 100));

  const subjectBreakdown: any = {};
  daySessions.forEach((s: any) => {
    subjectBreakdown[s.subject] = (subjectBreakdown[s.subject] || 0) + secondsToHours(s.duration || 0);
  });

  let carryOver = 0;
  const prevDay = new Date(date);
  prevDay.setDate(prevDay.getDate() - 1);
  const prevDayStr = prevDay.toISOString().split('T')[0];
  const prevStats = dailyStats.find((d: any) => d.date === prevDayStr);
  if (prevStats && prevStats.remainingHours > 0) {
    carryOver = Math.round(prevStats.remainingHours * 100) / 100;
  }

  const remainingHours = Math.max(0, Math.round(((requiredHours + carryOver) - totalHours) * 100) / 100);

  const existing = dailyStats.findIndex((d: any) => d.date === date);
  const statEntry = {
    date,
    totalHours,
    requiredHours,
    carryOver,
    remainingHours,
    percentage,
    subjectBreakdown,
  };

  if (existing >= 0) {
    dailyStats[existing] = statEntry;
  } else {
    dailyStats.push(statEntry);
  }

  await writeJSON(STORAGE_KEYS.DAILY_STATS, dailyStats);
};

const updateWeeklyStats = async () => {
  const weekStart = getWeekStart();
  const sessions = await readJSON(STORAGE_KEYS.STUDY_SESSIONS, []);
  const manualEntries = await readJSON(STORAGE_KEYS.MANUAL_ENTRIES, []);

  const weekSessions = sessions.filter((s: any) => s.date >= weekStart);
  const weekManual = manualEntries.filter((e: any) => e.date >= weekStart && e.status === 'approved');

  const sessionHours = secondsToHours(weekSessions.reduce((a: number, s: any) => a + (s.duration || 0), 0));
  const manualHours = weekManual.reduce((a: number, e: any) => a + (e.approvedTime || 0), 0);
  const totalHours = Math.round((sessionHours + manualHours) * 100) / 100;

  const weeklyStats = {
    current: {
      weekStart,
      totalHours,
      target: 70,
      difference: Math.round((totalHours - 70) * 100) / 100,
      percentage: Math.min(100, Math.round((totalHours / 70) * 100)),
    },
  };

  await writeJSON(STORAGE_KEYS.WEEKLY_STATS, weeklyStats);
};

export { saveFocusScore, updateDailyStats, updateWeeklyStats };
