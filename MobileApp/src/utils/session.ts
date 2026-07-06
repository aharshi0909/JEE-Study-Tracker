import { readJSON, writeJSON, getToday, STORAGE_KEYS } from './storage';
import { saveFocusScore, updateDailyStats, updateWeeklyStats } from './focus';

const startSession = async (subject: string) => {
  const active = await readJSON(STORAGE_KEYS.ACTIVE_SESSION, null);
  if (active && active.id) {
    throw new Error('A session is already active. Stop it first.');
  }

  const session = {
    id: Date.now().toString(),
    subject,
    startTime: new Date().toISOString(),
    date: getToday(),
    status: 'active',
    pauses: [],
  };

  await writeJSON(STORAGE_KEYS.ACTIVE_SESSION, session);
  return { success: true, session };
};

const endSession = async () => {
  const active = await readJSON(STORAGE_KEYS.ACTIVE_SESSION, null);
  if (!active || !active.id) {
    throw new Error('No active session found');
  }

  const endTime = new Date().toISOString();

  let totalElapsed = new Date(endTime).getTime() - new Date(active.startTime).getTime();
  let totalPaused = 0;

  if (active.pauses) {
    active.pauses.forEach((p: any) => {
      const pStart = new Date(p.pauseTime).getTime();
      const pEnd = p.resumeTime ? new Date(p.resumeTime).getTime() : new Date(endTime).getTime();
      totalPaused += pEnd - pStart;
    });
  }

  const duration = Math.max(0, Math.floor((totalElapsed - totalPaused) / 1000));
  const durationFormatted = `${String(Math.floor(duration / 3600)).padStart(2, '0')}:${String(Math.floor((duration % 3600) / 60)).padStart(2, '0')}:${String(duration % 60).padStart(2, '0')}`;

  const completedSession = { ...active, endTime, duration, durationFormatted, status: 'completed' };

  const sessions = await readJSON(STORAGE_KEYS.STUDY_SESSIONS, []);
  sessions.push(completedSession);
  await writeJSON(STORAGE_KEYS.STUDY_SESSIONS, sessions);
  await writeJSON(STORAGE_KEYS.ACTIVE_SESSION, null);

  const todayHours = (sessions.filter((s: any) => s.date === active.date).reduce((a: number, s: any) => a + (s.duration || 0), 0) / 3600);
  await saveFocusScore(active.date, todayHours);
  await updateDailyStats(active.date);
  await updateWeeklyStats();

  return { success: true, session: completedSession };
};

const getActiveSession = async () => {
  const active = await readJSON(STORAGE_KEYS.ACTIVE_SESSION, null);
  return { active: active?.id ? active : null };
};

const pauseSession = async () => {
  const active = await readJSON(STORAGE_KEYS.ACTIVE_SESSION, null);
  if (!active || !active.id) {
    throw new Error('No active session found');
  }
  if (active.status === 'paused') {
    throw new Error('Session already paused');
  }

  active.status = 'paused';
  active.pauses = active.pauses || [];
  active.pauses.push({ pauseTime: new Date().toISOString(), resumeTime: null });
  await writeJSON(STORAGE_KEYS.ACTIVE_SESSION, active);

  return { success: true, session: active };
};

const resumeSession = async () => {
  const active = await readJSON(STORAGE_KEYS.ACTIVE_SESSION, null);
  if (!active || !active.id) {
    throw new Error('No active session found');
  }
  if (active.status !== 'paused') {
    throw new Error('Session is not paused');
  }

  active.status = 'active';
  if (active.pauses && active.pauses.length > 0) {
    active.pauses[active.pauses.length - 1].resumeTime = new Date().toISOString();
  }
  await writeJSON(STORAGE_KEYS.ACTIVE_SESSION, active);

  return { success: true, session: active };
};

const addHourlyLog = async (data: { subject: string; topic: string; explanation: string }) => {
  const { subject, topic, explanation } = data;
  if (!subject || !topic || !explanation) {
    throw new Error('All fields required');
  }

  const log = {
    id: Date.now().toString(),
    date: getToday(),
    subject,
    topic,
    explanation,
    timestamp: new Date().toISOString(),
  };

  const logs = await readJSON(STORAGE_KEYS.HOURLY_LOGS, []);
  logs.push(log);
  await writeJSON(STORAGE_KEYS.HOURLY_LOGS, logs);

  const today = getToday();
  const sessions = (await readJSON(STORAGE_KEYS.STUDY_SESSIONS, [])).filter((s: any) => s.date === today);
  const todayHours = (sessions.reduce((a: number, s: any) => a + (s.duration || 0), 0) / 3600);
  await saveFocusScore(today, todayHours);

  return { success: true, log };
};

export { startSession, endSession, getActiveSession, pauseSession, resumeSession, addHourlyLog };
