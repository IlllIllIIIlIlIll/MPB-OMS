# Android Development Setup for Windows

## Option 1: Use Expo Go (Recommended - No Android Studio needed)

1. **Install Expo Go on your Android phone:**
   - Go to Google Play Store
   - Search for "Expo Go" 
   - Install the app

2. **Start the development server:**
   ```cmd
   cd mobile-app
   npm start
   ```

3. **Connect your phone:**
   - Open Expo Go app
   - Scan the QR code displayed in terminal/browser
   - Your app will load directly on your phone!

## Option 2: Android Studio Setup (For Emulator)

If you want to use an Android emulator, you need to install Android Studio:

### Step 1: Install Android Studio
1. Download from: https://developer.android.com/studio
2. Install with default settings
3. Open Android Studio and go through the setup wizard

### Step 2: Configure Android SDK
1. Open Android Studio
2. Go to `File > Settings` (or `Android Studio > Preferences` on Mac)
3. Navigate to `Appearance & Behavior > System Settings > Android SDK`
4. Note the SDK Location (usually `C:\Users\[Username]\AppData\Local\Android\Sdk`)
5. Install at least one SDK Platform (API 30 or higher recommended)

### Step 3: Set Environment Variables
1. **Set ANDROID_HOME:**
   - Open System Properties > Advanced > Environment Variables
   - Add new System Variable:
     - Variable name: `ANDROID_HOME`
     - Variable value: `C:\Users\[YourUsername]\AppData\Local\Android\Sdk`

2. **Add to PATH:**
   - Edit the PATH system variable
   - Add these entries:
     - `%ANDROID_HOME%\platform-tools`
     - `%ANDROID_HOME%\tools`
     - `%ANDROID_HOME%\tools\bin`

### Step 4: Create Virtual Device
1. In Android Studio, go to `Tools > AVD Manager`
2. Click `Create Virtual Device`
3. Choose a phone model (Pixel 4 recommended)
4. Choose a system image (API 30+ recommended)
5. Finish setup and start the emulator

### Step 5: Test Setup
```cmd
adb devices
```
This should show your emulator or connected device.

## Current Error Fix

The error you're seeing:
```
Failed to resolve the Android SDK path. ANDROID_HOME is set to a non-existing path: C:\Users\FAVIAN\AppData\Local\Android\Sdk
```

**Solution:**
1. Check if Android Studio is installed
2. If not, use Option 1 (Expo Go) - much easier!
3. If yes, verify the SDK path exists or install Android SDK

## Environment Configuration

Your mobile app is now configured to use your IP address (192.168.1.21) automatically through the centralized .env file.

The app will connect to:
- Backend: http://192.168.1.21:3001
- This works on both emulator and physical devices

## Quick Start Commands

```cmd
# From root directory - setup environment
.\setup-env.bat

# Start mobile app (recommended)
cd mobile-app
npm start

# Or use the convenient starter
.\start-mobile.bat
```

## Network Configuration

Make sure your Windows Firewall allows Node.js connections, and ensure your phone is on the same WiFi network as your computer (192.168.1.x network).
