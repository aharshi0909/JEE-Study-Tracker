# Setup Instructions for JEE Study Tracker Mobile (React Native)

## 🎯 Prerequisites Checklist

- [ ] Node.js 16+ installed (`node --version`)
- [ ] npm or yarn installed
- [ ] Android SDK installed via Android Studio
- [ ] Android 5.1 (API 21) or higher support enabled
- [ ] Google Gemini API key (free at https://aistudio.google.com)

## 📋 Step-by-Step Setup

### Step 1: Install Node & npm

**macOS/Linux:**
```bash
# Using Homebrew
brew install node
node --version  # Should be 16+
```

**Windows:**
- Download from https://nodejs.org/
- Or use: `choco install nodejs`

### Step 2: Install Android Development Tools

**Install Android Studio:**
1. Download from https://developer.android.com/studio
2. Run installer and follow setup wizard
3. Install Android SDK with API level 21+ (Android 5.1)
4. Create virtual device (API 21+) or connect physical device

**Set environment variables:**

**macOS/Linux:**
```bash
# Add to ~/.zshrc or ~/.bashrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Reload shell
source ~/.zshrc
```

**Windows:**
```
User Environment Variables → New
Variable: ANDROID_HOME
Value: C:\Users\YourUsername\AppData\Local\Android\sdk

Then add to PATH:
%ANDROID_HOME%\emulator
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
%ANDROID_HOME%\platform-tools
```

### Step 3: Clone & Setup Project

```bash
# Navigate to project
cd path/to/JEE-Study-Tracker/MobileApp

# Install dependencies
npm install

# If using yarn:
# yarn install
```

### Step 4: Configure for Android 5.1 Compatibility

The app is already configured, but verify `android/build.gradle`:

```gradle
// android/build.gradle
allprojects {
    repositories {
        google()
        jcenter()
    }
}
```

And `android/app/build.gradle`:
```gradle
android {
    compileSdkVersion 31
    defaultConfig {
        minSdkVersion 21  // Android 5.1
        targetSdkVersion 31
    }
}
```

### Step 5: Start the Development Server

```bash
# Terminal 1: Start Metro bundler
cd MobileApp
npm start

# You should see:
# ████████████████████░ 95% - Ready!
# To reload the app, press "r"
# To open developer menu, press "d"
```

### Step 6: Build & Run on Android

**In a new terminal:**

```bash
# Terminal 2: Build and run
cd MobileApp
npm run android
```

**Alternatively, using ADB with physical device:**

```bash
# Enable USB Debugging on your Android device
# Settings → Developer Options → USB Debugging

# Connect device via USB
adb devices  # Should show your device

# Run the app
npm run android
```

### Step 7: Configure Gemini API Key

1. Get your free API key:
   - Go to https://aistudio.google.com
   - Click "Get API Key"
   - Create new API key
   - Copy the key

2. In the app:
   - Tap the **More** tab (bottom right)
   - Tap **Settings** (gear icon)
   - Tap **Update Key** under "Gemini API Key"
   - Paste your key and tap **Save Key**
   - You should see "Configured" badge

## 🔄 Daily Development Workflow

```bash
# Terminal 1
cd MobileApp
npm start

# Terminal 2
npm run android

# For hot reload:
# - Press 'r' in Terminal 1 to reload
# - Press 'd' to open developer menu
# - Changes auto-refresh in debug mode
```

## 🧹 Cleaning & Rebuilding

If you encounter build errors:

```bash
# Clean build artifacts
cd MobileApp
rm -rf node_modules
rm -rf android/app/build
rm -rf android/.gradle

# Reinstall
npm install

# Rebuild
npm run android
```

## 📱 Running on Physical Device

**Android Phone:**

1. Enable Developer Mode:
   - Open Settings
   - Scroll to "About phone"
   - Tap "Build number" 7 times
   - Go back to Settings > Developer Options
   - Enable "USB Debugging"

2. Connect via USB:
```bash
adb devices
# Should show your device: "XXXXX         device"

npm run android
```

**Troubleshooting connections:**
```bash
# Reset ADB
adb kill-server
adb start-server
adb devices

# Force TCP connection (if USB doesn't work)
adb tcpip 5555
adb connect YOUR_DEVICE_IP:5555
```

## ✅ Verification Checklist

- [ ] App launches without errors
- [ ] Timer tab shows study timer UI
- [ ] Dashboard tab shows stats (initially empty)
- [ ] Can start a study session
- [ ] Hourly modal appears after 1 hour of study
- [ ] Coach tab shows chat interface
- [ ] Settings shows Gemini API key option
- [ ] Can set Gemini API key
- [ ] Chat features work with AI key set

## 🐛 Common Issues & Solutions

### "ANDROID_HOME not set"
```bash
# Verify environment variable
echo $ANDROID_HOME

# If empty, set it manually
export ANDROID_HOME=/path/to/android/sdk
```

### "Cannot find Android SDK"
```bash
# Check SDK location
ls ~/Library/Android/sdk/  # macOS
ls ~/AppData/Local/Android/sdk/  # Windows

# Or open Android Studio:
# Android Studio → Settings → SDK Manager
# Check path at bottom
```

### "No emulator/device found"
```bash
# Start emulator
emulator -list-avds
emulator -avd Pixel_5_API_31

# Or list physical devices
adb devices
```

### "Build failed: Cannot read property 'split' of undefined"
```bash
# Rebuild gradle
cd android
./gradlew clean
cd ..
npm run android
```

### "Gemini API not working"
- Verify key is valid at https://aistudio.google.com/app/apikey
- Check internet connection
- Try disabling VPN/proxy
- Confirm API is enabled: Google Cloud Console → APIs & Services

### "App crashes on Android 5.1 device"
- Ensure `minSdkVersion 21` in build.gradle
- Check if using API 21+ compatible libraries
- Review logcat: `adb logcat | grep ReactNativeJS`

## 📊 Checking Logs

```bash
# View all logs
adb logcat

# Filter React Native logs
adb logcat | grep -i ReactNativeJS

# Filter errors only
adb logcat *:E

# Clear previous logs
adb logcat -c
```

## 🚀 Building for Release

```bash
# Generate release APK
cd MobileApp/android
./gradlew assembleRelease

# APK will be at:
# MobileApp/android/app/build/outputs/apk/release/app-release.apk
```

## 📚 Resources

- React Native Docs: https://reactnative.dev/
- React Navigation: https://reactnavigation.org/
- Google Gemini API: https://ai.google.dev/
- Android Documentation: https://developer.android.com/docs

## 💬 Getting Help

1. Check the README.md for feature documentation
2. Review inline code comments
3. Check React Native error messages
4. Review logcat output for crashes
5. Check GitHub issues in main repo

---

**Ready to develop?** You're all set! Start with Step 5 if dependencies are installed.
