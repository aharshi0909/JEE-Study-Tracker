# JEE Study Tracker 🚀

A high-performance, AI-powered study dashboard designed for serious JEE aspirants. Track sessions, get AI coaching, analyze mock tests, and maintain your Focus Integrity Score (FIS).

## 🛠 Features

- **AI Accountability Coach**: A strict, brutal AI coach that call out excuses based on your real-time study logs.
- **Smart Study Timer**: Tracks active vs. paused time. Automatically triggers "Hourly Logs" to ensure high-quality study.
- **FIS (Focus Integrity Score)**: A 0-100 metric calculated by AI based on session length, logs, and consistency. No logs = Low FIS.
- **Mock Test AI Analytics**: Record scores and get immediate AI analysis of weak areas and improvement strategies.
- **AI-Verified Manual Entries**: Studied away from the desk? Submit details for AI verification; the AI only approves what's credible.
- **Persistent Progress**: Dashboard stats, weekly leaderboards, and detailed history logs.

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (LTS recommended)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### 2. Backend Setup
1. Open a terminal in the `Backend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Backend` folder:
   ```env
   PORT=3000
   GEMINI_API_KEY=your_key_here
   ```
4. Start the server:
   ```bash
   node server.js
   ```

### 3. Frontend Setup
1. Open a second terminal in the `Frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### 4. Usage
- Open `http://localhost:5173` in your browser.
- Select your subject and start a session.
- Keep the tab open or use desktop notifications to know when the 1-hour "Hourly Log" prompt appears.
- Audio cues (yay!) are triggered when it's time to log your progress.

---

## 📂 Project Structure

- `Backend/data/`: Auto-generated JSON files storing your history (never edited manually).
- `Backend/services/`: Core logic for Gemini AI interactions and FIS calculation.
- `Frontend/src/components/`: Modular React components for the dashboard.
- `Frontend/src/assets/`: Sound effects and visual assets.

---

## 🛡 Security & Resilience
- **Auto-Recovery**: If any JSON data file is deleted, the backend automatically recreates it with default empty values.
- **Notification Support**: Built-in support for browser desktop notifications.

Built for JEE aspirants who want to stop making excuses and start scoring. **No pain, no gain.**

# CREDITS:
- Debugging: AI
- Idea: Me
- Coding: Mainly Me
- Readme: AI
