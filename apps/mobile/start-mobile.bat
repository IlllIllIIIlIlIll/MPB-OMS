@echo off
echo ========================================
echo   MPB-OMS Mobile App - SDK 52 (Windows)
echo ========================================
echo.

echo Checking environment...
if not exist .env (
    echo Error: .env file not found!
    echo Please run setup-env.bat from the root directory first.
    pause
    exit /b 1
)

echo.
echo Mobile app upgraded to Expo SDK 52!
echo React Native: 0.76.9
echo.
echo Choose your option:
echo 1. Start with Expo Go (Recommended)
echo 2. Android Studio Emulator (requires setup)
echo 3. Start web version
echo 4. Check Android setup
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo.
    echo Starting Expo Go mode with SDK 52...
    echo Install latest Expo Go from Google Play Store and scan the QR code
    echo Your IP: 192.168.1.21
    npm start
) else if "%choice%"=="2" (
    echo.
    echo Starting Android emulator mode...
    echo Make sure your Android emulator is running first!
    echo Checking for connected devices...
    adb devices 2>nul
    if %errorlevel% neq 0 (
        echo.
        echo ❌ ADB not found. Please run setup-android.bat first
        pause
        exit /b 1
    )
    echo.
    echo Launching app on Android emulator...
    npm run android
) else if "%choice%"=="3" (
    echo.
    echo Starting web version...
    npm run web
) else if "%choice%"=="4" (
    echo.
    echo Running Android setup check...
    .\setup-android.bat
) else (
    echo Invalid choice. Starting default Expo Go mode...
    npm start
)

pause
