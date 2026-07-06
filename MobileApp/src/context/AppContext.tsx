import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import * as SessionService from './session';
import * as GeminiService from './gemini';
import { readJSON, writeJSON, STORAGE_KEYS, getToday, secondsToHours } from './storage';

interface AppContextType {
  activeSession: any | null;
  dailyStats: any | null;
  weeklyStats: any | null;
  focusData: any | null;
  chatHistory: any[];
  plannerHistory: any[];
  mockHistory: any[];
  mockTests: any[];
  studyLogs: any[];
  
  startSession: (subject: string) => Promise<void>;
  endSession: () => Promise<void>;
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  addHourlyLog: (data: any) => Promise<void>;
  
  sendCoachMessage: (msg: string) => Promise<string>;
  sendPlannerMessage: (msg: string) => Promise<string>;
  sendMockMessage: (msg: string, testData?: any) => Promise<string>;
  submitManualEntry: (entry: any) => Promise<any>;
  addMockTest: (test: any) => Promise<void>;
  
  getDailyStats: () => Promise<void>;
  getWeeklyStats: () => Promise<void>;
  getFocusScore: () => Promise<void>;
  getStudyLogs: () => Promise<void>;
  refreshAllStats: () => Promise<void>;
  resetAllData: () => Promise<void>;
  setGeminiKey: (key: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

type Action = 
  | { type: 'SET_ACTIVE_SESSION'; payload: any }
  | { type: 'SET_DAILY_STATS'; payload: any }
  | { type: 'SET_WEEKLY_STATS'; payload: any }
  | { type: 'SET_FOCUS_DATA'; payload: any }
  | { type: 'SET_CHAT_HISTORY'; payload: any[] }
  | { type: 'SET_PLANNER_HISTORY'; payload: any[] }
  | { type: 'SET_MOCK_HISTORY'; payload: any[] }
  | { type: 'SET_MOCK_TESTS'; payload: any[] }
  | { type: 'SET_STUDY_LOGS'; payload: any[] };

const initialState = {
  activeSession: null,
  dailyStats: null,
  weeklyStats: null,
  focusData: null,
  chatHistory: [],
  plannerHistory: [],
  mockHistory: [],
  mockTests: [],
  studyLogs: [],
};

const reducer = (state: any, action: Action) => {
  switch (action.type) {
    case 'SET_ACTIVE_SESSION':
      return { ...state, activeSession: action.payload };
    case 'SET_DAILY_STATS':
      return { ...state, dailyStats: action.payload };
    case 'SET_WEEKLY_STATS':
      return { ...state, weeklyStats: action.payload };
    case 'SET_FOCUS_DATA':
      return { ...state, focusData: action.payload };
    case 'SET_CHAT_HISTORY':
      return { ...state, chatHistory: action.payload };
    case 'SET_PLANNER_HISTORY':
      return { ...state, plannerHistory: action.payload };
    case 'SET_MOCK_HISTORY':
      return { ...state, mockHistory: action.payload };
    case 'SET_MOCK_TESTS':
      return { ...state, mockTests: action.payload };
    case 'SET_STUDY_LOGS':
      return { ...state, studyLogs: action.payload };
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const startSession = async (subject: string) => {
    const result = await SessionService.startSession(subject);
    dispatch({ type: 'SET_ACTIVE_SESSION', payload: result.session });
  };

  const endSession = async () => {
    const result = await SessionService.endSession();
    dispatch({ type: 'SET_ACTIVE_SESSION', payload: null });
    await refreshAllStats();
  };

  const pauseSession = async () => {
    await SessionService.pauseSession();
    const { active } = await SessionService.getActiveSession();
    dispatch({ type: 'SET_ACTIVE_SESSION', payload: active });
  };

  const resumeSession = async () => {
    await SessionService.resumeSession();
    const { active } = await SessionService.getActiveSession();
    dispatch({ type: 'SET_ACTIVE_SESSION', payload: active });
  };

  const addHourlyLog = async (data: any) => {
    await SessionService.addHourlyLog(data);
    await refreshAllStats();
  };

  const sendCoachMessage = async (msg: string): Promise<string> => {
    const response = await GeminiService.coachChat(msg);
    const history = await readJSON(STORAGE_KEYS.CHAT_HISTORY, []);
    dispatch({ type: 'SET_CHAT_HISTORY', payload: history });
    return response;
  };

  const sendPlannerMessage = async (msg: string): Promise<string> => {
    const response = await GeminiService.plannerChat(msg);
    const history = await readJSON(STORAGE_KEYS.PLANNER_HISTORY, []);
    dispatch({ type: 'SET_PLANNER_HISTORY', payload: history });
    return response;
  };

  const sendMockMessage = async (msg: string, testData?: any): Promise<string> => {
    const response = await GeminiService.mockChat(msg, testData);
    const history = await readJSON(STORAGE_KEYS.MOCK_HISTORY, []);
    dispatch({ type: 'SET_MOCK_HISTORY', payload: history });
    return response;
  };

  const submitManualEntry = async (entry: any) => {
    const verification = await GeminiService.verifyManualEntry(entry);
    const manualEntries = await readJSON(STORAGE_KEYS.MANUAL_ENTRIES, []);
    const newEntry = {
      id: Date.now().toString(),
      ...entry,
      status: 'approved',
      approvedTime: verification.approvedTime,
      aiReason: verification.aiReason,
      date: getToday(),
      timestamp: new Date().toISOString(),
    };
    manualEntries.push(newEntry);
    await writeJSON(STORAGE_KEYS.MANUAL_ENTRIES, manualEntries);
    await refreshAllStats();
    return newEntry;
  };

  const addMockTest = async (test: any) => {
    const mockTests = await readJSON(STORAGE_KEYS.MOCK_TESTS, []);
    const newTest = {
      id: Date.now().toString(),
      ...test,
      date: getToday(),
      timestamp: new Date().toISOString(),
    };
    mockTests.push(newTest);
    await writeJSON(STORAGE_KEYS.MOCK_TESTS, mockTests);
    dispatch({ type: 'SET_MOCK_TESTS', payload: mockTests });
  };

  const getDailyStats = async () => {
    const stats = await readJSON(STORAGE_KEYS.DAILY_STATS, []);
    const today = getToday();
    const todayStats = stats.find((d: any) => d.date === today);
    dispatch({ type: 'SET_DAILY_STATS', payload: todayStats || null });
  };

  const getWeeklyStats = async () => {
    const stats = await readJSON(STORAGE_KEYS.WEEKLY_STATS, null);
    dispatch({ type: 'SET_WEEKLY_STATS', payload: stats });
  };

  const getFocusScore = async () => {
    const scores = await readJSON(STORAGE_KEYS.FOCUS_SCORES, []);
    const today = getToday();
    const todayScore = scores.find((f: any) => f.date === today);
    dispatch({ type: 'SET_FOCUS_DATA', payload: { today: todayScore } });
  };

  const getStudyLogs = async () => {
    const logs = await readJSON(STORAGE_KEYS.HOURLY_LOGS, []);
    dispatch({ type: 'SET_STUDY_LOGS', payload: logs });
  };

  const refreshAllStats = async () => {
    await getDailyStats();
    await getWeeklyStats();
    await getFocusScore();
  };

  const resetAllData = async () => {
    await writeJSON(STORAGE_KEYS.ACTIVE_SESSION, null);
    await writeJSON(STORAGE_KEYS.STUDY_SESSIONS, []);
    await writeJSON(STORAGE_KEYS.HOURLY_LOGS, []);
    await writeJSON(STORAGE_KEYS.DAILY_STATS, []);
    await writeJSON(STORAGE_KEYS.WEEKLY_STATS, null);
    await writeJSON(STORAGE_KEYS.FOCUS_SCORES, []);
    await writeJSON(STORAGE_KEYS.MOCK_TESTS, []);
    await writeJSON(STORAGE_KEYS.MANUAL_ENTRIES, []);
    await writeJSON(STORAGE_KEYS.CHAT_HISTORY, []);
    await writeJSON(STORAGE_KEYS.PLANNER_HISTORY, []);
    await writeJSON(STORAGE_KEYS.MOCK_HISTORY, []);
    dispatch({
      type: 'SET_ACTIVE_SESSION',
      payload: null,
    });
    await refreshAllStats();
  };

  const setGeminiKey = async (key: string) => {
    await writeJSON(STORAGE_KEYS.GEMINI_API_KEY, key);
    GeminiService.initGemini(key);
  };

  const value: AppContextType = {
    ...state,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    addHourlyLog,
    sendCoachMessage,
    sendPlannerMessage,
    sendMockMessage,
    submitManualEntry,
    addMockTest,
    getDailyStats,
    getWeeklyStats,
    getFocusScore,
    getStudyLogs,
    refreshAllStats,
    resetAllData,
    setGeminiKey,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
