# JEE Study Tracker - React Native Mobile App 📱

A complete React Native mobile app for Android 5.1+ with all features from the original web app, built for local-first data storage and Gemini AI integration.

## ✨ Features

✅ **Study Timer** - Track active study time with automatic hourly checkpoints  
✅ **AI Accountability Coach** - Gemini-powered coach with real-time study context  
✅ **Smart Study Planner** - AI-generated daily schedules based on weak areas  
✅ **Mock Test Analytics** - Record scores and get instant AI feedback  
✅ **Manual Study Verification** - AI verifies off-desk study claims  
✅ **Focus Integrity Score (FIS)** - Dynamic 0-100 metric based on consistency  
✅ **Local Storage** - All data stored on device (AsyncStorage)  
✅ **Offline Capable** - Works without internet (except AI features)  
✅ **Material Design** - Native Android UI with dark theme  
✅ **Android 5.1+** - Supports legacy and modern devices  

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- Android SDK with API level 21+ (Android 5.1)
- Emulator or physical Android device
- Google Gemini API Key (free at [aistudio.google.com](https://aistudio.google.com))

### Installation

1. **Clone and setup**
```bash
cd MobileApp
npm install
```

2. **Configure Android**
```bash
npm run android
```

3. **Set Gemini API Key**
   - Open app → Settings tab
   - Paste your Gemini API key
   - Feature will be active immediately

### Running the App

**Start Metro bundler:**
```bash
npm start
```

**In another terminal, run on Android:**
```bash
npm run android
```

**Or connect a device and run:**
```bash
adb devices  # Verify your device
npm run android
```

## 📁 Project Structure

```
MobileApp/
├── src/
│   ├── screens/              # UI screens
│   │   ├── StudyTimerScreen.tsx      # Main timer
│   │   ├── DashboardScreen.tsx       # Stats & progress
│   │   ├── CoachChatScreen.tsx       # AI Coach
│   │   ├── PlannerScreen.tsx         # Study Planner
│   │   ├── MockTestScreen.tsx        # Mock tests
│   │   ├── ManualEntryScreen.tsx     # Off-desk logging
│   │   └── SettingsScreen.tsx        # Configuration
│   ├── context/
│   │   └── AppContext.tsx            # Global state management
│   ├── utils/
│   │   ├── storage.ts                # LocalStorage wrapper (AsyncStorage)
│   │   ├── gemini.ts                 # Gemini AI integration
│   │   ├── focus.ts                  # FIS calculations
│   │   └── session.ts                # Session management
│   ├── App.tsx                       # Navigation setup
│   └── index.ts                      # Entry point
├── package.json
├── tsconfig.json
├── babel.config.js
└── metro.config.js
```

## 🔑 Core Features Explained

### Study Timer
- Start/pause/resume sessions by subject (Physics, Chemistry, Math, Other)
- Automatic hourly checkpoints requiring topic logging
- Detailed explanation tracking for FIS calculation
- Live elapsed time display with progress to next checkpoint

### Dashboard
- Daily progress toward 10-hour requirement
- Weekly 70-hour target tracking
- Subject-wise time breakdown
- Current FIS score with color coding:
  - 🟢 Green (70+): Excellent
  - 🟡 Yellow (40-69): Good
  - 🔴 Red (<40): Poor

### AI Coach
- Strict accountability messaging based on real study data
- Quotes actual hours, scores, and consistency metrics
- Full chat history stored locally
- Context-aware responses using study patterns

### Study Planner
- Receives weak subjects from mock tests
- Generates daily schedules with time allocation
- Realistic constraints (≤10 hours/day)
- Adapts to user deviations from plans

### Mock Test Analysis
- Record test name, subject, marks, and max marks
- Get instant AI performance analysis
- Track trends across tests
- Identify weak chapters for focus

### Manual Entry
- Log off-desk study (library, cafe, home)
- AI verification checks for credibility
- Penalties for inflated claims
- Approved hours contribute to daily totals

### Focus Integrity Score (FIS)
**Calculation:**
```
Base Score = min(100, hours × 10)
Log Quality = min(50, hourly_logs × 10)
Consistency = min(20, days_with_50+_score)
Penalty = -20 if no logs despite study

FIS = max(0, min(100, Base + Quality + Consistency - 30))
```

## 💾 Local Storage

All data stored in device's AsyncStorage:
- `active_session` - Currently running session
- `study_sessions` - Completed sessions with duration
- `hourly_logs` - Topic/explanation checkpoints
- `daily_stats` - Daily progress and subject breakdown
- `weekly_stats` - Weekly totals and targets
- `focus_scores` - FIS history
- `mock_tests` - Test records
- `manual_entries` - Off-desk study verification
- `chat_history` - Coach messages (last 40)
- `planner_history` - Planner messages (last 20)
- `mock_history` - Mock analysis messages (last 20)

**Auto-backup tip:** Export AsyncStorage to JSON periodically for backup.

## 🤖 Gemini AI Integration

### Models Used
- **gemini-2.5-flash**: Coach, Planner, Mock Analysis (faster)
- **gemini-2.0-flash**: Manual entry verification (JSON output)

### Prompts

**Coach:** Brutal honesty, zero tolerance for excuses. Quotes actual data.

**Planner:** Expert scheduler. Builds realistic daily plans with subject weighting.

**Mock Analyst:** Performance tracker. Identifies weak areas and improvement strategies.

### Cost
- Free tier: 50 requests/min for `gemini-2.5-flash`
- Suitable for personal study tracking

## 🔧 Customization

### Change Target Hours
Edit `REQUIRED_HOURS` in `src/utils/focus.ts`:
```typescript
const requiredHours = 10; // Change to your target
```

### Modify Subjects
Edit `SUBJECTS` in `src/screens/StudyTimerScreen.tsx`:
```typescript
const SUBJECTS = ['Physics', 'Chemistry', 'Math', 'Biology', 'Other'];
```

### Adjust FIS Formula
Edit `saveFocusScore()` in `src/utils/focus.ts`

### Customize AI Prompts
Edit constants in `src/utils/gemini.ts`:
- `COACH_PROMPT`
- `PLANNER_PROMPT`
- `MOCK_PROMPT`

## 📊 Troubleshooting

### "Session not running" error
- Ensure you've started a session from the Timer tab first
- Check if device time is set correctly

### AI features not working
- Verify Gemini API key in Settings
- Check internet connection
- Confirm key has quota remaining

### Data not persisting
- Clear app cache: Settings → Apps → JEE Tracker → Clear Cache
- Uninstall and reinstall app
- Check device storage space

### Performance on older devices
- Reduce chat history size (change `.slice(-40)` to `.slice(-10)`)
- Disable auto-refresh (increase interval in Dashboard)

## 🛡️ Data Privacy

- ✅ All data stored locally on device
- ✅ No cloud sync (privacy-first)
- ✅ Gemini API only receives study queries (no PII)
- ✅ Can be completely offline except AI features
- ✅ Delete everything anytime via Settings → Clear All Data

## 📱 Device Compatibility

| Feature | Android 5.1+ | Notes |
|---------|-------------|-------|
| Core Timer | ✅ | Native support |
| AsyncStorage | ✅ | Works on all versions |
| Notifications | ✅ | Requires permission |
| Gemini API | ✅ | HTTPS only |
| UI Performance | ✅ | Optimized for low-end devices |

## 🎯 Tips for Best Results

1. **Hourly Logging**: Write detailed explanations (50+ chars) for better FIS
2. **Consistency**: Study same time daily for higher scores
3. **Manual Entry**: Be honest; AI penalizes inflated claims
4. **Mock Tests**: Take one every 2 weeks for meaningful analysis
5. **Coach Chats**: Ask specific questions (e.g., "Why is my Physics weak?")
6. **Backups**: Periodically export your data via settings

## 🚀 Future Enhancements

- [ ] Cloud backup (Firebase)
- [ ] Notification reminders
- [ ] Statistics visualizations
- [ ] Study group sync
- [ ] Offline AI model support
- [ ] Export to PDF reports
- [ ] Wearable integration

## 📄 License

Build for serious JEE aspirants. No pain, no gain.

## 🤝 Credits

- Built with React Native
- Powered by Google Gemini AI
- Local storage with AsyncStorage
- Navigation with React Navigation

---

**Stuck?** Check the troubleshooting section or review component code for inline comments.

**Ready to study?** Open the app, set your Gemini key, and start a session! 💪
