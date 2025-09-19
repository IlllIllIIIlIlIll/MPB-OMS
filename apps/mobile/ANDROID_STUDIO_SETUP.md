# Android Studio Setup for MPB OMS Mobile App

## ✅ **Current Status**
- Android Studio: **Installed** ✅ (`C:\Program Files\Android\Android Studio`)
- Android SDK: **Needs Configuration** ⚠️
- Environment Variables: **Needs Setup** ⚠️

## 🔧 **Step-by-Step Setup Guide**

### **Step 1: Configure Android SDK in Android Studio**

1. **Open Android Studio**
   - Launch Android Studio from Start Menu or Desktop

2. **Open SDK Manager**
   - Click on `File` → `Settings` (or `Configure` → `Settings` if no project is open)
   - Navigate to `Appearance & Behavior` → `System Settings` → `Android SDK`

3. **Install Required SDK Components**
   - **SDK Platforms tab**: Install at least:
     - ✅ Android 14 (API level 34) - Latest
     - ✅ Android 13 (API level 33) - Recommended for Expo
     - ✅ Android 12 (API level 31) - Good compatibility
   
   - **SDK Tools tab**: Ensure these are installed:
     - ✅ Android SDK Build-Tools
     - ✅ Android SDK Platform-Tools
     - ✅ Android SDK Tools
     - ✅ Intel x86 Emulator Accelerator (HAXM installer)

4. **Note the SDK Location**
   - The SDK path should be something like: `C:\Users\FAVIAN\AppData\Local\Android\Sdk`
   - **Write this path down** - you'll need it for environment variables

### **Step 2: Set Environment Variables (Windows)**

1. **Open Environment Variables**
   - Press `Win + R`, type `sysdm.cpl`, press Enter
   - Click `Advanced` tab → `Environment Variables`

2. **Create ANDROID_HOME Variable**
   - In "System Variables", click `New`
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\FAVIAN\AppData\Local\Android\Sdk` (your SDK path)

3. **Update PATH Variable**
   - Find `Path` in System Variables, click `Edit`
   - Add these new entries:
     - `%ANDROID_HOME%\platform-tools`
     - `%ANDROID_HOME%\tools`
     - `%ANDROID_HOME%\tools\bin`

4. **Apply Changes**
   - Click OK on all dialogs
   - **Restart your terminal/PowerShell**

### **Step 3: Create Android Virtual Device (AVD)**

1. **Open AVD Manager**
   - In Android Studio: `Tools` → `AVD Manager`
   - Or click the phone icon in the toolbar

2. **Create Virtual Device**
   - Click `Create Virtual Device`
   - Choose device: **Pixel 4** or **Pixel 6** (recommended)
   - Choose system image: **API 33** or **API 34** (with Google APIs)
   - Advanced Settings:
     - RAM: 2048 MB or higher
     - Internal Storage: 2048 MB or higher
   - Click `Finish`

3. **Start Emulator**
   - Click the ▶️ play button next to your AVD
   - Wait for the emulator to boot up completely

### **Step 4: Test Your Setup**

**After restarting your terminal**, test these commands:

```cmd
# Test ADB connection
adb version

# List connected devices (should show your emulator)
adb devices

# Test if emulator is detected
adb devices
```

### **Step 5: Run Your Mobile App**

1. **Navigate to mobile app directory**
   ```cmd
   cd mobile-app
   ```

2. **Start with Android target**
   ```cmd
   npm run android
   ```
   OR
   ```cmd
   npx expo start --android
   ```

3. **Alternative: Use your starter script**
   ```cmd
   .\start-mobile.bat
   # Choose option 2 (Android Emulator)
   ```

## 🎯 **Expected Results**

When everything is set up correctly:
1. **Metro bundler starts** ✅
2. **Android emulator launches** ✅
3. **App installs automatically** ✅
4. **Login screen appears** ✅
5. **You can login with**: `admin@tj-oms.com` / `admin123` ✅

## 🔧 **Troubleshooting**

### **"adb not found" Error**
- Restart your terminal after setting environment variables
- Verify ANDROID_HOME path exists
- Check that platform-tools is in your PATH

### **Emulator Won't Start**
- Enable Hyper-V or HAXM in BIOS
- Check if Windows Hypervisor Platform is enabled
- Try creating a new AVD with different API level

### **App Won't Install**
- Check if emulator shows as connected: `adb devices`
- Clear Metro cache: `npx expo start --clear --android`
- Restart emulator and try again

### **Network Connection Issues**
- Your app connects to: `http://192.168.1.21:3001`
- Emulator automatically handles this IP
- Make sure backend is running

## 💡 **Pro Tips**

1. **Keep Emulator Running**: Don't close it between tests
2. **Use GPU Acceleration**: Enable in AVD settings for better performance
3. **Increase RAM**: 4GB+ if your computer can handle it
4. **Enable Developer Options**: In emulator for better debugging

## 🚀 **Quick Commands After Setup**

```cmd
# Start everything in one go
cd mobile-app
npx expo start --android

# Check devices
adb devices

# Clear cache and restart
npx expo start --clear --android
```

Your mobile app will run much faster in the Android emulator compared to Expo Go, and you'll have access to more debugging tools! 🎯
