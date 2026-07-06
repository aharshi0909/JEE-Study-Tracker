import { GoogleGenerativeAI } from '@google/generative-ai';
import { readJSON, writeJSON, getToday, getWeekStart, secondsToHours } from './storage';
import { STORAGE_KEYS } from './storage';

let genAI: any = null;

const initGemini = (apiKey: string) => {
  if (apiKey && !genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

const COACH_PROMPT = `You are a STRICT JEE productivity accountability coach. Your personality:
- Brutal honesty, zero tolerance for excuses or laziness
- Always push for more; 10 hours/day is minimum, not achievement
- Call out inconsistency between claimed study and actual logs
- Quote actual numbers from the study context: hours, scores, subjects
- Never give undeserved praise
- Ask probing questions if explanations are vague
- Motivate through discipline, not comfort
You receive real-time study context with every message. Use it.`;

const PLANNER_PROMPT = `You are an expert JEE study planner.
- Analyze weak subjects from mock tests and hourly logs
- Build precise daily schedules (subject → topic → duration)
- Weight time by subject weakness and JEE exam weight
- Plans must be realistic (total ≤ 10 hours/day)
- Format output clearly: "Physics - Mechanics → 2h 30m"
- If user deviates from past plans, point it out`;

const MOCK_PROMPT = `You are a JEE mock test performance analyst.
- Identify weak chapters from scores
- Track score trends across tests
- Correlate study hours per subject with marks
- Give specific chapter-level improvement strategies
- Use percentage scores for fair cross-subject comparison`;

const buildContext = async () => {
  const today = getToday();
  const weekStart = getWeekStart();

  const sessions = await readJSON(STORAGE_KEYS.STUDY_SESSIONS, []);
  const manualEntries = await readJSON(STORAGE_KEYS.MANUAL_ENTRIES, []);
  const hourlyLogs = await readJSON(STORAGE_KEYS.HOURLY_LOGS, []);
  const mockTests = await readJSON(STORAGE_KEYS.MOCK_TESTS, []);
  const focusScores = await readJSON(STORAGE_KEYS.FOCUS_SCORES, []);
  const dailyStats = await readJSON(STORAGE_KEYS.DAILY_STATS, []);

  const todaySessions = sessions.filter((s: any) => s.date === today);
  const weekSessions = sessions.filter((s: any) => s.date >= weekStart);
  const todayManual = manualEntries.filter((e: any) => e.date === today && e.status === 'approved');
  const todayHourly = hourlyLogs.filter((l: any) => l.date === today);
  const recentMocks = mockTests.slice(-5);
  const todayScore = focusScores.find((f: any) => f.date === today);

  const todaySessionHours = secondsToHours(todaySessions.reduce((a: number, s: any) => a + (s.duration || 0), 0));
  const todayManualHours = todayManual.reduce((a: number, e: any) => a + (e.approvedTime || 0), 0);

  const activeSession = await readJSON(STORAGE_KEYS.ACTIVE_SESSION, null);
  let activeElapsedHours = 0;
  if (activeSession && activeSession.id) {
    const elapsedSec = Math.floor((new Date().getTime() - new Date(activeSession.startTime).getTime()) / 1000);
    activeElapsedHours = Math.max(0, elapsedSec / 3600);
  }

  const todayTotal = Math.round((todaySessionHours + todayManualHours + activeElapsedHours) * 100) / 100;

  const weekSessionHours = secondsToHours(weekSessions.reduce((a: number, s: any) => a + (s.duration || 0), 0));
  const weekManualHours = manualEntries
    .filter((e: any) => e.date >= weekStart && e.status === 'approved')
    .reduce((a: number, e: any) => a + (e.approvedTime || 0), 0);
  const weekTotal = Math.round((weekSessionHours + weekManualHours + activeElapsedHours) * 100) / 100;

  const subjectMap: any = {};
  [...todaySessions, ...weekSessions].forEach((s: any) => {
    subjectMap[s.subject] = (subjectMap[s.subject] || 0) + secondsToHours(s.duration || 0);
  });
  if (activeSession && activeSession.id) {
    subjectMap[activeSession.subject] = (subjectMap[activeSession.subject] || 0) + activeElapsedHours;
  }

  const dailyToday = dailyStats.find((d: any) => d.date === today);
  const carryOver = dailyToday?.carryOver || 0;

  return `=== LIVE STUDY CONTEXT (${today}) ===
TODAY: ${todayTotal}h studied | Required: ${(10 + carryOver).toFixed(1)}h (${carryOver > 0 ? `+${carryOver.toFixed(1)}h carry-over` : 'no carry-over'})
WEEK : ${weekTotal}h / 70h target (${(70 - weekTotal).toFixed(1)}h remaining)
FIS  : ${todayScore ? todayScore.focusScore : 'Not yet calculated'}/100

TODAY'S SUBJECT BREAKDOWN:
${todaySessions.length === 0 ? 'No sessions today' : todaySessions.map((s: any) => `  ${s.subject}: ${secondsToHours(s.duration || 0)}h`).join('\n')}
${todayManual.length > 0 ? todayManual.map((e: any) => `  ${e.subject} (manual-approved): ${e.approvedTime}h`).join('\n') : ''}

HOURLY LOGS TODAY (${todayHourly.length} submitted):
${todayHourly.length === 0 ? 'None' : todayHourly.map((l: any) => `  [${l.subject}] ${l.topic}: ${l.explanation?.substring(0, 120)}...`).join('\n')}

RECENT MOCK TESTS (last 5):
${recentMocks.length === 0 ? 'None' : recentMocks.map((t: any) => `  ${t.testName} | ${t.subject} | ${t.marks}/${t.maxMarks} (${Math.round((t.marks / t.maxMarks) * 100)}%)`).join('\n')}

WEEKLY SUBJECT TOTALS:
${Object.entries(subjectMap).map(([s, h]: [string, any]) => `  ${s}: ${h.toFixed(1)}h`).join('\n') || '  No data'}`;
};

const callGemini = async (systemPrompt: string, history: any[], userMessage: string): Promise<string> => {
  const apiKey = await readJSON(STORAGE_KEYS.GEMINI_API_KEY, null);
  const client = initGemini(apiKey);
  
  if (!client) {
    return '[AI unavailable: Set Gemini API key in app settings]';
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let fullPrompt = `SYSTEM:\n${systemPrompt}\n\n`;
    for (const h of (history || [])) {
      const text = h.parts?.[0]?.text || '';
      if (!text) continue;
      fullPrompt += h.role === 'model' ? `ASSISTANT: ${text}\n\n` : `USER: ${text}\n\n`;
    }
    fullPrompt += `USER: ${userMessage}\n\nASSISTANT:`;

    const result = await model.generateContent(fullPrompt);
    return result.response.text().trim();
  } catch (e: any) {
    console.error('[Gemini]', e.message);
    if (e.message?.includes('API_KEY_INVALID')) return '[Invalid Gemini API key. Check app settings]';
    if (e.message?.includes('quota')) return '[API quota exceeded]';
    return `[AI error: ${e.message}]`;
  }
};

const coachChat = async (userMessage: string): Promise<string> => {
  const history = await readJSON(STORAGE_KEYS.CHAT_HISTORY, []);
  const context = await buildContext();
  const contextualMsg = `${context}\n\n---\nUSER: ${userMessage}`;
  const reply = await callGemini(COACH_PROMPT, history, contextualMsg);
  const updated = [...history, { role: 'user', parts: [{ text: userMessage }] }, { role: 'model', parts: [{ text: reply }] }];
  await writeJSON(STORAGE_KEYS.CHAT_HISTORY, updated.slice(-40));
  return reply;
};

const plannerChat = async (userMessage: string): Promise<string> => {
  const history = await readJSON(STORAGE_KEYS.PLANNER_HISTORY, []);
  const context = await buildContext();
  const contextualMsg = `${context}\n\n---\nUSER: ${userMessage}`;
  const reply = await callGemini(PLANNER_PROMPT, history, contextualMsg);
  const updated = [...history, { role: 'user', parts: [{ text: userMessage }] }, { role: 'model', parts: [{ text: reply }] }];
  await writeJSON(STORAGE_KEYS.PLANNER_HISTORY, updated.slice(-20));
  return reply;
};

const mockChat = async (userMessage: string, testData?: any): Promise<string> => {
  const history = await readJSON(STORAGE_KEYS.MOCK_HISTORY, []);
  const allMocks = await readJSON(STORAGE_KEYS.MOCK_TESTS, []);
  const mockContext = `MOCK TEST DATA:\n${allMocks.slice(-10).map((t: any) => `${t.date} | ${t.testName} | ${t.subject}: ${t.marks}/${t.maxMarks}`).join('\n')}`;
  const msg = testData ? `NEW TEST RESULT: ${JSON.stringify(testData)}\n\n${mockContext}\n\nUSER: ${userMessage}` : `${mockContext}\n\nUSER: ${userMessage}`;
  const reply = await callGemini(MOCK_PROMPT, history, msg);
  const updated = [...history, { role: 'user', parts: [{ text: userMessage }] }, { role: 'model', parts: [{ text: reply }] }];
  await writeJSON(STORAGE_KEYS.MOCK_HISTORY, updated.slice(-20));
  return reply;
};

const verifyManualEntry = async (entry: any): Promise<{ approvedTime: number; aiReason: string }> => {
  const apiKey = await readJSON(STORAGE_KEYS.GEMINI_API_KEY, null);
  const client = initGemini(apiKey);
  
  if (!client) {
    return { approvedTime: entry.estimatedTime * 0.8, aiReason: 'AI unavailable - auto-approved at 80%' };
  }

  const context = await buildContext();
  const recentSessions = (await readJSON(STORAGE_KEYS.STUDY_SESSIONS, [])).slice(-10)
    .map((s: any) => `${s.date}: ${s.subject} - ${secondsToHours(s.duration || 0)}h`)
    .join('\n');

  const prompt = `${COACH_PROMPT}
You are verifying a manual study entry. Be strict. Return ONLY valid JSON.

STUDY CONTEXT:
${context}

RECENT SESSIONS:
${recentSessions}

MANUAL ENTRY CLAIM:
Subject: ${entry.subject}
Topic: ${entry.topic}
Location: ${entry.location}
Claimed Time: ${entry.estimatedTime} hours
Description: ${entry.description}
Problems Solved: ${entry.problemsSolved}

Evaluate credibility. Be skeptical of exaggerated claims.
Return JSON only: { "approvedTime": <number in hours>, "aiReason": "<1-2 sentence strict explanation>" }`;

  try {
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);
    return {
      approvedTime: Math.min(parsed.approvedTime, entry.estimatedTime),
      aiReason: parsed.aiReason,
    };
  } catch (e) {
    const fallback = Math.round(entry.estimatedTime * 0.75 * 10) / 10;
    return { approvedTime: fallback, aiReason: `AI parse error. Auto-approved at 75% of claimed time.` };
  }
};

export {
  initGemini,
  coachChat,
  plannerChat,
  mockChat,
  verifyManualEntry,
  buildContext,
};
