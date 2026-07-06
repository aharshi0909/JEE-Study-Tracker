# JEE Study Tracker - React Native Implementation

## 📱 What's Included

This React Native mobile app is a complete port of the JEE Study Tracker web application with the following features:

### ✅ Fully Implemented Features

1. **Study Timer** (StudyTimerScreen.tsx)
   - Start/pause/resume study sessions
   - Subject selection (Physics, Chemistry, Math, Custom)
   - Hourly checkpoints with topic logging
   - Session duration tracking
   - Pause/resume functionality with accurate time calculation

2. **Dashboard** (DashboardScreen.tsx)
   - Daily progress toward 10-hour goal
   - Weekly 70-hour target tracking
   - Subject-wise time breakdown
   - Focus Integrity Score (FIS) display
   - Real-time stats refresh

3. **AI Accountability Coach** (CoachChatScreen.tsx)
   - Chat interface with Gemini API
   - Real-time study context injection
   - Full conversation history (last 40 messages)
   - Strict personality configuration

4. **Study Planner** (PlannerScreen.tsx)
   - AI-generated daily study schedules
   - Subject weakness analysis
   - Time allocation optimization
   - Chat-based planning interface

5. **Mock Test Analysis** (MockTestScreen.tsx)
   - Record test scores
   - Track performance trends
   - AI analysis of weak areas
   - Subject-wise performance correlation

6. **Manual Study Entry** (ManualEntryScreen.tsx)
   - Log off-desk study sessions
   - Location tracking
   - AI verification of claims
   - Credibility assessment

7. **Focus Integrity Score (FIS)** (src/utils/focus.ts)
   - Dynamic calculation based on:
     - Total study hours
     - Hourly log quality
     - Consistency streak
     - Session documentation
   - Color-coded feedback (Green/Yellow/Red)

8. **Settings & Configuration** (SettingsScreen.tsx)
   - Gemini API key management
   - App information
   - Data export options
   - Full data reset capability

### 🎯 Local-First Architecture

All data stored using AsyncStorage:
- No backend server required
- Complete offline functionality (except AI features)
- Automatic persistence
- No internet dependency for core features

### 🤖 Gemini AI Integration

- Coach messaging with study context
- Study planning with weak subject analysis
- Mock test performance analysis
- Manual entry credibility verification
- Fully configurable prompts

## 📁 File Structure

```
MobileApp/
├── src/
│   ├── screens/
│   │   ├── StudyTimerScreen.tsx       (Main timer with hourly logs)
│   │   ├── DashboardScreen.tsx        (Stats and progress)
│   │   ├── CoachChatScreen.tsx        (AI coach interface)
│   │   ├── PlannerScreen.tsx          (Study planner)
│   │   ├── MockTestScreen.tsx         (Mock test tracking)
│   │   ├── ManualEntryScreen.tsx      (Off-desk logging)
│   │   └── SettingsScreen.tsx         (Configuration)
│   ├── context/
│   │   └── AppContext.tsx             (Global state + all business logic)
│   ├── utils/
│   │   ├── storage.ts                 (AsyncStorage wrapper)
│   │   ├── gemini.ts                  (Gemini API integration)
│   │   ├── focus.ts                   (FIS calculation)
│   │   └── session.ts                 (Session management)
│   ├── App.tsx                        (Navigation setup)
│   └── index.ts                       (Entry point)
├── README.md                          (Complete documentation)
├── SETUP.md                           (Installation guide)
├── package.json                       (Dependencies)
├── tsconfig.json                      (TypeScript config)
├── babel.config.js                    (Babel setup)
└── metro.config.js                    (Metro bundler config)
```

## 🔄 Data Flow

```
UI Component
    ↓
AppContext Hook (useAppContext)
    ↓
Business Logic (service functions)
    ↓
AsyncStorage (local persistence)
    ↓
[Optional] Gemini API
```

## 🛠️ Core Services

### storage.ts
- `readJSON()` / `writeJSON()` - AsyncStorage wrappers
- `getToday()` / `getWeekStart()` - Date utilities
- `secondsToHours()` / `formatDuration()` - Time formatting
- `STORAGE_KEYS` - Centralized key management

### gemini.ts
- `initGemini()` - Initialize Gemini client
- `coachChat()` - Coach messaging
- `plannerChat()` - Study planning
- `mockChat()` - Test analysis
- `verifyManualEntry()` - Credibility check
- `buildContext()` - Real-time study context

### focus.ts
- `saveFocusScore()` - Calculate and store FIS
- `updateDailyStats()` - Daily progress tracking
- `updateWeeklyStats()` - Weekly statistics

### session.ts
- `startSession()` - Begin study session
- `endSession()` - Complete session
- `pauseSession()` / `resumeSession()` - Pause control
- `addHourlyLog()` - Topic checkpoint
- `getActiveSession()` - Get current session

### AppContext.tsx
- Global state management using useReducer
- Orchestrates all business logic
- Provides hooks for components
- Manages data synchronization

## 🎨 UI/UX Design

- **Dark Theme**: #0f172a background, #1e293b cards
- **Color Scheme**: Indigo (#4f46e5), Emerald (#10b981), Amber (#f59e0b), Cyan (#06b6d4)
- **Responsive Layout**: ScrollView for content, FlatList for lists
- **Touch-Friendly**: Large tap targets, clear visual feedback
- **Android 5.1 Compatible**: No unsupported APIs

## 🚀 Getting Started

1. **Setup** (See SETUP.md):
   ```bash
   cd MobileApp
   npm install
   npm start
   npm run android
   ```

2. **First Run**:
   - App launches with Timer tab selected
   - Go to Settings to add Gemini API key
   - Start a study session to populate data

3. **Development**:
   - Hot reload with 'r' in Metro terminal
   - Full TypeScript support
   - ESLint configured

## 📊 Data Models

### Session
```typescript
{
  id: string
  subject: string
  startTime: ISO8601
  date: YYYY-MM-DD
  status: 'active' | 'paused' | 'completed'
  duration: seconds
  pauses: [{ pauseTime, resumeTime }]
}
```

### HourlyLog
```typescript
{
  id: string
  date: YYYY-MM-DD
  subject: string
  topic: string
  explanation: string
  timestamp: ISO8601
}
```

### DailyStats
```typescript
{
  date: YYYY-MM-DD
  totalHours: number
  requiredHours: 10
  carryOver: number
  remainingHours: number
  percentage: 0-100
  subjectBreakdown: { [subject]: hours }
}
```

## 🔌 API Integration

### Gemini API Calls

```typescript
// All calls go through callGemini()
const response = await callGemini(
  COACH_PROMPT,  // System prompt
  history,       // Message history
  userMessage    // Current message
);
```

### Context Injection

Every AI call includes real study context:
```
=== LIVE STUDY CONTEXT ===
TODAY: 3.5h studied | Required: 10h
WEEK: 45h / 70h target
FIS: 65/100
[detailed breakdown]
```

## 🧪 Testing Locally

1. **Timer Functionality**:
   - Start session → verify timer increments
   - Pause → verify timer stops
   - Resume → verify timer continues
   - End session → verify data persists

2. **AI Features** (requires API key):
   - Coach tab → Type message → Should get response
   - Mock screen → Add test → Get analysis
   - Manual entry → Submit → Verify AI response

3. **Data Persistence**:
   - Add data → Kill app → Reopen → Data still there
   - Check Android storage: `/data/data/com.jeestudytracker/databases/RKStorage/`

## 📈 Performance Optimization

- Lazy loading screens
- Message history capped (40 for coach, 20 for others)
- Efficient re-renders with useCallback
- No unnecessary API calls
- Optimized for Android 5.1 (minimal resources)

## 🔐 Security Considerations

- Gemini API key stored in encrypted device storage
- No user tracking or analytics
- No data sent to external servers (except Gemini API)
- Can run completely offline
- Users control all data deletion

## 🎓 Learning Resources

Code follows React Native best practices:
- Functional components with hooks
- TypeScript for type safety
- Context API for state management
- Modular service layer
- Clear separation of concerns

## 🚨 Common Issues & Solutions

**App won't build:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Android cache: `cd android && ./gradlew clean && cd ..`

**Gemini API errors:**
- Verify API key in Settings
- Check API quota at console.cloud.google.com
- Ensure internet connection

**Data not persisting:**
- Check AsyncStorage permissions in AndroidManifest.xml
- Verify device has storage space
- Check logcat for storage errors

## 📝 Next Steps

1. Clone the repo
2. Follow SETUP.md
3. Run the app
4. Configure Gemini API key
5. Start studying!

---

**Built for serious JEE aspirants. No pain, no gain.** 💪
